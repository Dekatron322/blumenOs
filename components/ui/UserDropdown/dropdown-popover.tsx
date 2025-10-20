"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { logout } from "lib/redux/authSlice"

import UserIcon from "public/user-icon"
import EditProfileIcon from "public/edit-profile-icon"
import PricingIcon from "public/pricing-icon"
import SupportIcon from "public/support-icon"
import EditIcon from "public/edit-icon"
import SettingIcon from "public/setting-icon"
import LogoutIcon from "public/logout-icon"
import LogoutModal from "../Modal/logout-modal"

// Set the app element for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement(document.body)
}

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  // Get user data from Redux store
  const { user } = useSelector((state: RootState) => state.auth)

  // Close the dropdown if clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleConfirmLogout = () => {
    setLoading(true)
    try {
      dispatch(logout())
      router.push("/signin")
    } finally {
      setLoading(false)
      setIsLogoutModalOpen(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "GU"
    const { firstName, lastName } = user
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "GU"
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div
          className="bg-grey-100 flex cursor-pointer items-center justify-center gap-2 rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
          onClick={() => setOpen(!open)}
          tabIndex={0}
        >
          <UserIcon />
        </div>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b px-4 py-2">
              <div className="bg-primary flex min-h-10 min-w-10 items-center justify-center rounded-full text-white">
                {getUserInitials()}
              </div>
              <div className="flex flex-col gap-0">
                <p className="m-0 inline-block font-bold leading-none text-[#202B3C]">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Guest User"}
                </p>
                <small className="text-grey-400 m-0 inline-block text-sm leading-none">
                  {user?.email || "No email"}
                </small>
              </div>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex w-full justify-between gap-2 bg-[#F8F9FA] px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Log out <LogoutIcon />
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onRequestClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={loading}
      />
    </>
  )
}

export default UserDropdown
