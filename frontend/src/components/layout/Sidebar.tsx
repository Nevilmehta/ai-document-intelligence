import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Upload,
  FileText,
  Zap,
  History,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../lib/utils'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/sources', icon: Upload, label: 'Source Docs', end: false },
  { to: '/targets', icon: FileText, label: 'Target Docs', end: false },
  { to: '/analysis/run', icon: Zap, label: 'Run Analysis', end: true },
  { to: '/analysis', icon: History, label: 'History', end: true },
  { to: '/monitoring', icon: Activity, label: 'Monitoring', end: false },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen bg-[#0A0A0A] border-r border-white/[0.07] shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-base font-bold tracking-tight gradient-text whitespace-nowrap"
            >
              DocIntel
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative',
                isActive
                  ? 'bg-violet-500/[0.15] text-violet-300 border border-violet-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-violet-500/[0.12] border border-violet-500/20"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-4.5 h-4.5 flex-shrink-0 relative z-10 transition-colors',
                    isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                  size={18}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium relative z-10 whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/[0.07] p-3 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(user?.full_name, user?.email)}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-slate-200 truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full justify-start text-slate-500 hover:text-red-400 hover:bg-red-500/[0.08]"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1A1A1A] border border-white/[0.12] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:border-white/25 transition-all z-20 shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
