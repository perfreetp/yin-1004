import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  Clock,
  MapPin,
  Camera,
  Package,
  Plus,
  X,
  Check,
  Search,
  ImagePlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/store'
import type { LostItem } from '@/types'

const LOST_STATUS_BADGE: Record<LostItem['status'], { cls: string; label: string }> = {
  registered: { cls: 'badge-warning', label: '待认领' },
  claimed: { cls: 'badge-success', label: '已认领' },
  unclaimed: { cls: 'badge-danger', label: '无人认领' },
}

const readAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as string)
    fr.onerror = reject
    fr.readAsDataURL(file)
  })

function calcDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (isNaN(ms) || ms < 0) return '--'
  const minutes = Math.round(ms / 60000)
  if (minutes < 60) return `${minutes}分钟`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
}

export default function Patrol() {
  const { patrolRecords, lostItems, addPatrolRecord, addLostItem, updateLostItemStatus } = useStore()

  const [showPatrolModal, setShowPatrolModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [searchLost, setSearchLost] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [patrolForm, setPatrolForm] = useState({
    staffName: '',
    route: '',
    startTime: '',
    endTime: '',
    notes: '',
  })
  const [patrolPhotos, setPatrolPhotos] = useState<string[]>([])

  const [lostForm, setLostForm] = useState({
    name: '',
    description: '',
    location: '',
    foundTime: '',
  })
  const [linkedPatrolId, setLinkedPatrolId] = useState('')

  const [lightbox, setLightbox] = useState<{
    photos: string[]
    index: number
  } | null>(null)

  const todayCount = patrolRecords.length
  const staffCount = new Set(patrolRecords.map(r => r.staffName)).size
  const lostCount = lostItems.length
  const claimedCount = lostItems.filter(i => i.status === 'claimed').length

  const filteredLostItems = searchLost.trim()
    ? lostItems.filter(i =>
        i.name.includes(searchLost) ||
        i.description.includes(searchLost) ||
        i.location.includes(searchLost)
      )
    : lostItems

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const promises = Array.from(files).map(f => readAsDataURL(f))
    const results = await Promise.all(promises)
    setPatrolPhotos(prev => [...prev, ...results])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePhotoRemove = (idx: number) => {
    setPatrolPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  const resetPatrolForm = () => {
    setPatrolForm({ staffName: '', route: '', startTime: '', endTime: '', notes: '' })
    setPatrolPhotos([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const resetLostForm = () => {
    setLostForm({ name: '', description: '', location: '', foundTime: '' })
    setLinkedPatrolId(patrolRecords.length > 0 ? patrolRecords[0].id : '')
  }

  const handleAddPatrol = () => {
    if (!patrolForm.staffName.trim() || !patrolForm.route.trim() || !patrolForm.startTime || !patrolForm.endTime) return
    const startStr = patrolForm.startTime.replace('T', ' ')
    const endStr = patrolForm.endTime.replace('T', ' ')
    addPatrolRecord({
      id: String(Date.now()),
      staffName: patrolForm.staffName.trim(),
      route: patrolForm.route.trim(),
      startTime: startStr,
      endTime: endStr,
      photos: [...patrolPhotos],
      notes: patrolForm.notes.trim(),
      lostItems: [],
    })
    resetPatrolForm()
    setShowPatrolModal(false)
  }

  const handleAddLost = () => {
    if (!lostForm.name.trim() || !lostForm.location.trim() || !lostForm.foundTime) return
    const foundStr = lostForm.foundTime.replace('T', ' ')
    addLostItem(
      {
        id: String(Date.now()),
        name: lostForm.name.trim(),
        description: lostForm.description.trim(),
        location: lostForm.location.trim(),
        foundTime: foundStr,
        status: 'registered',
        contactInfo: '',
      },
      linkedPatrolId || undefined
    )
    resetLostForm()
    setShowLostModal(false)
  }

  const openLostModalWithPatrol = (patrolId: string) => {
    setLostForm({ name: '', description: '', location: '', foundTime: '' })
    setLinkedPatrolId(patrolId)
    setShowLostModal(true)
  }

  const closePatrolModal = () => {
    resetPatrolForm()
    setShowPatrolModal(false)
  }

  const closeLostModal = () => {
    resetLostForm()
    setShowLostModal(false)
  }

  const lightboxPrev = useCallback(() => {
    setLightbox(prev => (prev ? { ...prev, index: (prev.index - 1 + prev.photos.length) % prev.photos.length } : null))
  }, [])

  const lightboxNext = useCallback(() => {
    setLightbox(prev => (prev ? { ...prev, index: (prev.index + 1) % prev.photos.length } : null))
  }, [])

  const lightboxClose = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lightboxClose()
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, lightboxClose, lightboxPrev, lightboxNext])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          巡场记录
        </h1>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-1.5 text-sm" onClick={() => { resetLostForm(); setShowLostModal(true) }}>
            <Package className="w-4 h-4" />
            登记失物
          </button>
          <button className="btn-primary flex items-center gap-1.5 text-sm" onClick={() => setShowPatrolModal(true)}>
            <Plus className="w-4 h-4" />
            新增巡场
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">今日巡场次数</p>
            <p className="stat-value text-slate-100">{todayCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-ochre-400/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-ochre-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">巡场人员数</p>
            <p className="stat-value text-ochre-400">{staffCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <Package className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">失物登记数</p>
            <p className="stat-value text-gold-400">{lostCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <Check className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">已认领数</p>
            <p className="stat-value text-brand-300">{claimedCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="section-title">巡场时间线</h2>
          <div className="relative pl-6 space-y-0">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-surface-500/30" />
            {patrolRecords.map(record => (
              <div key={record.id} className="relative pb-6 last:pb-0">
                <div className="absolute -left-6 top-1 w-[18px] h-[18px] rounded-full bg-surface-700 border-2 border-brand-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                </div>
                <div className="card-hover ml-2">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{record.staffName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{record.route}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{record.startTime.split(' ')[1]}</span>
                        <span className="text-slate-600">-</span>
                        <span>{record.endTime.split(' ')[1]}</span>
                      </div>
                      <p className="text-xs text-brand-400 mt-0.5">
                        {calcDuration(record.startTime, record.endTime)}
                      </p>
                    </div>
                  </div>

                  {record.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {record.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt=""
                          className="w-20 h-14 rounded-lg object-cover border border-surface-500/30 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setLightbox({ photos: record.photos, index: idx })}
                        />
                      ))}
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-3 flex items-start gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 leading-relaxed">{record.notes}</p>
                    </div>
                  )}

                  {record.lostItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-500/20">
                      <p className="text-xs text-slate-500 mb-2">拾得物品</p>
                      <div className="flex flex-wrap gap-2">
                        {record.lostItems.map(item => (
                          <span key={item.id} className={LOST_STATUS_BADGE[item.status].cls}>
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-surface-500/20 flex justify-end">
                    <button
                      className="btn-secondary text-xs flex items-center gap-1"
                      onClick={() => openLostModalWithPatrol(record.id)}
                    >
                      <Package className="w-3.5 h-3.5" />
                      补登记失物
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {patrolRecords.length === 0 && (
              <p className="text-sm text-slate-500 py-4">暂无巡场记录</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="section-title">失物登记</h2>
          <div className="mb-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input-field pl-9"
              placeholder="搜索失物..."
              value={searchLost}
              onChange={e => setSearchLost(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            {filteredLostItems.map(item => (
              <div key={item.id} className="card-hover">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">{item.name}</h3>
                      <span className={LOST_STATUS_BADGE[item.status].cls}>
                        {LOST_STATUS_BADGE[item.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-1.5">{item.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.foundTime.split(' ')[1] || item.foundTime}
                      </span>
                    </div>
                  </div>
                  {item.status === 'registered' && (
                    <button
                      className="btn-primary text-xs px-2.5 py-1 flex-shrink-0"
                      onClick={() => updateLostItemStatus(item.id, 'claimed')}
                    >
                      认领
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredLostItems.length === 0 && (
              <p className="text-sm text-slate-500 py-4 text-center">
                {searchLost ? '未找到匹配的失物' : '暂无失物登记'}
              </p>
            )}
          </div>
        </div>
      </div>

      {showPatrolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closePatrolModal}>
          <div className="bg-surface-800 border border-surface-500/30 rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">新增巡场记录</h2>
              <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={closePatrolModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">巡场人员</label>
                <input className="input-field" placeholder="请输入人员姓名" value={patrolForm.staffName} onChange={e => setPatrolForm(f => ({ ...f, staffName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">巡场路线</label>
                <input className="input-field" placeholder="如：东门→民俗街区→开封府" value={patrolForm.route} onChange={e => setPatrolForm(f => ({ ...f, route: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">开始时间</label>
                  <input type="datetime-local" className="input-field" value={patrolForm.startTime} onChange={e => setPatrolForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">结束时间</label>
                  <input type="datetime-local" className="input-field" value={patrolForm.endTime} onChange={e => setPatrolForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">现场照片</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <button
                  type="button"
                  className="btn-secondary w-full flex items-center justify-center gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-4 h-4" />
                  上传现场照片
                </button>

                {patrolPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {patrolPhotos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={photo}
                          alt=""
                          className="w-full h-16 rounded-lg object-cover border border-surface-500/30"
                        />
                        <button
                          type="button"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={() => handlePhotoRemove(idx)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {patrolPhotos.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    已上传 {patrolPhotos.length} 张照片
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">备注</label>
                <textarea className="input-field min-h-[80px] resize-none" placeholder="请输入巡场备注" value={patrolForm.notes} onChange={e => setPatrolForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary text-sm" onClick={closePatrolModal}>取消</button>
              <button className="btn-primary text-sm" onClick={handleAddPatrol}>确认添加</button>
            </div>
          </div>
        </div>
      )}

      {showLostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeLostModal}>
          <div className="bg-surface-800 border border-surface-500/30 rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">登记失物</h2>
              <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={closeLostModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">关联巡场记录</label>
                <select
                  className="input-field"
                  value={linkedPatrolId}
                  onChange={e => setLinkedPatrolId(e.target.value)}
                >
                  {patrolRecords.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.staffName} - {r.route} - {r.startTime}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">物品名称</label>
                <input className="input-field" placeholder="请输入物品名称" value={lostForm.name} onChange={e => setLostForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">描述</label>
                <textarea className="input-field min-h-[60px] resize-none" placeholder="请输入物品描述" value={lostForm.description} onChange={e => setLostForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">拾得地点</label>
                <input className="input-field" placeholder="请输入拾得地点" value={lostForm.location} onChange={e => setLostForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">拾得时间</label>
                <input type="datetime-local" className="input-field" value={lostForm.foundTime} onChange={e => setLostForm(f => ({ ...f, foundTime: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary text-sm" onClick={closeLostModal}>取消</button>
              <button className="btn-primary text-sm" onClick={handleAddLost}>确认登记</button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={lightboxClose}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            onClick={lightboxClose}
          >
            <X className="w-7 h-7" />
          </button>

          {lightbox.photos.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
              onClick={e => { e.stopPropagation(); lightboxPrev() }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {lightbox.photos.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
              onClick={e => { e.stopPropagation(); lightboxNext() }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <img
            src={lightbox.photos[lightbox.index]}
            alt=""
            className="max-w-4xl max-h-[80vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightbox.index + 1} / {lightbox.photos.length}
          </div>
        </div>
      )}
    </div>
  )
}
