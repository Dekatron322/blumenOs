"use client"

import { CardIcon, MobileIcon, NoTokenIcon, UssdIcon, WebPortalIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { motion } from "framer-motion"
import React, { useState } from "react"

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

const GenerateToken = () => {
  const [formData, setFormData] = useState({
    meterNumber: "",
    vendAmount: "",
  })
  const [generatedToken, setGeneratedToken] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const generateRandomToken = (): string => {
    const characters = "0123456789"
    let token = ""
    for (let i = 0; i < 20; i++) {
      if (i > 0 && i % 4 === 0) token += "-"
      token += characters[Math.floor(Math.random() * characters.length)]
    }
    return token
  }

  const calculateUnits = (amount: string): string => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum)) return "0.00"

    // Simple calculation: 1 unit = ₦92.50 (Band B tariff rate)
    const units = amountNum / 92.5
    return units.toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.meterNumber.trim()) {
      setError("Meter Number is required")
      return
    }

    if (!formData.vendAmount.trim() || parseFloat(formData.vendAmount) <= 0) {
      setError("Vend Amount must be greater than 0")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate API call delay
    setTimeout(() => {
      const tokenData: TokenData = {
        meterNumber: formData.meterNumber,
        vendAmount: formData.vendAmount,
        token: generateRandomToken(),
        units: calculateUnits(formData.vendAmount),
        generatedAt: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      setGeneratedToken(tokenData)
      setIsLoading(false)
    }, 1500)
  }

  const handleReset = () => {
    setFormData({
      meterNumber: "",
      vendAmount: "",
    })
    setGeneratedToken(null)
    setError("")
  }

  const handleCopyToken = () => {
    if (generatedToken?.token) {
      navigator.clipboard.writeText(generatedToken.token.replace(/-/g, ""))
      // You could add a toast notification here for better UX
      alert("Token copied to clipboard!")
    }
  }

  return (
    <div className="mt-6 min-h-screen">
      <div className=" max-w-1/2">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Token Generation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Generate Token</h1>
                <p className="mt-2 text-gray-600">Generate electricity tokens for prepaid meters</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Form Section */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Meter Number Input */}
                    <FormInputModule
                      label="Meter Number"
                      type="text"
                      name="meterNumber"
                      placeholder="Enter meter number"
                      value={formData.meterNumber}
                      onChange={handleInputChange}
                      required={true}
                      error={!!error && !formData.meterNumber.trim()}
                    />

                    {/* Vend Amount Input */}
                    <FormInputModule
                      label="Vend Amount (₦)"
                      type="number"
                      name="vendAmount"
                      placeholder="Enter amount in Naira"
                      value={formData.vendAmount}
                      onChange={handleInputChange}
                      required={true}
                      error={!!error && (!formData.vendAmount.trim() || parseFloat(formData.vendAmount) <= 0)}
                    />

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-md bg-red-50 p-3"
                      >
                        <p className="text-sm text-red-800">{error}</p>
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
                        disabled={isLoading}
                      >
                        Reset
                      </ButtonModule>
                      <ButtonModule type="submit" variant="primary" size="lg" className="flex-1" disabled={isLoading}>
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Generating...
                          </div>
                        ) : (
                          "Generate Token"
                        )}
                      </ButtonModule>
                    </div>
                  </form>
                </div>

                {/* Token Display Section */}
                <div className="space-y-6">
                  {generatedToken ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-lg border border-gray-200 bg-gray-100 p-6"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-green-900">Token Generated Successfully!</h3>
                        <div className="rounded-full bg-green-100 p-1">
                          <svg className="size-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Token Display */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-green-800">Token</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 rounded-md bg-white p-3">
                            <p className="text-center font-mono text-lg font-bold tracking-wider text-gray-900">
                              {generatedToken.token}
                            </p>
                          </div>
                          <ButtonModule
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyToken}
                            className="whitespace-nowrap"
                          >
                            Copy
                          </ButtonModule>
                        </div>
                      </div>

                      {/* Token Details */}
                      <div className="space-y-3 rounded-md bg-white p-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Meter Number:</span>
                          <span className="font-medium text-gray-900">{generatedToken.meterNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Vend Amount:</span>
                          <span className="font-medium text-gray-900">
                            ₦{parseFloat(generatedToken.vendAmount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Units:</span>
                          <span className="font-medium text-gray-900">{generatedToken.units} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Generated At:</span>
                          <span className="font-medium text-gray-900">{generatedToken.generatedAt}</span>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="mt-4 rounded-md bg-[#FFFFFF] p-3">
                        <h4 className="mb-2 text-sm font-semibold ">How to use:</h4>
                        <ul className="list-inside list-disc space-y-1 text-xs ">
                          <li>Enter the token on your prepaid meter keypad</li>
                          <li>Press the enter button to load the units</li>
                          <li>Wait for confirmation message on the meter display</li>
                        </ul>
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
                      <h3 className="mb-2 text-lg font-medium text-gray-900">No Token Generated</h3>
                      <p className="text-sm text-gray-500">
                        Fill in the meter number and vend amount to generate a token
                      </p>
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
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-blue-800">
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

export default GenerateToken
