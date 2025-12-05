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

// Response interface for subcategories endpoint
export interface CustomerSubCategoriesResponse {
  isSuccess: boolean
  message: string
  data: CustomerSubCategory[]
}

// Request interface for adding subcategory
export interface AddSubCategoryRequest {
  customerCategoryId: number
  name: string
  description: string
}

// Response interface for adding subcategory
export interface AddSubCategoryResponse {
  isSuccess: boolean
  message: string
  data: CustomerSubCategory
}

// Request interface for adding/editing category
export interface CategoryRequest {
  name: string
  description: string
}

// Response interface for adding category
export interface AddCategoryResponse {
  isSuccess: boolean
  message: string
  data: CustomerCategory
}

// Response interface for editing category
export interface EditCategoryResponse {
  isSuccess: boolean
  message: string
  data: CustomerCategory
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

  // Subcategories state
  subCategories: CustomerSubCategory[]
  subCategoriesLoading: boolean
  subCategoriesError: string | null
  subCategoriesSuccess: boolean

  // Add subcategory state
  addSubCategoryLoading: boolean
  addSubCategoryError: string | null
  addSubCategorySuccess: boolean
  addSubCategoryResponse: CustomerSubCategory | null

  // Add category state
  addCategoryLoading: boolean
  addCategoryError: string | null
  addCategorySuccess: boolean
  addCategoryResponse: CustomerCategory | null

  // Edit category state
  editCategoryLoading: boolean
  editCategoryError: string | null
  editCategorySuccess: boolean
  editCategoryResponse: CustomerCategory | null
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
  subCategories: [],
  subCategoriesLoading: false,
  subCategoriesError: null,
  subCategoriesSuccess: false,
  addSubCategoryLoading: false,
  addSubCategoryError: null,
  addSubCategorySuccess: false,
  addSubCategoryResponse: null,
  addCategoryLoading: false,
  addCategoryError: null,
  addCategorySuccess: false,
  addCategoryResponse: null,
  editCategoryLoading: false,
  editCategoryError: null,
  editCategorySuccess: false,
  editCategoryResponse: null,
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

// Async thunk for fetching subcategories by category ID
export const fetchSubCategoriesByCategoryId = createAsyncThunk(
  "customerCategories/fetchSubCategoriesByCategoryId",
  async (categoryId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMER_CATEGORIES.GET_SUBCATEGORIES.replace(
        "{categoryId}",
        categoryId.toString()
      )

      const response = await api.get<CustomerSubCategoriesResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch subcategories")
      }

      return {
        data: response.data.data,
        categoryId,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch subcategories")
      }
      return rejectWithValue(error.message || "Network error during subcategories fetch")
    }
  }
)

// Async thunk for adding a subcategory to a category
export const addSubCategory = createAsyncThunk(
  "customerCategories/addSubCategory",
  async (
    {
      categoryId,
      subCategoryData,
    }: { categoryId: number; subCategoryData: Omit<AddSubCategoryRequest, "customerCategoryId"> },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMER_CATEGORIES.ADD_SUBCATEGORIES.replace(
        "{categoryId}",
        categoryId.toString()
      )

      // Prepare request body according to API spec
      const requestBody: AddSubCategoryRequest = {
        customerCategoryId: categoryId,
        ...subCategoryData,
      }

      const response = await api.post<AddSubCategoryResponse>(buildApiUrl(endpoint), requestBody)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to add subcategory")
      }

      return {
        data: response.data.data,
        categoryId,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to add subcategory")
      }
      return rejectWithValue(error.message || "Network error during subcategory addition")
    }
  }
)

// Async thunk for adding a new category
export const addCategory = createAsyncThunk(
  "customerCategories/addCategory",
  async (categoryData: CategoryRequest, { rejectWithValue }) => {
    try {
      const response = await api.post<AddCategoryResponse>(
        buildApiUrl(API_ENDPOINTS.CUSTOMER_CATEGORIES.ADD_CATEGORY),
        categoryData
      )

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to add category")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to add category")
      }
      return rejectWithValue(error.message || "Network error during category addition")
    }
  }
)

