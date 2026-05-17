import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, X, Trash2 } from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'
import { formatRelativeTime } from '../../lib/utils'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your document intelligence' },
  '/sources': { title: 'Source Documents', subtitle: 'Manage uploaded resume / source files' },
  '/targets': { title: 'Target Documents', subtitle: 'Job descriptions and target content' },
  '/analysis/run': { title: 'Run Analysis', subtitle: 'Match a source against a target' },
  '/analysis': { title: 'Analysis History', subtitle: 'Past analysis results and scores' },
  '/monitoring': { title: 'System Monitoring', subtitle: 'Health status and architecture' },
}

function getPageMeta(pathname: string) {
  if (pathname.startsWith('/analysis/') && pathname !== '/analysis/run') {
    return { title: 'Analysis Result', subtitle: 'Detailed fit score and recommendations' }
  }
  return PAGE_TITLES[pathname] ?? { title: 'DocIntel', subtitle: '' }
}

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { title, subtitle } = getPageMeta(pathname)

  const { notifications, markRead, markAllRead, remove, clearAll } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    setOpen((o) => !o)
  }

  const handleClick = (id: string, analysisId?: number) => {
    markRead(id)
    if (analysisId) navigate(`/analysis/${analysisId}`)
    setOpen(false)
  }

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.07] bg-black/90 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Notification bell */}
      <div className="relative" ref={ref}>
        <button
          onClick={handleOpen}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-violet-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#111111] border border-white/[0.10] rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-slate-400" />
                  <span className="text-sm font-semibold text-slate-200">Notifications</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 bg-violet-500/20 text-violet-300 text-[10px] font-bold rounded-full">
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="p-1.5 text-slate-600 hover:text-slate-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                      title="Clear all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell size={28} className="text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No notifications yet</p>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Analysis completions will appear here
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`relative flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.05] last:border-0 transition-colors group ${
                        n.analysisId
                          ? 'cursor-pointer hover:bg-white/[0.04]'
                          : 'hover:bg-white/[0.02]'
                      } ${!n.read ? 'bg-violet-500/[0.04]' : ''}`}
                      onClick={() => handleClick(n.id, n.analysisId)}
                    >
                      {/* Unread dot */}
                      {!n.read && (
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-violet-500 rounded-full flex-shrink-0" />
                      )}

                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        !n.read ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                      }`}>
                        <CheckCircle2 size={15} className={!n.read ? 'text-emerald-400' : 'text-slate-600'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${!n.read ? 'text-slate-100' : 'text-slate-400'}`}>
                          {n.title}
                        </p>
                        {n.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{n.description}</p>
                        )}
                        <p className="text-[10px] text-slate-700 mt-1">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); remove(n.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-700 hover:text-slate-500 transition-all flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
