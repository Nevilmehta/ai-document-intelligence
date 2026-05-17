import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, token, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token, navigate])

  useEffect(() => clearError, [clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch {
      // error shown from store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-600/[0.10] blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/40">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">DocIntel</span>
        </div>

        <div className="glass p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-100">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
