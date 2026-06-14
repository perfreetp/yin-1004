import { useState, useMemo } from 'react'
import {
  MessageSquareWarning,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  UserPlus,
  Send,
} from 'lucide-react'
import { useStore } from '@/store'
import type { Complaint } from '@/types'

const COMPLAINT_TYPES = ['设施', '服务', '价格', '安全', '其他'] as const

const STATUS_CONFIG: Record<Complaint['status'], { cls: string; label: string; icon: typeof Clock }> = {
  pending: { cls: 'badge-warning', label: '待处理', icon: Clock },
  processing: { cls: 'badge-info', label: '处理中', icon: UserPlus },
  resolved: { cls: 'badge-success', label: '已完成', icon: CheckCircle },
}

const TYPE_BADGE: Record<string, string> = {
  设施: 'badge-info',
  服务: 'badge-warning',
  价格: 'badge-danger',
  安全: 'badge-danger',
  其他: 'badge-info',
}

interface FormData {
  title: string
  content: string
  type: string
  reporterName: string
  reporterPhone: string
}

const emptyForm: FormData = {
  title: '',
  content: '',
  type: '设施',
  reporterName: '',
  reporterPhone: '',
}

export default function ComplaintPage() {
  const { complaints, addComplaint, updateComplaintStatus } = useStore()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [assignDialog, setAssignDialog] = useState<{ id: string } | null>(null)
  const [assigneeName, setAssigneeName] = useState('')

  const pendingCount = useMemo(() => complaints.filter((c) => c.status === 'pending').length, [complaints])
  const processingCount = useMemo(() => complaints.filter((c) => c.status === 'processing').length, [complaints])
  const resolvedCount = useMemo(() => complaints.filter((c) => c.status === 'resolved').length, [complaints])
  const totalCount = complaints.length

  const pendingList = useMemo(() => complaints.filter((c) => c.status === 'pending'), [complaints])
  const processingList = useMemo(() => complaints.filter((c) => c.status === 'processing'), [complaints])
  const resolvedList = useMemo(() => complaints.filter((c) => c.status === 'resolved'), [complaints])

  const handleCreate = () => {
    if (!form.title || !form.content || !form.reporterName || !form.reporterPhone) return
    const id = Date.now().toString()
    const now = new Date()
    const ts = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    addComplaint({
      id,
      title: form.title,
      content: form.content,
      type: form.type,
      reporterName: form.reporterName,
      reporterPhone: form.reporterPhone,
      status: 'pending',
      createdAt: ts,
      updatedAt: ts,
    })
    setForm(emptyForm)
    setShowCreateModal(false)
  }

  const handleAssign = () => {
    if (!assignDialog || !assigneeName.trim()) return
    updateComplaintStatus(assignDialog.id, 'processing', assigneeName.trim())
    setAssignDialog(null)
    setAssigneeName('')
  }

  const handleResolve = (id: string) => {
    updateComplaintStatus(id, 'resolved')
  }

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const renderCard = (complaint: Complaint) => {
    const StatusIcon = STATUS_CONFIG[complaint.status].icon
    return (
      <div key={complaint.id} className="card-hover space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-100 leading-snug">{complaint.title}</h4>
          <span className={STATUS_CONFIG[complaint.status].cls}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {STATUS_CONFIG[complaint.status].label}
          </span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2">{complaint.content}</p>
        <div className="flex items-center gap-2">
          <span className={TYPE_BADGE[complaint.type] || 'badge-info'}>{complaint.type}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{complaint.reporterName}</span>
          <span>{complaint.createdAt.split(' ')[1] || complaint.createdAt}</span>
        </div>
        {complaint.status === 'pending' && (
          <button
            className="btn-primary w-full text-xs flex items-center justify-center gap-1.5 py-1.5"
            onClick={() => setAssignDialog({ id: complaint.id })}
          >
            <Send className="w-3.5 h-3.5" />
            派发
          </button>
        )}
        {complaint.status === 'processing' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-400">
              处理人：<span className="text-brand-300">{complaint.assignee}</span>
            </div>
            <button
              className="w-full text-xs flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-brand-400/20 text-brand-300 hover:bg-brand-400/30 transition-colors"
              onClick={() => handleResolve(complaint.id)}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              完成
            </button>
          </div>
        )}
        {complaint.status === 'resolved' && complaint.remark && (
          <div className="text-xs text-slate-400 bg-surface-800/60 rounded-lg px-3 py-2">
            <span className="text-slate-500">备注：</span>{complaint.remark}
          </div>
        )}
      </div>
    )
  }

  const renderColumn = (title: string, Icon: typeof Clock, list: Complaint[], colorClass: string) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <span className="text-xs text-slate-500 bg-surface-600/60 px-2 py-0.5 rounded-full">{list.length}</span>
      </div>
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="card text-center text-xs text-slate-500 py-8">暂无工单</div>
        )}
        {list.map(renderCard)}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">投诉工单</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          新增投诉
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">待处理</p>
            <p className="stat-value text-gold-400">{pendingCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">处理中</p>
            <p className="stat-value text-blue-400">{processingCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">已完成</p>
            <p className="stat-value text-brand-400">{resolvedCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-danger-400/15 flex items-center justify-center">
            <MessageSquareWarning className="w-6 h-6 text-danger-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">今日总计</p>
            <p className="stat-value text-danger-400">{totalCount}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto">
        {renderColumn('待处理', AlertCircle, pendingList, 'bg-gold-400/15 text-gold-400')}
        {renderColumn('处理中', Clock, processingList, 'bg-blue-500/15 text-blue-400')}
        {renderColumn('已完成', CheckCircle, resolvedList, 'bg-brand-400/15 text-brand-400')}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreateModal(false)} />
          <div className="relative card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-100">新增投诉</h3>
              <button
                className="text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">标题</label>
                <input
                  className="input-field"
                  placeholder="请输入投诉标题"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">内容</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="请输入投诉内容"
                  value={form.content}
                  onChange={(e) => updateField('content', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">类型</label>
                <select
                  className="input-field"
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                >
                  {COMPLAINT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">投诉人</label>
                <input
                  className="input-field"
                  placeholder="请输入投诉人姓名"
                  value={form.reporterName}
                  onChange={(e) => updateField('reporterName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">联系电话</label>
                <input
                  className="input-field"
                  placeholder="请输入联系电话"
                  value={form.reporterPhone}
                  onChange={(e) => updateField('reporterPhone', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleCreate}>
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {assignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setAssignDialog(null); setAssigneeName('') }} />
          <div className="relative card w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-100">派发工单</h3>
              <button
                className="text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => { setAssignDialog(null); setAssigneeName('') }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">处理人</label>
              <input
                className="input-field"
                placeholder="请输入处理人姓名"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAssign() }}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => { setAssignDialog(null); setAssigneeName('') }}>
                取消
              </button>
              <button className="btn-primary" onClick={handleAssign}>
                确认派发
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
