"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FiArrowLeft, FiCheck, FiClock, FiCopy, FiExternalLink, FiX } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"

type TransactionStatus = "pending" | "processing" | "completed" | "failed"

interface TransactionDetails {
  id: string
  type: string
  amount: string
  cryptoAmount: string
  timestamp: string
  hash: string
  walletAddress: string
  fees: string
  exchangeRate: string
}

const TransactionStatus: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<TransactionStatus>("pending")
  const [progress, setProgress] = useState(0)
  const [details, setDetails] = useState<TransactionDetails | null>(null)
  const [showFullHash, setShowFullHash] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)

  const router = useRouter()

  // Simulate transaction progress
  useEffect(() => {
    // Initial loading
    const loadTimer = setTimeout(() => {
      setLoading(false)
      setDetails({
        id: "TX-7890-4567-1234",
        type: "USDT Purchase",
        amount: "₦15,000.00",
        cryptoAmount: "10 USDT",
        timestamp: new Date().toLocaleString(),
        hash: "0x89c2b5d6f3a1e0b4c7d8e9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
        walletAddress: "0x2aBcdef1234567890abcdef1234567890c905",
        fees: "₦225.00",
        exchangeRate: "1 USDT = ₦1,500",
      })
    }, 1200)

    // Simulate transaction stages
    const statusTimer = setTimeout(() => setStatus("processing"), 2000)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setStatus("completed")
          return 100
        }
        return prev + (status === "processing" ? 10 : 0)
      })
    }, 800)

    // Cleanup
    return () => {
      clearTimeout(loadTimer)
      clearTimeout(statusTimer)
      clearInterval(progressInterval)
    }
  }, [status])

  const handleNewTransaction = () => {
    router.push("/crypto/buy")
  }

  const handleViewDashboard = () => {
    router.push("/dashboard")
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // notify({
        //   type: "success",
        //   title: "Copied!",
        //   message: `${label} copied to clipboard`,
        //   duration: 1500,
        // })
      })
      .catch(() => {
        // notify({
        //   type: "error",
        //   title: "Failed to copy",
        //   message: "Please try again",
        // })
      })
  }

  const displayHash = details
    ? showFullHash
      ? details.hash
      : `${details.hash.substring(0, 8)}...${details.hash.substring(details.hash.length - 8)}`
    : ""

  const displayAddress = details
    ? showFullAddress
      ? details.walletAddress
      : `${details.walletAddress.substring(0, 6)}...${details.walletAddress.substring(
          details.walletAddress.length - 4
        )}`
    : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardNav />

      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8 flex items-center">
            <button onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-gray-100">
              <FiArrowLeft className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaction Status</h1>
              <p className="text-gray-500">Real-time updates on your transfer</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mb-8">
            {loading ? (
              <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 size-8 animate-pulse rounded-full bg-gray-200"></div>
                <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                <div className="h-3 w-48 animate-pulse rounded bg-gray-200"></div>
              </div>
            ) : (
              <motion.div
                className={`rounded-xl border p-6 shadow-sm ${
                  status === "completed"
                    ? "border-green-200 bg-green-50"
                    : status === "failed"
                    ? "border-red-200 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
              >
                <div className="flex flex-col items-center text-center">
                  {status === "completed" ? (
                    <>
                      <div className="mb-4 rounded-full bg-green-100 p-3">
                        <FiCheck className="size-8 text-green-600" />
                      </div>
                      <h3 className="mb-1 text-xl font-bold text-green-800">Transaction Completed</h3>
                      <p className="text-green-600">Your funds have been transferred successfully</p>
                    </>
                  ) : status === "failed" ? (
                    <>
                      <div className="mb-4 rounded-full bg-red-100 p-3">
                        <FiX className="size-8 text-red-600" />
                      </div>
                      <h3 className="mb-1 text-xl font-bold text-red-800">Transaction Failed</h3>
                      <p className="text-red-600">Please try again or contact support</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 rounded-full bg-blue-100 p-3">
                        <FiClock className="size-8 animate-pulse text-blue-600" />
                      </div>
                      <h3 className="mb-1 text-xl font-bold text-gray-800">
                        {status === "processing" ? "Processing Transaction" : "Transaction Pending"}
                      </h3>
                      <p className="text-gray-600">
                        {status === "processing" ? "Confirming on blockchain..." : "Waiting for network confirmation"}
                      </p>
                    </>
                  )}
                </div>

                {status === "processing" && (
                  <div className="mt-6">
                    <div className="mb-1 flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <motion.div
                        className="h-2.5 rounded-full bg-blue-600"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Transaction Details */}
          {details && (
            <motion.div
              className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="mb-4 font-medium text-gray-900">Transaction Details</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{details.id}</span>
                    <button
                      onClick={() => handleCopy(details.id, "Transaction ID")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiCopy className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium text-gray-900">{details.type}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-medium text-gray-900">{details.amount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">You Receive</span>
                  <span className="text-sm font-medium text-gray-900">{details.cryptoAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Exchange Rate</span>
                  <span className="text-sm font-medium text-gray-900">{details.exchangeRate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fees</span>
                  <span className="text-sm font-medium text-gray-900">{details.fees}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Timestamp</span>
                  <span className="text-sm font-medium text-gray-900">{details.timestamp}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Transaction Hash</span>
                  <div className="text-right">
                    <div className="mb-1 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowFullHash(!showFullHash)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {showFullHash ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleCopy(details.hash, "Transaction hash")}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiCopy className="size-4" />
                      </button>
                    </div>
                    <div className="break-all font-mono text-sm text-gray-900">{displayHash}</div>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Wallet Address</span>
                  <div className="text-right">
                    <div className="mb-1 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setShowFullAddress(!showFullAddress)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {showFullAddress ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleCopy(details.walletAddress, "Wallet address")}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <FiCopy className="size-4" />
                      </button>
                    </div>
                    <div className="break-all font-mono text-sm text-gray-900">{displayAddress}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "completed" && (
              <>
                <ButtonModule
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleNewTransaction}
                >
                  New Transaction
                </ButtonModule>
                <ButtonModule
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleViewDashboard}
                >
                  View Dashboard
                </ButtonModule>
                <a
                  href={`https://bscscan.com/tx/${details?.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  View on BscScan <FiExternalLink />
                </a>
              </>
            )}
            {status === "failed" && (
              <>
                <ButtonModule
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleNewTransaction}
                >
                  Try Again
                </ButtonModule>
                <ButtonModule
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/support")}
                >
                  Contact Support
                </ButtonModule>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TransactionStatus
