"use client"

import { usePathname } from "next/navigation"

import DashboardNav from "components/Navbar/DashboardNav"
import ProfileSidebar from "components/Profile/ProfileSidebar"
import ProfileContent from "components/Profile/ProfileContent"

export default function ProfilePage() {
  const pathname = usePathname()

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname.startsWith("/kyb-verification")) return "kyb"
    if (pathname.startsWith("/bank-details")) return "bank"
    if (pathname.startsWith("/security")) return "security"
    if (pathname.startsWith("/api-keys-webhooks")) return "api"
    return "personal" // default for /profile
  }

  const activeTab = getActiveTab()

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        {/* Main Content with Sidebar */}
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar Tabs */}
          <ProfileSidebar />

          <div className="flex w-full flex-1 flex-col">
            <ProfileContent activeTab={activeTab} />
          </div>
        </div>
      </div>
    </>
  )
}
