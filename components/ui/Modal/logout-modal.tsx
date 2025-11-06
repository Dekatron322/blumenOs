"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { useDispatch } from "react-redux"
import { logout } from "lib/redux/authSlice"
import { useRouter } from "next/navigation"
import { AppDispatch } from "lib/redux/store"

// Define the props for the modal
interface LogoutModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void // Made optional since we're handling it internally
  loading: boolean
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onRequestClose, onConfirm, loading }) => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Dispatch the logout action
      dispatch(logout())

      // Call any additional onConfirm logic if provided
      if (onConfirm) {
        onConfirm()
      }

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[400px] max-w-md overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Confirm Logout</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-6 text-gray-600">Are you sure you want to log out?</p>

          <div className="flex gap-4">
            <ButtonModule variant="secondary" size="lg" className="flex-1" onClick={onRequestClose}>
              Cancel
            </ButtonModule>
            <ButtonModule
              type="button"
              variant="danger"
              size="lg"
              className="flex-1"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-2 size-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging out...
                </div>
              ) : (
                "Log Out"
              )}
            </ButtonModule>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LogoutModal
