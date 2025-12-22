// src/lib/redux/reportingSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Dashboard Cards
export interface DashboardCard {
  title: string
  description: string
  value: number
  valueFormat: "currency" | "count" | "percent" | string
  comparisonValue: number
  comparisonChangePercent: number | null
  periodLabel: string
}

export interface DashboardCardsData {
  cards: DashboardCard[]
}

export interface DashboardCardsResponse {
  isSuccess: boolean
  message: string
  data: DashboardCardsData
}

export interface DashboardCardsRequestParams {
  startDateUtc?: string // ISO string format
  endDateUtc?: string // ISO string format
  areaOfficeId?: number
  channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  collectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff"
}

export interface EnergyBalancePoint {
  periodStart: string
  feederId: number
  feederName: string
  energyDeliveredKwh: number
  energyBilledKwh: number
}

export interface EnergyBalanceData {
  points: EnergyBalancePoint[]
}

export interface EnergyBalanceResponse {
  isSuccess: boolean
  message: string
  data: EnergyBalanceData
}

export interface EnergyBalanceRequestParams {
  startDateUtc?: string
  endDateUtc?: string
  areaOfficeId?: number
  channel?: string
  collectorType?: string
}

export interface DailyCollectionPoint {
  bucketDate: string
  amount: number
  count: number
}

export interface DailyCollectionData {
  points: DailyCollectionPoint[]
}

export interface DailyCollectionResponse {
  isSuccess: boolean
  message: string
  data: DailyCollectionData
}

export interface CollectionByBandSlice {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface CollectionByBandData {
  dimension: number
  slices: CollectionByBandSlice[]
}

export interface CollectionByBandResponse {
  isSuccess: boolean
  message: string
  data: CollectionByBandData
}

export interface CboPerformanceSlice {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface CboPerformanceData {
  dimension: number
  slices: CboPerformanceSlice[]
}

export interface CboPerformanceResponse {
  isSuccess: boolean
  message: string
  data: CboPerformanceData
}

export interface NewConnectionsPoint {
  bucketDate: string
  count: number
}

export interface NewConnectionsData {
  totalConnections: number
  points: NewConnectionsPoint[]
}

export interface NewConnectionsResponse {
  isSuccess: boolean
  message: string
  data: NewConnectionsData
}

export interface PrepaidVendsPoint {
  bucketDate: string
  vendCount: number
  tokenCount: number
  totalKwh: number
  totalAmount: number
}

export interface PrepaidVendsData {
  points: PrepaidVendsPoint[]
}

export interface PrepaidVendsResponse {
  isSuccess: boolean
  message: string
  data: PrepaidVendsData
}

export interface TokenGeneratedPoint {
  bucketDate: string
  totalTokens: number
  keyChangeTokens: number
  clearTamperTokens: number
  clearCreditTokens: number
}

export interface TokenGeneratedData {
  points: TokenGeneratedPoint[]
}

export interface TokenGeneratedResponse {
  isSuccess: boolean
  message: string
  data: TokenGeneratedData
}

export interface MetersProgrammedPoint {
  bucketDate: string
  programmedCount: number
  distinctMeters: number
}

export interface MetersProgrammedData {
  points: MetersProgrammedPoint[]
}

export interface MetersProgrammedResponse {
  isSuccess: boolean
  message: string
  data: MetersProgrammedData
}

// Customer Segments interfaces
export interface CustomerSegment {
  label: string
  count: number
  percentage: number
}

export interface CustomerSegmentsData {
  totalCustomers: number
  activeCustomers: number
  suspendedCustomers: number
  prepaidCustomers: number
  postpaidCustomers: number
  unmeteredCustomers: number
  mdCustomers: number
  totalVendors: number
  activeVendors: number
  totalAgents: number
  segments: CustomerSegment[]
}

export interface CustomerSegmentsResponse {
  isSuccess: boolean
  message: string
  data: CustomerSegmentsData
}

// Trend interfaces
export interface TrendPoint {
  bucketDate: string
  amount: number
  count: number
}

export interface TrendData {
  points: TrendPoint[]
}

export interface TrendResponse {
  isSuccess: boolean
  message: string
  data: TrendData
}

// Breakdown interfaces
export interface BreakdownSlice {
  label: string
  amount: number
  count: number
  percentage: number
}

export interface BreakdownData {
  dimension: number
  slices: BreakdownSlice[]
}

export interface BreakdownResponse {
  isSuccess: boolean
  message: string
  data: BreakdownData
}

// Collection Efficiency interfaces
export interface CollectionEfficiencyData {
  totalBilled: number
  totalCollected: number
  efficiencyPercent: number
  billCount: number
  billsWithPayments: number
}

export interface CollectionEfficiencyResponse {
  isSuccess: boolean
  message: string
  data: CollectionEfficiencyData
}

export interface CollectionEfficiencyRequestParams {
  startDateUtc?: string
  endDateUtc?: string
  areaOfficeId?: number
  channel?: "Cash" | "BankTransfer" | "Pos" | "Card" | "VendorWallet" | "Chaque"
  collectorType?: "Customer" | "SalesRep" | "Vendor" | "Staff"
}

// Outstanding Arrears interfaces
export interface OutstandingArrearsData {
  totalOutstanding: number
  totalDebits: number
  totalCredits: number
  customersInArrears: number
}

export interface OutstandingArrearsResponse {
  isSuccess: boolean
  message: string
  data: OutstandingArrearsData
}

// Disputes interfaces
export interface DisputeItem {
  status: string
  count: number
  percentage: number
  amount: number
}

export interface DisputesData {
  billing: DisputeItem[]
  payments: DisputeItem[]
}

export interface DisputesResponse {
  isSuccess: boolean
  message: string
  data: DisputesData
}

// Reporting State
interface ReportingState {
  // Dashboard cards state
  dashboardCards: DashboardCard[]
  dashboardCardsLoading: boolean
  dashboardCardsError: string | null
  dashboardCardsSuccess: boolean

