"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  AgentIcon,
  AnalyticsIcon,
  AssetsIcon,
  AuditIcon,
  BillingIcon,
  DashboardIcon,
  FieldIcon,
  MeteringIcon,
  OutageIcon,
  PaymentIcon,
  ServiceIcon,
  TokenIcon,
} from "./Icons"

type LinkChild = { name: string; href: string }
type LinkItem = {
  name: string
  href?: string
  icon: (props: { isActive: boolean }) => JSX.Element
  children?: LinkChild[]
}

const links: LinkItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  {
    name: "Customers",
    href: "/customers",
    icon: ServiceIcon,
    children: [
      { name: "View Customers", href: "/customers/view-customers" },
      { name: "Add Customers", href: "/customers/add-customers" },
    ],
  },
  {
    name: "Postpaid Billing",
    href: "/billing",
    icon: BillingIcon,
  },
  {
    name: "Metering & AMI",
    href: "/metering",
    icon: MeteringIcon,
  },
  {
    name: "Prepaid & Tokens",
    href: "/tokens",
    icon: TokenIcon,
  },
  {
    name: "Collections & Payments",
    href: "/payment",
    icon: PaymentIcon,
  },
  {
    name: "Agent Management",
    href: "/agent-management",
    icon: AgentIcon,
    children: [
      { name: "Overview", href: "/agent-management/overview" },
      { name: "View All Agents", href: "/agent-management/all-agents" },
      { name: "Add New Agent", href: "/agent-management/add-new-agent" },
    ],
  },
  {
    name: "Asset Management",
    href: "/assets-management",
    icon: AssetsIcon,
    children: [
      { name: "Asset Report", href: "/assets-management/overview" },
      { name: "Area Offices", href: "/assets-management/area-offices" },
      { name: "Injection Substation", href: "/assets-management/injection-substations" },
      { name: "Feeders", href: "/assets-management/feeders" },
      { name: "Poles", href: "/assets-management/poles" },
      { name: "Distribution Stations", href: "/assets-management/distribution-stations" },
    ],
  },
  {
    name: "Outage Management",
    href: "/outage-management",
    icon: OutageIcon,
  },
  {
    name: "Analytics & Reports",
    href: "/analytics",
    icon: AnalyticsIcon,
  },
  {
    name: "Field Enumeration",
    href: "/field-enumeration",
    icon: FieldIcon,
  },
  {
    name: "Complaince & Audit",
    href: "/complaince",
    icon: AuditIcon,
  },
]

interface LinksProps {
  isCollapsed: boolean
}

export function Links({ isCollapsed }: LinksProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const handleExpand = (linkName: string, next: boolean) => {
    setExpanded((prev) => ({ ...prev, [linkName]: next }))
  }

  return (
    <div className="flex flex-col space-y-1 p-2">
      {links.map((link) => {
        const LinkIcon = link.icon
        const hasChildren = Array.isArray(link.children) && link.children.length > 0
        const childActive = hasChildren ? link.children!.some((c) => pathname.startsWith(c.href)) : false
        const isActive = link.href ? pathname.startsWith(link.href) : false
        const isLinkActive = hasChildren ? childActive || isActive : isActive
        const isExpanded = hasChildren ? expanded[link.name] ?? childActive : false

        return (
          <div key={link.name} className="group">
            <div
              className={clsx(
                "relative flex items-center rounded-xl transition-all duration-300 ease-out",
                "hover:bg-[#0a0a0a] hover:text-white",
                {
                  "bg-[#0a0a0a] text-white shadow-sm": isLinkActive,
                }
              )}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => handleExpand(link.name, !isExpanded)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                        {
                          "bg-white text-[#0a0a0a] shadow-lg": isLinkActive,
                          "bg-gray-100 text-[#0a0a0a] group-hover:bg-white group-hover:text-[#0a0a0a]": !isLinkActive,
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
                  {!isCollapsed && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={clsx("h-4 w-4 transform transition-colors transition-transform duration-300", {
                        "text-white": isLinkActive,
                        "text-[#0a0a0a] group-hover:text-white": !isLinkActive,
                        "rotate-180": isExpanded,
                      })}
                    >
                      {/* Chevron down, rotates to up when expanded */}
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
              ) : (
                <Link href={link.href || "#"} className="flex w-full items-center gap-3 px-4 py-3">
                  <div
                    className={clsx("flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300", {
                      "bg-white text-[#0a0a0a] shadow-lg": isLinkActive,
                      "bg-gray-100 text-[#0a0a0a] group-hover:bg-white group-hover:text-[#0a0a0a]": !isLinkActive,
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

            {hasChildren && !isCollapsed && (
              <div
                className={clsx(" overflow-hidden transition-all duration-500 ease-in-out", {
                  "max-h-0 opacity-0": !isExpanded,
                  "max-h-72 opacity-100": isExpanded,
                })}
              >
                <div className="ml-8 border-l-2 border-gray-200 py-2 pl-4">
                  {link.children!.map((child) => {
                    const isChildActive = pathname.startsWith(child.href)
                    return (
                      <Link key={child.name} href={child.href}>
                        <div
                          className={clsx(
                            "group/child mb-2 rounded-lg px-3 py-2 transition-all duration-300 last:mb-0",
                            "hover:bg-[#0a0a0a] hover:text-white",
                            {
                              "bg-gray-100 text-[#0a0a0a]": isChildActive,
                            }
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={clsx("h-1.5 w-1.5 rounded-full transition-all duration-300", {
                                "scale-125 bg-[#0a0a0a]": isChildActive,
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
                      </Link>
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
