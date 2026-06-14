import { useState, useEffect } from 'react'
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
  Timer,
} from 'lucide-react'
import { useStore } from '@/store'
import type { AppNotification } from '@/types'

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

type TabFilter = 'all' | AppNotification['type']
type ModalMode = 'create' | 'edit'

interface FormState {
  title: string
  content: string
  type: AppNotification['type']
  targetAreas: string[]
  isPinned: boolean
  enableSchedule: boolean
  scheduledPublishTime: string
}

const emptyForm: FormState = {
  title: '',
  content: '',
  type: 'broadcast',
  targetAreas: [],
  isPinned: false,
  enableSchedule: false,
  scheduledPublishTime: '',
}

export default function Notification() {
  const { notifications, addNotification, updateNotification, updateNotificationStatus, checkScheduledPublish } = useStore()
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = setInterval(() => {
      checkScheduledPublish()
    }, 30000)
    return () => clearInterval(timer)
  }, [checkScheduledPublish])

  const publishedCount = notifications.filter(n => n.status === 'published').length
  const draftCount = notifications.filter(n => n.status === 'draft').length
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length
  const pinnedCount = notifications.filter(n => n.isPinned).length

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeTab)

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
    setForm(emptyForm)
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
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim() || form.targetAreas.length === 0) return

    if (mode === 'create') {
      const now = new Date().toLocaleString()
      addNotification({
        id: Date.now().toString(),
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
        targetAreas: form.targetAreas,
        status: form.enableSchedule && form.scheduledPublishTime ? 'scheduled' : 'draft',
        isPinned: form.isPinned,
        createdAt: now,
        ...(form.enableSchedule && form.scheduledPublishTime
          ? { scheduledPublishTime: new Date(form.scheduledPublishTime).toISOString() }
          : {}),
        publishHistory: [],
      })
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

  const handleRevoke = (id: string) => {
    updateNotificationStatus(id, 'revoked')
  }

  const handleCancelSchedule = (id: string) => {
    updateNotification(id, { status: 'draft', scheduledPublishTime: undefined })
  }

  const toggleHistory = (id: string) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }))
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
        <button className="btn-primary flex items-center gap-2" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4" />
          新建通知
        </button>
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
            <Timer className="w-6 h-6 text-sky-400" />
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
                      发布记录 ({n.publishHistory.length})
                      {expandedHistory[n.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {expandedHistory[n.id] && (
                      <div className="mt-1.5 ml-1 border-l border-surface-500/30 pl-3 space-y-1.5">
                        {n.publishHistory.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500">
                            {entry.action === 'published' ? (
                              <Send className="w-3 h-3 text-emerald-400/70" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-red-400/70" />
                            )}
                            <span className={entry.action === 'published' ? 'text-emerald-400/70' : 'text-red-400/70'}>
                              {entry.action === 'published' ? '已发布' : '已撤回'}
                            </span>
                            <span className="text-slate-600">{entry.time}</span>
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
                    <Clock className="w-3 h-3" />
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
                      onClick={() => handleRevoke(n.id)}
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
    </div>
  )
}
