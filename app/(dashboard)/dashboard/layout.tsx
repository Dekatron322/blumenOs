import { NotificationProvider } from "components/ui/Notification/Notification"
import SideBar from "components/Sidebar/Sidebar"
import { Metadata } from "next"
import "styles/tailwind.css"

export const metadata: Metadata = {
  title: "BlumenOS Admin Dashboard",
  description:
    "We help distribution companies leverage data-driven, scalable, and secure grid management. Unlock the power of real-time analytics and asset control, enabling proactive outage management and optimized energy distribution.",
  icons: {
    icon: [
      { url: "/blumen.png" },
      { url: "/blumen.png", sizes: "16x16", type: "image/png" },
      { url: "/blumen.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/blumen.png" }],
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
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col sm:flex-row">
          <SideBar />
          <main className="flex-1">{children}</main>
        </div>
        <NotificationProvider position="top-center" />
      </body>
    </html>
  )
}
