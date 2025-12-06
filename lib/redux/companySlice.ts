// src/lib/redux/companySlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"

// Interfaces for Company
export interface Company {
  id: number
  name: string
  nercCode: string
  nercSupplyStructure: number
}

export interface CompaniesResponse {
  isSuccess: boolean
  message: string
  data: Company[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CompanyResponse {
  isSuccess: boolean
  message: string
  data: Company
}

export interface CompaniesRequestParams {
  pageNumber: number
  pageSize: number
  search?: string
  companyId?: number
  areaOfficeId?: number
  injectionSubstationId?: number
  feederId?: number
  serviceCenterId?: number
}

// Company State
interface CompanyState {
  // Companies list state
  companies: Company[]
  companiesLoading: boolean
  companiesError: string | null
  companiesSuccess: boolean

  // Single company state
  selectedCompany: Company | null
  selectedCompanyLoading: boolean
  selectedCompanyError: string | null
  selectedCompanySuccess: boolean

  // Pagination state
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrevious: boolean
  }

  // General state
  loading: boolean
  error: string | null
}

// Initial state
const initialState: CompanyState = {
  companies: [],
  companiesLoading: false,
  companiesError: null,
  companiesSuccess: false,
  selectedCompany: null,
  selectedCompanyLoading: false,
  selectedCompanyError: null,
  selectedCompanySuccess: false,
  pagination: {
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
}

// Async thunks - GET request for companies list
export const fetchCompanies = createAsyncThunk(
  "company/fetchCompanies",
  async (params: CompaniesRequestParams, { rejectWithValue }) => {
    try {
      const {
        pageNumber,
        pageSize,
        search,
        companyId,
        areaOfficeId,
        injectionSubstationId,
        feederId,
        serviceCenterId,
      } = params

      const response = await api.get<CompaniesResponse>(buildApiUrl(API_ENDPOINTS.COMPANY.GET), {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          ...(search && { Search: search }),
          ...(companyId !== undefined && { CompanyId: companyId }),
          ...(areaOfficeId !== undefined && { AreaOfficeId: areaOfficeId }),
          ...(injectionSubstationId !== undefined && { InjectionSubstationId: injectionSubstationId }),
          ...(feederId !== undefined && { FeederId: feederId }),
          ...(serviceCenterId !== undefined && { ServiceCenterId: serviceCenterId }),
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch companies")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch companies")
      }
      return rejectWithValue(error.message || "Network error during companies fetch")
    }
  }
)

// Async thunks - GET request by ID (if you need it later)
export const fetchCompanyById = createAsyncThunk(
  "company/fetchCompanyById",
  async (id: number, { rejectWithValue }) => {
    try {
      // Assuming you have a GET_BY_ID endpoint in your API_ENDPOINTS.COMPANY
      // If not, you can use the same endpoint with CompanyId parameter
      const response = await api.get<CompaniesResponse>(buildApiUrl(API_ENDPOINTS.COMPANY.GET), {
        params: {
          CompanyId: id,
          PageNumber: 1,
          PageSize: 1,
        },
      })

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch company")
      }

      // Since the endpoint returns a list, we take the first item if available
      if (response.data.data && response.data.data.length > 0) {
        return {
          isSuccess: response.data.isSuccess,
          message: response.data.message,
          data: response.data.data[0],
        } as CompanyResponse
      } else {
        return rejectWithValue("Company not found")
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch company")
      }
      return rejectWithValue(error.message || "Network error during company fetch")
    }
  }
)

// Company slice
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    // Clear companies state
    clearCompanies: (state) => {
      state.companies = []
      state.companiesError = null
      state.companiesSuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
    },

    // Clear selected company state
    clearSelectedCompany: (state) => {
      state.selectedCompany = null
      state.selectedCompanyError = null
      state.selectedCompanySuccess = false
      state.selectedCompanyLoading = false
    },

    // Clear all errors
    clearError: (state) => {
      state.error = null
      state.companiesError = null
      state.selectedCompanyError = null
    },

    // Reset company state
    resetCompanyState: (state) => {
      state.companies = []
      state.companiesLoading = false
      state.companiesError = null
      state.companiesSuccess = false
      state.selectedCompany = null
      state.selectedCompanyLoading = false
      state.selectedCompanyError = null
      state.selectedCompanySuccess = false
      state.pagination = {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      state.loading = false
      state.error = null
    },

    // Set pagination
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.currentPage = action.payload.page
      state.pagination.pageSize = action.payload.pageSize
    },