// Async thunk for editing an existing category
export const editCategory = createAsyncThunk(
  "customerCategories/editCategory",
  async ({ id, categoryData }: { id: number; categoryData: CategoryRequest }, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.CUSTOMER_CATEGORIES.EDIT_CATEGORY.replace("{id}", id.toString())

      const response = await api.put<EditCategoryResponse>(buildApiUrl(endpoint), categoryData)

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to update category")
      }

      return {
        data: response.data.data,
        id,
      }
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to update category")
      }
      return rejectWithValue(error.message || "Network error during category update")
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

    // Clear subcategories state
    clearSubCategories: (state) => {
      state.subCategories = []
      state.subCategoriesError = null
      state.subCategoriesSuccess = false
    },

    // Clear add subcategory state
    clearAddSubCategoryState: (state) => {
      state.addSubCategoryLoading = false
      state.addSubCategoryError = null
      state.addSubCategorySuccess = false
      state.addSubCategoryResponse = null
    },

    // Clear add category state
    clearAddCategoryState: (state) => {
      state.addCategoryLoading = false
      state.addCategoryError = null
      state.addCategorySuccess = false
      state.addCategoryResponse = null
    },

    // Clear edit category state
    clearEditCategoryState: (state) => {
      state.editCategoryLoading = false
      state.editCategoryError = null
      state.editCategorySuccess = false
      state.editCategoryResponse = null
    },

    // Clear errors
    clearError: (state) => {
      state.error = null
      state.selectedCategoryError = null
      state.subCategoriesError = null
      state.addSubCategoryError = null
      state.addCategoryError = null
      state.editCategoryError = null
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
      state.subCategories = []
      state.subCategoriesLoading = false
      state.subCategoriesError = null
      state.subCategoriesSuccess = false
      state.addSubCategoryLoading = false
      state.addSubCategoryError = null
      state.addSubCategorySuccess = false
      state.addSubCategoryResponse = null
      state.addCategoryLoading = false
      state.addCategoryError = null
      state.addCategorySuccess = false
      state.addCategoryResponse = null
      state.editCategoryLoading = false
      state.editCategoryError = null
      state.editCategorySuccess = false
      state.editCategoryResponse = null
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

    // Manually add subcategories to a category (for optimistic updates)
    addSubCategoryToCategory: (
      state,
      action: PayloadAction<{ categoryId: number; subCategory: CustomerSubCategory }>
    ) => {
      const { categoryId, subCategory } = action.payload
      const category = state.categories.find((cat) => cat.id === categoryId)
      if (category) {
        category.subCategories.push(subCategory)
      }

      // Also update selected category if it matches
      if (state.selectedCategory && state.selectedCategory.id === categoryId) {
        state.selectedCategory.subCategories.push(subCategory)
      }

      // Also add to subCategories list if it belongs to the same category
      if (state.subCategories.length > 0 && state.subCategories[0]?.customerCategoryId === categoryId) {
        state.subCategories.push(subCategory)
      }
    },

    // Manually add a category (for optimistic updates)
    addCategoryToState: (state, action: PayloadAction<CustomerCategory>) => {
      state.categories.push(action.payload)
    },

    // Manually update a subcategory
    updateSubCategoryInCategory: (
      state,
      action: PayloadAction<{ categoryId: number; subCategory: CustomerSubCategory }>
    ) => {
      const { categoryId, subCategory } = action.payload
      const category = state.categories.find((cat) => cat.id === categoryId)
      if (category) {
        const index = category.subCategories.findIndex((sub) => sub.id === subCategory.id)
        if (index !== -1) {
          category.subCategories[index] = subCategory
        }
      }

      // Also update selected category if it matches
      if (state.selectedCategory && state.selectedCategory.id === categoryId) {
        const index = state.selectedCategory.subCategories.findIndex((sub) => sub.id === subCategory.id)
        if (index !== -1) {
          state.selectedCategory.subCategories[index] = subCategory
        }
      }

      // Also update in subCategories list
      const subCategoryIndex = state.subCategories.findIndex((sub) => sub.id === subCategory.id)
      if (subCategoryIndex !== -1) {
        state.subCategories[subCategoryIndex] = subCategory
      }
    },

    // Manually update a category
    updateCategoryInState: (state, action: PayloadAction<CustomerCategory>) => {
      const index = state.categories.findIndex((cat) => cat.id === action.payload.id)
      if (index !== -1) {
        state.categories[index] = action.payload
      }

      // Also update selected category if it matches
      if (state.selectedCategory && state.selectedCategory.id === action.payload.id) {
        state.selectedCategory = action.payload
      }
    },

    // Manually delete a subcategory
    deleteSubCategoryFromCategory: (state, action: PayloadAction<{ categoryId: number; subCategoryId: number }>) => {
      const { categoryId, subCategoryId } = action.payload
      const category = state.categories.find((cat) => cat.id === categoryId)
      if (category) {
        category.subCategories = category.subCategories.filter((sub) => sub.id !== subCategoryId)
      }

      // Also update selected category if it matches
      if (state.selectedCategory && state.selectedCategory.id === categoryId) {
        state.selectedCategory.subCategories = state.selectedCategory.subCategories.filter(
          (sub) => sub.id !== subCategoryId
        )
      }

      // Also remove from subCategories list
      state.subCategories = state.subCategories.filter((sub) => sub.id !== subCategoryId)
    },

    // Manually delete a category
    deleteCategoryFromState: (state, action: PayloadAction<number>) => {
      const categoryId = action.payload
      state.categories = state.categories.filter((cat) => cat.id !== categoryId)

      // Also clear selected category if it matches
      if (state.selectedCategory && state.selectedCategory.id === categoryId) {
        state.selectedCategory = null
      }
    },

    // Reset add subcategory response
    resetAddSubCategoryResponse: (state) => {
      state.addSubCategoryResponse = null
    },

    // Reset add category response
    resetAddCategoryResponse: (state) => {
      state.addCategoryResponse = null
    },

    // Reset edit category response
    resetEditCategoryResponse: (state) => {
      state.editCategoryResponse = null
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

      // Fetch subcategories by category ID
      .addCase(fetchSubCategoriesByCategoryId.pending, (state) => {
        state.subCategoriesLoading = true
        state.subCategoriesError = null
        state.subCategoriesSuccess = false
      })
      .addCase(fetchSubCategoriesByCategoryId.fulfilled, (state, action) => {
        state.subCategoriesLoading = false
        state.subCategoriesSuccess = true
        state.subCategories = action.payload.data
        state.subCategoriesError = null

        // Also update the subcategories in the corresponding category
        const category = state.categories.find((cat) => cat.id === action.payload.categoryId)
        if (category) {
          category.subCategories = action.payload.data
        }

        // Also update selected category if it matches
        if (state.selectedCategory && state.selectedCategory.id === action.payload.categoryId) {
          state.selectedCategory.subCategories = action.payload.data
        }
      })
      .addCase(fetchSubCategoriesByCategoryId.rejected, (state, action) => {
        state.subCategoriesLoading = false
        state.subCategoriesError = (action.payload as string) || "Failed to fetch subcategories"
        state.subCategoriesSuccess = false
        state.subCategories = []
      })

      // Add subcategory
      .addCase(addSubCategory.pending, (state) => {
        state.addSubCategoryLoading = true
        state.addSubCategoryError = null
        state.addSubCategorySuccess = false
        state.addSubCategoryResponse = null
      })
      .addCase(addSubCategory.fulfilled, (state, action) => {
        state.addSubCategoryLoading = false
        state.addSubCategorySuccess = true
        state.addSubCategoryResponse = action.payload.data
        state.addSubCategoryError = null

        const { data: subCategory, categoryId } = action.payload

        // Update the subcategories list
        state.subCategories.push(subCategory)

        // Update the corresponding category
        const category = state.categories.find((cat) => cat.id === categoryId)
        if (category) {
          category.subCategories.push(subCategory)
        }

        // Also update selected category if it matches
        if (state.selectedCategory && state.selectedCategory.id === categoryId) {
          state.selectedCategory.subCategories.push(subCategory)
        }
      })
      .addCase(addSubCategory.rejected, (state, action) => {
        state.addSubCategoryLoading = false
        state.addSubCategoryError = (action.payload as string) || "Failed to add subcategory"
        state.addSubCategorySuccess = false
        state.addSubCategoryResponse = null
      })

      // Add category
      .addCase(addCategory.pending, (state) => {
        state.addCategoryLoading = true
        state.addCategoryError = null
        state.addCategorySuccess = false
        state.addCategoryResponse = null
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<AddCategoryResponse>) => {
        state.addCategoryLoading = false
        state.addCategorySuccess = true
        state.addCategoryResponse = action.payload.data
        state.addCategoryError = null

        // Add the new category to the categories list
        state.categories.push(action.payload.data)

        // Also update selected category if it's not set
        if (!state.selectedCategory) {
          state.selectedCategory = action.payload.data
        }
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.addCategoryLoading = false
        state.addCategoryError = (action.payload as string) || "Failed to add category"
        state.addCategorySuccess = false
        state.addCategoryResponse = null
      })

      // Edit category
      .addCase(editCategory.pending, (state) => {
        state.editCategoryLoading = true
        state.editCategoryError = null
        state.editCategorySuccess = false
        state.editCategoryResponse = null
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.editCategoryLoading = false
        state.editCategorySuccess = true
        state.editCategoryResponse = action.payload.data
        state.editCategoryError = null

        const { data: updatedCategory, id } = action.payload

        // Update the category in the categories list
        const index = state.categories.findIndex((cat) => cat.id === id)
        if (index !== -1) {
          state.categories[index] = updatedCategory
        }

        // Also update selected category if it matches
        if (state.selectedCategory && state.selectedCategory.id === id) {
          state.selectedCategory = updatedCategory
        }
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.editCategoryLoading = false
        state.editCategoryError = (action.payload as string) || "Failed to update category"
        state.editCategorySuccess = false
        state.editCategoryResponse = null
      })
  },
})

