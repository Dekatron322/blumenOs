"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { Links } from "./Links"

import Image from "next/image"
import clsx from "clsx"
import { usePopover } from "components/Navbar/use-popover"
import { AnimatePresence, motion } from "framer-motion"

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

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
        "sidebar relative z-[60] flex h-screen flex-col overflow-hidden border-r border-[#E4E4E4] max-sm:hidden",
        {
          "w-20": isCollapsed,
          "w-64": !isCollapsed,
        }
      )}
    >
      <div className="flex-1 border-0 border-red-700 lg:mt-2">
        <div className="flex items-center gap-2 border-b border-[#E4E4E4] px-7 py-2 transition-opacity lg:block">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/blumen.png" alt="Dashboard" width={50} height={50} />
            <h1 className="pt-2 text-xl font-bold">BlumenOS</h1>
          </Link>
        </div>

        <div className="mb-2 flex-1 overflow-y-auto lg:space-y-1">
          <Links isCollapsed={isCollapsed} />
        </div>
      </div>
      <div className="my-4 mt-auto flex h-auto items-center justify-between border-t px-6">
        <div ref={systemSettingsRef} className="relative flex w-full items-center justify-between pt-5">
          <button
            type="button"
            onClick={toggleSystemSettings}
            className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-xs hover:bg-gray-100 lg:text-sm 2xl:text-base"
          >
            <div className="flex items-center gap-2">
              <img src="/Icons/setting-2.svg" />
              <p className="bottom-bar hidden lg:block">System Settings</p>
            </div>
          </button>

          <AnimatePresence>
            {isSystemSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-[-1rem] z-50 mb-1 w-[240px] overflow-hidden rounded-md bg-white text-xs shadow-2xl ring-1 ring-black ring-opacity-5 lg:text-sm"
              >
                <div className="flex flex-col py-1">
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/ic_employee.svg" alt="Roles" className="size-4" />
                    <span>Roles</span>
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/payment.svg" alt="Payment Types" className="size-4" />
                    <span>Payment Types Mngt</span>
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/building.svg" alt="Departments" className="size-4" />
                    <span>Departments</span>
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/ic_employee.svg" alt="Roles" className="size-4" />
                    <span>Customer Category Mngt</span>
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/cpu.svg" alt="Background Jobs" className="size-4" />
                    <span>Background Jobs</span>
                  </button>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/message-notif.svg" alt="Notification Settings" className="size-4" />
                    <span>Notification Settings</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SideBar