  // Energy balance state
  energyBalancePoints: EnergyBalancePoint[]
  energyBalanceLoading: boolean
  energyBalanceError: string | null
  energyBalanceSuccess: boolean

  // Daily collection state
  dailyCollectionPoints: DailyCollectionPoint[]
  dailyCollectionLoading: boolean
  dailyCollectionError: string | null
  dailyCollectionSuccess: boolean

  // Collection by band state
  collectionByBandSlices: CollectionByBandSlice[]
  collectionByBandLoading: boolean
  collectionByBandError: string | null
  collectionByBandSuccess: boolean

  // CBO performance state
  cboPerformanceSlices: CboPerformanceSlice[]
  cboPerformanceLoading: boolean
  cboPerformanceError: string | null
  cboPerformanceSuccess: boolean

  // New connections state
  newConnectionsTotal: number
  newConnectionsPoints: NewConnectionsPoint[]
  newConnectionsLoading: boolean
  newConnectionsError: string | null
  newConnectionsSuccess: boolean

  // Prepaid vends state
  prepaidVendsPoints: PrepaidVendsPoint[]
  prepaidVendsLoading: boolean
  prepaidVendsError: string | null
  prepaidVendsSuccess: boolean

  // Token generated state
  tokenGeneratedPoints: TokenGeneratedPoint[]
  tokenGeneratedLoading: boolean
  tokenGeneratedError: string | null
  tokenGeneratedSuccess: boolean

  // Meters programmed state
  metersProgrammedPoints: MetersProgrammedPoint[]
  metersProgrammedLoading: boolean
  metersProgrammedError: string | null
  metersProgrammedSuccess: boolean

  // Customer segments state
  customerSegmentsData: CustomerSegmentsData | null
  customerSegmentsLoading: boolean
  customerSegmentsError: string | null
  customerSegmentsSuccess: boolean

  // Trend state
  trendPoints: TrendPoint[]
  trendLoading: boolean
  trendError: string | null
  trendSuccess: boolean

  // Breakdown state
  breakdownSlices: BreakdownSlice[]
  breakdownLoading: boolean
  breakdownError: string | null
  breakdownSuccess: boolean

  // Collection efficiency state
  collectionEfficiencyData: CollectionEfficiencyData | null
  collectionEfficiencyLoading: boolean
  collectionEfficiencyError: string | null
  collectionEfficiencySuccess: boolean

  // Outstanding arrears state
  outstandingArrearsData: OutstandingArrearsData | null
  outstandingArrearsLoading: boolean
  outstandingArrearsError: string | null
  outstandingArrearsSuccess: boolean

  // Disputes state
  disputesData: DisputesData | null
  disputesLoading: boolean
  disputesError: string | null
  disputesSuccess: boolean

