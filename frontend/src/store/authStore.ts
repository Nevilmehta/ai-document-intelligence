import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { authApi } from '../api/auth'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: localStorage.getItem('access_token'),
      user: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const tokens = await authApi.login(email, password)
          localStorage.setItem('access_token', tokens.access_token)
          set({ token: tokens.access_token, isLoading: false })
          await get().fetchUser()
        } catch (err: unknown) {
          const msg =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
              : undefined
          set({ error: msg || 'Login failed. Check your credentials.', isLoading: false })
          throw err
        }
      },

      signup: async (email, password, fullName) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.signup(email, password, fullName)
          await get().login(email, password)
        } catch (err: unknown) {
          const msg =
            err && typeof err === 'object' && 'response' in err
              ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
              : undefined
          set({ error: msg || 'Signup failed. Try again.', isLoading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ token: null, user: null })
      },

      fetchUser: async () => {
        try {
          const user = await authApi.getMe()
          set({ user })
        } catch {
          // silently fail
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
