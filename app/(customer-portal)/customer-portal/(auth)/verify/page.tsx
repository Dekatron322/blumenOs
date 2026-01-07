"use client"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { ButtonModule } from "components/ui/Button/Button"
import { motion } from "framer-motion"
import Image from "next/image"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearOtpVerificationStatus, verifyCustomerOtp } from "lib/redux/customerAuthSlice"
import { notify } from "components/ui/Notification/Notification"

const Verify: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const {
    isVerifyingOtp,
    otpVerificationError,
    otpVerificationSuccess,
    lastOtpVerificationMessage,
    isAuthenticated,
    customer,
  } = useSelector((state: RootState) => state.customerAuth)

  // Get customer data from localStorage (stored during OTP request)
  const [customerData, setCustomerData] = useState({
    accountNumber: "",
    phoneNumber: "",
  })

  // Generate fingerprint for demo purposes
  const generateFingerprint = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  useEffect(() => {
    // Load customer data from localStorage
    const storedAccountNumber = localStorage.getItem("customerAccountNumber")
    const storedPhoneNumber = localStorage.getItem("customerPhoneNumber")

    if (storedAccountNumber && storedPhoneNumber) {
      setCustomerData({
        accountNumber: storedAccountNumber,
        phoneNumber: storedPhoneNumber,
      })
    } else {
      // If no data found, redirect back to auth page
      router.push("/customer-portal/auth")
      return
    }

    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [router])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const code = otp.join("")

    if (code.length !== 6) {
      return
    }

    if (!customerData.accountNumber || !customerData.phoneNumber) {
      return
    }

    const verifyData = {
      accountNumber: customerData.accountNumber,
      phoneNumber: customerData.phoneNumber,
      fingerprint: generateFingerprint(),
      otp: code,
    }

    dispatch(verifyCustomerOtp(verifyData))
  }

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "").slice(-1)
    const next = [...otp]
    next[index] = sanitized
    setOtp(next)
    if (sanitized && index < inputRefs.current.length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) nextInput.focus()
    }
    if (otpVerificationError) {
      dispatch(clearOtpVerificationStatus())
    }
  }

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  // Redirect to customer overview on successful verification
  useEffect(() => {
    if (otpVerificationSuccess && isAuthenticated) {
      // Show success notification
      notify("success", "OTP verified successfully!", {
        title: lastOtpVerificationMessage || "Welcome back!",
        duration: 3000,
      })

      // Clear localStorage data
      localStorage.removeItem("customerPhoneNumber")
      localStorage.removeItem("customerAccountNumber")

      // Redirect after a short delay to allow notification to be seen
      setTimeout(() => {
        router.push("/customer-portal/overview")
      }, 1000)
    }
  }, [otpVerificationSuccess, isAuthenticated, lastOtpVerificationMessage, router])

  // Show error notification when verification fails
  useEffect(() => {
    if (otpVerificationError) {
      notify("error", "OTP Verification Failed", {
        title: otpVerificationError,
        duration: 5000,
      })
    }
  }, [otpVerificationError])

  const isButtonDisabled = isVerifyingOtp || otp.join("").length !== 6

  return (
    <div className="relative flex min-h-screen flex-col  bg-gradient-to-br from-[#ffffff] lg:flex-row">
      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center border-b-2 border-[#ffffff80] px-5 py-8 lg:w-[30%] lg:border-b-0 lg:border-r-2">
        <motion.main
          className="flex w-full flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image src="/kadco.svg" alt="Dashboard" width={120} height={120} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl rounded-2xl md:p-8 "
          >
            <div className="mx-4 mb-6  text-center">
              <h1 className="text-3xl font-bold text-[#004B23]">Verify Phone Number</h1>
              <p className="mx-auto mt-2 max-w-sm text-gray-500">Enter the 6-digit code sent to your phone number.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-4">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="h-12 w-12 rounded-md border border-[#E0E0E0] bg-[#f9f9f9] text-center text-lg font-medium outline-none focus:border-[#004B23] focus:ring-2 focus:ring-[#004B23] focus:ring-offset-1"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      ref={(el) => {
                        inputRefs.current[idx] = el
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mx-auto max-w-sm"
              >
                <ButtonModule
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isButtonDisabled}
                  className="w-full transform rounded-xl py-3 font-medium transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
                >
                  {isVerifyingOtp ? (
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
                      Verifying...
                    </div>
                  ) : (
                    "Verify"
                  )}
                </ButtonModule>
              </motion.div>
            </form>

            {/* Demo credentials hint */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className=" text-center text-sm text-gray-500"
          >
            Powered by BlumenTech
          </motion.div>
        </motion.main>
      </div>

      {/* Image Container with Text at Bottom */}
      <div className="relative hidden w-[70%] bg-[#004B23] lg:block ">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative z-0 flex items-start justify-center pt-8"
        >
          <img src="/auth-background.svg" alt="auth-background" className="w-full object-contain" />
        </motion.div>

        {/* Text positioned at the bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center px-10 pb-24">
          <motion.h1
            className="mb-4 max-w-[70%] text-center text-3xl font-semibold text-[#FFFFFFCC]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span className="text-[#FFFFFF80]">No</span> Complexity.{" "}
            <span className="text-[#FFFFFF80]">Just robust</span> power management infrastructure{" "}
            <span className="text-[#FFFFFF80]">for Utilities</span>
          </motion.h1>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center px-10 pb-10 ">
          <motion.p
            className="max-w-[80%] text-center  text-[#FFFFFF80]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            We help distribution companies leverage data-driven, scalable, and secure grid management. Unlock the power
            of real-time analytics and asset control, enabling proactive outage management and optimized energy
            distribution.
          </motion.p>
        </div>
      </div>
    </div>
  )
}

export default Verify