  // Request parameters
  currentParams: DashboardCardsRequestParams | null
  currentEnergyBalanceParams: EnergyBalanceRequestParams | null
  currentDailyCollectionParams: DashboardCardsRequestParams | null
  currentCollectionByBandParams: DashboardCardsRequestParams | null
  currentCboPerformanceParams: DashboardCardsRequestParams | null
  currentNewConnectionsParams: DashboardCardsRequestParams | null
  currentPrepaidVendsParams: DashboardCardsRequestParams | null
  currentTokenGeneratedParams: DashboardCardsRequestParams | null
  currentMetersProgrammedParams: DashboardCardsRequestParams | null
  currentCustomerSegmentsParams: DashboardCardsRequestParams | null
  currentTrendParams: DashboardCardsRequestParams | null
  currentBreakdownParams: (DashboardCardsRequestParams & { dimension?: number }) | null
}

// Initial state
const initialState: ReportingState = {
  dashboardCards: [],
  dashboardCardsLoading: false,
  dashboardCardsError: null,
  dashboardCardsSuccess: false,
  energyBalancePoints: [],
  energyBalanceLoading: false,
  energyBalanceError: null,
  energyBalanceSuccess: false,
  dailyCollectionPoints: [],
  dailyCollectionLoading: false,
  dailyCollectionError: null,
  dailyCollectionSuccess: false,
  collectionByBandSlices: [],
  collectionByBandLoading: false,
  collectionByBandError: null,
  collectionByBandSuccess: false,
  cboPerformanceSlices: [],
  cboPerformanceLoading: false,
  cboPerformanceError: null,
  cboPerformanceSuccess: false,
  newConnectionsTotal: 0,
  newConnectionsPoints: [],
  newConnectionsLoading: false,
  newConnectionsError: null,
  newConnectionsSuccess: false,
  prepaidVendsPoints: [],
  prepaidVendsLoading: false,
  prepaidVendsError: null,
  prepaidVendsSuccess: false,
  tokenGeneratedPoints: [],
  tokenGeneratedLoading: false,
  tokenGeneratedError: null,
  tokenGeneratedSuccess: false,
  metersProgrammedPoints: [],
  metersProgrammedLoading: false,
  metersProgrammedError: null,
  metersProgrammedSuccess: false,
  customerSegmentsData: null,
  customerSegmentsLoading: false,
  customerSegmentsError: null,
  customerSegmentsSuccess: false,
  trendPoints: [],
  trendLoading: false,
  trendError: null,
  trendSuccess: false,
  breakdownSlices: [],
  breakdownLoading: false,
  breakdownError: null,
  breakdownSuccess: false,
  collectionEfficiencyData: null,
  collectionEfficiencyLoading: false,
  collectionEfficiencyError: null,
  collectionEfficiencySuccess: false,
  outstandingArrearsData: null,
  outstandingArrearsLoading: false,
  outstandingArrearsError: null,
  outstandingArrearsSuccess: false,
  disputesData: null,
  disputesLoading: false,
  disputesError: null,
  disputesSuccess: false,
  currentParams: null,
  currentEnergyBalanceParams: null,
  currentDailyCollectionParams: null,
  currentCollectionByBandParams: null,
  currentCboPerformanceParams: null,
  currentNewConnectionsParams: null,
  currentPrepaidVendsParams: null,
  currentTokenGeneratedParams: null,
  currentMetersProgrammedParams: null,
  currentCustomerSegmentsParams: null,
  currentTrendParams: null,
  currentBreakdownParams: null,
}

// Async thunks
export const fetchDashboardCards = createAsyncThunk(
  "reporting/fetchDashboardCards",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      // Build query parameters object
      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<DashboardCardsResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.CARDS), {
        params: queryParams,
        paramsSerializer: {
          indexes: null, // Prevents array-like notation for params
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch dashboard cards")
      }

      return {
        data: response.data.data,
        params: params, // Return params to store them in state
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch dashboard cards")
      }
      return rejectWithValue(error.message || "Network error during dashboard cards fetch")
    }
  }
)

export const fetchMetersProgrammed = createAsyncThunk(
  "reporting/fetchMetersProgrammed",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<MetersProgrammedResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.METERS_PROGRAMMED), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch meters programmed")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch meters programmed")
      }
      return rejectWithValue(error.message || "Network error during meters programmed fetch")
    }
  }
)

export const fetchTokenGenerated = createAsyncThunk(
  "reporting/fetchTokenGenerated",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<TokenGeneratedResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.TOKEN_GENERATED), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch tokens generated")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch tokens generated")
      }
      return rejectWithValue(error.message || "Network error during tokens generated fetch")
    }
  }
)

export const fetchPrepaidVends = createAsyncThunk(
  "reporting/fetchPrepaidVends",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<PrepaidVendsResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.PREPAID_VENDS), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch prepaid vends")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch prepaid vends")
      }
      return rejectWithValue(error.message || "Network error during prepaid vends fetch")
    }
  }
)

export const fetchNewConnections = createAsyncThunk(
  "reporting/fetchNewConnections",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<NewConnectionsResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.NEW_CONNECTIONS), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch new connections")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch new connections")
      }
      return rejectWithValue(error.message || "Network error during new connections fetch")
    }
  }
)

export const fetchCboPerformance = createAsyncThunk(
  "reporting/fetchCboPerformance",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<CboPerformanceResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.CBO_PERFORMANCE), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch CBO performance")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch CBO performance")
      }
      return rejectWithValue(error.message || "Network error during CBO performance fetch")
    }
  }
)

export const fetchDailyCollection = createAsyncThunk(
  "reporting/fetchDailyCollection",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<DailyCollectionResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.DAILY_COLLECTION), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch daily collection")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch daily collection")
      }
      return rejectWithValue(error.message || "Network error during daily collection fetch")
    }
  }
)

export const fetchCollectionByBand = createAsyncThunk(
  "reporting/fetchCollectionByBand",
  async (params: DashboardCardsRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<CollectionByBandResponse>(
        buildApiUrl(API_ENDPOINTS.REPORTING.COLLECTION_BY_BAND),
        {
          params: queryParams,
          paramsSerializer: {
            indexes: null,
          },
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch collection by band")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch collection by band")
      }
      return rejectWithValue(error.message || "Network error during collection by band fetch")
    }
  }
)

