"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle, CreditCard, Shield, User, Webhook } from "lucide-react"
import { useAppSelector } from "lib/hooks/useRedux"
import AgentChangePasswordModal from "components/ui/Modal/agent-change-password-modal"

const tabs = [
  { id: "personal", label: "Personal Info", icon: User, href: "/profile" },

  { id: "security", label: "Reset Password", icon: Shield, href: "/security" },
]

export default function ProfileSidebar() {
  const pathname = usePathname()
  const { agent, user } = useAppSelector((state) => state.auth)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

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
    <div className="w-full md:w-64 md:flex-shrink-0">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => (tab.id === "security" ? setIsPasswordModalOpen(true) : null)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="size-5  flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Password Reset Modal */}
      <AgentChangePasswordModal
        isOpen={isPasswordModalOpen}
        onRequestClose={() => setIsPasswordModalOpen(false)}
        userId={agent?.id || user?.id || 1}
        agentName={user?.fullName || agent?.agentType || "Current User"}
      />
    </div>
  )
}
