"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { Links } from "./Links"

import Image from "next/image"
import clsx from "clsx"
import { usePopover } from "components/Navbar/use-popover"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const pathname = usePathname()

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
          <Links isCollapsed={isCollapsed} />
        </div>
      </div>
      <div className="my-4 mt-auto flex h-auto items-center justify-between border-t px-6">
        <div ref={systemSettingsRef} className="relative flex w-full items-center justify-between pt-5">
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
                  <Link
                    href="/roles"
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 font-semibold text-blue-600": pathname.startsWith("/roles"),
                      }
                    )}
                  >
                    <img src="/Icons/ic_employee.svg" alt="Roles" className="size-4" />
                    <span>Roles</span>
                  </Link>
                  <Link
                    href="/payment-types"
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 font-semibold text-blue-600": pathname.startsWith("/payment-types"),
                      }
                    )}
                  >
                    <img src="/Icons/payment.svg" alt="Payment Types" className="size-4" />
                    <span>Payment Types Mngt</span>
                  </Link>
                  <Link
                    href="/departments"
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 font-semibold text-blue-600": pathname.startsWith("/departments"),
                      }
                    )}
                  >
                    <img src="/Icons/building.svg" alt="Departments" className="size-4" />
                    <span>Departments</span>
                  </Link>
                  <Link
                    href="/customer-categories"
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 font-semibold text-blue-600": pathname.startsWith("/customer-categories"),
                      }
                    )}
                  >
                    <img src="/Icons/ic_employee.svg" alt="Roles" className="size-4" />
                    <span>Customer Category Mngt</span>
                  </Link>
                  <Link
                    href="/background-jobs"
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 font-semibold text-blue-600": pathname.startsWith("/background-jobs"),
                      }
                    )}
                  >
                    <img src="/Icons/cpu.svg" alt="Background Jobs" className="size-4" />
                    <span>Background Jobs</span>
                  </Link>
                  <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100">
                    <img src="/Icons/message-notif.svg" alt="Notification Settings" className="size-4" />
                    <span>Notification Settings</span>
                  </button>
                  <Link
                    href="/developer-mode"
                    className={clsx(
                      "flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100",
                      {
                        "bg-gray-100 font-semibold text-blue-600": pathname.startsWith("/settings/developer-mode"),
                      }
                    )}
                  >
                    <img src="/Icons/Analytics.svg" alt="Developer Mode" className="size-4" />
                    <span>Developer Mode</span>
                  </Link>
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
