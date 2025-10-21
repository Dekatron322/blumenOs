import SideBar from "components/Sidebar/Sidebar"
import { NotificationProvider } from "components/ui/Notification/Notification"
import ProtectedRoute from "lib/protectedRoutes"
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ProtectedRoute>
    <div className="flex h-screen w-screen flex-col-reverse border-0 border-blue-700 lg:flex-row">
      <div className="">
        <SideBar />
      </div>
      <div className="grow overflow-y-auto border-0 border-black ">{children}</div>
      <NotificationProvider position="top-center" />
    </div>
    // </ProtectedRoute>
  )
}
