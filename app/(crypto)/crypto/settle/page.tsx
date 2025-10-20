"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { FiArrowLeft, FiDollarSign } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { useRequestOtpMutation, useSettleCryptoMutation } from "lib/redux/cryptoSlice"

interface CryptoAsset {
  symbol: string
  name: string
  balance: number
  convertedBalance: number
  referenceCurrency: string
  logo: string
}

// Create a component that uses useSearchParams
function SettleContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [isValidAmount, setIsValidAmount] = useState(true)
  const [selectedToken, setSelectedToken] = useState<CryptoAsset | null>(null)
  const [activeField, setActiveField] = useState<"amount" | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const [settleCrypto] = useSettleCryptoMutation()
  const [requestOtp] = useRequestOtpMutation()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      try {
        const token = JSON.parse(decodeURIComponent(tokenParam)) as CryptoAsset
        setSelectedToken(token)
      } catch (e) {
        console.error("Failed to parse token from URL", e)
      }
    }
  }, [searchParams])

  const getTokenColor = (symbol: string) => {
    // Array of beautiful gradient color combinations
    const colorGradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-yellow-500 to-orange-600",
      "from-pink-500 to-rose-600",
      "from-indigo-500 to-blue-600",
      "from-emerald-500 to-green-600",
      "from-amber-500 to-yellow-600",
      "from-fuchsia-500 to-purple-600",
      "from-cyan-500 to-blue-600",
      "from-lime-500 to-green-600",
      "from-violet-500 to-purple-600",
      "from-sky-500 to-blue-600",
    ]

    // Create a consistent but seemingly random color based on the symbol
    // This ensures the same token always gets the same color
    let hash = 0
    for (let i = 0; i < symbol.length; i++) {
      hash = symbol.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Use the hash to select a gradient
    const index = Math.abs(hash) % colorGradients.length
    return colorGradients[index]
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedToken) {
      notify("error", "Please select a token to settle", {
        title: "No Token Selected",
      })
      return
    }

    if (!amount) {
      notify("error", "Please enter an amount to settle", {
        title: "Amount Required",
      })
      return
    }

    if (!isValidAmount) {
      notify("error", "Please enter a valid amount", {
        title: "Invalid Amount",
      })
      return
    }

    if (parseFloat(amount) > (selectedToken?.balance || 0)) {
      notify("error", `You don't have enough ${selectedToken.symbol} to complete this settlement`, {
        title: "Insufficient Balance",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First request OTP
      const otpResult = await requestOtp({ purpose: 3 }).unwrap()

      if (!otpResult.isSuccess) {
        throw new Error(otpResult.message || "Failed to request OTP")
      }

      // Store settlement data in session storage for the verification page
      const settleData = {
        currency: selectedToken.symbol,
        amount: parseFloat(amount),
        tokenName: selectedToken.name,
        tokenLogo: selectedToken.logo,
        convertedValue: (parseFloat(amount) / selectedToken.balance) * selectedToken.convertedBalance,
      }

      sessionStorage.setItem("cryptoSettleData", JSON.stringify(settleData))

      // Redirect to verification page
      router.push("/crypto/verification-code/settle")
    } catch (error: any) {
      setError(error.message || "Settlement failed. Please try again.")
      notify("error", error.message || "Please try again", {
        title: "Settlement Failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)
      setIsValidAmount(!!value && !isNaN(parseFloat(value)) && parseFloat(value) > 0)
    }
  }

  const handleMaxAmount = () => {
    if (selectedToken) {
      setAmount(selectedToken.balance.toString())
      setIsValidAmount(true)
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Settle {selectedToken?.symbol || "Crypto"}</h1>
              <p className="text-gray-500">Transfer to your bank account</p>
            </div>
          </div>

          {/* Token Card */}
          {selectedToken && (
            <motion.div
              className={`mb-6 rounded-xl bg-gradient-to-r p-4 ${getTokenColor(selectedToken.symbol)} shadow-lg`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-white/20">
                    <img
                      src={selectedToken.logo}
                      alt={selectedToken.symbol}
                      className="size-6"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.onerror = null
                        target.src = "https://via.placeholder.com/24"
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedToken.name}</h3>
                    <p className="text-sm text-white/90">
                      Balance: {selectedToken.balance.toFixed(4)} {selectedToken.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: selectedToken.referenceCurrency || "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(selectedToken.convertedBalance)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settle Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                {selectedToken && (
                  <button type="button" onClick={handleMaxAmount} className="text-xs text-blue-600 hover:text-blue-800">
                    Max: {selectedToken.balance.toFixed(4)}
                  </button>
                )}
              </div>
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "amount"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("amount")}
              >
                <div className="flex items-center">
                  <FiDollarSign className={`mr-2 text-gray-400 ${activeField === "amount" ? "text-blue-500" : ""}`} />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                    value={amount}
                    onChange={handleAmountChange}
                    onFocus={() => setActiveField("amount")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                  {selectedToken && (
                    <div className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700">
                      {selectedToken.symbol}
                    </div>
                  )}
                </div>
                {!isValidAmount && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs text-red-500"
                  >
                    Please enter a valid amount
                  </motion.p>
                )}
              </div>
            </div>

            {/* Conversion Estimate */}
            {selectedToken && amount && isValidAmount && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 text-center text-sm text-gray-500"
              >
                ≈{" "}
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: selectedToken.referenceCurrency || "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format((parseFloat(amount) / selectedToken.balance) * selectedToken.convertedBalance)}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !amount || !isValidAmount || !selectedToken}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  `Settle ${selectedToken?.symbol || ""}`
                )}
              </ButtonModule>

              <ButtonModule type="button" variant="outline" size="lg" className="w-full" onClick={handleGoBack}>
                Cancel
              </ButtonModule>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function Settle() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SettleContent />
    </Suspense>
  )
}