export const fetchEnergyBalance = createAsyncThunk(
  "reporting/fetchEnergyBalance",
  async (params: EnergyBalanceRequestParams, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<EnergyBalanceResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.ENERGY_BALANCE), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch energy balance")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch energy balance")
      }
      return rejectWithValue(error.message || "Network error during energy balance fetch")
    }
  }
)

export const fetchCustomerSegments = createAsyncThunk(
  "reporting/fetchCustomerSegments",
  async (params: DashboardCardsRequestParams = {}, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<CustomerSegmentsResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.CUSTOMER_SEGMENT), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customer segments")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customer segments")
      }
      return rejectWithValue(error.message || "Network error during customer segments fetch")
    }
  }
)

export const fetchTrend = createAsyncThunk(
  "reporting/fetchTrend",
  async (params: DashboardCardsRequestParams = {}, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<TrendResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.TREND), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch trend data")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch trend data")
      }
      return rejectWithValue(error.message || "Network error during trend data fetch")
    }
  }
)

export const fetchBreakdown = createAsyncThunk(
  "reporting/fetchBreakdown",
  async (params: DashboardCardsRequestParams & { dimension?: number } = {}, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType, dimension = 0 } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      if (dimension !== undefined) {
        queryParams.dimension = dimension
      }

      const response = await api.get<BreakdownResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.BREAKDOWN), {
        params: queryParams,
        paramsSerializer: {
          indexes: null,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch breakdown data")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch breakdown data")
      }
      return rejectWithValue(error.message || "Network error during breakdown data fetch")
    }
  }
)

export const fetchCollectionEfficiency = createAsyncThunk(
  "reporting/fetchCollectionEfficiency",
  async (params: CollectionEfficiencyRequestParams = {}, { rejectWithValue }) => {
    try {
      const { startDateUtc, endDateUtc, areaOfficeId, channel, collectorType } = params

      const queryParams: Record<string, any> = {}

      if (startDateUtc) {
        queryParams.StartDateUtc = startDateUtc
      }

      if (endDateUtc) {
        queryParams.EndDateUtc = endDateUtc
      }

      if (areaOfficeId !== undefined) {
        queryParams.AreaOfficeId = areaOfficeId
      }

      if (channel) {
        queryParams.Channel = channel
      }

      if (collectorType) {
        queryParams.CollectorType = collectorType
      }

      const response = await api.get<CollectionEfficiencyResponse>(
        buildApiUrl(API_ENDPOINTS.REPORTING.COLLECTION_EFFICIENCY),
        {
          params: queryParams,
          paramsSerializer: {
            indexes: null,
          },
        }
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch collection efficiency")
      }

      return {
        data: response.data.data,
        params,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch collection efficiency")
      }
      return rejectWithValue(error.message || "Network error during collection efficiency fetch")
    }
  }
)

export const fetchOutstandingArrears = createAsyncThunk(
  "reporting/fetchOutstandingArrears",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<OutstandingArrearsResponse>(
        buildApiUrl(API_ENDPOINTS.REPORTING.OUTSTANDING_ARREARS)
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch outstanding arrears")
      }

      return {
        data: response.data.data,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch outstanding arrears")
      }
      return rejectWithValue(error.message || "Network error during outstanding arrears fetch")
    }
  }
)

export const fetchDisputes = createAsyncThunk("reporting/fetchDisputes", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<DisputesResponse>(buildApiUrl(API_ENDPOINTS.REPORTING.DISPUTES))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch disputes")
    }

    return {
      data: response.data.data,
    }
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch disputes")
    }
    return rejectWithValue(error.message || "Network error during disputes fetch")
  }
})

