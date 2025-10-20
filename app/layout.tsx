import "styles/tailwind.css"
import { Providers } from "./providers"
import AuthInitializer from "./authInitializer"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthInitializer />
          {children}
        </Providers>
      </body>
    </html>
  )
}
