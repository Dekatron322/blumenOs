"use client"
import clsx from "clsx"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  AgentIcon,
  AnalyticsIcon,
  AssetsIcon,
  AuditIcon,
  BillingIcon,
  DashboardIcon,
  MeteringIcon,
  OutageIcon,
  PaymentIcon,
  ServiceIcon,
  TokenIcon,
} from "./Icons"
import { useRecordDebtModal } from "lib/contexts/RecordDebtModalContext"

export type LinkChild = { name: string; href: string; privilegeKey?: string; requiredActions?: string[] }
export type LinkItem = {
  name: string
  href?: string
  icon: (props: { isActive: boolean }) => JSX.Element
  children?: LinkChild[]
  privilegeKey?: string
  requiredActions?: string[]
  requiredRole?: string
}

// Define all possible links with their privilege requirements
export const allLinks: LinkItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: DashboardIcon,
    privilegeKey: "reporting-analytics",
    requiredActions: ["R"],
    // Dashboard is accessible to everyone who is authenticated
  },
  {
    name: "Customers",
    href: "/customers",
    icon: ServiceIcon,
    privilegeKey: "customers",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/customers/overview", privilegeKey: "customers", requiredActions: ["R"] },
      { name: "View Customers", href: "/customers/view-customers", privilegeKey: "customers", requiredActions: ["R"] },
      { name: "Add Customers", href: "/customers/add-customers", privilegeKey: "customers", requiredActions: ["W"] },
      { name: "Change Request", href: "/customers/change-request", privilegeKey: "customers", requiredActions: ["E"] },
      // {
      //   name: "Field Enumeration",
      //   href: "/customers/field-enumeration",
      //   privilegeKey: "customers",
      //   requiredActions: ["R"],
      // },
    ],
  },
  {
    name: "Employees",
    href: "/employees",
    icon: ServiceIcon,
    privilegeKey: "identity-users",
    requiredActions: ["R"],
    children: [
      {
        name: "Overview",
        href: "/employees/overview",
        privilegeKey: "identity-users",
        requiredActions: ["R"],
      },
      {
        name: "View Employees",
        href: "/employees/view-employees",
        privilegeKey: "identity-users",
        requiredActions: ["R"],
      },
      {
        name: "Add Employees",
        href: "/employees/add-employees",
        privilegeKey: "identity-users",
        requiredActions: ["W"],
      },
      {
        name: "Change Request",
        href: "/employees/change-request",
        privilegeKey: "identity-users",
        requiredActions: ["E"],
      },
    ],
  },
  {
    name: "Postpaid Billing",
    href: "/billing",
    icon: BillingIcon,
    privilegeKey: "billing-postpaid",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/billing/overview", privilegeKey: "billing-postpaid", requiredActions: ["R"] },
      { name: "Postpaid Bills", href: "/billing/bills", privilegeKey: "billing-postpaid", requiredActions: ["R"] },
      // {
      //   name: "Postpaid Meter Readings",
      //   href: "/billing/meter-readings",
      //   privilegeKey: "billing-postpaid",
      //   requiredActions: ["R"],
      // },
      {
        name: "Feeder Energy Caps",
        href: "/billing/feeder-energy-caps",
        privilegeKey: "billing-postpaid",
        requiredActions: ["R"],
      },
      {
        name: "Generate Postpaid Bills",
        href: "/billing/jobs",
        privilegeKey: "billing-postpaid",
        requiredActions: ["W"],
      },
      {
        name: "Change Request",
        href: "/billing/change-requests",
        privilegeKey: "billing-postpaid",
        requiredActions: ["E"],
      },
    ],
  },
  {
    name: "Metering & AMI",
    href: "/metering",
    icon: MeteringIcon,
    privilegeKey: "assets",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/metering/overview", privilegeKey: "assets", requiredActions: ["R"] },
      { name: "All Meters", href: "/metering/all-meters", privilegeKey: "assets", requiredActions: ["R"] },
      {
        name: "Postpaid Meter Readings",
        href: "/metering/meter-readings",
        privilegeKey: "assets",
        requiredActions: ["R"],
      },
      {
        name: "Install New Meter",
        href: "/metering/install-new-meter",
        privilegeKey: "assets",
        requiredActions: ["W"],
      },
      // {
      //   name: "Change Request",
      //   href: "/metering/change-requests",
      //   privilegeKey: "assets",
      //   requiredActions: ["E"],
      // },
    ],
  },
  {
    name: "Prepaid & Tokens",
    href: "/tokens",
    icon: TokenIcon,
    privilegeKey: "payments",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/tokens/overview", privilegeKey: "payments", requiredActions: ["R"] },
      {
        name: "Prepaid History",
        href: "/tokens/prepaid-history",
        privilegeKey: "payments",
        requiredActions: ["R"],
      },
      // {
      //   name: "Verify Meter Tokens",
      //   href: "/tokens/verify-meter-tokens",
      //   privilegeKey: "payments",
      //   requiredActions: ["R"],
      // },
    ],
  },
  {
    name: "Payments",
    href: "/payment",
    icon: PaymentIcon,
    privilegeKey: "payments",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/payment/overview", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "All Collections", href: "/payment/all-payment", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "Record Payment", href: "/payment/record-payment", privilegeKey: "payments", requiredActions: ["W"] },
      { name: "Cash Management", href: "/payment/cash-management", privilegeKey: "payments", requiredActions: ["R"] },
      {
        name: "Cash Clearance",
        href: "/agent-management/clearance",
        privilegeKey: "payments",
        requiredActions: ["W"],
      },
      {
        name: "Clear Cash",
        href: "/agent-management/clear-cash",
        privilegeKey: "payments",
        requiredActions: ["W"],
      },
      { name: "Duning Case", href: "/payment/duning-mgt", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "Change Request", href: "/payment/change-request", privilegeKey: "payments", requiredActions: ["E"] },
    ],
  },

  {
    name: "Debt Management",
    href: "/dm",
    icon: PaymentIcon,
    privilegeKey: "payments",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/dm/overview", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "All Debts Entries", href: "/dm/ade", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "All Customer Debts", href: "/dm/all-debts", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "All Debt Recovery", href: "/dm/adr", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "Debt Aging", href: "/dm/aging", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "Recovery Policies", href: "/dm/rp", privilegeKey: "payments", requiredActions: ["R"] },
      { name: "Add Debt", href: "/dm/add-debt", privilegeKey: "payments", requiredActions: ["W"] },
    ],
  },
  {
    name: "Cash Officers",
    href: "/agent-management",
    icon: AgentIcon,
    privilegeKey: "agents",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/agent-management/overview", privilegeKey: "agents", requiredActions: ["R"] },
      {
        name: "View All Sales Rep",
        href: "/agent-management/all-agents",
        privilegeKey: "agents",
        requiredActions: ["R"],
      },
      {
        name: "View All Cashiers",
        href: "/agent-management/all-cashiers",
        privilegeKey: "agents",
        requiredActions: ["R"],
      },
      {
        name: "View All Clearing Cashiers",
        href: "/agent-management/all-clearing-cashiers",
        privilegeKey: "agents",
        requiredActions: ["R"],
      },
      {
        name: "View All Supervisors",
        href: "/agent-management/all-supervisors",
        privilegeKey: "agents",
        requiredActions: ["R"],
      },
      {
        name: "Add New Officer",
        href: "/agent-management/add-new-agent",
        privilegeKey: "agents",
        requiredActions: ["W"],
      },

      {
        name: "Payments",
        href: "/agent-management/payments",
        privilegeKey: "agents",
        requiredActions: ["W"],
      },
      {
        name: "Change Request",
        href: "/agent-management/change-request",
        privilegeKey: "agents",
        requiredActions: ["E"],
      },
    ],
  },
  {
    name: "Vendor Mngt",
    href: "/vendor-management",
    icon: AgentIcon,
    privilegeKey: "vendors",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/vendor-management/overview", privilegeKey: "vendors", requiredActions: ["R"] },
      {
        name: "View All Vendors",
        href: "/vendor-management/all-vendors",
        privilegeKey: "vendors",
        requiredActions: ["R"],
      },
      {
        name: "Add New Vendor",
        href: "/vendor-management/add-new-vendor",
        privilegeKey: "vendors",
        requiredActions: ["W"],
      },
      {
        name: "Change Request",
        href: "/vendor-management/change-request",
        privilegeKey: "vendors",
        requiredActions: ["E"],
      },
    ],
  },
  {
    name: "Asset Management",
    href: "/assets-management",
    icon: AssetsIcon,
    privilegeKey: "assets",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/assets-management/overview", privilegeKey: "assets", requiredActions: ["R"] },
      { name: "Area Offices", href: "/assets-management/area-offices", privilegeKey: "assets", requiredActions: ["R"] },
      {
        name: "Injection Substation",
        href: "/assets-management/injection-substations",
        privilegeKey: "assets",
        requiredActions: ["R"],
      },
      { name: "Feeders", href: "/assets-management/feeders", privilegeKey: "assets", requiredActions: ["R"] },
      { name: "Poles", href: "/assets-management/poles", privilegeKey: "assets", requiredActions: ["R"] },
      {
        name: "Distribution Stations",
        href: "/assets-management/distribution-stations",
        privilegeKey: "assets",
        requiredActions: ["R"],
      },
      {
        name: "Service Stations",
        href: "/assets-management/service-stations",
        privilegeKey: "assets",
        requiredActions: ["R"],
      },
      {
        name: "Change Request",
        href: "/assets-management/change-request",
        privilegeKey: "assets",
        requiredActions: ["E"],
      },
    ],
  },
  {
    name: "Outage Mngt",
    href: "/outage-management",
    icon: OutageIcon,
    privilegeKey: "outages",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/outage-management/overview", privilegeKey: "outages", requiredActions: ["R"] },
      {
        name: "View Outages",
        href: "/outage-management/view-outages",
        privilegeKey: "outages",
        requiredActions: ["R"],
      },
      {
        name: "View Maintenance",
        href: "/outage-management/view-maintenance",
        privilegeKey: "maintenance",
        requiredActions: ["R"],
      },
      {
        name: "View Reports",
        href: "/outage-management/view-reports",
        privilegeKey: "outages",
        requiredActions: ["R"],
      },
    ],
  },
  {
    name: "Analytics & Reports",
    href: "/analytics",
    icon: AnalyticsIcon,
    privilegeKey: "reporting-analytics",
    requiredActions: ["R"],
    children: [
      // { name: "Overview", href: "/analytics/overview", privilegeKey: "notifications", requiredActions: ["W"] },
      {
        name: "Status Map",
        href: "/analytics/status-map",
        privilegeKey: "assets",
        requiredActions: ["R"],
      },
      {
        name: "Revenue Analytics",
        href: "/analytics/revenue-analytics",
        privilegeKey: "payments",
        requiredActions: ["R"],
      },
      {
        name: "Consumption Analytics",
        href: "/analytics/consumption-analytics",
        privilegeKey: "billing-postpaid",
        requiredActions: ["R"],
      },
      {
        name: "Performance Analytics",
        href: "/analytics/performance-analytics",
        privilegeKey: "notifications",
        requiredActions: ["R"],
      },
    ],
  },
  // {
  //   name: "Status Map",
  //   href: "/status-map",
  //   icon: PaymentIcon,
  //   privilegeKey: "assets",
  //   requiredActions: ["R"],
  // },
  {
    name: "Complaince & Audit",
    href: "/complaince",
    icon: AuditIcon,
    privilegeKey: "system-settings",
    requiredActions: ["R"],
    children: [
      // { name: "Overview", href: "/complaince/overview", privilegeKey: "system-settings", requiredActions: ["W"] },
      {
        name: "Audit Trails",
        href: "/complaince/audit-trails",
        privilegeKey: "system-settings",
        requiredActions: ["R"],
      },
      {
        name: "Complaince Checks",
        href: "/complaince/complaince-checks",
        privilegeKey: "system-settings",
        requiredActions: ["E"],
      },
      // {
      //   name: "NERC Reports",
      //   href: "/complaince/nerc-reports",
      //   privilegeKey: "system-settings",
      //   requiredActions: ["R"],
      // },
    ],
  },

  {
    name: "Disputes",
    href: "/disputes",
    icon: AuditIcon,
    privilegeKey: "disputes",
    requiredActions: ["R"],
    children: [
      { name: "Overview", href: "/disputes/overview", privilegeKey: "disputes", requiredActions: ["R"] },
      {
        name: "Billing Disputes",
        href: "/disputes/billing-disputes",
        privilegeKey: "disputes",
        requiredActions: ["R"],
      },
      {
        name: "Payment Disputes",
        href: "/disputes/payment-disputes",
        privilegeKey: "disputes",
        requiredActions: ["R"],
      },
      {
        name: "Change Requests",
        href: "/disputes/billing-disputes/change-requests",
        privilegeKey: "disputes",
        requiredActions: ["E"],
      },
    ],
  },
]

