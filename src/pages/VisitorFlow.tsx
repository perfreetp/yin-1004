import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Activity,
  ShieldAlert,
} from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

const levelConfig = {
  normal: { color: 'bg-brand-400', barColor: 'bg-brand-400', badge: 'badge-success', label: '正常' },
  warning: { color: 'bg-gold-400', barColor: 'bg-gold-400', badge: 'badge-warning', label: '预警' },
  danger: { color: 'bg-danger-400', barColor: 'bg-danger-400', badge: 'badge-danger', label: '拥挤' },
}

export default function VisitorFlow() {
  const { visitorFlow, areaFlows, dailyStats } = useStore()

  const warningAreas = areaFlows.filter((a) => a.level === 'danger')

  return (
    <div className="p-6 space-y-6">
      <h1 className="page-title">客流监测</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-400/15 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">当前在园人数</p>
            <p className="stat-value text-brand-300">
              {dailyStats.currentInPark.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-ochre-400/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-ochre-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">今日入园总计</p>
            <p className="stat-value text-ochre-400">
              {dailyStats.totalVisitors.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-danger-400/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-danger-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">预警区域数</p>
            <p className="stat-value text-danger-400">
              {areaFlows.filter((a) => a.level !== 'normal').length}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">分时客流趋势</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorFlow} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3750" />
              <XAxis
                dataKey="timeSlot"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={2}
                axisLine={{ stroke: '#2A3750' }}
                tickLine={{ stroke: '#2A3750' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#2A3750' }}
                tickLine={{ stroke: '#2A3750' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2332',
                  border: '1px solid #2A3750',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
              />
              <Area
                type="monotone"
                dataKey="currentCount"
                name="在园人数"
                fill="#2D8B7520"
                stroke="none"
              />
              <Line
                type="monotone"
                dataKey="inCount"
                name="入园人数"
                stroke="#2D8B75"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#2D8B75' }}
              />
              <Line
                type="monotone"
                dataKey="outCount"
                name="出园人数"
                stroke="#C47335"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#C47335' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="section-title">区域客流监测</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {areaFlows.map((area) => {
              const pct = Math.round((area.currentCount / area.capacity) * 100)
              const cfg = levelConfig[area.level]
              return (
                <div
                  key={area.areaName}
                  className={cn(
                    'card-hover',
                    area.level === 'danger' && 'ring-1 ring-danger-400/40'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-200">
                        {area.areaName}
                      </span>
                    </div>
                    <span className={cfg.badge}>{cfg.label}</span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-bold text-slate-100">
                      {area.currentCount}
                    </span>
                    <span className="text-xs text-slate-500">/ {area.capacity} 人</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-surface-500/50 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        cfg.barColor,
                        area.level === 'danger' && 'animate-pulse'
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-500">
                      容载率 {pct}%
                    </span>
                    <span className="flex items-center text-[11px] text-slate-500">
                      {pct > 80 ? (
                        <>
                          <ArrowUp className="w-3 h-3 text-danger-400 mr-0.5" />
                          <span className="text-danger-400">偏高</span>
                        </>
                      ) : pct > 60 ? (
                        <>
                          <ArrowUp className="w-3 h-3 text-gold-400 mr-0.5" />
                          <span className="text-gold-400">适中</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-3 h-3 text-brand-400 mr-0.5" />
                          <span className="text-brand-400">正常</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <ShieldAlert className="w-4 h-4 inline mr-1 text-danger-400" />
            预警通知
          </h2>
          <div className="space-y-3">
            {warningAreas.length === 0 && (
              <div className="card text-center py-8">
                <p className="text-sm text-slate-500">暂无预警</p>
              </div>
            )}
            {warningAreas.map((area) => {
              const pct = Math.round((area.currentCount / area.capacity) * 100)
              return (
                <div
                  key={area.areaName}
                  className="card border-danger-400/30 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-danger-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-danger-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-danger-300">
                        {area.areaName}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        当前 {area.currentCount} 人，容量 {area.capacity} 人，容载率 {pct}%
                      </p>
                      <p className="text-xs text-danger-400/80 mt-1.5">
                        ⚠ 该区域客流已达拥挤级别，请立即疏导游客
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
