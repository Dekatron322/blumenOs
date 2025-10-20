"use client"

import React, { useEffect, useRef, useState } from "react"
import Modal from "react-modal"
import { useRouter } from "next/navigation"

import UserIcon from "public/user-icon" // adjust the path as needed
import EditProfileIcon from "public/edit-profile-icon"
import PricingIcon from "public/pricing-icon"
import SupportIcon from "public/support-icon"
import EditIcon from "public/edit-icon"
import SettingIcon from "public/setting-icon"
import LogoutIcon from "public/logout-icon"
import LogoutModal from "../Modal/otech-plus-logout-modal"

// Set the app element for accessibility (ensure this runs client-side)
if (typeof window !== "undefined") {
  Modal.setAppElement(document.body)
}

interface AuthData {
  tokens: {
    accessToken: string
    refreshToken: string
    accessExpiry: string
    refreshExpiry: string
  }
  user: {
    id: number
    firstName: string | null
    lastName: string | null
    phoneNumber: string
    level: {
      label: string
      value: number
    }
    photo: string | null
    referralUrl: string
    point: number
    dateOfBirth: string | null
    email: string | null
    role: string
    status: {
      label: string
      value: number
    }
    isBvnVerified: boolean
    pinSet: boolean
    merchant: Merchant | null
    isMerchant: boolean
    kyc: {
      document: string | null
      kycType: {
        label: string
        value: number
      }
      kycStatus: {
        label: string
        value: number
      }
      kycMessage: string | null
      documentNumber: string | null
    }
    permissions?: string[]
  }
}

interface Merchant {
  userId: number
  name: string
  address: string
  description: string
  city: string
  province: {
    id: number
    name: string
  }
  country: {
    id: number
    name: string
  }
  status: {
    label: string
    value: number
  }
  level: {
    label: string
    value: number
  }
}

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<AuthData["user"] | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get user data from localStorage on component mount
    const authData = localStorage.getItem("authData")
    if (authData) {
      const parsedAuthData: AuthData = JSON.parse(authData) as any
      setUserData(parsedAuthData.user)
    }
  }, [])

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

  const router = useRouter()

  const handleConfirmLogout = () => {
    // Clear user session
    localStorage.removeItem("authData")
    setIsLogoutModalOpen(false)
    router.push("/signin/otech-plus")
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName ? firstName.charAt(0) : ""
    const last = lastName ? lastName.charAt(0) : ""
    return `${first}${last}`.toUpperCase() || "U"
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div
          className="bg-grey-100 flex cursor-pointer items-center justify-center gap-2 rounded-full p-2 transition duration-150 ease-in-out hover:bg-gray-200 focus:bg-gray-200 focus:outline-none"
          onClick={() => setOpen(!open)}
          tabIndex={0}
        >
          {userData?.photo ? (
            <img src={userData.photo} alt="User profile" className="size-8 rounded-full object-cover" />
          ) : (
            <div className="bg-primary flex size-8 items-center justify-center rounded-full text-white">
              {getInitials(userData?.firstName || null, userData?.lastName || null)}
            </div>
          )}
        </div>
        {open && (
          <div className="absolute right-0 z-50 mt-2 min-w-56 rounded-md bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b px-4 py-2">
              {userData?.photo ? (
                <img src={userData.photo} alt="User profile" className="size-10 rounded-full object-cover" />
              ) : (
                <div className="bg-primary flex min-h-10 min-w-10 items-center justify-center rounded-full text-white">
                  {getInitials(userData?.firstName || null, userData?.lastName || null)}
                </div>
              )}
              <div className="flex flex-col gap-0">
                <p className="m-0 inline-block font-bold leading-none text-[#202B3C]">
                  {userData?.firstName || userData?.lastName
                    ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
                    : "User"}
                </p>
                <small className="text-grey-400 m-0 inline-block text-sm leading-none">
                  {userData?.email || userData?.phoneNumber || "No contact info"}
                </small>
              </div>
            </div>
            <ul>
              <li>
                <a href="/profile" className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                  <EditProfileIcon /> Edit Profile
                </a>
              </li>
              <li>
                <a href="/profile" className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                  <PricingIcon /> Pricing
                </a>
              </li>
              <li className="flex w-full justify-between px-4 py-2">
                <a href="/profile" className="text-grey-400 flex gap-2 text-sm font-medium hover:bg-gray-100">
                  <SupportIcon /> Support
                </a>
                <EditIcon />
              </li>
              <li>
                <a href="/profile" className="text-grey-400 flex gap-2 px-4 py-2 text-sm font-medium hover:bg-gray-100">
                  <SettingIcon /> Settings
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="flex w-full justify-between gap-2 bg-[#F8F9FA] px-4 py-2 text-sm font-medium"
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
