"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiClock, FiMail, FiShield } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { useCryptoTransferMutation, useRequestOtpMutation } from "lib/redux/cryptoSlice"

interface OtpInputProps {
  value: string
  onChange: (otp: string) => void
  onVerify?: (otp: string) => Promise<boolean>
  length?: number
  className?: string
}

const OtpInputModule: React.FC<OtpInputProps> = ({ value = "", onChange, onVerify, length = 6, className = "" }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
  const [activeInput, setActiveInput] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (value.length === 0) {
      setOtp(Array(length).fill(""))
    }
  }, [value, length])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "") // Remove non-digit characters

    if (value === "") {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // Only take the last character
    setOtp(newOtp)
    setError(false)

    const combinedOtp = newOtp.join("")
    onChange(combinedOtp)

    // Auto focus next input
    if (value && index < length - 1) {
      setActiveInput(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    // Verify if all fields are filled
    if (combinedOtp.length === length && onVerify) {
      verifyOtp(combinedOtp)
    } else {
      setIsVerified(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveInput(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "")
    if (pastedData.length === length) {
      const newOtp = pastedData.split("").slice(0, length)
      setOtp(newOtp)
      onChange(newOtp.join(""))
      if (onVerify) {
        verifyOtp(newOtp.join(""))
      }
      setActiveInput(length - 1)
      inputRefs.current[length - 1]?.focus()
    }
  }

  const verifyOtp = async (otp: string) => {
    setIsVerifying(true)
    try {
      if (onVerify) {
        const isValid = await onVerify(otp)
        setIsVerified(isValid)
        setError(!isValid)
        return isValid
      }
      return false
    } catch (error) {
      setIsVerified(false)
      setError(true)
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-1 flex justify-center gap-3">
        {Array.from({ length }).map((_, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otp[index] || ""}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveInput(index)}
            initial={{ scale: 1 }}
            animate={{
              scale: activeInput === index ? 1.05 : 1,
              borderColor: error ? "#ef4444" : isVerified ? "#10b981" : activeInput === index ? "#3b82f6" : "#d1d5db",
              boxShadow: activeInput === index ? "0 0 0 3px rgba(59, 130, 246, 0.2)" : "none",
            }}
            transition={{ type: "spring", stiffness: 500 }}
            className={`size-14 rounded-lg border-2 bg-white text-center text-2xl font-semibold text-gray-800 outline-none transition-all`}
          />
        ))}
      </div>

      <AnimatePresence>
        {(isVerifying || isVerified || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="size-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-sm text-gray-600">Verifying...</span>
              </>
            ) : error ? (
              <>
                <FiAlertCircle className="text-red-500" />
                <span className="text-sm text-red-500">Invalid code</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="text-green-500" />
                <span className="text-sm text-green-600">Verified</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const VerificationCode: React.FC = () => {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [countdown, setCountdown] = useState(59)
  const [resendAttempts, setResendAttempts] = useState(0)
  const [transferData, setTransferData] = useState<any>(null)
  const [requestingOtp, setRequestingOtp] = useState(false)
  const [otpRequested, setOtpRequested] = useState(false)

  const router = useRouter()
  const [cryptoTransfer] = useCryptoTransferMutation()
  const [requestOtp] = useRequestOtpMutation()

  useEffect(() => {
    // Get transfer data from session storage
    const storedData = sessionStorage.getItem("cryptoTransferData")
    if (storedData) {
      setTransferData(JSON.parse(storedData))
      // Automatically request OTP when component loads
      handleRequestOtp()
    } else {
      // Redirect back if no transfer data
      router.push("/crypto/transfer")
    }
  }, [router])

  useEffect(() => {
    if (countdown > 0 && otpRequested) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, otpRequested])

  const handleGoBack = () => {
    router.back()
  }

  const handleRequestOtp = async () => {
    setRequestingOtp(true)
    try {
      const result = await requestOtp({ purpose: 3 }).unwrap()

      if (result.isSuccess) {
        setOtpRequested(true)
        setCountdown(59) // Reset countdown
        notify("success", "OTP Sent", {
          description: "Verification code has been sent to your registered email and phone",
        })
      } else {
        throw new Error(result.message || "Failed to request OTP")
      }
    } catch (error: any) {
      notify("error", "OTP Request Failed", {
        description: error.message || "Please try again",
      })
    } finally {
      setRequestingOtp(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isOtpVerified) {
      notify("error", "Verification Required", {
        description: "Please enter and verify the code",
      })
      return
    }

    if (!transferData) {
      notify("error", "Transfer Data Missing", {
        description: "Please start the transfer process again",
      })
      return
    }

    setLoading(true)

    try {
      // Make the actual API call
      const transferRequest = {
        otp,
        currency: transferData.currency,
        userId: transferData.userId,
        amount: transferData.amount,
        narration: transferData.narration,
      }

      const result = await cryptoTransfer(transferRequest).unwrap()

      if (result.isSuccess) {
        notify("success", "Transfer Successful!", {
          description: `${transferData.amount} ${transferData.currency} transferred to ${transferData.userName}`,
          duration: 3000,
        })

        // Clear the session storage
        sessionStorage.removeItem("cryptoTransferData")

        // Redirect to success page or back to crypto dashboard
        setTimeout(() => router.push("/crypto"), 1000)
      } else {
        throw new Error(result.message || "Transfer failed")
      }
    } catch (error: any) {
      setError(error.message || "Transfer failed. Please try again.")
      notify("error", "Transfer Failed", {
        description: error.message || "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerification = async (otp: string) => {
    // For demo purposes, any 6-digit code is valid
    // In production, this would validate against the backend
    const isValid = otp.length === 6

    if (isValid) {
      setIsOtpVerified(true)
      return true
    } else {
      setIsOtpVerified(false)
      return false
    }
  }

  const handleResendCode = () => {
    if (resendAttempts >= 3) {
      notify("error", "Limit Exceeded", {
        description: "You've reached the maximum resend attempts",
      })
      return
    }

    setResendAttempts((prev) => prev + 1)
    setOtp("")
    setIsOtpVerified(false)

    // Request new OTP
    handleRequestOtp()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardNav />

      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8 flex items-center">
            <button onClick={handleGoBack} className="mr-4 rounded-full p-2 hover:bg-gray-100">
              <FiArrowLeft className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OTP Verification</h1>
              <p className="text-gray-500">Secure transfer confirmation</p>
            </div>
          </div>

          {/* Transfer Summary */}
          {transferData && (
            <motion.div
              className="mb-6 rounded-xl bg-white p-4 shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="mb-2 font-medium text-gray-900">Transfer Summary</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {transferData.tokenLogo && (
                    <img
                      src={transferData.tokenLogo}
                      alt={transferData.currency}
                      className="mr-2 size-6 rounded-full"
                    />
                  )}
                  <span className="font-semibold">
                    {transferData.amount} {transferData.currency}
                  </span>
                </div>
                <span className="text-gray-600">to {transferData.userName}</span>
              </div>
            </motion.div>
          )}

          {/* Security Info */}
          <motion.div
            className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <FiShield className="text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium text-gray-900">Security Code</h3>
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code sent to your registered email and phone number
                </p>
              </div>
            </div>
          </motion.div>

          {/* OTP Request Status */}
          {requestingOtp && (
            <motion.div
              className="mb-4 flex items-center justify-center gap-2 text-blue-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Requesting verification code...</span>
            </motion.div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              {/* <div className="mb-4 flex items-center gap-2 text-gray-700">
                <FiMail className="text-gray-500" />
                <span className="text-sm">bennymulla@crossfiat.com</span>
              </div> */}

              <OtpInputModule
                value={otp}
                onChange={setOtp}
                onVerify={handleOtpVerification}
                className={requestingOtp ? "opacity-50" : ""}
                // disabled={requestingOtp}
              />

              <div className="mt-4 text-center">
                {countdown > 0 && otpRequested ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <FiClock className="text-gray-400" />
                    <span>Resend code in 00:{countdown.toString().padStart(2, "0")}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={requestingOtp}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:hover:text-gray-400"
                  >
                    Didn&apos;t receive code? Resend
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !isOtpVerified || requestingOtp}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  "Confirm Transfer"
                )}
              </ButtonModule>

              <ButtonModule
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoBack}
                disabled={requestingOtp}
              >
                Cancel
              </ButtonModule>
            </div>
          </form>

          {/* Security Footer */}
          <motion.div
            className="mt-8 text-center text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2">
              <FiShield className="text-gray-400" />
              <span>Your information is securely encrypted</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default VerificationCode
