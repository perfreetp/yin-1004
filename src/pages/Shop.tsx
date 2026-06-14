import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Store,
  DollarSign,
  AlertTriangle,
  Clock,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react'
import { useStore } from '@/store'
import type { Shop } from '@/types'

const CATEGORIES = ['全部', '餐饮', '文创', '体验'] as const
type CategoryTab = (typeof CATEGORIES)[number]

const CATEGORY_BADGE: Record<string, string> = {
  餐饮: 'badge-success',
  文创: 'badge-info',
  体验: 'badge-warning',
}

function getRentStatus(expiryDate: string): { daysLeft: number; badge: string; label: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffMs = expiry.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { daysLeft, badge: 'badge-danger', label: `已过期${Math.abs(daysLeft)}天` }
  }
  if (daysLeft <= 30) {
    return { daysLeft, badge: 'badge-warning', label: `剩余${daysLeft}天` }
  }
  return { daysLeft, badge: 'badge-success', label: `剩余${daysLeft}天` }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { name: string; monthlyRevenue: number } }>
}

function RevenueTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-surface-700 border border-surface-400/40 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{data.name}</p>
      <p className="text-sm font-mono text-gold-400">¥{data.monthlyRevenue.toLocaleString()}</p>
    </div>
  )
}

export default function ShopPage() {
  const { shops, toggleShopStatus } = useStore()
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('全部')

  const openCount = useMemo(() => shops.filter((s) => s.isOpen).length, [shops])
  const openRate = useMemo(() => ((openCount / shops.length) * 100).toFixed(1), [openCount, shops.length])
  const expiringCount = useMemo(
    () => shops.filter((s) => getRentStatus(s.rentExpiryDate).daysLeft <= 30).length,
    [shops],
  )
  const totalRevenue = useMemo(
    () => shops.reduce((sum, s) => sum + s.monthlyRevenue, 0),
    [shops],
  )

  const filteredShops = useMemo(() => {
    if (activeCategory === '全部') return shops
    return shops.filter((s) => s.category === activeCategory)
  }, [shops, activeCategory])

  const chartData = useMemo(
    () =>
      [...shops]
        .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
        .map((s) => ({ name: s.name, monthlyRevenue: s.monthlyRevenue })),
    [shops],
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">商铺管理</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <Store className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">营业中</p>
            <p className="stat-value text-brand-400">{openCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gold-400/15 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">营业率</p>
            <p className="stat-value text-gold-400">{openRate}%</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-danger-400/15 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-danger-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">即将到期</p>
            <p className="stat-value text-danger-400">{expiringCount}</p>
          </div>
        </div>
        <div className="card-hover flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-400/15 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">月营业额</p>
            <p className="stat-value text-brand-400">¥{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4 text-slate-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">分类筛选</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-brand-400/20 text-brand-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredShops.map((shop) => {
          const rentStatus = getRentStatus(shop.rentExpiryDate)
          return (
            <div key={shop.id} className="card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{shop.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{shop.location}</p>
                </div>
                <span className={CATEGORY_BADGE[shop.category] || 'badge-info'}>{shop.category}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {shop.isOpen ? (
                    <ToggleRight
                      className="w-8 h-8 text-brand-400 cursor-pointer hover:text-brand-300 transition-colors"
                      onClick={() => toggleShopStatus(shop.id)}
                    />
                  ) : (
                    <ToggleLeft
                      className="w-8 h-8 text-slate-500 cursor-pointer hover:text-slate-400 transition-colors"
                      onClick={() => toggleShopStatus(shop.id)}
                    />
                  )}
                  <span className={`text-sm font-medium ${shop.isOpen ? 'text-brand-300' : 'text-slate-500'}`}>
                    {shop.isOpen ? '营业中' : '已关闭'}
                  </span>
                </div>
                <span className="text-sm font-mono text-slate-300">¥{shop.monthlyRevenue.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-500/30">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-400">{shop.rentExpiryDate}</span>
                </div>
                <span className={rentStatus.badge}>{rentStatus.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h2 className="section-title">营业额排行</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3750" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                width={70}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Bar dataKey="monthlyRevenue" fill="#2D8B75" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