export interface UserPermission {
  roles: Array<{
    roleId: number
    name: string
    slug: string
    category: string
  }>
  privileges: Array<{
    key: string
    name: string
    category: string
    actions: string[]
  }>
}

// Runtime type guard to validate parsed permissions
export const isUserPermission = (value: unknown): value is UserPermission => {
  if (!value || typeof value !== "object") return false
  const v = value as any
  return Array.isArray(v?.roles) && Array.isArray(v?.privileges)
}

// Export link and permission helpers
export const hasPermission = (link: LinkItem, permissions: UserPermission): boolean => {
  // Check if user has super admin role
  const isSuperAdmin = permissions.roles.some((role) => role.slug === "superadmin")
  if (isSuperAdmin) return true

  // Check privilege requirements
  if (link.privilegeKey && link.requiredActions) {
    const privilege = permissions.privileges.find((p) => p.key === link.privilegeKey)
    if (!privilege) return false

    // Check if user has all required actions for this privilege
    return link.requiredActions.every((action) => privilege.actions.includes(action))
  }

  // If no specific privilege required, check if user has any privileges in the category
  if (link.privilegeKey) {
    return permissions.privileges.some((p) => p.key === link.privilegeKey)
  }

  return true
}

export const filterChildLinks = (children: LinkChild[], permissions: UserPermission): LinkChild[] => {
  return children.filter((child) => {
    if (child.privilegeKey && child.requiredActions) {
      const privilege = permissions.privileges.find((p) => p.key === child.privilegeKey)
      if (!privilege) return false
      return child.requiredActions.every((action) => privilege.actions.includes(action))
    }
    return true
  })
}

