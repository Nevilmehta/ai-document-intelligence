import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts'
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react'
import { analysisApi } from '../api/analysis'
import { retrievalApi } from '../api/retrieval'
import type { AnalysisResult as AnalysisResultType, RetrievalResult } from '../types'
import { GlassCard } from '../components/shared/GlassCard'
import { LoadingState } from '../components/shared/LoadingState'
import { ErrorState } from '../components/shared/ErrorState'
import { Tooltip } from '../components/shared/Tooltip'
import { scoreColor, scoreGradient, formatDate, shortenFilename, shortenTitle } from '../lib/utils'

type Tab = 'overview' | 'strengths' | 'gaps' | 'suggestions' | 'cover_letter' | 'chunks'

function ScoreGauge({ score }: { score: number }) {
  const data = [{ value: score, fill: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }]
  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={220}
          endAngle={-40}
          data={[{ value: 100, fill: 'rgba(255,255,255,0.05)' }, ...data]}
          barSize={12}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${scoreColor(score)}`}>{Math.round(score)}%</span>
        <span className="text-xs text-slate-500 mt-1">Fit Score</span>
      </div>
    </div>
  )
}

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Semantic Similarity</span>
        <span className="font-semibold text-slate-200">{pct}%</span>
      </div>
      <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(pct)}`}
        />
      </div>
    </div>
  )
}

function BulletList({ items, icon: Icon, iconClass }: {
  items: string[]
  icon: React.ElementType
  iconClass: string
}) {
  if (!items.length) return <p className="text-slate-500 text-sm">No items found.</p>
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3"
        >
          <Icon size={16} className={`${iconClass} flex-shrink-0 mt-0.5`} />
          <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
        </motion.li>
      ))}
    </ul>
  )
}

