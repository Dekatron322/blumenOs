"use client"
import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { BusinessLogo, DashboardIcon, EmployeeLogo, Pricing, ServiceIcon } from "./Icons"

interface NavLink {
  name: string
  href: string
  icon: any
  permission?: string
}

const allLinks: NavLink[] = [
  { name: "Dashboard", href: "/otech-plus/dashboard", icon: DashboardIcon },
  {
    name: "Transactions",
    href: "/otech-plus/transactions",
    icon: Pricing,
    permission: "ReportMgt",
  },
  {
    name: "Customers",
    href: "/otech-plus/customers",
    icon: ServiceIcon,
    permission: "UserMgt",
  },
  {
    name: "Businesses",
    href: "/otech-plus/businesses",
    icon: BusinessLogo,
    permission: "BusinessMgt",
  },
  {
    name: "Employees",
    href: "/otech-plus/employee",
    icon: EmployeeLogo,
    permission: "AdminMgt",
  },
]

interface LinksProps {
  isCollapsed: boolean
}

export function PlusLinks({ isCollapsed }: LinksProps) {
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

  // If no permissions loaded yet, return null or loading state
  if (
    !isClient ||
    (permissions.length === 0 && typeof window !== "undefined" && localStorage.getItem("authData") === null)
  ) {
    return null
  }

  return (
    <div className="flex flex-col border-black lg:h-auto">
      {links.map((link) => {
        const LinkIcon = link.icon
        const isActive = pathname.startsWith(link.href)
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("flex items-center gap-2 py-3 pl-5 text-gray-600 transition-colors hover:bg-gray-100", {
              "bg-blue-50 text-blue-600": isActive,
            })}
          >
            <LinkIcon isActive={isActive} />
            <p
              className={clsx("text-sm font-semibold transition-opacity duration-500", {
                hidden: isCollapsed,
                "font-extrabold": isActive,
              })}
            >
              {link.name}
            </p>
          </Link>
        )
      })}
    </div>
  )
}
