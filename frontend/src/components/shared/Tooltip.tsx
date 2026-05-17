import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  text: string
  children: React.ReactNode
  side?: 'top' | 'bottom'
  maxWidth?: string
}

export function Tooltip({ text, children, side = 'top', maxWidth = 'max-w-xs' }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && text && (
          <motion.div
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={`absolute ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 z-[200] pointer-events-none`}
          >
            <div className={`${maxWidth} px-2.5 py-1.5 bg-[#1F1F1F] border border-white/[0.14] rounded-lg text-xs text-slate-200 shadow-2xl whitespace-normal break-words text-center`}>
              {text}
            </div>
            <div
              className={`absolute left-1/2 -translate-x-1/2 border-[5px] border-transparent ${
                side === 'top'
                  ? 'top-full border-t-[#1F1F1F]'
                  : 'bottom-full border-b-[#1F1F1F]'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
