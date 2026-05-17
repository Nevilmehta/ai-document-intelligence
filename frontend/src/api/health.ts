import { apiClient } from './client'
import type { HealthStatus, RedisHealth } from '../types'

export const healthApi = {
  check: () => apiClient.get<HealthStatus>('/api/v1/health').then((r) => r.data),
  redisCheck: () =>
    apiClient.get<RedisHealth>('/api/v1/system/redis-health').then((r) => r.data),
}
