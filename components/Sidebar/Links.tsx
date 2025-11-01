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
      { name: "View Customers", href: "/customers" },
      { name: "Add Customers", href: "/customers/add-customers" },
    ],
  },
  {
    name: "Metering & AMI",
    href: "/metering",
    icon: MeteringIcon,
  },
  {
    name: "Billing Engine",
    href: "/billing",
    icon: BillingIcon,
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
  },
  {
    name: "Asset Management",
    href: "/assets-management",
    icon: AssetsIcon,
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
  const [expandedLink, setExpandedLink] = useState<string | null>(null)

  const handleExpand = (linkName: string) => {
    setExpandedLink(expandedLink === linkName ? null : linkName)
  }

  return (
    <div className="flex flex-col space-y-1 p-2">
      {links.map((link) => {
        const LinkIcon = link.icon
        const hasChildren = Array.isArray(link.children) && link.children.length > 0
        const childActive = hasChildren ? link.children!.some((c) => pathname.startsWith(c.href)) : false
        const isActive = link.href ? pathname.startsWith(link.href) : false
        const isLinkActive = hasChildren ? childActive || isActive : isActive
        const isExpanded = expandedLink === link.name

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
                  onClick={() => handleExpand(link.name)}
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
                    <div
                      className={clsx("h-1.5 w-1.5 rotate-45 border-r-2 border-t-2 transition-all duration-300", {
                        "border-white": isLinkActive,
                        "border-[#0a0a0a] group-hover:border-white": !isLinkActive,
                        "rotate-135": isExpanded,
                      })}
                    />
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
                className={clsx("ml-4 overflow-hidden transition-all duration-500 ease-in-out", {
                  "max-h-0 opacity-0": !isExpanded,
                  "max-h-48 opacity-100": isExpanded,
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
