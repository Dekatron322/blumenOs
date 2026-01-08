"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft"
import { RxCross2 } from "react-icons/rx"
import { Links } from "components/Sidebar/Links"
import { SalesRepLinks } from "components/Sidebar/SalesRepLinks"
import { CustomerLinks } from "components/Sidebar/CustomerLinks"
import { ChevronDown } from "lucide-react"
import { FiUser } from "react-icons/fi"
import LogoutModal from "components/ui/Modal/logout-modal"
import LogoutIcon from "public/logout-icon"
import { SearchModule } from "components/ui/Search/search-module"
import { AppDispatch, RootState } from "lib/redux/store"
import { resetCustomerAuth } from "lib/redux/customerAuthSlice"

const CustomerDashboardNav = () => {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Get customer data from Redux store
  const { isAuthenticated, customer } = useSelector((state: RootState) => state.customerAuth)

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen)
  }

  const handleConfirmLogout = () => {
    setLoading(true)
    try {
      // Clear customer authentication state
      dispatch(resetCustomerAuth())
      router.push("/customer-portal/auth")
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
        // currently unused dropdownRef, kept for parity with original structure
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
    const fullName = customer?.fullName?.trim()
    if (fullName) {
      const names = fullName.split(/\s+/).filter(Boolean)
      const first = names[0]
      const second = names[1]
      if (first && second) {
        return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
      }
      return first?.charAt(0).toUpperCase() || customer?.email?.charAt(0).toUpperCase() || "C"
    }
    return customer?.email?.charAt(0).toUpperCase() || "C"
  }

  // Get primary role name (always Customer for customer portal)
  const getPrimaryRole = () => {
    return "Customer"
  }

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/customer-portal/auth")
    }
  }, [isAuthenticated, router])

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="containerbg sticky top-0 z-50 hidden w-full border-b bg-white xl:block">
        <div className="flexBetween container mx-auto px-16 py-2 max-sm:px-3">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />

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
                    {customer?.fullName || customer?.email || "Customer User"}
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
                      <p className="text-sm font-medium text-gray-900">{customer?.fullName || "Customer User"}</p>
                      <p className="text-sm text-gray-500">{customer?.email}</p>
                      <p className="mt-1 text-xs text-gray-400">Account: {customer?.accountNumber || "N/A"}</p>
                    </div>

                    {/* Profile Link */}
                    <Link
                      href="/customer-portal/profile"
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
      <nav className="sticky top-0 z-50 block border-b bg-[#F9f9f9] px-3 py-4 max-md:px-3 xl:hidden xl:px-16">
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
                <p className="text-sm font-medium text-gray-900">{customer?.fullName || "Customer User"}</p>
                <p className="text-xs text-gray-500">{getPrimaryRole()}</p>
              </div>
            </div>
            <RxCross2 className="cursor-pointer text-gray-500" onClick={toggleNav} />
          </div>

          <div className="mt-2 flex flex-col items-start space-y-2">
            <CustomerLinks isCollapsed={false} />

            {/* Mobile Logout */}
            <button
              onClick={() => {
                setIsLogoutModalOpen(true)
                setIsNavOpen(false)
              }}
              className="absolute inset-x-0 bottom-0 z-50 mt-10 flex items-center gap-2 bg-red-100 p-3 text-red-600"
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

export default CustomerDashboardNav
