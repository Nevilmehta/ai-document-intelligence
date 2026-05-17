import { apiClient } from './client'
import type { AnalysisJob } from '../types'

export const jobsApi = {
  startAnalysis: (source_document_id: number, target_document_id: number) =>
    apiClient
      .post<AnalysisJob>('/api/v1/jobs/analysis', {
        source_document_id,
        target_document_id,
      })
      .then((r) => r.data),

  getJob: (job_id: number) =>
    apiClient.get<AnalysisJob>(`/api/v1/jobs/analysis/${job_id}`).then((r) => r.data),
}
