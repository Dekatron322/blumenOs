import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../redux/store"
import { clearFeedersError, fetchFeeders, resetFeedersState } from "../redux/formDataSlice"
import { FeedersParams } from "../redux/formDataSlice"

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T) => useSelector(selector)

export const useFormData = () => {
  const dispatch = useAppDispatch()

  // Feeders state
  const feeders = useAppSelector((state) => state.formData.feeders)
  const feedersLoading = useAppSelector((state) => state.formData.feedersLoading)
  const feedersError = useAppSelector((state) => state.formData.feedersError)
  const feedersSuccess = useAppSelector((state) => state.formData.feedersSuccess)
  const feedersResponse = useAppSelector((state) => state.formData.feedersResponse)
  const feedersPagination = useAppSelector((state) => state.formData.feedersPagination)

  // Actions
  const getFeeders = (params: FeedersParams) => {
    return dispatch(fetchFeeders(params))
  }

  const resetFeeders = () => {
    dispatch(resetFeedersState())
  }

  const clearFeedersErrorMsg = () => {
    dispatch(clearFeedersError())
  }

  return {
    // Feeders
    feeders,
    feedersLoading,
    feedersError,
    feedersSuccess,
    feedersResponse,
    feedersPagination,
    getFeeders,
    resetFeeders,
    clearFeedersErrorMsg,
  }
}
