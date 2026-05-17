export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
}

export interface SourceDocument {
  id: number
  file_name: string
  original_file_name: string
  file_type: string
  document_category: string
  extracted_text?: string
  cleaned_text?: string
  created_at: string
}

export interface TargetDocument {
  id: number
  title: string
  target_category: string
  raw_text?: string
  cleaned_text: string
  created_at: string
}

export type JobStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE'

export interface AnalysisJob {
  job_id: number
  celery_task_id: string
  status: JobStatus
  analysis_result_id?: number | null
  created_at?: string
  updated_at?: string
}

export interface AnalysisResult {
  id: number
  source_document_id: number
  target_document_id: number
  fit_score: number
  semantic_similarity: number | null
  summary: string
  strengths: string[]
  gaps: string[]
  suggestions: string[]
  improved_bullets: string[]
  cover_letter: string
  model_name?: string | null
  created_at: string
  source_filename?: string | null
  target_title?: string | null
}

export interface Chunk {
  id?: string
  content: string
  score: number
  document_id?: string
  chunk_index?: number
}

export interface RetrievalResult {
  source_chunks: Chunk[]
  target_chunks: Chunk[]
  similarity_score?: number
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  version?: string
  uptime?: number
  timestamp: string
}

export interface RedisHealth {
  status: 'healthy' | 'unhealthy'
  latency_ms?: number
  connected_clients?: number
  used_memory?: string
  used_memory_human?: string
}

export interface ApiError {
  detail: string
  status_code?: number
}
