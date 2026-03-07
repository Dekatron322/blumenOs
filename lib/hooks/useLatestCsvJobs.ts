import { useCallback, useEffect, useRef, useState } from "react"
import { useAppDispatch } from "lib/hooks/useRedux"
import { CsvJob, fetchCsvJobs } from "lib/redux/fileManagementSlice"

interface UseLatestCsvJobsOptions {
  jobTypes: number[]
  enabled?: boolean
  pollIntervalMs?: number
}

interface FetchLatestOptions {
  targetJobTypes?: number[]
  silent?: boolean
}

export const useLatestCsvJobs = ({
  jobTypes,
  enabled = true,
  pollIntervalMs = 30000,
}: UseLatestCsvJobsOptions) => {
  const dispatch = useAppDispatch()
  const [latestJobs, setLatestJobs] = useState<Record<number, CsvJob | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasLoadedOnceRef = useRef(false)
  const requestInFlightRef = useRef(false)
  const isMountedRef = useRef(true)

  const clearPollingTimeout = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
  }, [])

  const fetchLatestJobs = useCallback(
    async ({ targetJobTypes, silent = false }: FetchLatestOptions = {}) => {
      if (!enabled || requestInFlightRef.current) {
        return
      }

      const effectiveJobTypes = targetJobTypes?.length ? targetJobTypes : jobTypes
      if (!effectiveJobTypes.length) {
        return
      }

      const shouldShowLoader = !silent && !hasLoadedOnceRef.current
      requestInFlightRef.current = true

      if (shouldShowLoader && isMountedRef.current) {
        setIsLoading(true)
      }

      try {
        const jobsData: Record<number, CsvJob | null> = Object.fromEntries(
          effectiveJobTypes.map((jobType) => [jobType, null])
        ) as Record<number, CsvJob | null>

        const result = await dispatch(
          fetchCsvJobs({
            PageNumber: 1,
            PageSize: Math.max(50, effectiveJobTypes.length * 8),
            JobTypes: effectiveJobTypes,
            Status: undefined,
          })
        ).unwrap()

        if (result.isSuccess && Array.isArray(result.data)) {
          const orderedJobs = [...result.data].sort((a, b) => {
            const aTime = a.requestedAtUtc ? new Date(a.requestedAtUtc).getTime() : 0
            const bTime = b.requestedAtUtc ? new Date(b.requestedAtUtc).getTime() : 0
            return bTime - aTime
          })

          for (const job of orderedJobs) {
            if (typeof job.jobType !== "number") continue
            if (!effectiveJobTypes.includes(job.jobType)) continue
            if (jobsData[job.jobType]) continue
            jobsData[job.jobType] = job
          }
        }

        if (isMountedRef.current) {
          setLatestJobs((prev) => (targetJobTypes?.length ? { ...prev, ...jobsData } : jobsData))
        }
      } catch (error) {
        console.error("Failed to fetch latest jobs:", error)
      } finally {
        requestInFlightRef.current = false
        hasLoadedOnceRef.current = true
        if (shouldShowLoader && isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [dispatch, enabled, jobTypes]
  )

  useEffect(() => {
    if (!enabled) {
      clearPollingTimeout()
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      return
    }

    void fetchLatestJobs()
  }, [enabled, fetchLatestJobs, clearPollingTimeout])

  useEffect(() => {
    if (!enabled) {
      clearPollingTimeout()
      return
    }

    clearPollingTimeout()
    pollingTimeoutRef.current = setTimeout(() => {
      void fetchLatestJobs({ silent: true })
    }, pollIntervalMs)

    return () => {
      clearPollingTimeout()
    }
  }, [enabled, latestJobs, fetchLatestJobs, clearPollingTimeout, pollIntervalMs])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      clearPollingTimeout()
    }
  }, [clearPollingTimeout])

  return { latestJobs, isLoading, refetch: fetchLatestJobs }
}
