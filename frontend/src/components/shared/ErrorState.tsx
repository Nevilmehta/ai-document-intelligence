import { AlertCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Failed to load data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-8 flex flex-col items-center gap-4 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-200">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </motion.div>
  )
}
