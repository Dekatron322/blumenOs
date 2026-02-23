import { useAppDispatch, useAppSelector } from "./useRedux"
import {
  clearPaymentDisputesError,
  fetchPaymentDisputes,
  PaymentDisputeSource,
  PaymentDisputesRequestParams,
  PaymentDisputeStatus,
  resetPaymentDisputes,
} from "lib/redux/paymentDisputeSlice"

export const usePaymentDispute = () => {
  const dispatch = useAppDispatch()
  const paymentDisputeState = useAppSelector((state) => state.paymentDispute)

  const getPaymentDisputes = (params: PaymentDisputesRequestParams) => {
    return dispatch(fetchPaymentDisputes(params))
  }

  const clearError = () => {
    dispatch(clearPaymentDisputesError())
  }

  const reset = () => {
    dispatch(resetPaymentDisputes())
  }

  return {
    ...paymentDisputeState,
    getPaymentDisputes,
    clearError,
    reset,
  }
}

// Export enums for easy access in components
export { PaymentDisputeStatus, PaymentDisputeSource }
