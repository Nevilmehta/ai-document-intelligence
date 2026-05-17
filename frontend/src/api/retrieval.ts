import { apiClient } from './client'
import type { RetrievalResult } from '../types'

export const retrievalApi = {
  getSimilarity: (source_id: number, target_id: number) =>
    apiClient
      .get<RetrievalResult>('/api/v1/retrieval/similarity/source-target', {
        params: { source_id, target_id },
      })
      .then((r) => r.data),

  getChunks: (source_id: number, target_id: number) =>
    apiClient
      .get<RetrievalResult>('/api/v1/chunk-retrieval/source-target', {
        params: { source_id, target_id },
      })
      .then((r) => r.data),
}
