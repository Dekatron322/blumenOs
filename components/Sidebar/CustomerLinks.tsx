"use client"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { selectMyBillsList } from "lib/redux/customersDashboardSlice"
import { DashboardIcon, OutageIcon, PaymentIcon } from "./Icons"
import {
  CashClearanceIcon,
  CollectCash,
  MakeChangeRequestIcon,
  MeterOutlineIcon,
  RaiseTicketIcon,
  ReportOutageIcon,
  VendingIcon,
  VendingIconOutline,
} from "components/Icons/Icons"

interface NavLink {
  name: string
  href: string
  icon: any
  permission?: string
}

const allLinks: NavLink[] = [
  { name: "Overiview", href: "/customer-portal/overview", icon: DashboardIcon },
  {
    name: "Make payment",
    href: "/customer-portal/make-payment",
    icon: CollectCash,
  },
  {
    name: "Buy unit",
    href: "/customer-portal/buy-unit",
    icon: VendingIconOutline,
  },
  {
    name: "My Meters",
    href: "/customer-portal/meters",
    icon: MeterOutlineIcon,
  },
  {
    name: "Raise Support Ticket",
    href: "/customer-portal/support-ticket",
    icon: RaiseTicketIcon,
  },
  {
    name: "My Bills",
    href: "/customer-portal/bills",
    icon: PaymentIcon,
  },
  {
    name: "Report Outage",
    href: "/customer-portal/report-outage",
    icon: ReportOutageIcon,
  },
  {
    name: "All Support Ticket",
    href: "/customer-portal/all-support-ticket",
    icon: RaiseTicketIcon,
  },
  {
    name: "View Payment History",
    href: "/customer-portal/payment-history",
    icon: CashClearanceIcon,
  },
]

interface CustomerLinksProps {
  isCollapsed: boolean
}

export function CustomerLinks({ isCollapsed }: CustomerLinksProps) {
  const pathname = usePathname()
  const [permissions, setPermissions] = useState<string[]>([])
  const [links, setLinks] = useState<NavLink[]>(allLinks)
  const { agent } = useSelector((state: RootState) => state.auth)
  const myBillsList = useSelector(selectMyBillsList)

  useEffect(() => {
    // Get auth data from localStorage
    const getAuthData = () => {
      if (typeof window !== "undefined") {
        const authData = localStorage.getItem("authData")
        if (authData) {
          try {
            const parsedAuth = JSON.parse(authData) as any
            return parsedAuth.user?.permissions || []
          } catch (e) {
            console.error("Error parsing auth data", e)
            return []
          }
        }
      }
      return []
    }

    // Set initial permissions
    setPermissions(getAuthData())

    // Listen for storage changes to update permissions in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authData") {
        setPermissions(getAuthData())
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    // Filter links based on permissions
    const filteredLinks = allLinks.filter((link) => {
      // Hide Collect payment when agent has reached collection limit
      if (link.href === "/sales-rep/collect-payment" && agent && agent.cashAtHand >= agent.cashCollectionLimit) {
        return false
      }

      // Always show Dashboard (no permission required)
      if (!link.permission) return true

      // Check if user has the required permission
      return permissions.includes(link.permission)
    })
    setLinks(filteredLinks)
  }, [permissions, agent])

  return (
    <div className="flex w-full flex-col space-y-1 overflow-y-auto p-2">
      {links.map((link) => {
        const LinkIcon = link.icon
        const isActive = pathname.startsWith(link.href)

        // Calculate notification count for My Bills
        const notificationCount = link.name === "My Bills" && myBillsList ? myBillsList.length : 0

        return (
          <div key={link.name} className="group">
            <Link
              href={link.href}
              className={clsx(
                "flex w-full items-center gap-3 rounded-lg p-2 text-[#004B23] transition-all duration-300 ease-out",
                "hover:bg-[#004B23] hover:text-white",
                {
                  "bg-[#004B23] text-white shadow-sm": isActive,
                }
              )}
            >
              <div className="relative">
                <div
                  className={clsx("flex size-8 items-center justify-center rounded-lg transition-all duration-300", {
                    "bg-white text-[#004B23] shadow-lg": isActive,
                    "bg-gray-100 text-[#004B23] group-hover:bg-white group-hover:text-[#004B23]": !isActive,
                  })}
                >
                  <LinkIcon isActive={isActive} />
                </div>
                {notificationCount > 0 && (
                  <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </div>
                )}
              </div>

              <p
                className={clsx("relative text-sm font-medium transition-all duration-300", {
                  "w-0 scale-0 opacity-0": isCollapsed,
                  "scale-100 opacity-100": !isCollapsed,
                })}
              >
                {link.name}
              </p>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
