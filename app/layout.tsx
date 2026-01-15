import "styles/tailwind.css"
import { Providers } from "./providers"
import AuthInitializer from "./authInitializer"
import GlobalRecordDebtModal from "components/ui/GlobalRecordDebtModal"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthInitializer />
          {children}
          <GlobalRecordDebtModal />
        </Providers>
      </body>
    </html>
  )
}
