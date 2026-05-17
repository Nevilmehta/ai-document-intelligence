import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
}: LoadingStateProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 36 : 28

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <Loader2
        size={iconSize}
        className="text-violet-400 animate-spin"
      />
      <p className="text-sm text-slate-500">{message}</p>
    </motion.div>
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">{content}</div>
    )
  }

  return (
    <div className="flex items-center justify-center py-16">{content}</div>
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="glass p-6 space-y-3 animate-pulse">
      <div className="h-4 bg-white/[0.06] rounded-lg w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-white/[0.04] rounded-lg"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  )
}
