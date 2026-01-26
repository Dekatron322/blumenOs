import "styles/tailwind.css"
import ThemeProviders from "components/ProvidersComponents/ThemeProviders"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProviders>{children}</ThemeProviders>
}
