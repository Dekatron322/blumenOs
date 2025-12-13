"use client"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardIcon, PaymentIcon } from "./Icons"
import { CashClearanceIcon, CollectCash, MakeChangeRequestIcon, RaiseTicketIcon } from "components/Icons/Icons"

interface NavLink {
  name: string
  href: string
  icon: any
  permission?: string
}

const allLinks: NavLink[] = [
  { name: "Overiview", href: "/sales-rep/overview", icon: DashboardIcon },
  {
    name: "Collect payment",
    href: "/sales-rep/collect-payment",
    icon: CollectCash,
  },
  {
    name: "Raise Ticket",
    href: "/sales-rep/raise-ticket",
    icon: RaiseTicketIcon,
  },
  {
    name: "Make Change Request",
    href: "/sales-rep/make-change-request",
    icon: MakeChangeRequestIcon,
  },
  {
    name: "View Cash Clearance History",
    href: "/sales-rep/view-cash-clearance-history",
    icon: CashClearanceIcon,
  },
  {
    name: "View Payment History",
    href: "/sales-rep/view-payment-history",
    icon: PaymentIcon,
  },
]

interface SalesRepLinksProps {
  isCollapsed: boolean
}

export function SalesRepLinks({ isCollapsed }: SalesRepLinksProps) {
  const pathname = usePathname()
  const [permissions, setPermissions] = useState<string[]>([])
  const [links, setLinks] = useState<NavLink[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

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
      // Always show Dashboard (no permission required)
      if (!link.permission) return true

      // Check if user has the required permission
      return permissions.includes(link.permission)
    })
    setLinks(filteredLinks)
  }, [permissions])

  // Only guard against server-side render; on client, fall back to showing links even without authData
  if (!isClient) {
    return null
  }

  return (
    <div className="flex w-full flex-col space-y-1 overflow-y-auto p-2">
      {links.map((link) => {
        const LinkIcon = link.icon
        const isActive = pathname.startsWith(link.href)

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
              <div
                className={clsx("flex size-8 items-center justify-center rounded-lg transition-all duration-300", {
                  "bg-white text-[#004B23] shadow-lg": isActive,
                  "bg-gray-100 text-[#004B23] group-hover:bg-white group-hover:text-[#004B23]": !isActive,
                })}
              >
                <LinkIcon isActive={isActive} />
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
