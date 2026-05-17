import { useState, useEffect, useCallback, useRef } from 'react'
import { jobsApi } from '../api/jobs'
import type { AnalysisJob, JobStatus } from '../types'

interface UseJobPollingOptions {
  intervalMs?: number
  onComplete?: (job: AnalysisJob) => void
  onError?: (job: AnalysisJob) => void
}

const TERMINAL_STATUSES: JobStatus[] = ['SUCCESS', 'FAILURE']

export function useJobPolling(
  jobId: number | null,
  options: UseJobPollingOptions = {}
) {
  const { intervalMs = 2500, onComplete, onError } = options
  const [job, setJob] = useState<AnalysisJob | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)

  onCompleteRef.current = onComplete
  onErrorRef.current = onError

  const stopPolling = useCallback(() => {
    setIsPolling(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!jobId) return

    setIsPolling(true)

    const poll = async () => {
      try {
        const updated = await jobsApi.getJob(jobId)
        setJob(updated)
        if (TERMINAL_STATUSES.includes(updated.status)) {
          stopPolling()
          if (updated.status === 'SUCCESS') onCompleteRef.current?.(updated)
          else onErrorRef.current?.(updated)
        }
      } catch {
        stopPolling()
      }
    }

    poll()
    intervalRef.current = setInterval(poll, intervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [jobId, intervalMs, stopPolling])

  return { job, isPolling, stopPolling }
}
