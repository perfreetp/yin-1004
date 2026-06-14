import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Drama, Plus, Clock, MapPin, User, X, Check, CheckCircle, XCircle, Users, Filter, XCircle as XCircleIcon, UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import type { Performance as PerformanceType } from '@/types'

export default function Performance() {
  const { performances, addPerformance, updatePerformanceStatus, toggleActorCheckIn, addActor } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddActorModal, setShowAddActorModal] = useState(false)
  const [addActorTargetId, setAddActorTargetId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PerformanceType | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const [formName, setFormName] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [formStartTime, setFormStartTime] = useState('')
  const [formEndTime, setFormEndTime] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))

  const [actorName, setActorName] = useState('')
  const [actorRole, setActorRole] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const statusFilter = searchParams.get('status') as 'scheduled' | 'confirmed' | 'cancelled' | undefined

  const filteredPerformances = performances.filter(p => {
    if (p.date !== selectedDate) return false
    if (statusFilter && p.status !== statusFilter) return false
    return true
  })

  const todayPerformances = performances.filter(p => p.date === today)
  const totalCount = todayPerformances.length
  const confirmedCount = todayPerformances.filter(p => p.status === 'confirmed').length
  const scheduledCount = todayPerformances.filter(p => p.status === 'scheduled').length
  const cancelledCount = todayPerformances.filter(p => p.status === 'cancelled').length

  const statusLabelMap: Record<PerformanceType['status'], { label: string; icon: typeof Clock; badge: string }> = {
    scheduled: { label: '待确认', icon: Clock, badge: 'badge-warning' },
    confirmed: { label: '已确认', icon: CheckCircle, badge: 'badge-success' },
    cancelled: { label: '已停演', icon: XCircle, badge: 'badge-danger' },
  }

  const filterLabelMap: Record<string, string> = {
    scheduled: '待确认演出',
    confirmed: '已确认演出',
    cancelled: '已停演演出',
  }

  const statusBadge = (status: PerformanceType['status']) => {
    const config = statusLabelMap[status]
    const Icon = config.icon
    return (
      <span className={config.badge}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const handleConfirm = (id: string) => {
    updatePerformanceStatus(id, 'confirmed')
  }

  const handleRestore = (id: string) => {
    updatePerformanceStatus(id, 'scheduled')
  }

  const handleCancel = () => {
    if (!cancelTarget || !cancelReason.trim()) return
    updatePerformanceStatus(cancelTarget.id, 'cancelled', cancelReason.trim())
    setCancelTarget(null)
    setCancelReason('')
  }

  const handleAdd = () => {
    if (!formName.trim() || !formVenue.trim() || !formStartTime || !formEndTime) return
    addPerformance({
      id: String(Date.now()),
      name: formName.trim(),
      venue: formVenue.trim(),
      startTime: formStartTime,
      endTime: formEndTime,
      date: selectedDate,
      actors: [],
      status: 'scheduled',
    })
    setFormName('')
    setFormVenue('')
    setFormStartTime('')
    setFormEndTime('')
    setShowAddModal(false)
  }

  const handleAddActor = () => {
    if (!addActorTargetId || !actorName.trim() || !actorRole.trim()) return
    addActor(addActorTargetId, {
      id: String(Date.now()),
      name: actorName.trim(),
      role: actorRole.trim(),
    })
    setActorName('')
    setActorRole('')
    setAddActorTargetId(null)
    setShowAddActorModal(false)
  }

  const clearFilter = () => {
    setSearchParams({})
  }

  const openAddActorModal = (performanceId: string) => {
    setAddActorTargetId(performanceId)
    setShowAddActorModal(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2">
          <Drama className="w-5 h-5 text-brand-400" />
          演出排期
        </h1>
        <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          新增演出
        </button>
      </div>

      {statusFilter && (
        <div className="flex items-center gap-3 p-4 bg-surface-700 rounded-xl border border-surface-500/30">
          <Filter className="w-4 h-4 text-brand-400" />
          <span className="text-sm text-slate-300">
            当前筛选：<span className={`${statusFilter === 'confirmed' ? 'text-brand-300' : statusFilter === 'cancelled' ? 'text-danger-400' : 'text-gold-400'} font-medium`}>{filterLabelMap[statusFilter]}</span>
          </span>
          <button
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-surface-600/50 hover:bg-surface-600 rounded-lg transition-all duration-200"
            onClick={clearFilter}
          >
            <X className="w-3 h-3" />
            清除筛选
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <Drama className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">今日场次</p>
            <p className="stat-value text-slate-100">{totalCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">已确认</p>
            <p className="stat-value text-brand-300">{confirmedCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">待确认</p>
            <p className="stat-value text-gold-400">{scheduledCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-danger-400/15 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-danger-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">已停演</p>
            <p className="stat-value text-danger-400">{cancelledCount}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">筛选条件</span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">日期</label>
            <input
              type="date"
              className="input-field w-44"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                !statusFilter
                  ? 'bg-brand-400/20 text-brand-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
              }`}
              onClick={clearFilter}
            >
              全部
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                statusFilter === 'scheduled'
                  ? 'bg-gold-400/20 text-gold-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
              }`}
              onClick={() => setSearchParams({ status: 'scheduled' })}
            >
              待确认
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                statusFilter === 'confirmed'
                  ? 'bg-brand-400/20 text-brand-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
              }`}
              onClick={() => setSearchParams({ status: 'confirmed' })}
            >
              已确认
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                statusFilter === 'cancelled'
                  ? 'bg-danger-400/20 text-danger-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
              }`}
              onClick={() => setSearchParams({ status: 'cancelled' })}
            >
              已停演
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">演出列表</h2>
          <span className="text-xs text-slate-500">共 {filteredPerformances.length} 场</span>
        </div>
        <div className="space-y-3">
          {filteredPerformances.length === 0 ? (
            <div className="card text-center py-12">
              <XCircleIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">暂无符合条件的演出</p>
            </div>
          ) : (
            filteredPerformances.map(perf => (
              <div key={perf.id} className="card-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-100 truncate">{perf.name}</h3>
                      {statusBadge(perf.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {perf.venue}
                      </span>
                      <span className="text-surface-400">|</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {perf.startTime} - {perf.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {perf.status === 'scheduled' && (
                      <>
                        <button className="btn-primary text-xs px-3 py-1.5" onClick={() => handleConfirm(perf.id)}>
                          确认
                        </button>
                        <button className="btn-danger text-xs px-3 py-1.5" onClick={() => { setCancelTarget(perf); setCancelReason('') }}>
                          停演
                        </button>
                      </>
                    )}
                    {perf.status === 'confirmed' && (
                      <button className="btn-danger text-xs px-3 py-1.5" onClick={() => { setCancelTarget(perf); setCancelReason('') }}>
                        停演
                      </button>
                    )}
                    {perf.status === 'cancelled' && (
                      <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => handleRestore(perf.id)}>
                        取消停演
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-surface-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      演员签到 ({perf.actors.filter(a => a.checkedIn).length}/{perf.actors.length})
                    </p>
                    {perf.status !== 'cancelled' && (
                      <button
                        className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                        onClick={() => openAddActorModal(perf.id)}
                      >
                        <Plus className="w-3 h-3" />
                        添加演员
                      </button>
                    )}
                  </div>
                  {perf.actors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {perf.actors.map(actor => (
                        <button
                          key={actor.id}
                          onClick={() => perf.status !== 'cancelled' && toggleActorCheckIn(perf.id, actor.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
                            perf.status === 'cancelled'
                              ? 'cursor-not-allowed opacity-60'
                              : ''
                          } ${
                            actor.checkedIn
                              ? 'bg-brand-400/15 text-brand-300 border border-brand-400/30'
                              : 'bg-surface-600/50 text-slate-400 border border-surface-500/30'
                          }`}
                          disabled={perf.status === 'cancelled'}
                        >
                          <span className={`w-2 h-2 rounded-full ${actor.checkedIn ? 'bg-brand-400' : 'bg-slate-600'}`} />
                          {actor.name}
                          <span className="text-slate-600">·</span>
                          <span className={actor.checkedIn ? 'text-brand-400/70' : 'text-slate-600'}>{actor.role}</span>
                          {actor.checkedIn ? <UserCheck className="w-3 h-3 text-brand-400/70" /> : <UserX className="w-3 h-3 text-slate-600" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">暂无演员</p>
                  )}
                </div>

                {perf.status === 'cancelled' && perf.cancelReason && (
                  <div className="mt-3 pt-3 border-t border-surface-500/20 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-danger-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-danger-400">停演原因：{perf.cancelReason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-surface-800 border border-surface-500/30 rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">新增演出</h2>
              <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">节目名称</label>
                <input className="input-field" placeholder="请输入节目名称" value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">场地</label>
                <input className="input-field" placeholder="请输入演出场地" value={formVenue} onChange={e => setFormVenue(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">演出日期</label>
                <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">开始时间</label>
                  <input type="time" className="input-field" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">结束时间</label>
                  <input type="time" className="input-field" value={formEndTime} onChange={e => setFormEndTime(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary text-sm" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="btn-primary text-sm" onClick={handleAdd}>确认添加</button>
            </div>
          </div>
        </div>
      )}

      {showAddActorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddActorModal(false); setAddActorTargetId(null); setActorName(''); setActorRole('') }}>
          <div className="bg-surface-800 border border-surface-500/30 rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">添加演员</h2>
              <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={() => { setShowAddActorModal(false); setAddActorTargetId(null); setActorName(''); setActorRole('') }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">演员姓名</label>
                <input className="input-field" placeholder="请输入演员姓名" value={actorName} onChange={e => setActorName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">饰演角色</label>
                <input className="input-field" placeholder="请输入饰演角色" value={actorRole} onChange={e => setActorRole(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary text-sm" onClick={() => { setShowAddActorModal(false); setAddActorTargetId(null); setActorName(''); setActorRole('') }}>取消</button>
              <button className="btn-primary text-sm" onClick={handleAddActor} disabled={!actorName.trim() || !actorRole.trim()}>确认添加</button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setCancelTarget(null); setCancelReason('') }}>
          <div className="bg-surface-800 border border-surface-500/30 rounded-xl w-full max-w-md mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">停演确认</h2>
              <button className="text-slate-500 hover:text-slate-300 transition-colors" onClick={() => { setCancelTarget(null); setCancelReason('') }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              确认停演 <span className="font-semibold text-danger-400">{cancelTarget.name}</span>？请填写停演原因：
            </p>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="请输入停演原因"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-5">
              <button className="btn-secondary text-sm" onClick={() => { setCancelTarget(null); setCancelReason('') }}>取消</button>
              <button className="btn-danger text-sm" disabled={!cancelReason.trim()} onClick={handleCancel}>确认停演</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
