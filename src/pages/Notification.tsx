import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
  Megaphone,
  FileText,
  Pin,
  Plus,
  X,
  Send,
  Eye,
  EyeOff,
  Clock,
  Check,
  Pencil,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Wand2,
  Package,
  ShieldCheck,
  User,
  Timer,
  Radio,
  MapPin,
} from 'lucide-react'
import { useStore } from '@/store'
import type { AppNotification, LostItem, PatrolRecord, NotificationSource } from '@/types'

const TARGET_AREAS = [
  '全园区', '万岁山主舞台', '开封府实景', '民俗街区', '湖心亭',
  '北广场', '武术馆', '南门广场', '东门入口', '管理部',
]

const TYPE_LABELS: Record<AppNotification['type'], string> = {
  broadcast: '广播通知',
  announcement: '活动公告',
  briefing: '运营简报',
}

const TYPE_BADGE: Record<AppNotification['type'], string> = {
  broadcast: 'badge-info',
  announcement: 'badge-success',
  briefing: 'badge-warning',
}

const STATUS_LABELS: Record<AppNotification['status'], string> = {
  draft: '草稿',
  published: '已发布',
  revoked: '已撤回',
  scheduled: '待发布',
}

const STATUS_BADGE: Record<AppNotification['status'], string> = {
  draft: 'badge-warning',
  published: 'badge-success',
  revoked: 'badge-danger',
  scheduled: 'badge-info',
}

const SOURCE_LABELS: Record<NotificationSource, string> = {
  manual: '手工新建',
  lost_item: '失物招领',
  patrol: '巡场记录',
  briefing: '运营简报',
}

const SOURCE_BADGE: Record<NotificationSource, string> = {
  manual: 'badge-info',
  lost_item: 'badge-warning',
  patrol: 'badge-success',
  briefing: 'badge-ochre',
}

const SOURCE_ICONS: Record<NotificationSource, ReactNode> = {
  manual: <Pencil className="w-3 h-3" />,
  lost_item: <Package className="w-3 h-3" />,
  patrol: <ShieldCheck className="w-3 h-3" />,
  briefing: <FileText className="w-3 h-3" />,
}

type TabFilter = 'all' | AppNotification['type']
type ModalMode = 'create' | 'edit'
type GenerateTab = 'lostItem' | 'patrol'

interface FormState {
  title: string
  content: string
  type: AppNotification['type']
  targetAreas: string[]
  isPinned: boolean
  enableSchedule: boolean
  scheduledPublishTime: string
  source: NotificationSource
  sourceId?: string
}

const emptyForm: FormState = {
  title: '',
  content: '',
  type: 'broadcast',
  targetAreas: [],
  isPinned: false,
  enableSchedule: false,
  scheduledPublishTime: '',
  source: 'manual',
}

