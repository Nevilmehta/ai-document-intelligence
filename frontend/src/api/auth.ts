import { apiClient } from './client'
import type { AuthTokens, User } from '../types'

export const authApi = {
  signup: (email: string, password: string, full_name?: string) =>
    apiClient
      .post<User>('/api/v1/auth/signup', { email, password, full_name })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient
      .post<AuthTokens>(
        '/api/v1/auth/login',
        new URLSearchParams({ username: email, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      .then((r) => r.data),

  getMe: () => apiClient.get<User>('/api/v1/users/me').then((r) => r.data),
}
