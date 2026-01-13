// src/lib/redux/countriesSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { api } from "./authSlice"
import { API_ENDPOINTS, buildApiUrl } from "lib/config/api"
import type { RootState } from "lib/redux/store"

// API response models
export interface CountryCurrency {
  id: number
  name: string
  symbol: string
  abbreviation: string
  avatar: string | null
}

export interface Province {
  id: number
  countryId: number
  name: string
}

export interface LGA {
  id: number
  provinceId: number
  name: string
}

export interface Country {
  id: number
  name: string
  callingCode: string
  abbreviation: string
  currency: CountryCurrency
  provinces: Province[]
}

export interface CountriesResponse {
  isSuccess: boolean
  message: string
  data: Country[]
}

export interface LGAResponse {
  isSuccess: boolean
  message: string
  data: LGA[]
}

interface CountriesState {
  countries: Country[]
  lgas: LGA[]
  loading: boolean
  error: string | null
  success: boolean
}

const initialState: CountriesState = {
  countries: [],
  lgas: [],
  loading: false,
  error: null,
  success: false,
}

// Fetch all countries (and their provinces)
export const fetchCountries = createAsyncThunk("countries/fetchCountries", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<CountriesResponse>(buildApiUrl(API_ENDPOINTS.COUNTRIES.GET))

    if (!response.data.isSuccess) {
      return rejectWithValue(response.data.message || "Failed to fetch countries")
    }

    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return rejectWithValue(error.response.data.message || "Failed to fetch countries")
    }
    return rejectWithValue(error.message || "Network error during countries fetch")
  }
})

// Fetch LGAs by province ID
export const fetchLGAsByProvinceId = createAsyncThunk(
  "countries/fetchLGAsByProvinceId",
  async (provinceId: number, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.COUNTRIES.LGA.replace("{provinceId}", provinceId.toString())
      const response = await api.get<LGAResponse>(buildApiUrl(endpoint))

      if (!response.data.isSuccess) {
        return rejectWithValue(response.data.message || "Failed to fetch LGAs")
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return rejectWithValue(error.response.data.message || "Failed to fetch LGAs")
      }
      return rejectWithValue(error.message || "Network error during LGAs fetch")
    }
  }
)

const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {
    clearCountries: (state) => {
      state.countries = []
      state.lgas = []
      state.loading = false
      state.error = null
      state.success = false
    },
    resetCountriesState: (state) => {
      state.countries = []
      state.lgas = []
      state.loading = false
      state.error = null
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchCountries.fulfilled, (state, action: PayloadAction<CountriesResponse>) => {
        state.loading = false
        state.success = true
        state.countries = action.payload.data
        state.error = null
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch countries"
        state.success = false
        state.countries = []
      })
      .addCase(fetchLGAsByProvinceId.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(fetchLGAsByProvinceId.fulfilled, (state, action: PayloadAction<LGAResponse>) => {
        state.loading = false
        state.success = true
        state.lgas = action.payload.data
        state.error = null
      })
      .addCase(fetchLGAsByProvinceId.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch LGAs"
        state.success = false
        state.lgas = []
      })
  },
})

export const { clearCountries, resetCountriesState } = countriesSlice.actions

// Selectors
export const selectCountries = (state: RootState) => state.countries.countries
export const selectLGAs = (state: RootState) => state.countries.lgas
export const selectCountriesLoading = (state: RootState) => state.countries.loading
export const selectCountriesError = (state: RootState) => state.countries.error
export const selectCountriesSuccess = (state: RootState) => state.countries.success

// Flatten all provinces across countries
export const selectAllProvinces = (state: RootState) =>
  state.countries.countries.flatMap((country) => country.provinces)

// Provinces by country id
export const selectProvincesByCountryId = (countryId: number) => (state: RootState) => {
  const country = state.countries.countries.find((c) => c.id === countryId)
  return country ? country.provinces : []
}

// LGAs by province id
export const selectLGAsByProvinceId = (provinceId: number) => (state: RootState) => {
  return state.countries.lgas.filter((lga) => lga.provinceId === provinceId)
}

export default countriesSlice.reducer
