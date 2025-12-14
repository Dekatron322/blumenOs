"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import Image from "next/image"
import clsx from "clsx"
import { usePopover } from "components/Navbar/use-popover"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { allLinks, getFirstPermittedPath, hasPermission, type UserPermission } from "./Links"
import { SalesRepLinks } from "./SalesRepLinks"

const SalesRepSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const { isAgentOnly, user } = useSelector((state: RootState) => state.auth)

  const {
    anchorRef: systemSettingsRef,
    open: isSystemSettingsOpen,
    handleToggle: toggleSystemSettings,
    handleClose: closeSystemSettings,
  } = usePopover()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (systemSettingsRef.current && !systemSettingsRef.current.contains(target)) {
        closeSystemSettings()
      }
    }

    if (isSystemSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [systemSettingsRef, closeSystemSettings, isSystemSettingsOpen])

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(false)}
      className={clsx(
        "sidebar relative z-[60] flex h-screen flex-col overflow-hidden border-r border-[#E4E4E4] max-xl:hidden ",
        {
          "w-20": isCollapsed,
          "w-64": !isCollapsed,
        }
      )}
    >
      <div className="flex-1 border-0 border-red-700 lg:mt-2">
        <div className="flex items-center gap-2 border-b border-[#E4E4E4] px-7 py-2 transition-opacity lg:block">
          <Link href="/" className="mb-2 flex items-center gap-2">
            <Image src="/kadco.svg" alt="Dashboard" width={135} height={130} />
          </Link>
        </div>

        <div className="mb-2 flex-1 overflow-y-auto lg:space-y-1">
          <SalesRepLinks isCollapsed={isCollapsed} />
        </div>
      </div>

      {!isAgentOnly && (
        <div className="my-4 mt-auto flex h-auto items-center justify-between border-t px-6">
          <div className="flex w-full items-center justify-between pt-5">
            <button
              type="button"
              onClick={() => {
                const permissions: UserPermission | null =
                  user?.roles && user?.privileges
                    ? {
                        roles: user.roles,
                        privileges: user.privileges,
                      }
                    : null

                let targetPath = "/dashboard"

                if (permissions) {
                  const dashboardLink = allLinks.find((link) => link.href === "/dashboard")
                  const canAccessDashboard = dashboardLink ? hasPermission(dashboardLink, permissions) : false

                  if (!canAccessDashboard) {
                    const firstPermitted = getFirstPermittedPath(permissions)
                    if (firstPermitted) {
                      targetPath = firstPermitted
                    }
                  }
                }

                router.push(targetPath)
              }}
              className="flex w-full items-center justify-center rounded-lg bg-[#004B23] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#003017]"
            >
              Switch to main dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesRepSidebar
