"use client"
import Link from "next/link"
import React, { useState } from "react"
import { Links } from "./Links"
import { LogoIcon } from "./Icons"
import Image from "next/image"
import clsx from "clsx"

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(false)}
      className={clsx(
        "sidebar relative z-[60] flex h-full flex-col justify-between border-r border-[#E4E4E4] max-sm:hidden",
        {
          "w-20": isCollapsed,
          "w-64": !isCollapsed,
        }
      )}
    >
      <div className="h-full justify-between border-0 border-red-700 lg:mt-2 lg:h-auto">
        <div className="flex items-center gap-2 border-b border-[#E4E4E4] px-7 py-2 transition-opacity lg:block">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/blumen.png" alt="Dashboard" width={50} height={50} />
            <h1 className="pt-2 text-xl font-bold">BlumenOS</h1>
          </Link>
        </div>

        <div className="mb-2 h-full border-b border-[#E4E4E4] lg:h-auto lg:space-y-1">
          <Links isCollapsed={isCollapsed} />
        </div>
      </div>
      <div className="my-4  flex h-auto items-center justify-between border-t  px-6">
        <div className="flex items-center space-x-2 border-0 border-black pt-5 ">
          <img src="/Icons/setting-2.svg" />
          <p className="bottom-bar hidden text-xs  lg:block 2xl:text-base">System Settings</p>
        </div>
      </div>
    </div>
  )
}

export default SideBar
