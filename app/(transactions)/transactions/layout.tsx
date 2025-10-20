import { NotificationProvider } from "components/ui/Notification/Notification"
import ProtectedRoute from "lib/protectedRoutes"
import { Metadata } from "next"
import "styles/tailwind.css"

export const metadata: Metadata = {
  title: "Ultra Admin Dashboard",
  description:
    "This is the central ultra dashboard for Ultra App, enabling of seamless, lightning-fast transactions. Instant money transfer, swap crypto to naira in seconds, make Ultra-to-Ultra transfers, pay bills, use virtual debit cards, and so much more.",
  icons: {
    icon: [
      { url: "/Group 5.svg" },
      { url: "/Group 5.svg", sizes: "16x16", type: "image/svg" },
      { url: "/Group 5.svg", sizes: "32x32", type: "image/svg" },
    ],
    apple: [{ url: "/Group 5.svg" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    url: "https://myultraapp.com/",
    images: [
      {
        width: 1200,
        height: 630,
        url: "#",
      },
    ],
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-screen flex-col-reverse border-0 border-blue-700 lg:flex-row">
        {/* <div className="">
        <SideBar />
      </div> */}
        <div className="grow overflow-y-auto border-0 border-black ">{children}</div>
        <NotificationProvider position="top-center" />
      </div>
    </ProtectedRoute>
  )
}
