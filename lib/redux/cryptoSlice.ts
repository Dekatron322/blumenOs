// src/lib/redux/cryptoSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./store"
import { API_CONFIG, API_ENDPOINTS } from "lib/config/api"

export interface Network {
  id: string
  name: string
  deposits_enabled: boolean
  withdraws_enabled: boolean
}

export interface CryptoAsset {
  name: string
  symbol: string
  balance: number
  locked: number
  staked: number
  convertedBalance: number
  referenceCurrency: string
  logo: string
  networks: Network[]
}

export interface CryptoAccountResponse {
  data: CryptoAsset[]
  base: null
  isSuccess: boolean
  message: string
}

export interface CryptoFee {
  id: number
  name: string
  symbol: string
  logo: string
  isStablecoin: boolean
  buySpread: number
  sellSpread: number
  isSpreadBased: boolean
  buyCommissionPct: number
  buyCommissionCap: number
  sellCommissionPct: number
  sellCommissionCap: number
}

export interface CryptoFeesResponse {
  data: CryptoFee[]
  isSuccess: boolean
  message: string
}

export interface EditCryptoFeeRequest {
  id: number
  buySpread: number
  sellSpread: number
  isSpreadBased: boolean
  buyCommissionPct: number
  buyCommissionCap: number
  sellCommissionPct: number
  sellCommissionCap: number
}

export interface EditCryptoFeeResponse {
  isSuccess: boolean
  message: string
}

export interface CryptoTransferRequest {
  otp: string
  currency: string
  userId: number
  amount: number
  narration: string
}

export interface CryptoTransferData {
  reference: string
  txid: string
  status: string
  fee: string
}

export interface CryptoTransferResponse {
  isSuccess: boolean
  message: string
  data: CryptoTransferData
}

export interface RequestOtpRequest {
  purpose: number
}

export interface RequestOtpResponse {
  isSuccess: boolean
  message: string
}

export interface QuotationRequest {
  fromCurrency: string
  toCurrency: string
  fromAmount: number
}

export interface QuotationData {
  fromCurrency: string
  toCurrency: string
  quotedPrice: number
  quotedCurrency: string
  fromAmount: number
  toAmount: number
  lpFee: string
}

export interface QuotationResponse {
  isSuccess: boolean
  message: string
  data: QuotationData
}

export interface SwapRequest {
  fromCurrency: string
  toCurrency: string
  amount: number
  otp: string
}

export interface SwapData {
  fromCurrency: string
  toCurrency: string
  quotedPrice: number
  quotedCurrency: string
  fromAmount: number
  toAmount: number
  lpFee: number
}

export interface SwapResponse {
  isSuccess: boolean
  message: string
  data: SwapData
}

// Settle Request Interface
export interface SettleRequest {
  otp: string
  currency: string
  amount: number
}

// Settle Data Interface
export interface SettleData {
  reference: string
  txid: string
  status: string
  fee: string
}

// Settle Response Interface
export interface SettleResponse {
  isSuccess: boolean
  message: string
  data: SettleData
}

// Refund Withdrawal Request Interface
export interface RefundWithdrawalRequest {
  reference: string
  otp: string
}

// Refund Withdrawal Response Interface
export interface RefundWithdrawalResponse {
  isSuccess: boolean
  message: string
}

export const cryptoApi = createApi({
  reducerPath: "cryptoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const accessToken = state.auth.tokens?.accessToken

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`)
      } else {
        const storedAuth = localStorage.getItem("authState")
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth) as { tokens?: { accessToken?: string } }
          if (parsedAuth.tokens?.accessToken) {
            headers.set("Authorization", `Bearer ${parsedAuth.tokens.accessToken}`)
          }
        }
      }

      headers.set("Accept", "application/json")
      headers.set("Content-Type", "application/json")

      return headers
    },
  }),
  tagTypes: ["CryptoFees"],
  endpoints: (builder) => ({
    getMasterAccount: builder.query<CryptoAccountResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.CRYPTO.LIST + "/Master",
        method: "GET",
      }),
    }),
    getProfitAccount: builder.query<CryptoAccountResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.CRYPTO.LIST + "/Profit",
        method: "GET",
      }),
    }),
    getCryptoFees: builder.query<CryptoFeesResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.FEES.CRYPTO_FEES,
        method: "GET",
      }),
      providesTags: ["CryptoFees"],
    }),
    editCryptoFee: builder.mutation<EditCryptoFeeResponse, EditCryptoFeeRequest>({
      query: (feeData) => ({
        url: API_ENDPOINTS.FEES.EDIT_CRYPTO_FEES,
        method: "POST",
        body: feeData,
      }),
      invalidatesTags: ["CryptoFees"],
    }),
    cryptoTransfer: builder.mutation<CryptoTransferResponse, CryptoTransferRequest>({
      query: (transferData) => ({
        url: API_ENDPOINTS.CRYPTO.TRANSFER,
        method: "POST",
        body: transferData,
      }),
    }),
    requestOtp: builder.mutation<RequestOtpResponse, RequestOtpRequest>({
      query: (otpRequest) => ({
        url: API_ENDPOINTS.CRYPTO.REQUEST_OTP,
        method: "POST",
        body: otpRequest,
      }),
    }),
    getQuotation: builder.mutation<QuotationResponse, QuotationRequest>({
      query: (quotationData) => ({
        url: API_ENDPOINTS.CRYPTO.QUOTATION,
        method: "POST",
        body: {
          ...quotationData,
          fromCurrency: quotationData.fromCurrency.toLowerCase(),
          toCurrency: quotationData.toCurrency.toLowerCase(),
        },
      }),
    }),
    swapCrypto: builder.mutation<SwapResponse, SwapRequest>({
      query: (swapData) => ({
        url: API_ENDPOINTS.CRYPTO.SWAP,
        method: "POST",
        body: {
          ...swapData,
          fromCurrency: swapData.fromCurrency.toLowerCase(),
          toCurrency: swapData.toCurrency.toLowerCase(),
        },
      }),
    }),
    // Settle Crypto Endpoint
    settleCrypto: builder.mutation<SettleResponse, SettleRequest>({
      query: (settleData) => ({
        url: API_ENDPOINTS.CRYPTO.SETTLE,
        method: "POST",
        body: settleData,
      }),
    }),
    // Refund Withdrawal Endpoint
    refundWithdrawal: builder.mutation<RefundWithdrawalResponse, RefundWithdrawalRequest>({
      query: (refundData) => ({
        url: API_ENDPOINTS.CRYPTO.REFUND,
        method: "POST",
        body: refundData,
      }),
    }),
  }),
})

export const {
  useGetMasterAccountQuery,
  useGetProfitAccountQuery,
  useGetCryptoFeesQuery,
  useEditCryptoFeeMutation,
  useCryptoTransferMutation,
  useRequestOtpMutation,
  useGetQuotationMutation,
  useSwapCryptoMutation,
  useSettleCryptoMutation,
  useRefundWithdrawalMutation,
} = cryptoApi
