import { useState, useEffect, useRef, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Users,
  DollarSign,
  MessageSquareWarning,
  Drama,
  Store,
  TrendingUp,
  TrendingDown,
  FileText,
  X,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { Performance } from '@/types'

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef(0)

  useEffect(() => {
    const start = startRef.current
    const end = value
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(start + (end - start) * eased)
      setDisplay(current)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
    return () => {
      startRef.current = display
    }
  }, [value, duration])

  return <>{display.toLocaleString()}</>
}

const metricCards = [
  {
    key: 'ticketRevenue' as const,
    label: '售票收入',
    prefix: '¥',
    icon: DollarSign,
    format: (v: number) => v.toLocaleString(),
    trend: +12.5,
    color: 'text-brand-300',
    bg: 'bg-brand-400/15',
    route: '/ticket',
  },
  {
    key: 'complaintCount' as const,
    label: '投诉数量',
    prefix: '',
    icon: MessageSquareWarning,
    format: (v: number) => String(v),
    trend: -8.3,
    color: 'text-danger-400',
    bg: 'bg-danger-400/15',
    route: '/complaint',
  },
  {
    key: 'performanceCount' as const,
    label: '演出场次',
    prefix: '',
    icon: Drama,
    format: (v: number) => String(v),
    trend: +5.0,
    color: 'text-gold-400',
    bg: 'bg-gold-400/15',
    route: '/performance',
  },
  {
    key: 'shopOpenRate' as const,
    label: '商铺营业率',
    prefix: '',
    suffix: '%',
    icon: Store,
    format: (v: number) => (v * 100).toFixed(0),
    trend: +2.1,
    color: 'text-brand-300',
    bg: 'bg-brand-400/15',
    route: '/shop',
  },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { timeSlot: string; inCount: number } }>
  label?: string
}

function ChartTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-surface-700 border border-surface-400/40 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{data.timeSlot}</p>
      <p className="text-sm font-mono text-brand-300">入园 {data.inCount} 人</p>
    </div>
  )
}

const statusConfig: Record<Performance['status'], { label: string; icon: typeof CheckCircle; badge: string; dotColor: string; textColor: string }> = {
  confirmed: { label: '已确认', icon: CheckCircle, badge: 'badge-success', dotColor: 'bg-brand-400', textColor: 'text-brand-300' },
  scheduled: { label: '待确认', icon: Clock, badge: 'badge-warning', dotColor: 'bg-gold-400', textColor: 'text-gold-400' },
  cancelled: { label: '已停演', icon: XCircle, badge: 'badge-danger', dotColor: 'bg-danger-400', textColor: 'text-danger-400' },
}

const statusOrder: Performance['status'][] = ['scheduled', 'confirmed', 'cancelled']

