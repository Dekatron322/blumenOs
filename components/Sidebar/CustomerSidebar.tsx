"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import clsx from "clsx"
import { usePopover } from "components/Navbar/use-popover"
import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { CustomerLinks } from "./CustomerLinks"

const CustomerSidebar = () => {
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
          <CustomerLinks isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* {!isAgentOnly && (
        <div className="my-4 mt-auto flex h-auto items-center justify-between border-t px-6">
          <div className="flex w-full items-center justify-between pt-5">
            <button
              type="button"
              onClick={toggleSystemSettings}
              className="flex w-full items-center justify-between gap-2 rounded-md p-2 text-left  hover:bg-gray-100 "
            >
              <div className="flex items-center gap-2">
                <img src="/Icons/setting-2.svg" />
                <p className="bottom-bar  lg:block">System Settings</p>
              </div>
            </button>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default CustomerSidebar
