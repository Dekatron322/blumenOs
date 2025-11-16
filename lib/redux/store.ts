// src/lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import employeeReducer from "./employeeSlice"
import roleReducer from "./roleSlice"
import areaOfficeReducer from "./areaOfficeSlice"
import departmentReducer from "./departmentSlice"
import { adminApi } from "./adminSlice"
import injectionSubstationReducer from "./injectionSubstationSlice"
import feedersReducer from "./feedersSlice"
import distributionSubstationsReducer from "./distributionSubstationsSlice"
import polesReducer from "./polesSlice"
import serviceStationReducer from "./serviceStationsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    roles: roleReducer,
    areaOffices: areaOfficeReducer,
    departments: departmentReducer,
    injectionSubstations: injectionSubstationReducer,
    feeders: feedersReducer,
    distributionSubstations: distributionSubstationsReducer,
    poles: polesReducer,
    serviceStations: serviceStationReducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(adminApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
