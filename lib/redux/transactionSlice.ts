// src/lib/redux/transactionApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./store"
import { API_CONFIG, API_ENDPOINTS } from "lib/config/api"

export interface Status {
  label: string
  value: number
}

export interface Type {
  label: string
  value: number
}

export interface Currency {
  id: number
  name: string
  symbol: string
  ticker: string
  avatar: string
}

export interface Utility {
  isToken: boolean
  token: string | null
  otherField: string | null
  reference: string
}

export interface User {
  id: number
  tag: string
  firstName: string
  lastName: string
  photo: string
  isVerified: boolean
}

export interface VasPayload {
  customerId: string
  billerId: string
  itemId: string
  customerPhone: string
  customerName: string
  otherField: string
  amount: number
}

export interface Sender {
  sender: string
  bankName: string
  accountNumber?: string
  tag?: string
  sessionId?: string
  bankCode?: string
}

export interface Receiver {
  reciever: string
  bankName: string
  accountNumber?: string
  tag?: string
  sessionId?: string | null
  bankCode?: string
}

export interface Transaction {
  id: number
  createdAt: string
  userId: number
  walletId: number
  amount: number
  fee: number
  status: Status
  type: Type
  comment: string
  channel: string
  reference: string
  currency: Currency
  utility: Utility | null
  user: User
  vasPayload: VasPayload | null
  sender: Sender | null
  reciever: Receiver | null
  canRefund: boolean
}

export interface CryptoCurrency {
  name: string
  symbol: string
  logo: string
}

export interface QuidaxUser {
  userId: number
  firstName: string
  lastName: string
  display: string | null
}

export interface CryptoTransaction {
  id: number
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  quotedPrice: string
  toAmount: string
  createdAt: string
  updatedAt: string
  confirmed: boolean
  settled: boolean
  profitCurrency: string
  profit: number
  settlementAmount: number
  adjustedQuotedPrice: number
  type: Type
  reference: string
  quidaxUser: QuidaxUser
  from_Currency: CryptoCurrency
  to_Currency: CryptoCurrency
}

export interface TransactionsResponse {
  data: Transaction[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  isSuccess: boolean
  message: string
}

export interface CryptoTransactionsResponse {
  data: CryptoTransaction[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  isSuccess: boolean
  message: string
}

export interface TransactionDetailsResponse {
  data: Transaction[]
  isSuccess: boolean
  message: string
}

export interface RefundRequest {
  reference: string
}

export interface RefundResponse {
  isSuccess: boolean
  message: string
  data: {
    isToken: boolean
    token: string | null
    otherField: string | null
    reference: string
  }
}

export interface SettleRequest {
  currency: string
  userId: number
  amount: number
  type: number
  narration: string
}

export interface SettleByReferenceRequest {
  transactionReference: string
}

export interface WalletBalance {
  name: string
  symbol: string
  balance: number
  bonus: number
  locked: number
  staked: number
  convertedBalance: number
  referenceCurrency: string
  logo: string
  networks: Array<{
    id: string
    name: string
    deposits_enabled: boolean
    withdraws_enabled: boolean
  }>
}

export interface SettleResponse {
  isSuccess: boolean
  message: string
  data: WalletBalance[]
}

export interface SettleByReferenceResponse {
  isSuccess: boolean
  message: string
  data: WalletBalance[]
}

export interface TransactionQueryParams {
  pageNumber?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  type?: string
  status?: string
  reference?: string
}

export interface CryptoTransactionQueryParams {
  pageNumber?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  type?: string
  status?: string
  reference?: string
}

export const transactionApi = createApi({
  reducerPath: "transactionApi",
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
  endpoints: (builder) => ({
    getTransactions: builder.query<TransactionsResponse, TransactionQueryParams>({
      query: ({ pageNumber = 1, pageSize = 10, startDate, endDate, type, status, reference }) => {
        const params = new URLSearchParams({
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        })

        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (type) params.append("type", type)
        if (status) params.append("status", status)
        if (reference) params.append("reference", reference)

        return {
          url: `${API_ENDPOINTS.TRANSACTIONS.LIST}?${params.toString()}`,
          method: "GET",
        }
      },
    }),

    getCryptoTransactions: builder.query<CryptoTransactionsResponse, CryptoTransactionQueryParams>({
      query: ({ pageNumber = 1, pageSize = 10, startDate, endDate, type, status, reference }) => {
        const params = new URLSearchParams({
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
        })

        if (startDate) params.append("startDate", startDate)
        if (endDate) params.append("endDate", endDate)
        if (type) params.append("type", type)
        if (status) params.append("status", status)
        if (reference) params.append("reference", reference)

        return {
          url: `${API_ENDPOINTS.TRANSACTIONS.CRYPTO}?${params.toString()}`,
          method: "GET",
        }
      },
    }),

    getTransactionById: builder.query<TransactionDetailsResponse, number>({
      query: (id) => ({
        url: API_ENDPOINTS.TRANSACTIONS.DETAILS(id),
        method: "GET",
      }),
    }),

    refundTransaction: builder.mutation<RefundResponse, RefundRequest>({
      query: (refundRequest) => ({
        url: API_ENDPOINTS.TRANSACTIONS.REFUND,
        method: "POST",
        body: refundRequest,
      }),
    }),

    settleTransaction: builder.mutation<SettleResponse, SettleRequest>({
      query: (settleRequest) => ({
        url: API_ENDPOINTS.TRANSACTIONS.SETTLE,
        method: "POST",
        body: settleRequest,
      }),
    }),

    settleTransactionByReference: builder.mutation<SettleByReferenceResponse, SettleByReferenceRequest>({
      query: (settleRequest) => ({
        url: API_ENDPOINTS.TRANSACTIONS.SETTLE,
        method: "POST",
        body: settleRequest,
      }),
    }),
  }),
})

export const {
  useGetTransactionsQuery,
  useGetCryptoTransactionsQuery,
  useGetTransactionByIdQuery,
  useRefundTransactionMutation,
  useSettleTransactionMutation,
  useSettleTransactionByReferenceMutation,
} = transactionApi