// Helper to get the first permitted navigation path for a user
export const getFirstPermittedPath = (permissions: UserPermission): string | null => {
  const permittedParents = allLinks.filter((link) => hasPermission(link, permissions))

  for (const link of permittedParents) {
    // Prefer first permitted child when available
    if (link.children && link.children.length > 0) {
      const children = filterChildLinks(link.children, permissions)
      if (children.length > 0) {
        return children[0]?.href ?? null
      }
    }

    // Fall back to parent href
    if (link.href) {
      return link.href
    }
  }

  return null
}

interface LinksProps {
  isCollapsed: boolean
}

export function Links({ isCollapsed }: LinksProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { openModal } = useRecordDebtModal()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [userPermissions, setUserPermissions] = useState<UserPermission | null>(null)
  const [filteredLinks, setFilteredLinks] = useState<LinkItem[]>([])

  useEffect(() => {
    // Load user permissions from localStorage
    if (typeof window === "undefined") {
      return
    }
    const storedPermissions = localStorage.getItem("userPermissions")
    if (storedPermissions) {
      try {
        const parsed = JSON.parse(storedPermissions)
        if (isUserPermission(parsed)) {
          setUserPermissions(parsed)
        } else {
          setUserPermissions(null)
        }
      } catch {
        setUserPermissions(null)
      }
    }
  }, [])

  useEffect(() => {
    if (userPermissions) {
      const filtered = allLinks.filter((link) => hasPermission(link, userPermissions))
      setFilteredLinks(filtered)
    } else {
      // If no permissions loaded, show all links (fallback)
      setFilteredLinks(allLinks)
    }
  }, [userPermissions])

  // Guard: if user manually navigates to a path (e.g. /dashboard) they don't have
  // permission for, redirect them to the first permitted path.
  useEffect(() => {
    if (!userPermissions || !pathname) return

    let matched = false
    let allowed = false

    for (const link of allLinks) {
      // Check parent route
      if (link.href && pathname.startsWith(link.href)) {
        matched = true
        allowed = hasPermission(link, userPermissions)
      }

      // Check children routes
      if (link.children && link.children.length > 0) {
        const permittedChildren = filterChildLinks(link.children, userPermissions)
        for (const child of link.children) {
          if (pathname.startsWith(child.href)) {
            matched = true
            // If this child is in the permitted list, it's allowed
            const isChildAllowed = permittedChildren.some((c) => c.href === child.href)
            allowed = allowed || isChildAllowed
          }
        }
      }
    }

    if (matched && !allowed) {
      const firstPermitted = getFirstPermittedPath(userPermissions)
      if (firstPermitted && firstPermitted !== pathname) {
        router.replace(firstPermitted)
      }
    }
  }, [pathname, userPermissions, router])

  const handleExpand = (linkName: string, next: boolean) => {
    setExpanded((prev) => ({ ...prev, [linkName]: next }))
  }

  const handleChildLinkClick = (child: LinkChild) => {
    // Special handling for "Add Debt" link
    if (child.name === "Add Debt") {
      openModal()
      return
    }
    // Normal navigation for other links
    router.push(child.href)
  }

  if (!userPermissions) {
    // Show loading state or basic links while permissions load
    return (
      <div className="flex h-svh flex-col space-y-1 overflow-y-auto p-2">
        {allLinks.map((link) => (
          <div key={link.name} className="animate-pulse">
            <div className="h-10 rounded-xl bg-gray-200"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex max-h-[calc(100svh-150px)] w-full flex-col space-y-1 overflow-y-auto p-2">
      {filteredLinks.map((link) => {
        const LinkIcon = link.icon
        const hasChildren = Array.isArray(link.children) && link.children.length > 0
        const filteredChildren = hasChildren && userPermissions ? filterChildLinks(link.children!, userPermissions) : []
        const shouldShowParent = hasChildren ? filteredChildren.length > 0 : true

        if (!shouldShowParent) return null

        const childActive = hasChildren ? filteredChildren.some((c) => pathname.startsWith(c.href)) : false
        const isActive = link.href ? pathname.startsWith(link.href) : false
        const isLinkActive = hasChildren ? childActive || isActive : isActive
        const isExpanded = hasChildren ? expanded[link.name] ?? childActive : false

        return (
          <div key={link.name} className="group">
            <div
              className={clsx(
                "relative flex items-center rounded-lg transition-all duration-300 ease-out",
                "hover:bg-[#004B23] hover:text-white",
                {
                  "bg-[#004B23] text-white shadow-sm": isLinkActive,
                }
              )}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => handleExpand(link.name, !isExpanded)}
                  className="flex w-full items-center justify-between gap-3 p-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        "flex size-8 items-center justify-center rounded-lg transition-all duration-300",
                        {
                          "bg-white text-[#004B23] shadow-lg": isLinkActive,
                          "bg-gray-100 text-[#004B23] group-hover:bg-white group-hover:text-[#004B23]": !isLinkActive,
                        }
                      )}
                    >
                      <LinkIcon isActive={isLinkActive} />
                    </div>
                    <p
                      className={clsx("relative text-sm font-medium transition-all duration-300", {
                        "w-0 scale-0 opacity-0": isCollapsed,
                        "scale-100 opacity-100": !isCollapsed,
                      })}
                    >
                      {link.name}
                    </p>
                  </div>
                  {!isCollapsed && filteredChildren.length > 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={clsx("size-4 transform transition-colors  duration-300", {
                        "text-white": isLinkActive,
                        "text-[#004B23] group-hover:text-white": !isLinkActive,
                        "rotate-180": isExpanded,
                      })}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link href={link.href || "#"} className="flex w-full items-center gap-3 p-2">
                  <div
                    className={clsx("flex size-8 items-center justify-center rounded-md transition-all duration-300", {
                      "bg-white text-[#004B23] shadow-lg": isLinkActive,
                      "bg-gray-100 text-[#004B23] group-hover:bg-white group-hover:text-[#004B23]": !isLinkActive,
                    })}
                  >
                    <LinkIcon isActive={isLinkActive} />
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
              )}
            </div>

            {hasChildren && !isCollapsed && filteredChildren.length > 0 && (
              <div
                className={clsx(" overflow-hidden transition-all duration-500 ease-in-out", {
                  "max-h-0 opacity-0": !isExpanded,
                  "max-h-96 opacity-100": isExpanded,
                })}
              >
                <div className="ml-6 border-l-2 border-gray-200 py-2 pl-3">
                  {filteredChildren.map((child) => {
                    const isChildActive = pathname.startsWith(child.href)
                    return (
                      <button key={child.name} onClick={() => handleChildLinkClick(child)} className="w-full text-left">
                        <div
                          className={clsx(
                            "group/child mb-2 rounded-md p-2  transition-all duration-300 last:mb-0",
                            "hover:bg-[#004B23] hover:text-white",
                            {
                              "bg-gray-100 text-[#004B23]": isChildActive,
                            }
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={clsx("h-1.5 w-1.5 rounded-full transition-all duration-300", {
                                "scale-125 bg-[#004B23]": isChildActive,
                                "bg-gray-300 group-hover/child:bg-white": !isChildActive,
                              })}
                            />
                            <p
                              className={clsx("text-sm transition-all duration-300", {
                                "font-semibold": isChildActive,
                              })}
                            >
                              {child.name}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
