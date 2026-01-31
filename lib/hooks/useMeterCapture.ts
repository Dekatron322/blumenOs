// src/lib/hooks/useMeterCapture.ts
import { useCallback } from "react"
import { useAppDispatch, useAppSelector } from "./useRedux"
import {
  clearMeterCaptureError,
  fetchMeterCaptures,
  MeterCaptureData,
  MeterCaptureRequestParams,
  MeterCaptureState,
  resetMeterCaptureState,
} from "lib/redux/meterCaptureSlice"

export const useMeterCapture = () => {
  const dispatch = useAppDispatch()
  const meterCaptureState = useAppSelector((state) => state.meterCapture)

  const getMeterCaptures = useCallback(
    (params: MeterCaptureRequestParams) => {
      return dispatch(fetchMeterCaptures(params))
    },
    [dispatch]
  )

  const clearError = useCallback(() => {
    dispatch(clearMeterCaptureError())
  }, [dispatch])

  const resetState = useCallback(() => {
    dispatch(resetMeterCaptureState())
  }, [dispatch])

  return {
    // State
    meterCaptures: meterCaptureState.meterCaptures,
    loading: meterCaptureState.loading,
    error: meterCaptureState.error,
    success: meterCaptureState.success,
    pagination: meterCaptureState.pagination,

    // Actions
    getMeterCaptures,
    clearError,
    resetState,
  }
}

export type { MeterCaptureData, MeterCaptureState, MeterCaptureRequestParams }
