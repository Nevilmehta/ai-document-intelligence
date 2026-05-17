import { apiClient } from './client'
import type { AnalysisResult } from '../types'

export const analysisApi = {
  getResult: (analysis_id: string) =>
    apiClient.get<AnalysisResult>(`/api/v1/analysis/${analysis_id}`).then((r) => r.data),

  getAll: () =>
    apiClient.get<AnalysisResult[]>('/api/v1/analysis').then((r) => r.data),
}