    // Update company in list
    updateCompanyInList: (state, action: PayloadAction<Company>) => {
      const index = state.companies.findIndex((company) => company.id === action.payload.id)
      if (index !== -1) {
        state.companies[index] = action.payload
      }
    },

    // Update selected company
    updateSelectedCompany: (state, action: PayloadAction<Company>) => {
      state.selectedCompany = action.payload
    },

    // Add a new company to the list
    addCompanyToList: (state, action: PayloadAction<Company>) => {
      state.companies.unshift(action.payload)
      state.pagination.totalCount += 1
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)
    },

    // Remove company from list
    removeCompanyFromList: (state, action: PayloadAction<number>) => {
      state.companies = state.companies.filter((company) => company.id !== action.payload)
      state.pagination.totalCount = Math.max(0, state.pagination.totalCount - 1)
      state.pagination.totalPages = Math.ceil(state.pagination.totalCount / state.pagination.pageSize)

      // Also clear selected company if it matches the removed ID
      if (state.selectedCompany && state.selectedCompany.id === action.payload) {
        state.selectedCompany = null
      }
    },

    // Filter companies by search term
    filterCompanies: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase()
      if (searchTerm) {
        // Note: This filters only the currently loaded companies
        // For full filtering, you should use the API endpoint with search parameter
        state.companies = state.companies.filter(
          (company) =>
            company.name.toLowerCase().includes(searchTerm) || company.nercCode.toLowerCase().includes(searchTerm)
        )
      }
    },

    // Sort companies
    sortCompanies: (state, action: PayloadAction<{ field: keyof Company; ascending: boolean }>) => {
      const { field, ascending } = action.payload
      state.companies.sort((a, b) => {
        if (a[field] < b[field]) return ascending ? -1 : 1
        if (a[field] > b[field]) return ascending ? 1 : -1
        return 0
      })
    },

    // Set companies directly (useful for caching or preloading)
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload
      state.companiesSuccess = true
      state.pagination.totalCount = action.payload.length
      state.pagination.totalPages = Math.ceil(action.payload.length / state.pagination.pageSize)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch companies cases
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true
        state.companiesError = null
        state.companiesSuccess = false
        state.loading = true
      })
      .addCase(fetchCompanies.fulfilled, (state, action: PayloadAction<CompaniesResponse>) => {
        state.companiesLoading = false
        state.companiesSuccess = true
        state.loading = false
        state.companies = action.payload.data || []
        state.pagination = {
          totalCount: action.payload.totalCount || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          hasNext: action.payload.hasNext || false,
          hasPrevious: action.payload.hasPrevious || false,
        }
        state.companiesError = null
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.companiesLoading = false
        state.loading = false
        state.companiesError = (action.payload as string) || "Failed to fetch companies"
        state.companiesSuccess = false
        state.companies = []
        state.pagination = {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          hasNext: false,
          hasPrevious: false,
        }
      })
      // Fetch company by ID cases
      .addCase(fetchCompanyById.pending, (state) => {
        state.selectedCompanyLoading = true
        state.selectedCompanyError = null
        state.selectedCompanySuccess = false
        state.loading = true
      })
      .addCase(fetchCompanyById.fulfilled, (state, action: PayloadAction<CompanyResponse>) => {
        state.selectedCompanyLoading = false
        state.selectedCompanySuccess = true
        state.loading = false
        state.selectedCompany = action.payload.data
        state.selectedCompanyError = null
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.selectedCompanyLoading = false
        state.loading = false
        state.selectedCompanyError = (action.payload as string) || "Failed to fetch company"
        state.selectedCompanySuccess = false
        state.selectedCompany = null
      })
  },
})

export const {
  clearCompanies,
  clearSelectedCompany,
  clearError,
  resetCompanyState,
  setPagination,
  updateCompanyInList,
  updateSelectedCompany,
  addCompanyToList,
  removeCompanyFromList,
  filterCompanies,
  sortCompanies,
  setCompanies,
} = companySlice.actions

export default companySlice.reducer