export const {
  clearCategories,
  clearSubCategories,
  clearAddSubCategoryState,
  clearAddCategoryState,
  clearEditCategoryState,
  clearError,
  clearSelectedCategory,
  resetCustomerCategoriesState,
  setSelectedCategory,
  setSelectedCategoryById,
  filterCategories,
  addSubCategoryToCategory,
  addCategoryToState,
  updateSubCategoryInCategory,
  updateCategoryInState,
  deleteSubCategoryFromCategory,
  deleteCategoryFromState,
  resetAddSubCategoryResponse,
  resetAddCategoryResponse,
  resetEditCategoryResponse,
} = customerCategoriesSlice.actions

// Selectors
export const selectCategories = (state: RootState) => state.customerCategories.categories

export const selectCategoriesLoading = (state: RootState) => state.customerCategories.loading

export const selectCategoriesError = (state: RootState) => state.customerCategories.error

export const selectCategoriesSuccess = (state: RootState) => state.customerCategories.success

export const selectSelectedCategory = (state: RootState) => state.customerCategories.selectedCategory

export const selectSelectedCategoryLoading = (state: RootState) => state.customerCategories.selectedCategoryLoading

export const selectSelectedCategoryError = (state: RootState) => state.customerCategories.selectedCategoryError

export const selectSubCategories = (state: RootState) => state.customerCategories.subCategories

