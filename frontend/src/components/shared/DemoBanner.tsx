import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="overflow-hidden flex-shrink-0"
        >
          <div className="flex items-center justify-between gap-4 px-6 py-2.5 bg-violet-500/[0.08] border-b border-violet-500/[0.14]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles size={13} className="text-violet-400 flex-shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="text-violet-300 font-medium">Demo mode</span>
                {' '}— you&apos;re exploring with a shared guest account. Results may not be saved permanently.{' '}
                <Link
                  to="/login"
                  className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors font-medium"
                >
                  Sign in
                </Link>
                {' '}or{' '}
                <Link
                  to="/signup"
                  className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors font-medium"
                >
                  create an account
                </Link>
                {' '}to keep your own history.
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-600 hover:text-slate-400 flex-shrink-0 transition-colors rounded"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
