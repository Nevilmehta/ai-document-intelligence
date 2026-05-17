import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { UploadSource } from './pages/UploadSource'
import { CreateTarget } from './pages/CreateTarget'
import { RunAnalysis } from './pages/RunAnalysis'
import { AnalysisResult } from './pages/AnalysisResult'
import { AnalysisHistory } from './pages/AnalysisHistory'
import { SystemMonitoring } from './pages/SystemMonitoring'
import { useAuthStore } from './store/authStore'

function AuthInitializer() {
  const { token, user, fetchUser } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      fetchUser()
    }
  }, [token, user, fetchUser])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected — Layout wraps all */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sources" element={<UploadSource />} />
          <Route path="/targets" element={<CreateTarget />} />
          <Route path="/analysis/run" element={<RunAnalysis />} />
          <Route path="/analysis/:id" element={<AnalysisResult />} />
          <Route path="/analysis" element={<AnalysisHistory />} />
          <Route path="/monitoring" element={<SystemMonitoring />} />
        </Route>

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
