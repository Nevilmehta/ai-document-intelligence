import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { History, ArrowRight, Search, TrendingUp, Clock } from 'lucide-react'
import { analysisApi } from '../api/analysis'
import type { AnalysisResult } from '../types'
import { GlassCard } from '../components/shared/GlassCard'
import { EmptyState } from '../components/shared/EmptyState'
import { LoadingState } from '../components/shared/LoadingState'
import { Tooltip } from '../components/shared/Tooltip'
import { scoreColor, scoreGradient, formatDate, formatRelativeTime, shortenFilename, shortenTitle } from '../lib/utils'

const CustomTooltip = ({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: { score: number; label: string } }>
}) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass-sm px-3 py-2">
      <p className="text-xs text-slate-400">{d.label}</p>
      <p className="text-sm font-semibold" style={{ color: d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444' }}>
        {d.score}%
      </p>
    </div>
  )
}

export function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    analysisApi
      .getAll()
      .then(setAnalyses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = analyses.filter((a) => {
    const q = search.toLowerCase()
    return (
      !q ||
      a.source_filename?.toLowerCase().includes(q) ||
      a.target_title?.toLowerCase().includes(q)
    )
  })

  const chartData = analyses
    .slice(-10)
    .map((a, i) => ({
      label: `#${i + 1}`,
      score: Math.round(a.fit_score),
    }))

  const avgScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((s, a) => s + a.fit_score, 0) / analyses.length)
      : 0

  const best = analyses.reduce(
    (b, a) => (a.fit_score > (b?.fit_score ?? 0) ? a : b),
    null as AnalysisResult | null
  )

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Analyses',
            value: analyses.length,
            icon: History,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
          },
          {
            label: 'Average Fit Score',
            value: `${avgScore}%`,
            icon: TrendingUp,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
          },
          {
            label: 'Best Score',
            value: best ? `${Math.round(best.fit_score)}%` : '—',
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-100">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard>
            <h3 className="font-semibold text-slate-200 mb-5">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fill: '#64748b', fontSize: 11 }} />
                <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.score >= 80 ? '#10b981' : d.score >= 60 ? '#f59e0b' : '#ef4444'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-200">All Results</h3>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 py-2 text-sm w-52"
                placeholder="Search..."
              />
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading analyses..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={History}
              title="No analyses yet"
              description="Run your first analysis to see results here."
              action={
                <Link to="/analysis/run" className="btn-primary text-sm">
                  Run Analysis
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filtered.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/analysis/${a.id}`}
                    className="flex items-center gap-4 py-4 -mx-6 px-6 hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Score pill */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 bg-gradient-to-br ${scoreGradient(a.fit_score)} bg-opacity-10`}
                      style={{ background: `rgba(0,0,0,0.2)` }}
                    >
                      <span className={`text-lg font-bold leading-none ${scoreColor(a.fit_score)}`}>
                        {Math.round(a.fit_score)}
                      </span>
                      <span className="text-[9px] text-slate-600 mt-0.5">SCORE</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Tooltip text={a.source_filename || `Source Document #${a.source_document_id}`} side="top">
                        <p className="text-sm font-medium text-slate-200 truncate max-w-[220px]">
                          {shortenFilename(a.source_filename, 28) || `Source #${a.source_document_id}`}
                        </p>
                      </Tooltip>
                      <Tooltip text={a.target_title || `Target Document #${a.target_document_id}`} side="bottom">
                        <p className="text-xs text-slate-500 truncate max-w-[220px] mt-0.5">
                          → {shortenTitle(a.target_title, 30) || `Target #${a.target_document_id}`}
                        </p>
                      </Tooltip>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                        <Clock size={10} /> {formatRelativeTime(a.created_at)}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{formatDate(a.created_at)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">similarity</p>
                      <p className="text-sm font-medium text-slate-300">
                        {a.semantic_similarity != null ? `${Math.round(a.semantic_similarity * 100)}%` : '—'}
                      </p>
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-slate-700 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}