export default function Dashboard() {
  const { dailyStats, visitorFlow, performances, generateBriefing } = useStore()
  const [briefing, setBriefing] = useState<string | null>(null)
  const navigate = useNavigate()

  const today = format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhCN })

  const handleGenerateBriefing = () => {
    setBriefing(generateBriefing())
  }

  const todayPerformances = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return performances.filter((p) => p.date === todayStr)
  }, [performances])

  const groupedPerformances = useMemo(() => {
    const groups: Record<Performance['status'], Performance[]> = {
      confirmed: [],
      scheduled: [],
      cancelled: [],
    }
    for (const p of todayPerformances) {
      groups[p.status].push(p)
    }
    return groups
  }, [todayPerformances])

  const handlePerformanceClick = () => {
    navigate('/performance')
  }

  const handleStatusGroupClick = (status: Performance['status']) => {
    navigate(`/performance?status=${status}`)
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="page-title">运营看板</h1>
          <p className="text-sm text-slate-500 mt-1">{today}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={handleGenerateBriefing}>
          <Sparkles className="w-4 h-4" />
          生成每日简报
        </button>
      </header>

      <div className="card-hover relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-400/20 flex items-center justify-center">
              <Users className="w-7 h-7 text-brand-300" />
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">入园人数</p>
              <div className="flex items-baseline gap-6">
                <div>
                  <span className="stat-value text-brand-300">
                    <AnimatedNumber value={dailyStats.totalVisitors} />
                  </span>
                  <span className="text-sm text-slate-500 ml-2">总入园</span>
                </div>
                <div>
                  <span className="stat-value text-gold-400">
                    <AnimatedNumber value={dailyStats.currentInPark} />
                  </span>
                  <span className="text-sm text-slate-500 ml-2">当前在园</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-brand-300">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12%</span>
            </div>
            <span className="text-xs text-slate-500">较昨日</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon
          const isUp = card.trend > 0
          const value = dailyStats[card.key]
          return (
            <div
              key={card.key}
              className="card-hover cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 relative group"
              onClick={() => navigate(card.route)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-brand-300' : 'text-danger-400'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isUp ? '+' : ''}{card.trend}%
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">{card.label}</p>
              <p className="stat-value text-slate-100">
                {card.prefix}<AnimatedNumber value={typeof value === 'number' && card.key === 'shopOpenRate' ? value * 100 : value} />{card.suffix ?? ''}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span>查看详情</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">今日演出概览</h2>
          <span className="text-xs text-slate-500">{todayPerformances.length} 场演出</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusOrder.map((status) => {
            const config = statusConfig[status]
            const StatusIcon = config.icon
            const items = groupedPerformances[status]
            return (
              <div key={status} className="bg-surface-800/50 rounded-lg border border-surface-500/20 overflow-hidden flex flex-col">
                <div
                  className="flex items-center justify-between px-4 py-3 border-b border-surface-500/20 cursor-pointer hover:bg-surface-600/30 transition-colors group/header"
                  onClick={() => handleStatusGroupClick(status)}
                >
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
                    <span className={`text-sm font-medium ${config.textColor}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-slate-500">· {items.length}场</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 group-hover/header:text-brand-400 transition-colors">
                    <span>查看全部</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex-1 p-3 space-y-2 min-h-[120px] max-h-[280px] overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                      {status === 'cancelled' ? (
                        <CheckCircle className="w-8 h-8 mb-2 text-brand-400/30" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 mb-2 text-slate-600/50" />
                      )}
                      <p className="text-xs">暂无{config.label}演出</p>
                    </div>
                  ) : (
                    items.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-lg bg-surface-700/50 hover:bg-surface-600/50 cursor-pointer transition-colors group/perf"
                        onClick={handlePerformanceClick}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-200 group-hover/perf:text-brand-300 transition-colors line-clamp-1">
                            {p.name}
                          </p>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/perf:text-brand-400 transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{p.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <Drama className="w-3 h-3" />
                          <span className="truncate">{p.venue}</span>
                        </div>
                        {status === 'cancelled' && p.cancelReason && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-danger-400/80 bg-danger-400/10 rounded px-2 py-1">
                            <XCircle className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{p.cancelReason}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title mb-0">分时入园趋势</h2>
          <span className="badge badge-success">实时</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitorFlow} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientInCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D8B75" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2D8B75" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3750" vertical={false} />
              <XAxis
                dataKey="timeSlot"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#2A3750' }}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="inCount"
                stroke="#2D8B75"
                strokeWidth={2}
                fill="url(#gradientInCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {briefing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setBriefing(null)}
        >
          <div
            className="card w-full max-w-lg mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100">每日运营简报</h2>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600 text-slate-400 hover:text-slate-200 transition-colors"
                onClick={() => setBriefing(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans bg-surface-800 rounded-lg p-4 border border-surface-500/30">
              {briefing}
            </pre>
            <div className="flex justify-end gap-3 mt-4">
              <button className="btn-secondary" onClick={() => setBriefing(null)}>
                关闭
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  navigator.clipboard.writeText(briefing)
                }}
              >
                复制简报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
