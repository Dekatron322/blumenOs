import "styles/tailwind.css"
import ThemeProviders from "components/ProvidersComponents/ThemeProviders"
import ProtectedRoute from "lib/protectedRoutes"
import CustomerAuthProvider from "lib/providers/customerAuthProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProviders>
          <CustomerAuthProvider>{children}</CustomerAuthProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
