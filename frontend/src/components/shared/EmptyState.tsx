import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-12 flex flex-col items-center gap-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-600" />
      </div>
      <div>
        <p className="font-semibold text-slate-300">{title}</p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  )
}
