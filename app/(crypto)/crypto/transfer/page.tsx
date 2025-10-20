"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { FiArrowLeft, FiCheck, FiDollarSign, FiUser, FiX } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { useGetUsersQuery } from "lib/redux/customerSlice"
import { useCryptoTransferMutation } from "lib/redux/cryptoSlice"

interface CryptoAsset {
  symbol: string
  name: string
  amount: number
  valueUSD: number
  allocation: number
  price: number
  change24h: number
  color?: string
  logo?: string
}

// Create a component that uses useSearchParams
function TransferContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTag, setUserTag] = useState("")
  const [amount, setAmount] = useState("")
  const [userName, setUserName] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const [verifyingUser, setVerifyingUser] = useState(false)
  const [isValidAmount, setIsValidAmount] = useState(true)
  const [selectedToken, setSelectedToken] = useState<CryptoAsset | null>(null)
  const [activeField, setActiveField] = useState<"user" | "amount" | null>(null)
  const [debouncedTag, setDebouncedTag] = useState("")
  const [narration, setNarration] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const [cryptoTransfer] = useCryptoTransferMutation()

  // Use the RTK Query hook to fetch users by tag
  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetUsersQuery(
    {
      pageNumber: 1,
      pageSize: 1,
      tag: debouncedTag,
    },
    {
      skip: debouncedTag.length < 3, // Only run query when tag has at least 3 characters
    }
  )

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      try {
        const token = JSON.parse(decodeURIComponent(tokenParam)) as {
          symbol: string
          name: string
          balance?: number
          convertedBalance?: number
          logo?: string
        }
        setSelectedToken({
          symbol: token.symbol,
          name: token.name,
          amount: token.balance || token.convertedBalance || 0,
          valueUSD: token.convertedBalance || 0,
          allocation: 0,
          price: (token.convertedBalance || 0) / (token.balance || 1),
          change24h: 0,
          color: getRandomColor(),
          logo: token.logo,
        })
      } catch (e) {
        console.error("Failed to parse token from URL", e)
      }
    }
  }, [searchParams])

  // Debounce the user tag input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userTag.length >= 3) {
        setDebouncedTag(userTag)
        setVerifyingUser(true)
      } else {
        setUserName("")
        setUserData(null)
        setDebouncedTag("")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [userTag])

  // Handle the API response for user validation
  useEffect(() => {
    if (usersData && usersData.data && usersData.data.length > 0) {
      const user = usersData.data[0]
      if (user) {
        setUserData(user)
        const fullName =
          user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : `@${user.tag || userTag}`
        setUserName(fullName)
        setVerifyingUser(false)
      }
    } else if (usersError) {
      setUserName("")
      setUserData(null)
      setVerifyingUser(false)
      console.error("Error validating user:", usersError)
    } else if (debouncedTag && !isUsersLoading && usersData?.data?.length === 0) {
      setUserName("User not found")
      setUserData(null)
      setVerifyingUser(false)
    }
  }, [usersData, usersError, isUsersLoading, debouncedTag, userTag])

  const getRandomColor = () => {
    const colors = [
      "from-amber-500 to-orange-600",
      "from-indigo-500 to-purple-600",
      "from-emerald-500 to-teal-600",
      "from-blue-500 to-cyan-600",
      "from-green-500 to-lime-600",
      "from-purple-500 to-pink-600",
      "from-red-500 to-rose-600",
      "from-cyan-500 to-blue-600",
      "from-yellow-500 to-amber-600",
      "from-teal-500 to-green-600",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const handleGoBack = () => {
    router.back()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedToken) {
      notify("error", "No Token Selected", {
        description: "Please select a token to transfer",
      })
      return
    }

    if (!userData || !amount) {
      notify("error", "Incomplete Details", {
        description: "Please provide all required details",
      })
      return
    }

    if (!isValidAmount) {
      notify("error", "Invalid Amount", {
        description: "Please enter a valid amount",
      })
      return
    }

    if (parseFloat(amount) > (selectedToken?.amount || 0)) {
      notify("error", "Insufficient Balance", {
        description: `You don't have enough ${selectedToken.symbol} to complete this transfer`,
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Store transfer data in session storage for the next step
      const transferData = {
        currency: selectedToken.symbol,
        userId: userData.id,
        amount: parseFloat(amount),
        narration: narration || `Transfer of ${amount} ${selectedToken.symbol} to ${userName}`,
        userName,
        tokenSymbol: selectedToken.symbol,
        tokenLogo: selectedToken.logo,
      }

      sessionStorage.setItem("cryptoTransferData", JSON.stringify(transferData))

      // Redirect to verification page
      router.push("/crypto/verification-code")
    } catch (error: any) {
      setError(error.message || "Transfer failed. Please try again.")
      notify("error", "Transfer Failed", {
        description: error.message || "Please try again",
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
      setAmount(selectedToken.amount.toString())
      setIsValidAmount(true)
    }
  }

  const clearUserTag = () => {
    setUserTag("")
    setUserName("")
    setUserData(null)
    setDebouncedTag("")
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
              <h1 className="text-2xl font-bold text-gray-900">
                Transfer <span className="uppercase">{selectedToken?.symbol || "Crypto"}</span>
              </h1>
              <p className="text-gray-500">Send to any Ultra user instantly</p>
            </div>
          </div>

          {/* Token Card */}
          {selectedToken && (
            <motion.div
              className={`mb-6 rounded-xl bg-gradient-to-r p-4 ${selectedToken.color} shadow-lg`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedToken.logo && (
                    <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <img
                        src={selectedToken.logo}
                        alt={selectedToken.symbol}
                        className="size-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{selectedToken.name}</h3>
                    <p className="text-sm text-white/90">
                      Balance: {selectedToken.amount.toFixed(4)}{" "}
                      <span className="uppercase">{selectedToken.symbol}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">
                    {selectedToken.valueUSD.toLocaleString()} <span className="uppercase">{selectedToken.symbol}</span>
                  </p>
                  <p className={`text-xs ${selectedToken.change24h >= 0 ? "text-green-200" : "text-red-200"}`}>
                    {selectedToken.change24h >= 0 ? "+" : ""}
                    {selectedToken.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Transfer Form */}
          <form onSubmit={handleSubmit}>
            {/* User Tag Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Recipient</label>
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "user"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("user")}
              >
                <div className="flex items-center">
                  <FiUser className={`mr-2 text-gray-400 ${activeField === "user" ? "text-blue-500" : ""}`} />
                  <span className="text-gray-400">@</span>
                  <input
                    type="text"
                    placeholder="username"
                    className="ml-1 flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                    value={userTag}
                    onChange={(e) => setUserTag(e.target.value)}
                    onFocus={() => setActiveField("user")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                  {userTag && (
                    <button type="button" onClick={clearUserTag} className="ml-2 text-gray-400 hover:text-gray-600">
                      <FiX className="size-4" />
                    </button>
                  )}
                  {verifyingUser && (
                    <div className="ml-2 size-5 animate-spin">
                      <div className="size-4 rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {userName && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex items-center"
                    >
                      {userData ? (
                        <>
                          <div className="mr-2 flex size-4 items-center justify-center rounded-full bg-green-100">
                            <FiCheck className="size-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">{userName}</span>
                        </>
                      ) : (
                        <>
                          <div className="mr-2 flex size-4 items-center justify-center rounded-full bg-red-100">
                            <FiX className="size-3 text-red-600" />
                          </div>
                          <span className="text-sm text-red-600">{userName}</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {userTag.length > 0 && userTag.length < 3 && (
                <p className="mt-1 text-xs text-gray-500">Enter at least 3 characters</p>
              )}
            </div>

            {/* Amount Field */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                {selectedToken && (
                  <button type="button" onClick={handleMaxAmount} className="text-xs text-blue-600 hover:text-blue-800">
                    Max: {selectedToken.amount.toFixed(4)}
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
                    <div className="ml-2 rounded-md bg-gray-100 px-2 py-1 text-sm uppercase text-gray-700">
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

            {/* Narration Field */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
              <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all">
                <input
                  type="text"
                  placeholder="Add a description for this transfer"
                  className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !userData || !amount || !isValidAmount || !selectedToken}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  `Send ${selectedToken?.symbol || ""}`
                )}
              </ButtonModule>

              <ButtonModule type="button" variant="outline" size="lg" className="w-full" onClick={handleGoBack}>
                Cancel
              </ButtonModule>
            </div>
          </form>

          {/* Conversion Estimate */}
          {selectedToken && amount && isValidAmount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-sm text-gray-500"
            >
              ≈ {(parseFloat(amount) * selectedToken.price).toFixed(2)}{" "}
              <span className="uppercase">{selectedToken.symbol}</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function TransferToUser() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <TransferContent />
    </Suspense>
  )
}
