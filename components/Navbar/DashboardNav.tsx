"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft"
import { RxCross2 } from "react-icons/rx"
import { Links } from "components/Sidebar/Links"
import UltraIcon from "public/ultra-icon"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { ChevronDown } from "lucide-react"
import { FiUser } from "react-icons/fi"
import LogoutModal from "components/ui/Modal/logout-modal"
import { logout } from "lib/redux/authSlice"
import LogoutIcon from "public/logout-icon"
import { SearchModule } from "components/ui/Search/search-module"

const DashboardNav = () => {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const pathname = usePathname()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const router = useRouter()

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen)
  }

  const handleConfirmLogout = () => {
    setLoading(true)
    try {
      dispatch(logout())
      router.push("/")
    } finally {
      setLoading(false)
      setIsLogoutModalOpen(false)
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get user initials for avatar
  const getUserInitials = () => {
    const fullName = user?.fullName?.trim()
    if (fullName) {
      const names = fullName.split(/\s+/).filter(Boolean)
      const first = names[0]
      const second = names[1]
      if (first && second) {
        return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
      }
      return first?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"
    }
    return user?.email?.charAt(0).toUpperCase() || "A"
  }

  // Get primary role name
  const getPrimaryRole = () => {
    if (user?.roles && user.roles.length > 0) {
      const roleName = user.roles?.[0]?.name
      return roleName ?? "Administrator"
    }
    return "Administrator"
  }

  // Check if user has specific privilege
  const hasPrivilege = (key: string, action?: string): boolean => {
    if (!user?.privileges) return false

    const privilege = user.privileges.find((p) => p.key === key)
    if (!privilege) return false

    if (action) {
      return privilege.actions.includes(action)
    }
    return true
  }

  // Dashboard menu items with privilege-based access control
  // const menuItems = [
  //   {
  //     name: "Dashboard",
  //     path: "/dashboard",
  //     show: hasPrivilege("dashboard", "R"), // Check if user can read dashboard
  //   },
  //   {
  //     name: "Customers",
  //     path: "/customers",
  //     show: hasPrivilege("customers", "R"),
  //   },
  //   {
  //     name: "Agents",
  //     path: "/agents",
  //     show: hasPrivilege("agents", "R"),
  //   },
  //   {
  //     name: "Assets",
  //     path: "/assets",
  //     show: hasPrivilege("assets", "R"),
  //   },
  //   {
  //     name: "Vendors",
  //     path: "/vendors",
  //     show: hasPrivilege("vendors", "R"),
  //   },
  //   {
  //     name: "Payments",
  //     path: "/payments",
  //     show: hasPrivilege("payments", "R"),
  //   },
  //   {
  //     name: "Disputes",
  //     path: "/disputes",
  //     show: hasPrivilege("disputes", "R"),
  //   },
  //   {
  //     name: "Outages",
  //     path: "/outages",
  //     show: hasPrivilege("outages", "R"),
  //   },
  //   {
  //     name: "Maintenance",
  //     path: "/maintenance",
  //     show: hasPrivilege("maintenance", "R"),
  //   },
  //   {
  //     name: "Billing",
  //     path: "/billing",
  //     show: hasPrivilege("billing-postpaid", "R"),
  //   },
  //   {
  //     name: "User Management",
  //     path: "/user-management",
  //     show: hasPrivilege("identity-users", "R"),
  //   },
  //   {
  //     name: "Role Management",
  //     path: "/role-management",
  //     show: hasPrivilege("roles", "R"),
  //   },
  //   {
  //     name: "Notifications",
  //     path: "/notifications",
  //     show: hasPrivilege("notifications", "R"),
  //   },
  //   {
  //     name: "System Settings",
  //     path: "/system-settings",
  //     show: hasPrivilege("system-settings", "R"),
  //   },
  // ]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  return (
    <>
      <nav className="containerbg sticky top-0 z-50 hidden w-full border-b bg-white md:block">
        <div className="flexBetween container mx-auto px-16 py-2 max-sm:px-3">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />
          {/* <div className="flex items-center gap-10">
            {menuItems.map(
              (item) =>
                item.show && (
                  <div key={item.name} className="relative">
                    <Link
                      href={item.path}
                      className={`text-sm font-medium transition-all duration-300 ease-in-out ${
                        pathname === item.path
                          ? "rounded-lg bg-[#e9f0ff] p-3 font-semibold text-[#003F9F]"
                          : "text-gray-600 hover:text-[#2F6FE3]"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </div>
                )
            )}
          </div> */}
          <div className="flex gap-4">
            <div className="relative flex content-center items-center justify-center gap-5" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200"
              >
                <div className="flex size-8 items-center justify-center rounded-full bg-[#004B23] font-medium text-white">
                  {getUserInitials()}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.email || "Admin User"}
                  </span>
                  <span className="text-xs text-gray-500">{getPrimaryRole()}</span>
                </div>
                <ChevronDown
                  className={`size-4 text-gray-500 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="pt-1">
                    {/* User Info Section */}
                    <div className="overflow-hidden border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user?.fullName || "Admin User"}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="mt-1 text-xs text-gray-400">Account ID: {user?.accountId || "N/A"}</p>
                      {user?.mustChangePassword && (
                        <div className="mt-2 rounded bg-yellow-50 px-2 py-1">
                          <p className="text-xs text-yellow-700">Password change required</p>
                        </div>
                      )}
                    </div>

                    {/* Profile Link */}
                    <Link
                      href="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-gray-50"
                    >
                      <FiUser className="size-4" />
                      Profile Settings
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setIsLogoutModalOpen(true)
                        setIsUserDropdownOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors duration-300 ease-in-out hover:bg-[#FDF3F3]"
                    >
                      <LogoutIcon />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sticky top-0 z-50 block border-b bg-[#F9f9f9] px-16 py-4 max-md:px-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/" className="content-center">
            <Image src="/kadco.svg" alt="Dashboard" width={100} height={50} />
          </Link>
          <div className="flex items-center gap-4">
            {/* Mobile User Info */}
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#004B23] text-sm font-medium text-white">
                {getUserInitials()}
              </div>
            </div>
            <FormatAlignLeftIcon onClick={toggleNav} style={{ cursor: "pointer" }} />
          </div>
        </div>

        {/* Mobile Sidebar + Backdrop */}
        {isNavOpen && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={toggleNav} />}

        <div
          className={`fixed left-0 top-0 z-50 h-full w-[300px] bg-white transition-transform duration-300 ${
            isNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#004B23] text-sm font-medium text-white">
                {getUserInitials()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.fullName || "Admin User"}</p>
                <p className="text-xs text-gray-500">{getPrimaryRole()}</p>
              </div>
            </div>
            <RxCross2 className="cursor-pointer text-gray-500" onClick={toggleNav} />
          </div>

          <div className="mt-2 flex flex-col items-start space-y-2 ">
            <Links isCollapsed={false} />

            {/* Mobile Menu Items */}
            {/* <div className="mt-4 w-full space-y-2">
              {menuItems.map(
                (item) =>
                  item.show && (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={toggleNav}
                      className={`block w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out ${
                        pathname === item.path ? "bg-[#e9f0ff] text-[#003F9F]" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
              )}
            </div> */}

            {/* Mobile Logout */}
            <button
              onClick={() => {
                setIsLogoutModalOpen(true)
                setIsNavOpen(false)
              }}
              className="absolute bottom-0 left-0 right-0 z-50  mt-10 flex items-center gap-2  bg-red-100 px-3 py-3 text-red-600"
            >
              <LogoutIcon />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onRequestClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loading}
      />
    </>
  )
}

export default DashboardNav
