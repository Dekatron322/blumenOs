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

const links = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  {
    name: "Customers Managment",
    href: "/customers",
    icon: ServiceIcon,
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

  // { name: "Crypto", href: "/crypto", icon: BusinessLogo },
  // { name: "Virtual Cards", href: "/virtual-accounts", icon: NoteIcon },

  // { name: "Tickets & Events", href: "/tickets-and-events", icon: BusinessLogo },
  // { name: "Role Management", href: "/role-management", icon: BusinessLogo },
  // { name: "Fees", href: "/fees", icon: BusinessLogo },
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
    <div className="flex flex-col border-black">
      {links.map((link) => {
        const LinkIcon = link.icon
        const isActive = link.href ? pathname.startsWith(link.href) : false

        const isExpanded = expandedLink === link.name
        const isLinkActive = link.href ? isActive : isActive

        return (
          <div key={link.name}>
            <div
              className={clsx("dashboard-style", {
                "active-dashboard": isLinkActive,
              })}
            >
              <Link href={link.href || "#"}>
                <div className="flex w-full items-center justify-between gap-2 pl-5">
                  <div className="flex items-center gap-3">
                    <LinkIcon isActive={isLinkActive} />
                    <p
                      className={clsx(
                        "relative top-[3px] text-sm font-medium leading-none transition-opacity duration-500",
                        {
                          hidden: isCollapsed,
                          " font-extrabold transition-opacity duration-500": isLinkActive,
                        }
                      )}
                    >
                      {link.name}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
