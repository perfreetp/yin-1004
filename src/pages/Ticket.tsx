import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Ticket,
  Users,
  DollarSign,
  Plus,
  X,
  Check,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react'
import { useStore } from '@/store'
import type { TeamReservation } from '@/types'

const TICKET_TYPES = ['全部', '成人票', '儿童票', '老年票', '团队票'] as const
type TicketTypeTab = (typeof TICKET_TYPES)[number]

const TICKET_COLORS: Record<string, string> = {
  成人票: '#2D8B75',
  儿童票: '#D4A853',
  老年票: '#C47335',
  团队票: '#3B82F6',
}

const STATUS_BADGE: Record<TeamReservation['status'], { cls: string; label: string }> = {
  pending: { cls: 'badge-warning', label: '待确认' },
  confirmed: { cls: 'badge-success', label: '已确认' },
  cancelled: { cls: 'badge-danger', label: '已取消' },
}

const STATUS_ICON: Record<TeamReservation['status'], typeof Clock> = {
  pending: Clock,
  confirmed: Check,
  cancelled: XCircle,
}

interface FormData {
  teamName: string
  contactPerson: string
  contactPhone: string
  visitorCount: string
  reservationDate: string
}

const emptyForm: FormData = {
  teamName: '',
  contactPerson: '',
  contactPhone: '',
  visitorCount: '',
  reservationDate: '',
}

export default function TicketPage() {
  const { ticketSales, teamReservations, addTeamReservation, updateTeamReservation } = useStore()

  const [activeTab, setActiveTab] = useState<TicketTypeTab>('全部')
  const [filterDate, setFilterDate] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)

  const totalSold = useMemo(
    () => ticketSales.reduce((sum, s) => sum + s.quantity, 0),
    [ticketSales],
  )
  const totalRevenue = useMemo(
    () => ticketSales.reduce((sum, s) => sum + s.amount, 0),
    [ticketSales],
  )
  const totalTeamReservations = useMemo(
    () => teamReservations.filter((r) => r.status !== 'cancelled').length,
    [teamReservations],
  )

  const filteredSales = useMemo(() => {
    let data = ticketSales
    if (filterDate) data = data.filter((s) => s.date === filterDate)
    if (activeTab !== '全部') data = data.filter((s) => s.ticketType === activeTab)
    return data
  }, [ticketSales, filterDate, activeTab])

  const chartData = useMemo(() => {
    const slotMap = new Map<string, Record<string, string | number>>()
    for (const sale of filteredSales) {
      if (!slotMap.has(sale.timeSlot)) {
        slotMap.set(sale.timeSlot, { timeSlot: sale.timeSlot })
      }
      const entry = slotMap.get(sale.timeSlot)!
      entry[sale.ticketType] = ((entry[sale.ticketType] as number) || 0) + sale.quantity
    }
    return Array.from(slotMap.values())
  }, [filteredSales])

  const activeTicketTypes = useMemo(() => {
    if (activeTab !== '全部') return [activeTab]
    const types = new Set(ticketSales.map((s) => s.ticketType))
    return Array.from(types)
  }, [activeTab, ticketSales])

  const handleAddReservation = () => {
    if (!form.teamName || !form.contactPerson || !form.contactPhone || !form.visitorCount || !form.reservationDate) return
    const id = Date.now().toString()
    const now = new Date()
    const createdAt = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    addTeamReservation({
      id,
      teamName: form.teamName,
      contactPerson: form.contactPerson,
      contactPhone: form.contactPhone,
      visitorCount: Number(form.visitorCount),
      reservationDate: form.reservationDate,
      status: 'pending',
      createdAt,
    })
    setForm(emptyForm)
    setShowModal(false)
  }

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">票务管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          新增团队预约
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">总售票数</p>
            <p className="stat-value text-brand-400">{totalSold.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">总收入</p>
            <p className="stat-value text-gold-400">¥{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">团队预约数</p>
            <p className="stat-value text-blue-400">{totalTeamReservations}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
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
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {TICKET_TYPES.map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-brand-400/20 text-brand-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card">
        <h2 className="section-title">分时段售票统计</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3750" />
            <XAxis dataKey="timeSlot" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A2332',
                border: '1px solid #2A3750',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            {activeTicketTypes.map((type) => (
              <Bar key={type} dataKey={type} fill={TICKET_COLORS[type]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Team Reservation Table */}
      <div className="card">
        <h2 className="section-title">团队预约管理</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-500/30">
                <th className="text-left py-3 px-3 text-slate-400 font-medium">团队名称</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">联系人</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">人数</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">预约日期</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">状态</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {teamReservations.map((r) => {
                const StatusIcon = STATUS_ICON[r.status]
                const badge = STATUS_BADGE[r.status]
                return (
                  <tr key={r.id} className="border-b border-surface-500/10 hover:bg-surface-600/30 transition-colors">
                    <td className="py-3 px-3 text-slate-200">{r.teamName}</td>
                    <td className="py-3 px-3 text-slate-300">{r.contactPerson}</td>
                    <td className="py-3 px-3 text-slate-300">{r.visitorCount}</td>
                    <td className="py-3 px-3 text-slate-300">{r.reservationDate}</td>
                    <td className="py-3 px-3">
                      <span className={`${badge.cls} inline-flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {r.status === 'pending' && (
                          <>
                            <button
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-brand-400/20 text-brand-300 hover:bg-brand-400/30 transition-colors"
                              onClick={() => updateTeamReservation(r.id, 'confirmed')}
                            >
                              <Check className="w-3 h-3" />
                              确认
                            </button>
                            <button
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-danger-400/20 text-danger-400 hover:bg-danger-400/30 transition-colors"
                              onClick={() => updateTeamReservation(r.id, 'cancelled')}
                            >
                              <X className="w-3 h-3" />
                              取消
                            </button>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <button
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-danger-400/20 text-danger-400 hover:bg-danger-400/30 transition-colors"
                            onClick={() => updateTeamReservation(r.id, 'cancelled')}
                          >
                            <X className="w-3 h-3" />
                            取消
                          </button>
                        )}
                        {r.status === 'cancelled' && (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-100">新增团队预约</h3>
              <button
                className="text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">团队名称</label>
                <input
                  className="input-field"
                  placeholder="请输入团队名称"
                  value={form.teamName}
                  onChange={(e) => updateField('teamName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">联系人</label>
                <input
                  className="input-field"
                  placeholder="请输入联系人姓名"
                  value={form.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">联系电话</label>
                <input
                  className="input-field"
                  placeholder="请输入联系电话"
                  value={form.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">游客人数</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="请输入游客人数"
                  value={form.visitorCount}
                  onChange={(e) => updateField('visitorCount', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">预约日期</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.reservationDate}
                  onChange={(e) => updateField('reservationDate', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                取消
              </button>
              <button className="btn-primary" onClick={handleAddReservation}>
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
