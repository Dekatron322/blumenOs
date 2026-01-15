// app/providers.tsx
"use client"

import { store } from "lib/redux/store"
import { Provider } from "react-redux"
import { RecordDebtModalProvider } from "lib/contexts/RecordDebtModalContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <RecordDebtModalProvider>{children}</RecordDebtModalProvider>
    </Provider>
  )
}