export default function Notification() {
  const { notifications, addNotification, updateNotification, updateNotificationStatus, checkScheduledPublish, lostItems, patrolRecords, generateBriefing, linkNotificationToPatrol } = useStore()
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({})
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateTab, setGenerateTab] = useState<GenerateTab>('lostItem')

  useEffect(() => {
    checkScheduledPublish()
  }, [checkScheduledPublish])

  const publishedCount = notifications.filter(n => n.status === 'published').length
  const draftCount = notifications.filter(n => n.status === 'draft').length
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length
  const pinnedCount = notifications.filter(n => n.isPinned).length

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeTab)

  const availableLostItems = lostItems.filter(item => item.status !== 'claimed')

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'broadcast', label: '广播通知' },
    { key: 'announcement', label: '活动公告' },
    { key: 'briefing', label: '运营简报' },
  ]

  const mode: ModalMode = editingId !== null ? 'edit' : 'create'
  const editingNotification = editingId !== null ? notifications.find(n => n.id === editingId) : null

  const handleToggleArea = (area: string) => {
    setForm(prev => ({
      ...prev,
      targetAreas: prev.targetAreas.includes(area)
        ? prev.targetAreas.filter(a => a !== area)
        : [...prev.targetAreas, area],
    }))
  }

  const resetFormAndClose = () => {
    setShowModal(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, source: 'manual' })
    setShowModal(true)
  }

  const handleOpenEdit = (id: string) => {
    const target = notifications.find(n => n.id === id)
    if (!target) return
    setEditingId(id)
    setForm({
      title: target.title,
      content: target.content,
      type: target.type,
      targetAreas: [...target.targetAreas],
      isPinned: target.isPinned,
      enableSchedule: !!target.scheduledPublishTime && target.status === 'scheduled',
      scheduledPublishTime: target.scheduledPublishTime
        ? new Date(target.scheduledPublishTime).toISOString().slice(0, 16)
        : '',
      source: target.source,
      sourceId: target.sourceId,
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim() || form.targetAreas.length === 0) return

    if (mode === 'create') {
      const now = new Date().toLocaleString()
      const newId = Date.now().toString()
      addNotification({
        id: newId,
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        targetAreas: form.targetAreas,
        status: form.enableSchedule && form.scheduledPublishTime ? 'scheduled' : 'draft',
        isPinned: form.isPinned,
        createdAt: now,
        source: form.source,
        sourceId: form.sourceId,
        ...(form.enableSchedule && form.scheduledPublishTime
          ? { scheduledPublishTime: new Date(form.scheduledPublishTime).toISOString() }
          : {}),
        publishHistory: [],
      })
      if (form.source === 'patrol' && form.sourceId) {
        linkNotificationToPatrol(form.sourceId, newId, form.title.trim(), now)
      }
    } else if (mode === 'edit' && editingId !== null) {
      const patch: Partial<AppNotification> = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        targetAreas: form.targetAreas,
        isPinned: form.isPinned,
      }
      if (form.enableSchedule && form.scheduledPublishTime) {
        patch.status = 'scheduled'
        patch.scheduledPublishTime = new Date(form.scheduledPublishTime).toISOString()
      } else {
        const current = notifications.find(n => n.id === editingId)
        if (current?.status === 'scheduled') {
          patch.status = 'draft'
          patch.scheduledPublishTime = undefined
        }
      }
      updateNotification(editingId, patch)
    }

    resetFormAndClose()
  }

  const handlePublish = (id: string) => {
    updateNotificationStatus(id, 'published')
  }

  const handleOpenRevoke = (id: string) => {
    setRevokingId(id)
    setRevokeReason('')
    setShowRevokeModal(true)
  }

  const handleConfirmRevoke = () => {
    if (!revokingId || !revokeReason.trim()) return
    updateNotificationStatus(revokingId, 'revoked', revokeReason.trim())
    setShowRevokeModal(false)
    setRevokingId(null)
    setRevokeReason('')
  }

  const handleCloseRevoke = () => {
    setShowRevokeModal(false)
    setRevokingId(null)
    setRevokeReason('')
  }

  const handleCancelSchedule = (id: string) => {
    updateNotification(id, { status: 'draft', scheduledPublishTime: undefined })
  }

  const toggleHistory = (id: string) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const deriveTargetAreasFromRoute = (route: string): string[] => {
    const areas: string[] = []
    const routeLower = route.toLowerCase()
    if (routeLower.includes('东门')) areas.push('东门入口')
    if (routeLower.includes('南门')) areas.push('南门广场')
    if (routeLower.includes('北广场')) areas.push('北广场')
    if (routeLower.includes('民俗')) areas.push('民俗街区')
    if (routeLower.includes('开封府')) areas.push('开封府实景')
    if (routeLower.includes('湖心亭')) areas.push('湖心亭')
    if (routeLower.includes('武术馆')) areas.push('武术馆')
    if (routeLower.includes('主舞台') || routeLower.includes('万岁山')) areas.push('万岁山主舞台')
    if (areas.length === 0) areas.push('全园区')
    return areas
  }

  const handleGenerateFromLostItem = (item: LostItem) => {
    setForm({
      title: `失物招领：${item.name}`,
      content: `在 ${item.location} 拾得${item.name}，${item.description}。请失主携带有效证件前往客服中心认领。`,
      type: 'broadcast',
      targetAreas: ['全园区'],
      isPinned: false,
      enableSchedule: false,
      scheduledPublishTime: '',
      source: 'lost_item',
      sourceId: item.id,
    })
    setEditingId(null)
    setShowGenerateModal(false)
    setShowModal(true)
  }

  const handleGenerateFromPatrol = (record: PatrolRecord) => {
    const targetAreas = deriveTargetAreasFromRoute(record.route)
    setForm({
      title: `巡场提醒：${record.route}`,
      content: `${record.staffName} 在巡场（路线：${record.route}）中发现以下情况：${record.notes || '请注意关注相关区域。'}`,
      type: 'broadcast',
      targetAreas,
      isPinned: false,
      enableSchedule: false,
      scheduledPublishTime: '',
      source: 'patrol',
      sourceId: record.id,
    })
    setEditingId(null)
    setShowGenerateModal(false)
    setShowModal(true)
  }

  const handleGenerateBriefing = () => {
    const briefingContent = generateBriefing()
    setForm({
      title: `每日运营简报 - ${new Date().toLocaleDateString('zh-CN')}`,
      content: briefingContent,
      type: 'briefing',
      targetAreas: ['管理部'],
      isPinned: false,
      enableSchedule: false,
      scheduledPublishTime: '',
      source: 'briefing',
    })
    setEditingId(null)
    setShowModal(true)
  }

  const formatScheduledTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr)
      return d.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return isoStr
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="page-title">通知发布</h1>
          <p className="text-sm text-slate-500 mt-1">管理园区通知、公告与运营简报</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2" onClick={handleGenerateBriefing}>
            <FileText className="w-4 h-4" />
            生成运营简报
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={() => setShowGenerateModal(true)}>
            <Wand2 className="w-4 h-4" />
            从现有记录生成
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            新建通知
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-400/15 flex items-center justify-center">
            <Eye className="w-6 h-6 text-brand-300" />
          </div>
          <div>
            <p className="text-xs text-slate-500">已发布</p>
            <p className="stat-value text-brand-300">{publishedCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-400/15 flex items-center justify-center">
            <FileText className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">草稿</p>
            <p className="stat-value text-gold-400">{draftCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-400/15 flex items-center justify-center">
            <Clock className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500">待发布</p>
            <p className="stat-value text-sky-400">{scheduledCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-400/15 flex items-center justify-center">
            <Pin className="w-6 h-6 text-brand-300" />
          </div>
          <div>
            <p className="text-xs text-slate-500">置顶</p>
            <p className="stat-value text-brand-300">{pinnedCount}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-surface-700 rounded-lg p-1 w-fit border border-surface-500/30">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-brand-400/20 text-brand-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(n => (
          <div key={n.id} className="card-hover">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {n.isPinned && <Pin className="w-3.5 h-3.5 text-brand-300 shrink-0" />}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${SOURCE_BADGE[n.source]}`}>
                    {SOURCE_ICONS[n.source]}
                    来源：{SOURCE_LABELS[n.source]}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100 truncate">{n.title}</h3>
                  <span className={TYPE_BADGE[n.type]}>{TYPE_LABELS[n.type]}</span>
                  <span className={STATUS_BADGE[n.status]}>
                    {n.status === 'scheduled' && <Clock className="w-3 h-3 inline mr-1" />}
                    {STATUS_LABELS[n.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{n.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {n.targetAreas.map(area => (
                    <span key={area} className="inline-flex items-center px-2 py-0.5 rounded bg-surface-800 text-[11px] text-slate-400 border border-surface-500/30">
                      <MapPin className="w-3 h-3 mr-1" />
                      {area}
                    </span>
                  ))}
                </div>
                {n.status === 'scheduled' && n.scheduledPublishTime && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-sky-400">
                    <CalendarClock className="w-3.5 h-3.5" />
                    定时发布：{formatScheduledTime(n.scheduledPublishTime)}
                  </div>
                )}
                {n.publishHistory.length > 0 && (
                  <div className="mt-2">
                    <button
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                      onClick={() => toggleHistory(n.id)}
                    >
                      <Radio className="w-3 h-3" />
                      发布记录 ({n.publishHistory.length})
                      {expandedHistory[n.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {expandedHistory[n.id] && (
                      <div className="mt-1.5 ml-1 border-l border-surface-500/30 pl-3 space-y-1.5">
                        {n.publishHistory.map((entry, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              {entry.action === 'published' ? (
                                <>
                                  <Send className="w-3 h-3 text-emerald-400/70" />
                                  <span className="text-emerald-400/70 font-medium">发布</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-red-400/70" />
                                  <span className="text-red-400/70 font-medium">撤回</span>
                                </>
                              )}
                              <span className="text-slate-500">·</span>
                              <span className="text-slate-400">{entry.time}</span>
                            </div>
                            {entry.targetAreas && entry.targetAreas.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 ml-4.5">
                                <MapPin className="w-3 h-3" />
                                <span>覆盖区域：{entry.targetAreas.join('、')}</span>
                              </div>
                            )}
                            {entry.action === 'published' && entry.source && (
                              <div className="flex items-center gap-1.5 text-xs ml-4.5">
                                <span className="text-slate-500">来源：</span>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${SOURCE_BADGE[entry.source]}`}>
                                  {SOURCE_ICONS[entry.source]}
                                  {SOURCE_LABELS[entry.source]}
                                </span>
                              </div>
                            )}
                            {entry.action === 'revoked' && entry.reason && (
                              <div className="text-xs text-red-400/70 ml-4.5">
                                原因：{entry.reason}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {n.status === 'published' && n.publishTime && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Timer className="w-3 h-3" />
                    {n.publishTime}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {(n.status === 'draft' || n.status === 'revoked') && (
                    <>
                      <button
                        className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                        onClick={() => handleOpenEdit(n.id)}
                      >
                        <Pencil className="w-3 h-3" />
                        编辑
                      </button>
                      <button
                        className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                        onClick={() => handlePublish(n.id)}
                      >
                        {n.status === 'draft' ? <Send className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {n.status === 'draft' ? '发布' : '重新发布'}
                      </button>
                    </>
                  )}
                  {n.status === 'published' && (
                    <button
                      className="btn-danger text-xs px-3 py-1 flex items-center gap-1"
                      onClick={() => handleOpenRevoke(n.id)}
                    >
                      <EyeOff className="w-3 h-3" />
                      撤回
                    </button>
                  )}
                  {n.status === 'scheduled' && (
                    <>
                      <button
                        className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                        onClick={() => handleOpenEdit(n.id)}
                      >
                        <Pencil className="w-3 h-3" />
                        编辑
                      </button>
                      <button
                        className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                        onClick={() => handlePublish(n.id)}
                      >
                        <Send className="w-3 h-3" />
                        立即发布
                      </button>
                      <button
                        className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                        onClick={() => handleCancelSchedule(n.id)}
                      >
                        <Clock className="w-3 h-3" />
                        取消定时
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card flex flex-col items-center justify-center py-12 text-slate-500">
            <Megaphone className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">暂无通知</p>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={resetFormAndClose}
        >
          <div
            className="card w-full max-w-lg mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">
                {mode === 'create' ? '新建通知' : '编辑通知'}
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600 text-slate-400 hover:text-slate-200 transition-colors"
                onClick={resetFormAndClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {mode === 'edit' && editingNotification && (
              <div className="mb-4">
                <span className="badge-info inline-flex items-center gap-1.5">
                  正在编辑 {TYPE_LABELS[editingNotification.type]} · 当前状态 {STATUS_LABELS[editingNotification.status]}
                </span>
              </div>
            )}

            {mode === 'create' && form.source !== 'manual' && (
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${SOURCE_BADGE[form.source]}`}>
                  {SOURCE_ICONS[form.source]}
                  来源：{SOURCE_LABELS[form.source]}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">标题</label>
                <input
                  className="input-field"
                  placeholder="请输入通知标题"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">内容</label>
                <div className="border border-surface-500/50 rounded-lg overflow-hidden focus-within:border-brand-400/50 focus-within:ring-1 focus-within:ring-brand-400/20 transition-all duration-200">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-800 border-b border-surface-500/30">
                    <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs font-bold">B</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs italic">I</button>
                    <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs underline">U</button>
                    <div className="w-px h-4 bg-surface-500/30 mx-1" />
                    <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs">列表</button>
                  </div>
                  <textarea
                    className="w-full bg-surface-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none min-h-[120px] resize-y"
                    placeholder="请输入通知内容"
                    value={form.content}
                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">类型</label>
                <select
                  className="input-field"
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value as AppNotification['type'] }))}
                >
                  <option value="broadcast">广播通知</option>
                  <option value="announcement">活动公告</option>
                  <option value="briefing">运营简报</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-2">目标区域</label>
                <div className="grid grid-cols-2 gap-2">
                  {TARGET_AREAS.map(area => (
                    <label
                      key={area}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 text-sm ${
                        form.targetAreas.includes(area)
                          ? 'border-brand-400/50 bg-brand-400/10 text-brand-300'
                          : 'border-surface-500/30 bg-surface-800 text-slate-400 hover:border-surface-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.targetAreas.includes(area)}
                        onChange={() => handleToggleArea(area)}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                        form.targetAreas.includes(area)
                          ? 'bg-brand-400 border-brand-400'
                          : 'border-surface-400'
                      }`}>
                        {form.targetAreas.includes(area) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {area}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
                  form.isPinned
                    ? 'bg-brand-400 border-brand-400'
                    : 'border-surface-400'
                }`}>
                  {form.isPinned && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.isPinned}
                  onChange={e => setForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                />
                <span className="text-sm text-slate-300">是否置顶</span>
                <Pin className="w-3.5 h-3.5 text-brand-300" />
              </label>

              <div className="border-t border-surface-500/30 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
                    form.enableSchedule
                      ? 'bg-sky-400 border-sky-400'
                      : 'border-surface-400'
                  }`}>
                    {form.enableSchedule && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.enableSchedule}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      enableSchedule: e.target.checked,
                      scheduledPublishTime: e.target.checked ? prev.scheduledPublishTime : '',
                    }))}
                  />
                  <CalendarClock className="w-4 h-4 text-sky-400" />
                  <span className="text-sm text-slate-300">设置定时发布</span>
                </label>

                {form.enableSchedule && (
                  <div className="mt-3 ml-8">
                    <label className="block text-xs text-slate-400 mb-1.5">发布时间</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={form.scheduledPublishTime}
                      onChange={e => setForm(prev => ({ ...prev, scheduledPublishTime: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-500/30">
              <button
                className="btn-secondary"
                onClick={resetFormAndClose}
              >
                取消
              </button>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.content.trim() || form.targetAreas.length === 0}
              >
                <Send className="w-4 h-4" />
                {mode === 'create'
                  ? form.enableSchedule && form.scheduledPublishTime
                    ? '设置定时发布'
                    : '保存草稿'
                  : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevokeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCloseRevoke}
        >
          <div
            className="card w-full max-w-md mx-4 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                确认撤回通知？
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600 text-slate-400 hover:text-slate-200 transition-colors"
                onClick={handleCloseRevoke}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              撤回后该通知将立即下线，用户将无法查看。此操作会记录在发布历史中。
            </p>

            <div className="mb-5">
              <label className="block text-xs text-slate-400 mb-1.5">
                撤回原因 <span className="text-red-400">*</span>
              </label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="请输入撤回原因..."
                value={revokeReason}
                onChange={e => setRevokeReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="btn-secondary"
                onClick={handleCloseRevoke}
              >
                取消
              </button>
              <button
                className="btn-danger flex items-center gap-2"
                onClick={handleConfirmRevoke}
                disabled={!revokeReason.trim()}
              >
                <EyeOff className="w-4 h-4" />
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="card w-full max-w-xl mx-4 relative max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-brand-300" />
                选择来源
              </h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600 text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => setShowGenerateModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1 mb-4 shrink-0">
              <button
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  generateTab === 'lostItem'
                    ? 'bg-surface-700 text-brand-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setGenerateTab('lostItem')}
              >
                <Package className="w-4 h-4" />
                失物招领
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  generateTab === 'patrol'
                    ? 'bg-surface-700 text-brand-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => setGenerateTab('patrol')}
              >
                <ShieldCheck className="w-4 h-4" />
                巡场记录
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {generateTab === 'lostItem' && (
                availableLostItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Package className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm">暂无未认领的失物</p>
                  </div>
                ) : (
                  availableLostItems.map(item => (
                    <div key={item.id} className="bg-surface-800 rounded-lg p-3 border border-surface-500/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            <Package className="w-4 h-4 text-gold-400 shrink-0" />
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              {item.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.foundTime}
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
                          onClick={() => handleGenerateFromLostItem(item)}
                        >
                          <Wand2 className="w-3 h-3" />
                          生成通知
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {generateTab === 'patrol' && (
                patrolRecords.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <ShieldCheck className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm">暂无巡场记录</p>
                  </div>
                ) : (
                  patrolRecords.map(record => (
                    <div key={record.id} className="bg-surface-800 rounded-lg p-3 border border-surface-500/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            {record.route}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {record.staffName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {record.startTime}
                            </span>
                          </div>
                          {record.notes && (
                            <p className="text-xs text-slate-400 mt-2 line-clamp-2">{record.notes}</p>
                          )}
                        </div>
                        <button
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
                          onClick={() => handleGenerateFromPatrol(record)}
                        >
                          <Wand2 className="w-3 h-3" />
                          生成通知
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