function ChunkItem({ chunk, index }: { chunk: { content: string; score: number }; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-xs font-mono text-slate-600 w-6 flex-shrink-0">#{index + 1}</span>
        <span className="flex-1 text-sm text-slate-300 truncate">{chunk.content}</span>
        <span className="text-xs font-medium text-violet-400 mr-2">
          {Math.round(chunk.score * 100)}%
        </span>
        {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <p className="p-4 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{chunk.content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'strengths', label: 'Strengths', icon: CheckCircle2 },
  { id: 'gaps', label: 'Gaps', icon: XCircle },
  { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { id: 'cover_letter', label: 'Cover Letter', icon: Mail },
  { id: 'chunks', label: 'Chunks', icon: Sparkles },
]

export function AnalysisResult() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<AnalysisResultType | null>(null)
  const [retrieval, setRetrieval] = useState<RetrievalResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!id) return
    analysisApi
      .getResult(id)
      .then((r) => {
        setResult(r)
        return retrievalApi.getChunks(r.source_document_id, r.target_document_id).catch(() => null)
      })
      .then((ret) => { if (ret) setRetrieval(ret) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingState message="Loading analysis result..." fullPage />
  if (error || !result) return <ErrorState title="Result not found" message="This analysis result could not be loaded." />

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link to="/analysis" className="btn-ghost text-slate-500 text-sm">
          <ArrowLeft size={14} /> History
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-sm text-slate-400">Result #{id?.slice(0, 8)}</span>
      </div>

      {/* Score header */}
      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1 flex flex-col items-center">
            <ScoreGauge score={result.fit_score} />
            <p className="text-xs text-slate-500 mt-2">
              {result.fit_score >= 80
                ? 'Excellent match'
                : result.fit_score >= 60
                ? 'Good match'
                : 'Needs improvement'}
            </p>
          </div>
          <div className="md:col-span-2 space-y-5">
            <div>
              <p className="text-xs text-slate-500 mb-1">Source Document</p>
              <Tooltip text={result.source_filename || `Source Document #${result.source_document_id}`} side="top">
                <p className="font-medium text-slate-200 truncate max-w-xs">
                  {shortenFilename(result.source_filename, 36) || `Source #${result.source_document_id}`}
                </p>
              </Tooltip>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Target Document</p>
              <Tooltip text={result.target_title || `Target Document #${result.target_document_id}`} side="bottom">
                <p className="font-medium text-slate-200 truncate max-w-xs">
                  {shortenTitle(result.target_title, 36) || `Target #${result.target_document_id}`}
                </p>
              </Tooltip>
            </div>
            {result.semantic_similarity != null && (
              <SimilarityBar value={result.semantic_similarity} />
            )}
            <div className="flex items-center gap-4 pt-1">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{result.strengths.length}</p>
                <p className="text-xs text-slate-500">Strengths</p>
              </div>
              <div className="h-8 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{result.gaps.length}</p>
                <p className="text-xs text-slate-500">Gaps</p>
              </div>
              <div className="h-8 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{result.suggestions.length}</p>
                <p className="text-xs text-slate-500">Suggestions</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-600">{formatDate(result.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              tab === tid
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/25'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard>
                <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Top Strengths
                </h4>
                <BulletList items={result.strengths.slice(0, 3)} icon={CheckCircle2} iconClass="text-emerald-400" />
              </GlassCard>
              <GlassCard>
                <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle size={16} /> Key Gaps
                </h4>
                <BulletList items={result.gaps.slice(0, 3)} icon={XCircle} iconClass="text-red-400" />
              </GlassCard>
            </div>
          )}

          {tab === 'strengths' && (
            <GlassCard>
              <h4 className="font-semibold text-slate-200 mb-4">All Strengths ({result.strengths.length})</h4>
              <BulletList items={result.strengths} icon={CheckCircle2} iconClass="text-emerald-400" />
            </GlassCard>
          )}

          {tab === 'gaps' && (
            <GlassCard>
              <h4 className="font-semibold text-slate-200 mb-4">All Gaps ({result.gaps.length})</h4>
              <BulletList items={result.gaps} icon={XCircle} iconClass="text-red-400" />
            </GlassCard>
          )}

          {tab === 'suggestions' && (
            <div className="space-y-4">
              <GlassCard>
                <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-400" /> Suggestions
                </h4>
                <BulletList items={result.suggestions} icon={Lightbulb} iconClass="text-amber-400" />
              </GlassCard>
              {result.improved_bullets.length > 0 && (
                <GlassCard>
                  <h4 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-400" /> Improved Bullets
                  </h4>
                  <BulletList items={result.improved_bullets} icon={Sparkles} iconClass="text-violet-400" />
                </GlassCard>
              )}
            </div>
          )}

          {tab === 'cover_letter' && (
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Mail size={16} className="text-cyan-400" />
                <h4 className="font-semibold text-slate-200">AI-Generated Cover Letter</h4>
              </div>
              {result.cover_letter ? (
                <div className="relative">
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full" />
                  <p className="pl-4 text-sm text-slate-300 leading-[1.85] whitespace-pre-wrap">
                    {result.cover_letter}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No cover letter generated.</p>
              )}
            </GlassCard>
          )}

          {tab === 'chunks' && (
            <div className="space-y-4">
              {retrieval ? (
                <>
                  <GlassCard>
                    <h4 className="font-semibold text-slate-200 mb-4">
                      Source Chunks ({retrieval.source_chunks?.length ?? 0})
                    </h4>
                    <div className="space-y-2">
                      {(retrieval.source_chunks ?? []).map((c, i) => (
                        <ChunkItem key={i} chunk={c} index={i} />
                      ))}
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <h4 className="font-semibold text-slate-200 mb-4">
                      Target Chunks ({retrieval.target_chunks?.length ?? 0})
                    </h4>
                    <div className="space-y-2">
                      {(retrieval.target_chunks ?? []).map((c, i) => (
                        <ChunkItem key={i} chunk={c} index={i} />
                      ))}
                    </div>
                  </GlassCard>
                </>
              ) : (
                <GlassCard>
                  <p className="text-sm text-slate-500">Retrieval data not available for this analysis.</p>
                </GlassCard>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
