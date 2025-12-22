import { NotificationProvider } from "components/ui/Notification/Notification"
import { Metadata } from "next"
import "styles/tailwind.css"

export const metadata: Metadata = {
  title: "Kaduna Electric Admin Dashboard",
  description:
    "End-to-end billing and field-ops platform powering KadElectric: customer/CRM, meter and billing, outage management, agent cash collection with clearance/remittance tracking, vendor payments, and real-time performance analytics—all secured by role-based controls.",
  icons: {
    icon: [
      { url: "/ke.png" },
      { url: "/ke.png", sizes: "16x16", type: "image/png" },
      { url: "/ke.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/ke.png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://blumenos.com/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "#",
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <NotificationProvider position="top-center" />
    </html>
  )
}
