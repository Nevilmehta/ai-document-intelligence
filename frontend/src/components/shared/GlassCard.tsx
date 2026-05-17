import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: 'violet' | 'cyan' | 'emerald' | 'amber' | 'none'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const GLOW_STYLES = {
  violet: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.12)] hover:border-violet-500/25',
  cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.10)] hover:border-cyan-500/25',
  emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.10)] hover:border-emerald-500/25',
  amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.10)] hover:border-amber-500/25',
  none: '',
}

const PADDING_STYLES = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function GlassCard({
  children,
  className,
  glow = 'none',
  hover = false,
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass',
        hover && 'transition-all duration-300 cursor-pointer hover:bg-white/[0.07]',
        GLOW_STYLES[glow],
        PADDING_STYLES[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
