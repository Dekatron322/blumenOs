import "styles/tailwind.css"
import ThemeProviders from "components/ProvidersComponents/ThemeProviders"
import ProtectedRoute from "lib/protectedRoutes"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <html lang="en">
        <body>
          <ThemeProviders>{children}</ThemeProviders>
        </body>
      </html>
    </ProtectedRoute>
  )
}
