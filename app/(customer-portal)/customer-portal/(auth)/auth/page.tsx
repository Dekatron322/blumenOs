"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/EmailInput"
import { motion } from "framer-motion"
import Image from "next/image"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearOtpRequestStatus, requestCustomerOtp } from "lib/redux/customerAuthSlice"
import { notify } from "components/ui/Notification/Notification"

const SignIn: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { isRequestingOtp, otpRequestError, otpRequestSuccess, lastOtpRequestMessage } = useSelector(
    (state: RootState) => state.customerAuth
  )

  // Generate a simple fingerprint for demo purposes
  const generateFingerprint = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!phoneNumber.trim()) {
      return
    }

    if (!accountNumber.trim()) {
      return
    }

    const otpData = {
      accountNumber: accountNumber.trim(),
      phoneNumber: phoneNumber.trim(),
      fingerprint: generateFingerprint(),
    }

    dispatch(requestCustomerOtp(otpData))
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value)
    if (otpRequestError) {
      dispatch(clearOtpRequestStatus())
    }
  }

  const handleAccountNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountNumber(event.target.value)
    if (otpRequestError) {
      dispatch(clearOtpRequestStatus())
    }
  }

  // Redirect to verify page on successful OTP request
  React.useEffect(() => {
    if (otpRequestSuccess && lastOtpRequestMessage) {
      // Show success notification
      notify("success", "OTP sent successfully!", {
        title: lastOtpRequestMessage,
        description: "Redirecting...",
        duration: 3000,
      })

      // Store phone number for verification page
      if (typeof window !== "undefined") {
        localStorage.setItem("customerPhoneNumber", phoneNumber)
        localStorage.setItem("customerAccountNumber", accountNumber)
      }

      // Redirect after a short delay to allow notification to be seen
      setTimeout(() => {
        router.push("/customer-portal/verify")
      }, 1000)
    }
  }, [otpRequestSuccess, lastOtpRequestMessage, phoneNumber, accountNumber, router])

  // Show error notification when OTP request fails
  React.useEffect(() => {
    if (otpRequestError) {
      notify("error", "OTP Request Failed", {
        title: otpRequestError,
        duration: 5000,
      })
    }
  }, [otpRequestError])

  const isButtonDisabled = isRequestingOtp || phoneNumber.trim() === "" || accountNumber.trim() === ""

  return (
    <div className="relative flex min-h-screen flex-col  bg-gradient-to-br from-[#ffffff] lg:flex-row">
      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center border-b-2 border-[#ffffff80] px-5 py-8 lg:w-[40%] lg:border-b-0 lg:border-r-2">
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
            <div className="mx-4 mb-8 border-b pb-6 text-center">
              <h1 className="text-3xl font-bold text-[#004B23]">Welcome back</h1>
              <p className="mt-2 text-gray-500">Enter your details to jump right into your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <FormInputModule
                  label="Account Number"
                  type="text"
                  placeholder="Enter your account number"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  required
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <FormInputModule
                  label="Phone Number"
                  type="tel"
                  placeholder="e.g. 0803 123 4567"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="size-4 rounded border-gray-300  text-[#004B23] focus:ring-[#004B23]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link href="#" className="text-sm font-medium text-[#004B23] hover:text-[#004B23]">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
                <ButtonModule
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isButtonDisabled}
                  className="w-full transform rounded-xl py-3 font-medium transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
                >
                  {isRequestingOtp ? (
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
                      Requesting OTP...
                    </div>
                  ) : (
                    "Request OTP"
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
      <div className="relative hidden w-[60%] bg-[#004B23] lg:block ">
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

export default SignIn