export const selectSubCategoriesLoading = (state: RootState) => state.customerCategories.subCategoriesLoading

export const selectSubCategoriesError = (state: RootState) => state.customerCategories.subCategoriesError

export const selectSubCategoriesSuccess = (state: RootState) => state.customerCategories.subCategoriesSuccess

export const selectAddSubCategoryLoading = (state: RootState) => state.customerCategories.addSubCategoryLoading

export const selectAddSubCategoryError = (state: RootState) => state.customerCategories.addSubCategoryError

export const selectAddSubCategorySuccess = (state: RootState) => state.customerCategories.addSubCategorySuccess

export const selectAddSubCategoryResponse = (state: RootState) => state.customerCategories.addSubCategoryResponse

export const selectAddCategoryLoading = (state: RootState) => state.customerCategories.addCategoryLoading

export const selectAddCategoryError = (state: RootState) => state.customerCategories.addCategoryError

export const selectAddCategorySuccess = (state: RootState) => state.customerCategories.addCategorySuccess

export const selectAddCategoryResponse = (state: RootState) => state.customerCategories.addCategoryResponse

export const selectEditCategoryLoading = (state: RootState) => state.customerCategories.editCategoryLoading

export const selectEditCategoryError = (state: RootState) => state.customerCategories.editCategoryError

