import "../../../styles/tailwind.css"
import type { ReactNode } from "react"

export const metadata = {
  title: "BlumenOS Customer Portal",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
