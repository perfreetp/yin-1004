import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Ticket,
  Drama,
  Users,
  Store,
  MessageSquareWarning,
  ShieldCheck,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Mountain,
} from 'lucide-react'

const navItems = [
  { path: '/', label: '运营看板', icon: LayoutDashboard },
  { path: '/ticket', label: '票务管理', icon: Ticket },
  { path: '/performance', label: '演出排期', icon: Drama },
  { path: '/visitor-flow', label: '客流监测', icon: Users },
  { path: '/shop', label: '商铺管理', icon: Store },
  { path: '/complaint', label: '投诉工单', icon: MessageSquareWarning },
  { path: '/patrol', label: '巡场记录', icon: ShieldCheck },
  { path: '/notification', label: '通知发布', icon: Megaphone },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <aside
        className={`${
          collapsed ? 'w-[68px]' : 'w-[220px]'
        } flex flex-col border-r border-surface-500/30 bg-surface-800 transition-all duration-300 flex-shrink-0`}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-500/30 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-serif font-bold text-slate-100 whitespace-nowrap">万岁山景区</h1>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">运营工作台</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-400/15 text-brand-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-600/50'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-surface-500/30 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
