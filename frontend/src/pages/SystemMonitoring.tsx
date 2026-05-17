import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Database,
  Server,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { healthApi } from '../api/health'
import type { HealthStatus, RedisHealth } from '../types'
import { GlassCard } from '../components/shared/GlassCard'

function StatusBadge({ status }: { status: string }) {
  const ok = status === 'healthy'
  return (
    <div className={`flex items-center gap-1.5 ${ok ? 'text-emerald-400' : 'text-red-400'}`}>
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  )
}

const ARCH_NODES = [
  {
    id: 'client',
    label: 'Browser Client',
    sublabel: 'React + Vite',
    icon: Globe,
    color: 'from-violet-600 to-violet-500',
    x: 0,
  },
  {
    id: 'nginx',
    label: 'Nginx',
    sublabel: 'Reverse Proxy',
    icon: Server,
    color: 'from-slate-600 to-slate-500',
    x: 1,
  },
  {
    id: 'api',
    label: 'FastAPI',
    sublabel: 'Backend API',
    icon: Zap,
    color: 'from-cyan-600 to-cyan-500',
    x: 2,
  },
  {
    id: 'redis',
    label: 'Redis',
    sublabel: 'Job Queue & Cache',
    icon: Database,
    color: 'from-red-600 to-red-500',
    x: 3,
  },
  {
    id: 'ai',
    label: 'AI Engine',
    sublabel: 'Embeddings & LLM',
    icon: Cpu,
    color: 'from-amber-600 to-amber-500',
    x: 4,
  },
]

export function SystemMonitoring() {
  const [apiHealth, setApiHealth] = useState<HealthStatus | null>(null)
  const [redisHealth, setRedisHealth] = useState<RedisHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const [api, redis] = await Promise.allSettled([
      healthApi.check(),
      healthApi.redisCheck(),
    ])
    if (api.status === 'fulfilled') setApiHealth(api.value)
    else setApiHealth({ status: 'unhealthy', timestamp: new Date().toISOString() })
    if (redis.status === 'fulfilled') setRedisHealth(redis.value)
    else setRedisHealth({ status: 'unhealthy' })
    setLastChecked(new Date())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const overallOk = apiHealth?.status === 'healthy' && redisHealth?.status === 'healthy'

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Overall status banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass p-5 flex items-center gap-4 border ${
          overallOk ? 'border-emerald-500/20' : 'border-red-500/20'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            overallOk ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}
        >
          {overallOk ? (
            <CheckCircle2 size={24} className="text-emerald-400" />
          ) : (
            <AlertCircle size={24} className="text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-200">
            {overallOk ? 'All Systems Operational' : 'System Degraded'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {lastChecked
              ? `Last checked at ${lastChecked.toLocaleTimeString()}`
              : 'Checking systems...'}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Health cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API health */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassCard>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Zap size={18} className="text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">API Server</p>
                  <p className="text-xs text-slate-500">FastAPI backend</p>
                </div>
              </div>
              {apiHealth ? <StatusBadge status={apiHealth.status} /> : <span className="text-slate-600 text-sm">—</span>}
            </div>
            <div className="space-y-2">
              {apiHealth?.version && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Version</span>
                  <span className="text-slate-300 font-mono">{apiHealth.version}</span>
                </div>
              )}
              {apiHealth?.uptime !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Uptime</span>
                  <span className="text-slate-300">
                    {Math.floor(apiHealth.uptime / 3600)}h {Math.floor((apiHealth.uptime % 3600) / 60)}m
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Endpoint</span>
                <span className="text-slate-400 font-mono text-xs">
                  {import.meta.env.VITE_API_BASE_URL || 'localhost:8000'}
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Redis health */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Database size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-200">Redis Cache</p>
                  <p className="text-xs text-slate-500">Job queue & caching</p>
                </div>
              </div>
              {redisHealth ? <StatusBadge status={redisHealth.status} /> : <span className="text-slate-600 text-sm">—</span>}
            </div>
            <div className="space-y-2">
              {redisHealth?.latency_ms !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Latency</span>
                  <span className="text-slate-300">{redisHealth.latency_ms}ms</span>
                </div>
              )}
              {redisHealth?.connected_clients !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Clients</span>
                  <span className="text-slate-300">{redisHealth.connected_clients}</span>
                </div>
              )}
              {(redisHealth?.used_memory_human || redisHealth?.used_memory) && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Memory Used</span>
                  <span className="text-slate-300">
                    {redisHealth.used_memory_human || redisHealth.used_memory}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Architecture diagram */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <GlassCard>
          <h3 className="font-semibold text-slate-200 mb-6">System Architecture</h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max mx-auto justify-center">
              {ARCH_NODES.map((node, i) => {
                const Icon = node.icon
                return (
                  <div key={node.id} className="flex items-center gap-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="glass-sm p-4 flex flex-col items-center gap-2 w-32 text-center"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{node.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{node.sublabel}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </motion.div>
                    {i < ARCH_NODES.length - 1 && (
                      <ArrowRight size={16} className="text-slate-700 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Services grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Document Parser', status: 'running', icon: Activity },
              { label: 'Embedding Service', status: 'running', icon: Cpu },
              { label: 'LLM Integration', status: 'running', icon: Zap },
              { label: 'Vector Store', status: 'running', icon: Database },
              { label: 'Job Worker', status: 'running', icon: Clock },
              { label: 'Auth Service', status: 'running', icon: CheckCircle2 },
            ].map(({ label, status, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="glass-sm p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{label}</p>
                  <p className="text-[10px] text-emerald-400 capitalize">{status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
