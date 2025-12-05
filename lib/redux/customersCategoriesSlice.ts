// src/lib/redux/customerCategoriesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import type { RootState } from "lib/redux/store"

// Interfaces for Customer Categories
export interface CustomerSubCategory {
  id: number
  name: string
  description: string
  customerCategoryId: number
}

export interface CustomerCategory {
  id: number
  name: string
  description: string
  subCategories: CustomerSubCategory[]
}

export interface CustomerCategoriesResponse {
  isSuccess: boolean
  message: string
  data: CustomerCategory[]
}

// Customer Categories State
interface CustomerCategoriesState {
  // Customer categories list state
  categories: CustomerCategory[]
  loading: boolean
  error: string | null
  success: boolean

  // Selected category state (for viewing/editing)
  selectedCategory: CustomerCategory | null
  selectedCategoryLoading: boolean
  selectedCategoryError: string | null
}

// Initial state
const initialState: CustomerCategoriesState = {
  categories: [],
  loading: false,
  error: null,
  success: false,
  selectedCategory: null,
  selectedCategoryLoading: false,
  selectedCategoryError: null,
}

// Async thunk for fetching customer categories
export const fetchCustomerCategories = createAsyncThunk(
  "customerCategories/fetchCustomerCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<CustomerCategoriesResponse>(buildApiUrl(API_ENDPOINTS.CUSTOMER_CATEGORIES.GET))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch customer categories")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch customer categories")
      }
      return rejectWithValue(error.message || "Network error during customer categories fetch")
    }
  }
)

// Customer Categories slice
const customerCategoriesSlice = createSlice({
  name: "customerCategories",
  initialState,
  reducers: {
    // Clear categories state
    clearCategories: (state) => {
      state.categories = []
      state.error = null
      state.success = false
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.selectedCategoryError = null
    },

    // Clear selected category
    clearSelectedCategory: (state) => {
      state.selectedCategory = null
      state.selectedCategoryError = null
    },

    // Reset customer categories state
    resetCustomerCategoriesState: (state) => {
      state.categories = []
      state.loading = false
      state.error = null
      state.success = false
      state.selectedCategory = null
      state.selectedCategoryLoading = false
      state.selectedCategoryError = null
    },

    // Set selected category (for when we get it from another source)
    setSelectedCategory: (state, action: PayloadAction<CustomerCategory>) => {
      state.selectedCategory = action.payload
    },

    // Set selected category by ID
    setSelectedCategoryById: (state, action: PayloadAction<number>) => {
      const categoryId = action.payload
      const category = state.categories.find((cat) => cat.id === categoryId)
      if (category) {
        state.selectedCategory = category
      }
    },

    // Filter categories by search term
    filterCategories: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase()
      if (searchTerm.trim() === "") {
        // If search is empty, show all categories
        // Note: This assumes we have all categories loaded
        return
      }

      // In a real scenario, you might want to fetch filtered data from API
      // This is a client-side filter for when all data is loaded
      state.categories = state.categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm) ||
          category.description.toLowerCase().includes(searchTerm) ||
          category.subCategories.some(
            (sub) => sub.name.toLowerCase().includes(searchTerm) || sub.description.toLowerCase().includes(searchTerm)
          )
      )
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customer categories
      .addCase(fetchCustomerCategories.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchCustomerCategories.fulfilled, (state, action: PayloadAction<CustomerCategoriesResponse>) => {
        state.loading = false
        state.success = true
        state.categories = action.payload.data
        state.error = null
      })
      .addCase(fetchCustomerCategories.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch customer categories"
        state.success = false
        state.categories = []
      })
  },
})

export const {
  clearCategories,
  clearError,
  clearSelectedCategory,
  resetCustomerCategoriesState,
  setSelectedCategory,
  setSelectedCategoryById,
  filterCategories,
} = customerCategoriesSlice.actions

// Selectors
export const selectCategories = (state: RootState) => state.customerCategories.categories

export const selectCategoriesLoading = (state: RootState) => state.customerCategories.loading

export const selectCategoriesError = (state: RootState) => state.customerCategories.error

export const selectCategoriesSuccess = (state: RootState) => state.customerCategories.success

export const selectSelectedCategory = (state: RootState) => state.customerCategories.selectedCategory

export const selectSelectedCategoryLoading = (state: RootState) => state.customerCategories.selectedCategoryLoading

export const selectSelectedCategoryError = (state: RootState) => state.customerCategories.selectedCategoryError

// Helper selector to get category by ID
export const selectCategoryById = (categoryId: number) => (state: RootState) =>
  state.customerCategories.categories.find((cat) => cat.id === categoryId)

// Helper selector to get flattened subcategories
export const selectAllSubCategories = (state: RootState) =>
  state.customerCategories.categories.flatMap((cat) => cat.subCategories)

export default customerCategoriesSlice.reducer
