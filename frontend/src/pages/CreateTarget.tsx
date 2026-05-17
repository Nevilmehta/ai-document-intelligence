import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  X,
  Eye,
  File,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { documentsApi } from '../api/documents'
import type { TargetDocument } from '../types'
import { formatRelativeTime } from '../lib/utils'
import { EmptyState } from '../components/shared/EmptyState'
import { LoadingState } from '../components/shared/LoadingState'
import { GlassCard } from '../components/shared/GlassCard'

const CATEGORY_LABEL: Record<string, string> = {
  job_description: 'Job Description',
  internship: 'Internship',
  freelance: 'Freelance',
  other: 'Other',
}

const PLACEHOLDER = `Software Engineer, Backend — Acme Corp

We're looking for a backend engineer with 3+ years of experience in Python, FastAPI, or Django. Experience with distributed systems, PostgreSQL, and cloud infrastructure (AWS/GCP) is a plus.

Responsibilities:
- Design and build scalable REST APIs
- Collaborate with cross-functional teams
- Participate in architecture and code reviews

Requirements:
- 3+ years Python experience
- Familiarity with containerization (Docker, Kubernetes)
- Strong understanding of SQL and NoSQL databases`

export function CreateTarget() {
  const [targets, setTargets] = useState<TargetDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const fetchTargets = async () => {
    try {
      const data = await documentsApi.getTargets()
      setTargets(data)
    } catch {
      // show empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTargets() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await documentsApi.createTarget(title.trim(), content.trim())
      setTitle('')
      setContent('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      await fetchTargets()
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      setError(msg || 'Failed to create target document.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Form */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-200">Create Target Document</h2>
            <p className="text-xs text-slate-500 mt-0.5">Paste a job description or any target content</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <FileText size={16} className="text-cyan-400" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g. Senior Backend Engineer — Acme Corp"
              required
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field resize-none leading-relaxed"
              rows={10}
              placeholder={PLACEHOLDER}
              required
            />
            <p className="text-xs text-slate-600 mt-1.5 text-right">
              {content.length} chars · ~{Math.ceil(content.split(/\s+/).filter(Boolean).length)} words
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 flex items-center gap-2"
              >
                <X size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-emerald-300">Target document created successfully!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="btn-primary"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={16} /> Save Target Document
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {/* List */}
      <GlassCard>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-200">Saved Targets</h3>
          <span className="badge-neutral">{targets.length} documents</span>
        </div>

        {loading ? (
          <LoadingState message="Loading targets..." />
        ) : targets.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No target documents"
            description="Create your first target document by pasting a job description above."
          />
        ) : (
          <div className="space-y-2">
            {targets.map((doc, i) => {
              const isExpanded = expandedId === doc.id
              const preview = doc.raw_text || doc.cleaned_text || ''
              const hasPreview = preview.length > 0
              const category = CATEGORY_LABEL[doc.target_category] ?? doc.target_category

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-sm overflow-hidden"
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 p-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-cyan-400" />
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="badge-info text-[10px]">{category}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {formatRelativeTime(doc.created_at)}
                        </span>
                        {hasPreview && (
                          <span className="text-xs text-slate-600">
                            ~{Math.ceil(preview.split(/\s+/).filter(Boolean).length)} words
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {hasPreview && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                        className="btn-ghost text-xs gap-1 py-1.5 px-2.5 flex-shrink-0"
                        title="Preview document text"
                      >
                        <Eye size={13} />
                        {isExpanded ? 'Hide' : 'Preview'}
                        {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    )}
                  </div>

                  {/* Expandable text preview */}
                  <AnimatePresence>
                    {isExpanded && hasPreview && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/[0.06] mx-4" />
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <File size={12} className="text-slate-500" />
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Document Text Preview
                            </span>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-4 max-h-56 overflow-y-auto">
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap font-mono text-[12px]">
                              {preview}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-2 text-right">
                            {preview.length} characters total
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
