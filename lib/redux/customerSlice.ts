// // src/lib/redux/customerSlice.ts
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
// import type { RootState } from "./store"
// import { API_CONFIG, API_ENDPOINTS } from "lib/config/api"

// export interface Customer {
//   id: string
//   accountNumber: string
//   customerName: string
//   customerType: "PREPAID" | "POSTPAID"
//   serviceBand: string
//   tariffClass: string
//   region: string
//   businessUnit: string
//   feederId: string | null
//   transformerId: string | null
//   address: string
//   phoneNumber: string
//   email: string
//   status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
//   outstandingArrears: string
//   createdAt: string
//   updatedAt: string
//   meters: any[]
//   prepaidAccount: any | null
//   postpaidAccount: any | null
// }

// export interface Pagination {
//   currentPage: number
//   totalPages: number
//   totalRecords: number
//   limit: number
//   hasNextPage: boolean
//   hasPreviousPage: boolean
// }

// export interface CustomersResponse {
//   success: boolean
//   message: string
//   data: {
//     customers: Customer[]
//     pagination: Pagination
//   }
// }

// export interface AddCustomerRequest {
//   accountNumber: string
//   customerName: string
//   customerType: "PREPAID" | "POSTPAID"
//   serviceBand: string
//   tariffClass: string
//   region: string
//   businessUnit: string
//   address: string
//   phoneNumber: string
//   email: string
//   status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
// }

// export interface AddCustomerResponse {
//   success: boolean
//   message: string
//   data: Customer
// }

// export interface UpdateCustomerRequest {
//   serviceBand?: string
//   tariffClass?: string
//   status?: "ACTIVE" | "INACTIVE" | "SUSPENDED"
//   customerName?: string
//   region?: string
//   businessUnit?: string
//   address?: string
//   phoneNumber?: string
//   email?: string
// }

// export interface UpdateCustomerResponse {
//   success: boolean
//   message: string
//   data: Customer
// }

// export const customerApi = createApi({
//   reducerPath: "customerApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: API_CONFIG.BASE_URL,
//     prepareHeaders: (headers, { getState }) => {
//       const state = getState() as RootState
//       const accessToken = state.auth.tokens?.accessToken

//       if (accessToken) {
//         headers.set("Authorization", `Bearer ${accessToken}`)
//       } else {
//         const storedAuth = localStorage.getItem("authState")
//         if (storedAuth) {
//           const parsedAuth = JSON.parse(storedAuth) as { tokens?: { accessToken?: string } }
//           if (parsedAuth.tokens?.accessToken) {
//             headers.set("Authorization", `Bearer ${parsedAuth.tokens.accessToken}`)
//           }
//         }
//       }

//       headers.set("Accept", "application/json")
//       headers.set("Content-Type", "application/json")

//       return headers
//     },
//   }),
//   tagTypes: ["Customer"],
//   endpoints: (builder) => ({
//     getCustomers: builder.query<
//       CustomersResponse,
//       {
//         page?: number
//         limit?: number
//         region?: string
//       }
//     >({
//       query: ({ page = 1, limit = 50, region }) => ({
//         url: API_ENDPOINTS.CUSTOMER.GET,
//         params: {
//           page,
//           limit,
//           ...(region && { region }),
//         },
//         method: "GET",
//       }),
//       providesTags: ["Customer"],
//     }),

//     addCustomer: builder.mutation<AddCustomerResponse, AddCustomerRequest>({
//       query: (customerData) => ({
//         url: API_ENDPOINTS.CUSTOMER.ADD,
//         method: "POST",
//         body: customerData,
//       }),
//       invalidatesTags: ["Customer"],
//     }),

//     updateCustomer: builder.mutation<UpdateCustomerResponse, { id: string; updates: UpdateCustomerRequest }>({
//       query: ({ id, updates }) => ({
//         url: API_ENDPOINTS.CUSTOMER.UPDATE.replace(":id", id),
//         method: "PUT",
//         body: updates,
//       }),
//       invalidatesTags: ["Customer"],
//     }),
//   }),
// })

// export const { useGetCustomersQuery, useAddCustomerMutation, useUpdateCustomerMutation } = customerApi
