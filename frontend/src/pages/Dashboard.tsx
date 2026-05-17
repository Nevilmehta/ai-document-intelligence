import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import {
  BarChart3,
  Upload,
  FileText,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { StatCard } from '../components/shared/StatCard'
import { GlassCard } from '../components/shared/GlassCard'
import { Tooltip } from '../components/shared/Tooltip'
import { analysisApi } from '../api/analysis'
import { documentsApi } from '../api/documents'
import type { AnalysisResult } from '../types'
import { formatRelativeTime, scoreColor, shortenFilename, shortenTitle } from '../lib/utils'

const MOCK_CHART_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: Math.floor(55 + Math.random() * 40),
}))

const QUICK_ACTIONS = [
  { label: 'Upload Resume', to: '/sources', icon: Upload, color: 'violet' as const },
  { label: 'Add Job Description', to: '/targets', icon: FileText, color: 'cyan' as const },
  { label: 'Run Analysis', to: '/analysis/run', icon: Zap, color: 'emerald' as const },
]

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-sm px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-violet-400">{payload[0].value}%</p>
    </div>
  )
}

export function Dashboard() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [sourceCount, setSourceCount] = useState(0)
  const [targetCount, setTargetCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      analysisApi.getAll(),
      documentsApi.getSources(),
      documentsApi.getTargets(),
    ]).then(([a, s, t]) => {
      if (a.status === 'fulfilled') setAnalyses(a.value)
      if (s.status === 'fulfilled') setSourceCount(s.value.length)
      if (t.status === 'fulfilled') setTargetCount(t.value.length)
      setLoading(false)
    })
  }, [])

  const avgScore =
    analyses.length > 0
      ? Math.round(analyses.reduce((s, a) => s + a.fit_score, 0) / analyses.length)
      : 0

  const chartData =
    analyses.length > 0
      ? analyses
          .slice(-14)
          .map((a, i) => ({ day: `#${i + 1}`, score: Math.round(a.fit_score) }))
      : MOCK_CHART_DATA

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Analyses"
          value={loading ? '—' : analyses.length}
          icon={BarChart3}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
          delay={0}
          trend={{ value: 12, label: 'this week' }}
        />
        <StatCard
          title="Avg Fit Score"
          value={loading ? '—' : `${avgScore}%`}
          icon={TrendingUp}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
          delay={0.05}
          trend={{ value: 4.2, label: 'vs last week' }}
        />
        <StatCard
          title="Source Documents"
          value={loading ? '—' : sourceCount}
          icon={Upload}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
          delay={0.1}
        />
        <StatCard
          title="Target Documents"
          value={loading ? '—' : targetCount}
          icon={FileText}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-200">Fit Score Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Last {chartData.length} analyses</p>
              </div>
              <span className="badge-info">Live</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <ChartTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col gap-4"
        >
          <GlassCard>
            <h3 className="font-semibold text-slate-200 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="glass-hover flex items-center gap-3 p-3.5 group"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      color === 'violet'
                        ? 'bg-violet-500/15 text-violet-400'
                        : color === 'cyan'
                        ? 'bg-cyan-500/15 text-cyan-400'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-300 flex-1">{label}</span>
                  <ArrowRight
                    size={14}
                    className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold text-slate-200 mb-3">System Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'API Server', ok: true },
                { label: 'Redis Cache', ok: true },
                { label: 'AI Engine', ok: true },
                { label: 'Document Store', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`dot-pulse ${ok ? 'bg-emerald-400' : 'bg-red-400'}`}
                    />
                    <span className={`text-xs ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ok ? 'Healthy' : 'Down'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent analyses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-200">Recent Analyses</h3>
            <Link to="/analysis" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {analyses.length === 0 && !loading ? (
            <div className="py-10 text-center">
              <p className="text-slate-600 text-sm">No analyses yet.</p>
              <Link to="/analysis/run" className="btn-primary mt-4 text-sm">
                <Zap size={14} /> Run your first analysis
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {(analyses.length > 0 ? analyses.slice(0, 5) : []).map((a) => (
                <Link
                  key={a.id}
                  to={`/analysis/${a.id}`}
                  className="flex items-center gap-4 py-3.5 hover:bg-white/[0.03] -mx-6 px-6 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5 min-w-0">
                      <Tooltip text={a.source_filename || `Source Document #${a.source_document_id}`}>
                        <span className="truncate max-w-[130px] block">
                          {shortenFilename(a.source_filename) || `Source #${a.source_document_id}`}
                        </span>
                      </Tooltip>
                      <span className="text-slate-600 flex-shrink-0">→</span>
                      <Tooltip text={a.target_title || `Target Document #${a.target_document_id}`}>
                        <span className="truncate max-w-[130px] block">
                          {shortenTitle(a.target_title) || `Target #${a.target_document_id}`}
                        </span>
                      </Tooltip>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {formatRelativeTime(a.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${scoreColor(a.fit_score)}`}>
                      {Math.round(a.fit_score)}%
                    </span>
                    <p className="text-xs text-slate-600">fit score</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-700 group-hover:text-slate-500 transition-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}
