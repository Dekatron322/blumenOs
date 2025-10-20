// src/lib/redux/adminSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./store"
import { API_CONFIG, API_ENDPOINTS } from "lib/config/api"

export interface Status {
  value: number
  label: string
}

export interface User {
  id: number
  firstName: string | null
  lastName: string | null
  phoneNumber: string
  tag: string | null
  photo: string | null
  referralUrl: string | null
  dob: string | null
  email: string | null
  role: string
  status: Status
  isVerified: boolean
  isTwoFactorEnabled: boolean
  isPinSet: boolean
  country: string | null
  kyc: any | null
}

export interface Permission {
  canViewUsers: boolean
  canManageUsers: boolean
  canManageAdmin: boolean
  canViewDashboard: boolean
  canViewTransactions: boolean
  canManageSystemSettings: boolean
}

export interface Admin {
  id: number
  isActive: boolean
  user: User
  permission: Permission | null
}

export interface AdminsResponse {
  data: Admin[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
  isSuccess: boolean
  message: string
}

export interface CreateAdminRequest {
  userId: number
  permission: Permission
}

export interface CreateAdminResponse {
  data: Admin
  isSuccess: boolean
  message: string
}

export interface UpdateAdminRequest {
  id: number
  isActive?: boolean
  permission?: Partial<Permission>
}

export interface UpdateAdminResponse {
  data: Admin
  isSuccess: boolean
  message: string
}

export interface DeleteAdminResponse {
  isSuccess: boolean
  message: string
}

export interface UpdateAdminPermissionRequest {
  id: number
  permission: Permission
}

export interface UpdateAdminPermissionResponse {
  isSuccess: boolean
  message: string
}

export interface NotifyUserRequest {
  userId: number
  title: string
  message: string
}

export interface NotifyUserResponse {
  isSuccess: boolean
  message: string
}

// Bank List Interfaces
export interface Bank {
  bankCode: string
  bankName: string
  bankLongCode: string
}

export interface BankListResponse {
  data: Bank[]
  isSuccess: boolean
  message: string
}

// Account Verification Interfaces
export interface AccountVerificationRequest {
  number: string
  bank: string
}

export interface AccountVerificationResponse {
  isSuccess: boolean
  message: string
  data: {
    number: string
    bank: string
    name: string
  }
}

// Withdrawal Interfaces
export interface WithdrawRequest {
  currencyId: number
  amount: number
  accountName: string
  accountNumber: string
  bankCode: string
  bankName: string
  narration: string
  otp: string
}

export interface WithdrawResponse {
  isSuccess: boolean
  message: string
}

export const adminApi = createApi({
  reducerPath: "adminApi",
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
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    getAdmins: builder.query<
      AdminsResponse,
      {
        pageNumber: number
        pageSize: number
      }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: "/Admin",
        params: {
          pageNumber,
          pageSize,
        },
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),

    createAdmin: builder.mutation<CreateAdminResponse, CreateAdminRequest>({
      query: (adminData) => ({
        url: "/Admin",
        method: "POST",
        body: adminData,
      }),
      invalidatesTags: ["Admin"],
    }),

    updateAdmin: builder.mutation<UpdateAdminResponse, UpdateAdminRequest>({
      query: ({ id, ...updateData }) => ({
        url: `/Admin/${id}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Admin"],
    }),

    deleteAdmin: builder.mutation<DeleteAdminResponse, number>({
      query: (id) => ({
        url: `/Admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),

    getAdminById: builder.query<CreateAdminResponse, number>({
      query: (id) => ({
        url: `/Admin/${id}`,
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),

    updateAdminPermission: builder.mutation<UpdateAdminPermissionResponse, UpdateAdminPermissionRequest>({
      query: ({ id, permission }) => ({
        url: `/Admin/Permission/${id}`,
        method: "PATCH",
        body: permission,
      }),
      invalidatesTags: ["Admin"],
    }),

    notifyUser: builder.mutation<NotifyUserResponse, NotifyUserRequest>({
      query: (notificationData) => ({
        url: "/Admin/User/Notify",
        method: "POST",
        body: notificationData,
      }),
    }),

    // Bank List Endpoint
    getBankList: builder.query<BankListResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.BANKS.LIST,
        method: "GET",
      }),
    }),

    // Account Verification Endpoint
    verifyAccount: builder.mutation<AccountVerificationResponse, AccountVerificationRequest>({
      query: (verificationData) => ({
        url: API_ENDPOINTS.BANKS.VERIFY,
        method: "POST",
        body: verificationData,
      }),
    }),

    // Withdrawal Endpoint
    withdraw: builder.mutation<WithdrawResponse, WithdrawRequest>({
      query: (withdrawData) => ({
        url: API_ENDPOINTS.DASHBOARD.WITHDRAW,
        method: "POST",
        body: withdrawData,
      }),
    }),
  }),
})

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminByIdQuery,
  useUpdateAdminPermissionMutation,
  useNotifyUserMutation,
  useGetBankListQuery,
  useVerifyAccountMutation,
  useWithdrawMutation,
} = adminApi
