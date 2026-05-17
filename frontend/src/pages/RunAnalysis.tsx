import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, FileText, Upload, ChevronDown, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { documentsApi } from '../api/documents'
import { jobsApi } from '../api/jobs'
import { useJobPolling } from '../hooks/useJobPolling'
import { useNotificationStore } from '../store/notificationStore'
import type { SourceDocument, TargetDocument, AnalysisJob } from '../types'
import { shortenFilename, shortenTitle } from '../lib/utils'
import { GlassCard } from '../components/shared/GlassCard'
import { LoadingState } from '../components/shared/LoadingState'

function Select<T extends { id: number }>({
  label,
  icon: Icon,
  items,
  value,
  onChange,
  renderItem,
  placeholder,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string
  icon: React.ElementType
  items: T[]
  value: number | null
  onChange: (id: number) => void
  renderItem: (item: T) => { primary: string; secondary?: string }
  placeholder: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const selected = items.find((i) => i.id === value)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  return (
    <div className="relative" ref={ref}>
      <label className="label">{label}</label>
      <button
        type="button"
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="input-field flex items-center gap-3 text-left cursor-pointer"
      >
        <Icon size={16} className="text-slate-500 flex-shrink-0" />
        <span className={`flex-1 text-sm ${selected ? 'text-slate-200' : 'text-slate-500'}`}>
          {selected ? renderItem(selected).primary : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 top-full mt-1 w-full overflow-hidden shadow-2xl rounded-xl border border-white/[0.12] bg-[#111111]"
          >
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">No items found</div>
            ) : (
              <div className="max-h-48 overflow-y-auto py-1">
                {items.map((item) => {
                  const { primary, secondary } = renderItem(item)
                  const isSelected = item.id === value
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { onChange(item.id); onClose() }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected ? 'bg-violet-500/20' : 'hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-violet-400' : 'text-slate-400'} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-100 truncate">{primary}</p>
                        {secondary && <p className="text-xs text-slate-400">{secondary}</p>}
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="text-violet-400" />}
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function RunAnalysis() {
  const [sources, setSources] = useState<SourceDocument[]>([])
  const [targets, setTargets] = useState<TargetDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [sourceId, setSourceId] = useState<number | null>(null)
  const [targetId, setTargetId] = useState<number | null>(null)
  const [openSelect, setOpenSelect] = useState<'source' | 'target' | null>(null)
  const [startedJob, setStartedJob] = useState<AnalysisJob | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const { job, isPolling } = useJobPolling(startedJob?.job_id ?? null, {
    onComplete: (j) => {
      const src = sources.find((s) => s.id === sourceId)
      const tgt = targets.find((t) => t.id === targetId)
      addNotification({
        title: 'Analysis complete',
        description: `${shortenFilename(src?.original_file_name) || `Source #${sourceId}`} → ${shortenTitle(tgt?.title) || `Target #${targetId}`}`,
        analysisId: j.analysis_result_id ?? undefined,
      })
      if (j.analysis_result_id) navigate(`/analysis/${j.analysis_result_id}`)
    },
  })

  useEffect(() => {
    Promise.allSettled([documentsApi.getSources(), documentsApi.getTargets()]).then(
      ([s, t]) => {
        if (s.status === 'fulfilled') setSources(s.value)
        if (t.status === 'fulfilled') setTargets(t.value)
        setLoadingDocs(false)
      }
    )
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceId || !targetId) return
    setSubmitError(null)
    try {
      const j = await jobsApi.startAnalysis(sourceId, targetId)
      setStartedJob(j)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      setSubmitError(msg || 'Failed to start analysis.')
    }
  }

  const currentJob = job || startedJob

  const isTerminal = currentJob?.status === 'SUCCESS' || currentJob?.status === 'FAILURE'
  const isRunning = !isTerminal && !!currentJob

  return (
    <div className="max-w-2xl space-y-6">
      <GlassCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Zap size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-200">Run Document Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">Match a source document against a target</p>
          </div>
        </div>

        {loadingDocs ? (
          <LoadingState message="Loading documents..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Source Document (resume / CV)"
              icon={Upload}
              items={sources}
              value={sourceId}
              onChange={setSourceId}
              placeholder="Select source document..."
              renderItem={(d) => ({ primary: d.original_file_name, secondary: d.document_category })}
              isOpen={openSelect === 'source'}
              onOpen={() => setOpenSelect('source')}
              onClose={() => setOpenSelect(null)}
            />

            <Select
              label="Target Document (job description)"
              icon={FileText}
              items={targets}
              value={targetId}
              onChange={setTargetId}
              placeholder="Select target document..."
              renderItem={(d) => ({ primary: d.title, secondary: d.target_category })}
              isOpen={openSelect === 'target'}
              onOpen={() => setOpenSelect('target')}
              onClose={() => setOpenSelect(null)}
            />

            {submitError && (
              <div className="p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 flex items-center gap-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            {sources.length === 0 && (
              <p className="text-sm text-amber-400/80">
                No source documents yet. Upload one first.
              </p>
            )}
            {targets.length === 0 && (
              <p className="text-sm text-amber-400/80">
                No target documents yet. Create one first.
              </p>
            )}

            <button
              type="submit"
              disabled={!sourceId || !targetId || isPolling || !!startedJob}
              className="btn-primary w-full justify-center py-3"
            >
              <Zap size={16} /> Start Analysis
            </button>
          </form>
        )}
      </GlassCard>

      {/* Job status */}
      <AnimatePresence>
        {currentJob && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <GlassCard>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  currentJob.status === 'SUCCESS'
                    ? 'bg-emerald-500/10'
                    : currentJob.status === 'FAILURE'
                    ? 'bg-red-500/10'
                    : 'bg-violet-500/10'
                }`}>
                  {currentJob.status === 'SUCCESS' ? (
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  ) : currentJob.status === 'FAILURE' ? (
                    <AlertCircle size={22} className="text-red-400" />
                  ) : (
                    <Loader2 size={22} className="text-violet-400 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-200">
                    {currentJob.status === 'STARTED'
                      ? 'Analyzing documents...'
                      : currentJob.status === 'PENDING'
                      ? 'Queued — starting soon'
                      : currentJob.status === 'SUCCESS'
                      ? 'Analysis complete! Redirecting...'
                      : 'Analysis failed'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Job ID: {currentJob.job_id}</p>
                </div>
                <span className={`badge ${
                  currentJob.status === 'SUCCESS'
                    ? 'badge-success'
                    : currentJob.status === 'FAILURE'
                    ? 'badge-danger'
                    : 'badge-info'
                }`}>
                  {currentJob.status}
                </span>
              </div>

              {isRunning && (
                <div className="mt-4">
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-500 to-transparent"
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-2 text-center">
                    AI is reading and comparing your documents...
                  </p>
                </div>
              )}

              {currentJob.status === 'FAILURE' && (
                <button
                  className="btn-secondary mt-4 text-sm"
                  onClick={() => { setStartedJob(null); setSubmitError(null) }}
                >
                  Try again
                </button>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
