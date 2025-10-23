// src/lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"

import { customerApi } from "./customerSlice"
import { adminApi } from "./adminSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [customerApi.reducerPath]: customerApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(customerApi.middleware)

      .concat(adminApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
