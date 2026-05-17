import { apiClient } from './client'
import type { SourceDocument, TargetDocument } from '../types'

export const documentsApi = {
  uploadSource: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post<SourceDocument>('/api/v1/documents/upload-source', form, {
        // Do NOT set Content-Type — axios must auto-set it with the multipart boundary
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      })
      .then((r) => r.data)
  },

  getSources: () =>
    apiClient.get<SourceDocument[]>('/api/v1/documents/source').then((r) => r.data),

  createTarget: (title: string, raw_text: string) =>
    apiClient
      .post<TargetDocument>('/api/v1/documents/create-target', { title, raw_text })
      .then((r) => r.data),

  getTargets: () =>
    apiClient.get<TargetDocument[]>('/api/v1/documents/target').then((r) => r.data),
}