export const selectEditCategorySuccess = (state: RootState) => state.customerCategories.editCategorySuccess

export const selectEditCategoryResponse = (state: RootState) => state.customerCategories.editCategoryResponse

// Helper selector to get category by ID
export const selectCategoryById = (categoryId: number) => (state: RootState) =>
  state.customerCategories.categories.find((cat) => cat.id === categoryId)

// Helper selector to get subcategories by category ID
export const selectSubCategoriesByCategoryId = (categoryId: number) => (state: RootState) => {
  // First check if we have loaded subcategories for this category
  if (
    state.customerCategories.subCategories.length > 0 &&
    state.customerCategories.subCategories[0]?.customerCategoryId === categoryId
  ) {
    return state.customerCategories.subCategories
  }

  // Fall back to subcategories from the category object
  const category = state.customerCategories.categories.find((cat) => cat.id === categoryId)
  return category ? category.subCategories : []
}

// Helper selector to get flattened subcategories from all categories
export const selectAllSubCategories = (state: RootState) =>
  state.customerCategories.categories.flatMap((cat) => cat.subCategories)

// Helper selector to get subcategory by ID
export const selectSubCategoryById = (subCategoryId: number) => (state: RootState) => {
  // Check in the subCategories list first
  const fromSubCategories = state.customerCategories.subCategories.find((sub) => sub.id === subCategoryId)
  if (fromSubCategories) return fromSubCategories

  // Then check in categories
  for (const category of state.customerCategories.categories) {
    const subCategory = category.subCategories.find((sub) => sub.id === subCategoryId)
    if (subCategory) return subCategory
  }

  return null
}

// Helper selector to check if a subcategory with given name exists in a category
export const selectSubCategoryExistsInCategory =
  (categoryId: number, subCategoryName: string) => (state: RootState) => {
    const category = state.customerCategories.categories.find((cat) => cat.id === categoryId)
    if (!category) return false

    return category.subCategories.some((sub) => sub.name.toLowerCase() === subCategoryName.toLowerCase())
  }

// Helper selector to check if a category with given name exists (excluding current category)
export const selectCategoryExists = (categoryName: string, excludeCategoryId?: number) => (state: RootState) => {
  return state.customerCategories.categories.some(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase() && cat.id !== excludeCategoryId
  )
}

// Helper selector to get the last added subcategory
export const selectLastAddedSubCategory = (state: RootState) => state.customerCategories.addSubCategoryResponse

// Helper selector to get the last added category
export const selectLastAddedCategory = (state: RootState) => state.customerCategories.addCategoryResponse

// Helper selector to get the last edited category
export const selectLastEditedCategory = (state: RootState) => state.customerCategories.editCategoryResponse

// Helper selector to get total categories count
export const selectTotalCategories = (state: RootState) => state.customerCategories.categories.length

// Helper selector to get total subcategories count
export const selectTotalSubCategories = (state: RootState) =>
  state.customerCategories.categories.reduce((total, category) => total + category.subCategories.length, 0)

export default customerCategoriesSlice.reducer