// Reporting slice
const reportingSlice = createSlice({
  name: "reporting",
  initialState,
  reducers: {
    // Clear dashboard cards state
    clearDashboardCards: (state) => {
      state.dashboardCards = []
      state.dashboardCardsError = null
      state.dashboardCardsSuccess = false
      state.currentParams = null
    },

    clearEnergyBalance: (state) => {
      state.energyBalancePoints = []
      state.energyBalanceError = null
      state.energyBalanceSuccess = false
      state.currentEnergyBalanceParams = null
    },

    clearDailyCollection: (state) => {
      state.dailyCollectionPoints = []
      state.dailyCollectionError = null
      state.dailyCollectionSuccess = false
      state.currentDailyCollectionParams = null
    },

    clearCollectionByBand: (state) => {
      state.collectionByBandSlices = []
      state.collectionByBandError = null
      state.collectionByBandSuccess = false
      state.currentCollectionByBandParams = null
    },

    clearCboPerformance: (state) => {
      state.cboPerformanceSlices = []
      state.cboPerformanceError = null
      state.cboPerformanceSuccess = false
      state.currentCboPerformanceParams = null
    },

    clearNewConnections: (state) => {
      state.newConnectionsTotal = 0
      state.newConnectionsPoints = []
      state.newConnectionsError = null
      state.newConnectionsSuccess = false
      state.currentNewConnectionsParams = null
    },

    clearPrepaidVends: (state) => {
      state.prepaidVendsPoints = []
      state.prepaidVendsError = null
      state.prepaidVendsSuccess = false
      state.currentPrepaidVendsParams = null
    },

    clearTokenGenerated: (state) => {
      state.tokenGeneratedPoints = []
      state.tokenGeneratedError = null
      state.tokenGeneratedSuccess = false
      state.currentTokenGeneratedParams = null
    },

    clearMetersProgrammed: (state) => {
      state.metersProgrammedPoints = []
      state.metersProgrammedError = null
      state.metersProgrammedSuccess = false
      state.currentMetersProgrammedParams = null
    },

    clearCustomerSegments: (state) => {
      state.customerSegmentsData = null
      state.customerSegmentsError = null
      state.customerSegmentsSuccess = false
      state.currentCustomerSegmentsParams = null
    },

    clearTrend: (state) => {
      state.trendPoints = []
      state.trendError = null
      state.trendSuccess = false
      state.currentTrendParams = null
    },

    clearBreakdown: (state) => {
      state.breakdownSlices = []
      state.breakdownError = null
      state.breakdownSuccess = false
      state.currentBreakdownParams = null
    },

    clearCollectionEfficiency: (state) => {
      state.collectionEfficiencyData = null
      state.collectionEfficiencyError = null
      state.collectionEfficiencySuccess = false
    },

    clearOutstandingArrears: (state) => {
      state.outstandingArrearsData = null
      state.outstandingArrearsError = null
      state.outstandingArrearsSuccess = false
    },

    clearDisputes: (state) => {
      state.disputesData = null
      state.disputesError = null
      state.disputesSuccess = false
    },

    // Clear errors
    clearError: (state) => {
      state.dashboardCardsError = null
      state.energyBalanceError = null
      state.dailyCollectionError = null
      state.collectionByBandError = null
      state.cboPerformanceError = null
      state.newConnectionsError = null
      state.prepaidVendsError = null
      state.tokenGeneratedError = null
      state.metersProgrammedError = null
      state.customerSegmentsError = null
      state.trendError = null
      state.breakdownError = null
      state.collectionEfficiencyError = null
      state.outstandingArrearsError = null
      state.disputesError = null
    },

    // Clear success state
    clearSuccess: (state) => {
      state.dashboardCardsSuccess = false
      state.energyBalanceSuccess = false
      state.dailyCollectionSuccess = false
      state.collectionByBandSuccess = false
      state.cboPerformanceSuccess = false
      state.newConnectionsSuccess = false
      state.prepaidVendsSuccess = false
      state.tokenGeneratedSuccess = false
      state.metersProgrammedSuccess = false
      state.customerSegmentsSuccess = false
      state.trendSuccess = false
      state.breakdownSuccess = false
      state.collectionEfficiencySuccess = false
      state.outstandingArrearsSuccess = false
      state.disputesSuccess = false
    },

    // Reset reporting state
    resetReportingState: (state) => {
      state.dashboardCards = []
      state.dashboardCardsLoading = false
      state.dashboardCardsError = null
      state.dashboardCardsSuccess = false
      state.currentParams = null

      state.energyBalancePoints = []
      state.energyBalanceLoading = false
      state.energyBalanceError = null
      state.energyBalanceSuccess = false
      state.currentEnergyBalanceParams = null

      state.dailyCollectionPoints = []
      state.dailyCollectionLoading = false
      state.dailyCollectionError = null
      state.dailyCollectionSuccess = false
      state.currentDailyCollectionParams = null

      state.collectionByBandSlices = []
      state.collectionByBandLoading = false
      state.collectionByBandError = null
      state.collectionByBandSuccess = false
      state.currentCollectionByBandParams = null

      state.cboPerformanceSlices = []
      state.cboPerformanceLoading = false
      state.cboPerformanceError = null
      state.cboPerformanceSuccess = false
      state.currentCboPerformanceParams = null

      state.newConnectionsTotal = 0
      state.newConnectionsPoints = []
      state.newConnectionsLoading = false
      state.newConnectionsError = null
      state.newConnectionsSuccess = false
      state.currentNewConnectionsParams = null

      state.prepaidVendsPoints = []
      state.prepaidVendsLoading = false
      state.prepaidVendsError = null
      state.prepaidVendsSuccess = false
      state.currentPrepaidVendsParams = null

      state.tokenGeneratedPoints = []
      state.tokenGeneratedLoading = false
      state.tokenGeneratedError = null
      state.tokenGeneratedSuccess = false
      state.currentTokenGeneratedParams = null

      state.metersProgrammedPoints = []
      state.metersProgrammedLoading = false
      state.metersProgrammedError = null
      state.metersProgrammedSuccess = false
      state.currentMetersProgrammedParams = null
    },

    // Set specific card value (for manual updates if needed)
    setDashboardCardValue: (state, action: PayloadAction<{ index: number; value: number }>) => {
      const { index, value } = action.payload
      if (state.dashboardCards[index]) {
        state.dashboardCards[index].value = value
      }
    },

    // Set all dashboard cards (for testing or mock data)
    setDashboardCards: (state, action: PayloadAction<DashboardCard[]>) => {
      state.dashboardCards = action.payload
      state.dashboardCardsSuccess = true
    },

    // Update current parameters without fetching
    setCurrentParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentParams = action.payload
    },

    setCurrentEnergyBalanceParams: (state, action: PayloadAction<EnergyBalanceRequestParams>) => {
      state.currentEnergyBalanceParams = action.payload
    },

    setCurrentDailyCollectionParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentDailyCollectionParams = action.payload
    },

    setCurrentCollectionByBandParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentCollectionByBandParams = action.payload
    },

    setCurrentCboPerformanceParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentCboPerformanceParams = action.payload
    },

    setCurrentNewConnectionsParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentNewConnectionsParams = action.payload
    },

    setCurrentPrepaidVendsParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentPrepaidVendsParams = action.payload
    },

    setCurrentTokenGeneratedParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentTokenGeneratedParams = action.payload
    },

    setCurrentMetersProgrammedParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentMetersProgrammedParams = action.payload
    },

    setCurrentCustomerSegmentsParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentCustomerSegmentsParams = action.payload
    },

    setCurrentTrendParams: (state, action: PayloadAction<DashboardCardsRequestParams>) => {
      state.currentTrendParams = action.payload
    },

    setCurrentBreakdownParams: (state, action: PayloadAction<DashboardCardsRequestParams & { dimension?: number }>) => {
      state.currentBreakdownParams = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard cards
      .addCase(fetchDashboardCards.pending, (state) => {
        state.dashboardCardsLoading = true
        state.dashboardCardsError = null
        state.dashboardCardsSuccess = false
      })
      .addCase(fetchDashboardCards.fulfilled, (state, action) => {
        state.dashboardCardsLoading = false
        state.dashboardCardsSuccess = true
        state.dashboardCards = action.payload.data.cards
        state.currentParams = action.payload.params
        state.dashboardCardsError = null
      })
      .addCase(fetchDashboardCards.rejected, (state, action) => {
        state.dashboardCardsLoading = false
        state.dashboardCardsError = (action.payload as string) || "Failed to fetch dashboard cards"
        state.dashboardCardsSuccess = false
        state.dashboardCards = []
      })

      // Fetch energy balance
      .addCase(fetchEnergyBalance.pending, (state) => {
        state.energyBalanceLoading = true
        state.energyBalanceError = null
        state.energyBalanceSuccess = false
      })
      .addCase(fetchEnergyBalance.fulfilled, (state, action) => {
        state.energyBalanceLoading = false
        state.energyBalanceSuccess = true
        state.energyBalancePoints = action.payload.data.points
        state.currentEnergyBalanceParams = action.payload.params
        state.energyBalanceError = null
      })
      .addCase(fetchEnergyBalance.rejected, (state, action) => {
        state.energyBalanceLoading = false
        state.energyBalanceError = (action.payload as string) || "Failed to fetch energy balance"
        state.energyBalanceSuccess = false
        state.energyBalancePoints = []
      })

      // Fetch daily collection
      .addCase(fetchDailyCollection.pending, (state) => {
        state.dailyCollectionLoading = true
        state.dailyCollectionError = null
        state.dailyCollectionSuccess = false
      })
      .addCase(fetchDailyCollection.fulfilled, (state, action) => {
        state.dailyCollectionLoading = false
        state.dailyCollectionSuccess = true
        state.dailyCollectionPoints = action.payload.data.points
        state.currentDailyCollectionParams = action.payload.params
        state.dailyCollectionError = null
      })
      .addCase(fetchDailyCollection.rejected, (state, action) => {
        state.dailyCollectionLoading = false
        state.dailyCollectionError = (action.payload as string) || "Failed to fetch daily collection"
        state.dailyCollectionSuccess = false
        state.dailyCollectionPoints = []
      })

      // Fetch collection by band
      .addCase(fetchCollectionByBand.pending, (state) => {
        state.collectionByBandLoading = true
        state.collectionByBandError = null
        state.collectionByBandSuccess = false
      })
      .addCase(fetchCollectionByBand.fulfilled, (state, action) => {
        state.collectionByBandLoading = false
        state.collectionByBandSuccess = true
        state.collectionByBandSlices = action.payload.data.slices
        state.currentCollectionByBandParams = action.payload.params
        state.collectionByBandError = null
      })
      .addCase(fetchCollectionByBand.rejected, (state, action) => {
        state.collectionByBandLoading = false
        state.collectionByBandError = (action.payload as string) || "Failed to fetch collection by band"
        state.collectionByBandSuccess = false
        state.collectionByBandSlices = []
      })

      // Fetch CBO performance
      .addCase(fetchCboPerformance.pending, (state) => {
        state.cboPerformanceLoading = true
        state.cboPerformanceError = null
        state.cboPerformanceSuccess = false
      })
      .addCase(fetchCboPerformance.fulfilled, (state, action) => {
        state.cboPerformanceLoading = false
        state.cboPerformanceSuccess = true
        state.cboPerformanceSlices = action.payload.data.slices
        state.currentCboPerformanceParams = action.payload.params
        state.cboPerformanceError = null
      })
      .addCase(fetchCboPerformance.rejected, (state, action) => {
        state.cboPerformanceLoading = false
        state.cboPerformanceError = (action.payload as string) || "Failed to fetch CBO performance"
        state.cboPerformanceSuccess = false
        state.cboPerformanceSlices = []
      })

      // Fetch new connections
      .addCase(fetchNewConnections.pending, (state) => {
        state.newConnectionsLoading = true
        state.newConnectionsError = null
        state.newConnectionsSuccess = false
      })
      .addCase(fetchNewConnections.fulfilled, (state, action) => {
        state.newConnectionsLoading = false
        state.newConnectionsSuccess = true
        state.newConnectionsTotal = action.payload.data.totalConnections
        state.newConnectionsPoints = action.payload.data.points
        state.currentNewConnectionsParams = action.payload.params
        state.newConnectionsError = null
      })
      .addCase(fetchNewConnections.rejected, (state, action) => {
        state.newConnectionsLoading = false
        state.newConnectionsError = (action.payload as string) || "Failed to fetch new connections"
        state.newConnectionsSuccess = false
        state.newConnectionsTotal = 0
        state.newConnectionsPoints = []
      })

      // Fetch prepaid vends
      .addCase(fetchPrepaidVends.pending, (state) => {
        state.prepaidVendsLoading = true
        state.prepaidVendsError = null
        state.prepaidVendsSuccess = false
      })
      .addCase(fetchPrepaidVends.fulfilled, (state, action) => {
        state.prepaidVendsLoading = false
        state.prepaidVendsSuccess = true
        state.prepaidVendsPoints = action.payload.data.points
        state.currentPrepaidVendsParams = action.payload.params
        state.prepaidVendsError = null
      })
      .addCase(fetchPrepaidVends.rejected, (state, action) => {
        state.prepaidVendsLoading = false
        state.prepaidVendsError = (action.payload as string) || "Failed to fetch prepaid vends"
        state.prepaidVendsSuccess = false
        state.prepaidVendsPoints = []
      })

      // Fetch tokens generated
      .addCase(fetchTokenGenerated.pending, (state) => {
        state.tokenGeneratedLoading = true
        state.tokenGeneratedError = null
        state.tokenGeneratedSuccess = false
      })
      .addCase(fetchTokenGenerated.fulfilled, (state, action) => {
        state.tokenGeneratedLoading = false
        state.tokenGeneratedSuccess = true
        state.tokenGeneratedPoints = action.payload.data.points
        state.currentTokenGeneratedParams = action.payload.params
        state.tokenGeneratedError = null
      })
      .addCase(fetchTokenGenerated.rejected, (state, action) => {
        state.tokenGeneratedLoading = false
        state.tokenGeneratedError = (action.payload as string) || "Failed to fetch tokens generated"
        state.tokenGeneratedSuccess = false
        state.tokenGeneratedPoints = []
      })

      // Fetch meters programmed
      .addCase(fetchMetersProgrammed.pending, (state) => {
        state.metersProgrammedLoading = true
        state.metersProgrammedError = null
        state.metersProgrammedSuccess = false
      })
      .addCase(fetchMetersProgrammed.fulfilled, (state, action) => {
        state.metersProgrammedLoading = false
        state.metersProgrammedSuccess = true
        state.metersProgrammedPoints = action.payload.data.points
        state.currentMetersProgrammedParams = action.payload.params
        state.metersProgrammedError = null
      })
      .addCase(fetchMetersProgrammed.rejected, (state, action) => {
        state.metersProgrammedLoading = false
        state.metersProgrammedError = (action.payload as string) || "Failed to fetch meters programmed"
        state.metersProgrammedSuccess = false
        state.metersProgrammedPoints = []
      })

      // Fetch customer segments
      .addCase(fetchCustomerSegments.pending, (state) => {
        state.customerSegmentsLoading = true
        state.customerSegmentsError = null
        state.customerSegmentsSuccess = false
      })
      .addCase(fetchCustomerSegments.fulfilled, (state, action) => {
        state.customerSegmentsLoading = false
        state.customerSegmentsSuccess = true
        state.customerSegmentsData = action.payload.data
        state.currentCustomerSegmentsParams = action.payload.params
        state.customerSegmentsError = null
      })
      .addCase(fetchCustomerSegments.rejected, (state, action) => {
        state.customerSegmentsLoading = false
        state.customerSegmentsError = (action.payload as string) || "Failed to fetch customer segments"
        state.customerSegmentsSuccess = false
        state.customerSegmentsData = null
      })
      // Fetch trend
      .addCase(fetchTrend.pending, (state) => {
        state.trendLoading = true
        state.trendError = null
        state.trendSuccess = false
      })
      .addCase(fetchTrend.fulfilled, (state, action) => {
        state.trendLoading = false
        state.trendSuccess = true
        state.trendPoints = action.payload.data.points
        state.currentTrendParams = action.payload.params
        state.trendError = null
      })
      .addCase(fetchTrend.rejected, (state, action) => {
        state.trendLoading = false
        state.trendError = (action.payload as string) || "Failed to fetch trend data"
        state.trendSuccess = false
        state.trendPoints = []
      })
      // Fetch breakdown
      .addCase(fetchBreakdown.pending, (state) => {
        state.breakdownLoading = true
        state.breakdownError = null
        state.breakdownSuccess = false
      })
      .addCase(fetchBreakdown.fulfilled, (state, action) => {
        state.breakdownLoading = false
        state.breakdownSuccess = true
        state.breakdownSlices = action.payload.data.slices
        state.currentBreakdownParams = action.payload.params
        state.breakdownError = null
      })
      .addCase(fetchBreakdown.rejected, (state, action) => {
        state.breakdownLoading = false
        state.breakdownError = (action.payload as string) || "Failed to fetch breakdown data"
        state.breakdownSuccess = false
        state.breakdownSlices = []
      })
      // Fetch collection efficiency
      .addCase(fetchCollectionEfficiency.pending, (state) => {
        state.collectionEfficiencyLoading = true
        state.collectionEfficiencyError = null
        state.collectionEfficiencySuccess = false
      })
      .addCase(fetchCollectionEfficiency.fulfilled, (state, action) => {
        state.collectionEfficiencyLoading = false
        state.collectionEfficiencySuccess = true
        state.collectionEfficiencyData = action.payload.data
        state.collectionEfficiencyError = null
      })
      .addCase(fetchCollectionEfficiency.rejected, (state, action) => {
        state.collectionEfficiencyLoading = false
        state.collectionEfficiencyError = (action.payload as string) || "Failed to fetch collection efficiency"
        state.collectionEfficiencySuccess = false
        state.collectionEfficiencyData = null
      })
      // Fetch outstanding arrears
      .addCase(fetchOutstandingArrears.pending, (state) => {
        state.outstandingArrearsLoading = true
        state.outstandingArrearsError = null
        state.outstandingArrearsSuccess = false
      })
      .addCase(fetchOutstandingArrears.fulfilled, (state, action) => {
        state.outstandingArrearsLoading = false
        state.outstandingArrearsSuccess = true
        state.outstandingArrearsData = action.payload.data
        state.outstandingArrearsError = null
      })
      .addCase(fetchOutstandingArrears.rejected, (state, action) => {
        state.outstandingArrearsLoading = false
        state.outstandingArrearsError = (action.payload as string) || "Failed to fetch outstanding arrears"
        state.outstandingArrearsSuccess = false
        state.outstandingArrearsData = null
      })
      // Fetch disputes
      .addCase(fetchDisputes.pending, (state) => {
        state.disputesLoading = true
        state.disputesError = null
        state.disputesSuccess = false
      })
      .addCase(fetchDisputes.fulfilled, (state, action) => {
        state.disputesLoading = false
        state.disputesSuccess = true
        state.disputesData = action.payload.data
        state.disputesError = null
      })
      .addCase(fetchDisputes.rejected, (state, action) => {
        state.disputesLoading = false
        state.disputesError = (action.payload as string) || "Failed to fetch disputes"
        state.disputesSuccess = false
        state.disputesData = null
      })
  },
})

export const {
  clearDashboardCards,
  clearEnergyBalance,
  clearDailyCollection,
  clearCollectionByBand,
  clearCboPerformance,
  clearNewConnections,
  clearPrepaidVends,
  clearTokenGenerated,
  clearMetersProgrammed,
  clearCustomerSegments,
  clearTrend,
  clearError,
  clearSuccess,
  resetReportingState,
  setDashboardCardValue,
  setDashboardCards,
  setCurrentParams,
  setCurrentEnergyBalanceParams,
  setCurrentDailyCollectionParams,
  setCurrentCollectionByBandParams,
  setCurrentCboPerformanceParams,
  setCurrentNewConnectionsParams,
  setCurrentPrepaidVendsParams,
  setCurrentTokenGeneratedParams,
  setCurrentMetersProgrammedParams,
  setCurrentCustomerSegmentsParams,
  setCurrentTrendParams,
  setCurrentBreakdownParams,
  clearCollectionEfficiency,
  clearOutstandingArrears,
  clearDisputes,
} = reportingSlice.actions

export default reportingSlice.reducer
