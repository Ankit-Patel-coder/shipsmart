// src/components/layout/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../context/authStore'
import {
  LayoutDashboard, Upload, History, User, LogOut,
  Zap, Menu, X, ChevronRight
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,          label: 'Upload Images' },
  { to: '/history',   icon: History,         label: 'History' },
  { to: '/profile',   icon: User,            label: 'Profile' },
]

function PlanBadge({ plan }) {
  const colors = {
    FREE:      'bg-neutral-100 text-neutral-600',
    STARTER:   'bg-blue-50 text-blue-700',
    PRO:       'bg-purple-50 text-purple-700',
    UNLIMITED: 'bg-brand-50 text-brand-700',
  }
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[plan] || colors.FREE}`}>
      {plan}
    </span>
  )
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full bg-white border-r border-neutral-100 ${mobile ? 'w-72' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-neutral-100">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-semibold text-[15px] text-neutral-900">ShipSmart</span>
          <p className="text-[10px] text-neutral-400 leading-none mt-0.5">Meesho Optimiser</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quota bar */}
      {user && (
        <div className="mx-3 mb-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-500">Images used</span>
            <PlanBadge plan={user.plan} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-neutral-800">
              {user.imagesUsed}
              <span className="text-neutral-400 font-normal">
                /{user.imagesLimit === -1 ? '∞' : user.imagesLimit}
              </span>
            </span>
            {user.plan === 'FREE' && (
              <button
                onClick={() => { navigate('/pricing'); mobile && setMobileOpen(false) }}
                className="text-[11px] text-brand-600 font-medium hover:underline flex items-center gap-0.5"
              >
                Upgrade <ChevronRight size={10} />
              </button>
            )}
          </div>
          {user.imagesLimit !== -1 && (
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((user.imagesUsed / user.imagesLimit) * 100))}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors" title="Log out">
            <LogOut size={15} className="text-neutral-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-neutral-50">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-semibold text-sm">ShipSmart</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
