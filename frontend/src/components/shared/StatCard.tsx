import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  delay?: number
  children?: ReactNode
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-violet-400',
  iconBg = 'bg-violet-500/10',
  trend,
  delay = 0,
  children,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className="glass p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-100 mt-1 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'text-xs font-semibold',
              trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-xs text-slate-600">{trend.label}</span>
        </div>
      )}

      {children}
    </motion.div>
  )
}
