import { useState } from 'react'
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
}

const STATUS_BADGE: Record<AppNotification['status'], string> = {
  draft: 'badge-warning',
  published: 'badge-success',
  revoked: 'badge-danger',
}

type TabFilter = 'all' | AppNotification['type']

interface FormState {
  title: string
  content: string
  type: AppNotification['type']
  targetAreas: string[]
  isPinned: boolean
}

const emptyForm: FormState = {
  title: '',
  content: '',
  type: 'broadcast',
  targetAreas: [],
  isPinned: false,
}

export default function Notification() {
  const { notifications, addNotification, updateNotificationStatus } = useStore()
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  const publishedCount = notifications.filter(n => n.status === 'published').length
  const draftCount = notifications.filter(n => n.status === 'draft').length
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

  const handleToggleArea = (area: string) => {
    setForm(prev => ({
      ...prev,
      targetAreas: prev.targetAreas.includes(area)
        ? prev.targetAreas.filter(a => a !== area)
        : [...prev.targetAreas, area],
    }))
  }

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim() || form.targetAreas.length === 0) return
    const now = new Date().toLocaleString()
    addNotification({
      id: Date.now().toString(),
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      targetAreas: form.targetAreas,
      status: 'draft',
      isPinned: form.isPinned,
      createdAt: now,
    })
    setForm(emptyForm)
    setShowModal(false)
  }

  const handlePublish = (id: string) => {
    updateNotificationStatus(id, 'published')
  }

  const handleRevoke = (id: string) => {
    updateNotificationStatus(id, 'revoked')
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="page-title">通知发布</h1>
          <p className="text-sm text-slate-500 mt-1">管理园区通知、公告与运营简报</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          新建通知
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <span className={STATUS_BADGE[n.status]}>{STATUS_LABELS[n.status]}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{n.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {n.targetAreas.map(area => (
                    <span key={area} className="inline-flex items-center px-2 py-0.5 rounded bg-surface-800 text-[11px] text-slate-400 border border-surface-500/30">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {n.status === 'published' && n.publishTime && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    {n.publishTime}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {n.status === 'draft' && (
                    <button
                      className="btn-primary text-xs px-3 py-1 flex items-center gap-1"
                      onClick={() => handlePublish(n.id)}
                    >
                      <Send className="w-3 h-3" />
                      发布
                    </button>
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
                  {n.status === 'revoked' && (
                    <button
                      className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                      onClick={() => handlePublish(n.id)}
                    >
                      <Eye className="w-3 h-3" />
                      重新发布
                    </button>
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
          onClick={() => { setShowModal(false); setForm(emptyForm) }}
        >
          <div
            className="card w-full max-w-lg mx-4 relative max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-100">新建通知</h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600 text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => { setShowModal(false); setForm(emptyForm) }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs font-bold">B</button>
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs italic">I</button>
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs underline">U</button>
                    <div className="w-px h-4 bg-surface-500/30 mx-1" />
                    <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-600 text-slate-400 text-xs">列表</button>
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
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-500/30">
              <button
                className="btn-secondary"
                onClick={() => { setShowModal(false); setForm(emptyForm) }}
              >
                取消
              </button>
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.content.trim() || form.targetAreas.length === 0}
              >
                <Send className="w-4 h-4" />
                保存草稿
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
