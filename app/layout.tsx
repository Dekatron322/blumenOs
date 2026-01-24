import "styles/tailwind.css"
import { Providers } from "./providers"
import AuthInitializer from "./authInitializer"
import GlobalRecordDebtModal from "components/ui/GlobalRecordDebtModal"
import DevToolsBlocker from "components/ui/DevToolsBlocker"
import { NotificationProvider } from "components/ui/Notification/Notification"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthInitializer />
          <DevToolsBlocker>{children}</DevToolsBlocker>
          <GlobalRecordDebtModal />
          <NotificationProvider position="top-center" />
        </Providers>
      </body>
    </html>
  )
}
