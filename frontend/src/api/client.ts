import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getDemoToken } from '../lib/demoAuth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isAuthEndpoint = config?.url?.includes('/auth/')

    // On 401: silently log in as demo, then retry once
    if (error.response?.status === 401 && !config?._retry && !isAuthEndpoint) {
      config._retry = true
      try {
        const token = await getDemoToken()
        config.headers.Authorization = `Bearer ${token}`
        return apiClient(config)
      } catch {
        // demo login failed — reject without redirecting
      }
    }

    // If a real auth endpoint 401'd (e.g. wrong credentials), clear stored token
    if (error.response?.status === 401 && isAuthEndpoint) {
      localStorage.removeItem('access_token')
    }

    return Promise.reject(error)
  }
)
