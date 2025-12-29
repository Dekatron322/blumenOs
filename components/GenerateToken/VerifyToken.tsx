"use client"

import { CardIcon, MobileIcon, NoTokenIcon, UssdIcon, WebPortalIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { motion } from "framer-motion"
import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { verifyToken, clearVerifyToken } from "lib/redux/metersSlice"

interface TokenData {
  meterNumber: string
  vendAmount: string
  token: string
  units: string
  generatedAt: string
}

interface VendChannel {
  name: string
  vends: number
  icon: React.ReactNode
}

interface RecentVend {
  customerName: string
  meterNumber: string
  amount: string
  units: string
  channel: string
  timestamp: string
}

const VerifyToken = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { verifyTokenData, verifyTokenLoading, verifyTokenError } = useSelector((state: RootState) => state.meters)

  const [formData, setFormData] = useState({
    token: "",
    meterId: "",
  })
  const [error, setError] = useState("")
  const [localLoading, setLocalLoading] = useState(false)

  const vendingChannels: VendChannel[] = [
    { name: "Web Portal", vends: 2340, icon: <WebPortalIcon /> },
    { name: "Mobile App", vends: 3180, icon: <MobileIcon /> },
    { name: "POS Agents", vends: 2900, icon: <CardIcon /> },
    { name: "USSD", vends: 1450, icon: <UssdIcon /> },
  ]

  const recentVends: RecentVend[] = [
    {
      customerName: "John Adebayo",
      meterNumber: "MTR001234567",
      amount: "₦150",
      units: "187.5 kWh",
      channel: "POS Agent",
      timestamp: "2024-01-15 16:30",
    },
    {
      customerName: "Amina Yusuf",
      meterNumber: "MTR001234569",
      amount: "₦85",
      units: "106.25 kWh",
      channel: "Mobile App",
      timestamp: "2024-01-15 15:45",
    },
    {
      customerName: "Chika Okwu",
      meterNumber: "MTR001234571",
      amount: "₦250",
      units: "312.5 kWh",
      channel: "Web Portal",
      timestamp: "2024-01-15 14:20",
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Remove any non-numeric characters and format token
    const cleanedValue = value.replace(/[^0-9]/g, "")
    let formattedValue = cleanedValue

    // Format as groups of 4 digits separated by hyphens
    if (cleanedValue.length > 0) {
      const groups = cleanedValue.match(/.{1,4}/g)
      if (groups) {
        formattedValue = groups.join("-").substring(0, 24) // Max 20 digits + 4 hyphens
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    // Clear errors when user starts typing
    if (error) setError("")
    if (verifyTokenError) dispatch(clearVerifyToken())
  }

  const validateToken = (token: string): boolean => {
    // Remove hyphens for validation
    const cleanToken = token.replace(/-/g, "")

    // Check if token is 20 digits
    if (cleanToken.length !== 20) {
      setError("Token must be 20 digits")
      return false
    }

    // Check if token contains only numbers
    if (!/^\d+$/.test(cleanToken)) {
      setError("Token can only contain numbers")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous verification results
    dispatch(clearVerifyToken())

    // Validation
    if (!formData.token.trim()) {
      setError("Token is required")
      return
    }

    if (!formData.meterId.trim()) {
      setError("Meter ID is required")
      return
    }

    // Remove hyphens for API call
    const cleanToken = formData.token.replace(/-/g, "")

    if (!validateToken(formData.token)) {
      return
    }

    setLocalLoading(true)
    setError("")

    try {
      await dispatch(
        verifyToken({
          id: parseInt(formData.meterId),
          requestData: { tokenDec: cleanToken },
        })
      ).unwrap()
    } catch (err: any) {
      setError(err || "Failed to verify token")
    } finally {
      setLocalLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      token: "",
      meterId: "",
    })
    setError("")
    dispatch(clearVerifyToken())
  }

  const handleCopyToken = () => {
    if (formData.token) {
      const cleanToken = formData.token.replace(/-/g, "")
      navigator.clipboard.writeText(cleanToken)
      // You could add a toast notification here for better UX
      alert("Token copied to clipboard!")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getTokenStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "used":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTokenStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "used":
        return (
          <svg className="size-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "pending":
        return (
          <svg className="size-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "expired":
        return (
          <svg className="size-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="size-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  // Format the token for display
  const formatTokenDisplay = (token: string) => {
    if (!token) return ""
    const groups = token.match(/.{1,4}/g)
    return groups ? groups.join("-") : token
  }

  return (
    <div className="mt-6 min-h-screen">
      <div className="max-w-1/2">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Token Verification Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Verify Token</h1>
                <p className="mt-2 text-gray-600">Verify electricity token validity and details</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Form Section */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Meter ID Input */}
                    <FormInputModule
                      label="Meter ID"
                      type="number"
                      name="meterId"
                      placeholder="Enter meter ID"
                      value={formData.meterId}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, meterId: e.target.value }))
                        if (error) setError("")
                        if (verifyTokenError) dispatch(clearVerifyToken())
                      }}
                      required={true}
                      error={!!error && !formData.token}
                    />

                    {/* Token Input */}
                    <FormInputModule
                      label="Token"
                      type="text"
                      name="token"
                      placeholder="Enter 20-digit token (e.g., 1234-5678-9012-3456-7890)"
                      value={formData.token}
                      onChange={handleInputChange}
                      required={true}
                      error={!!error && !!formData.token}
                    />

                    {/* Error Messages */}
                    {(error || verifyTokenError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-md bg-red-50 p-3"
                      >
                        <p className="text-sm text-red-800">{error || verifyTokenError}</p>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <ButtonModule
                        type="button"
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={handleReset}
                        disabled={verifyTokenLoading || localLoading}
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        disabled={verifyTokenLoading || localLoading}
                      >
                        {verifyTokenLoading || localLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Verifying...
                          </div>
                        ) : (
                          "Verify Token"
                        )}
                      </ButtonModule>
                    </div>
                  </form>
                </div>

                {/* Verification Result Section */}
                <div className="space-y-6">
                  {verifyTokenData ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-lg border border-gray-200 bg-gray-100 p-6"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-green-900">Token Verified Successfully!</h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                            <svg
                              className="size-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Valid
                          </span>
                          <div className="rounded-full bg-green-100 p-1">
                            <svg
                              className="size-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Token Display */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-green-800">Token</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 rounded-md bg-white p-3">
                            <p className="text-center font-mono text-lg font-bold tracking-wider text-gray-900">
                              {formatTokenDisplay(verifyTokenData.token.tokenDec)}
                            </p>
                          </div>
                          <ButtonModule
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(verifyTokenData.token.tokenDec)}
                            className="whitespace-nowrap"
                          >
                            Copy
                          </ButtonModule>
                        </div>
                      </div>

                      {/* Token Details */}
                      <div className="space-y-4 rounded-md bg-white p-4">
                        {/* Token Information */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">Token Information</h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Description:</span>
                              <span className="font-medium text-gray-900">{verifyTokenData.token.description}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">DRN:</span>
                              <span className="font-medium text-gray-900">{verifyTokenData.token.drn}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Token Class:</span>
                              <span className="font-medium text-gray-900">{verifyTokenData.token.tokenClass}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Transfer Amount:</span>
                              <span className="font-medium text-gray-900">{verifyTokenData.token.transferAmount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Technical Parameters */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">Technical Parameters</h4>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="rounded-md bg-gray-50 p-2 text-center">
                              <div className="text-xs text-gray-500">SGC</div>
                              <div className="font-mono font-semibold">{verifyTokenData.token.sgc}</div>
                            </div>
                            <div className="rounded-md bg-gray-50 p-2 text-center">
                              <div className="text-xs text-gray-500">KRN</div>
                              <div className="font-mono font-semibold">{verifyTokenData.token.krn}</div>
                            </div>
                            <div className="rounded-md bg-gray-50 p-2 text-center">
                              <div className="text-xs text-gray-500">TI</div>
                              <div className="font-mono font-semibold">{verifyTokenData.token.ti}</div>
                            </div>
                            <div className="rounded-md bg-gray-50 p-2 text-center">
                              <div className="text-xs text-gray-500">EA</div>
                              <div className="font-mono font-semibold">{verifyTokenData.token.ea}</div>
                            </div>
                          </div>
                        </div>

                        {/* Validation Result */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">Validation Result</h4>
                          <div className="rounded-md bg-blue-50 p-3">
                            <p className="text-sm text-blue-800">{verifyTokenData.validationResult}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
                    >
                      <div className="mb-4 rounded-full bg-gray-100 p-3">
                        <NoTokenIcon />
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-gray-900">No Token Verified</h3>
                      <p className="text-sm text-gray-500">Enter a token to verify its validity and view details</p>
                      <div className="mt-4 rounded-md bg-gray-50 p-3 text-left">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">Token Format:</h4>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li>• Enter 20-digit token number</li>
                          <li>• You can enter with or without hyphens</li>
                          <li>• Example: 12345678901234567890 or 1234-5678-9012-3456-7890</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats and Recent Vends */}
          <div className="space-y-8">
            {/* Vending Channels */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <h2 className="mb-6 text-xl font-bold text-gray-900">Vending Channels</h2>
              <div className="space-y-4">
                {vendingChannels.map((channel, index) => (
                  <motion.div
                    key={channel.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{channel.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                        <p className="text-sm text-gray-600">{channel.vends.toLocaleString()} vends</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {((channel.vends / 10000) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">of total</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Vends */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Recent Vends</h2>
                <button className="rounded-md bg-[#f3f4f6] px-2 py-1 text-sm font-medium text-[#004B23] transition-colors duration-200 ease-in-out hover:bg-[#e5e7eb] hover:text-[#000000]">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentVends.map((vend, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vend.customerName}</h3>
                        <p className="text-sm text-gray-600">{vend.meterNumber}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{vend.amount}</div>
                        <div className="text-sm text-gray-600">{vend.units}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f6f6] px-2 py-1 text-[#004B23]">
                        {vend.channel}
                      </span>
                      <span className="text-gray-500">{vend.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyToken
