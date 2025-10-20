"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FiArrowLeft, FiCopy, FiExternalLink, FiInfo, FiShield } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"

interface TransferDetails {
  amount: string
  cryptoAmount: string
  walletAddress: string
  network: string
  networkFee: string
  processingFee: string
  total: string
}

const ReviewTransfer: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null)
  const [showFullAddress, setShowFullAddress] = useState(false)

  const router = useRouter()

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransferDetails({
        amount: "₦15,000.00",
        cryptoAmount: "10 USDT",
        walletAddress: "0x2aBcdef1234567890abcdef1234567890c905",
        network: "BEP20",
        networkFee: "₦150.00",
        processingFee: "₦75.00",
        total: "₦15,225.00",
      })
      setLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // notify({
      //   type: "success",
      //   title: "Transfer Initiated!",
      //   message: "Your transaction is being processed",
      //   duration: 2000,
      // })

      setTimeout(() => router.push("/crypto/transaction-status"), 1000)
    } catch (error: any) {
      setError(error.message || "Transfer failed. Please try again.")
      // notify({
      //   type: "error",
      //   title: "Transfer Failed",
      //   message: error.message || "Please try again",
      // })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyAddress = () => {
    if (!transferDetails) return

    navigator.clipboard
      .writeText(transferDetails.walletAddress)
      .then(() => {
        // notify({
        //   type: "success",
        //   title: "Copied!",
        //   message: "Wallet address copied to clipboard",
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

  const toggleAddressVisibility = () => {
    setShowFullAddress(!showFullAddress)
  }

  const displayWalletAddress = transferDetails
    ? showFullAddress
      ? transferDetails.walletAddress
      : `${transferDetails.walletAddress.substring(0, 6)}...${transferDetails.walletAddress.substring(
          transferDetails.walletAddress.length - 4
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
              <h1 className="text-2xl font-bold text-gray-900">Review Transfer</h1>
              <p className="text-gray-500">Confirm your transaction details</p>
            </div>
          </div>

          {/* Security Notice */}
          <motion.div
            className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <FiShield className="text-blue-600" />
              </div>
              <div>
                <h3 className="mb-1 font-medium text-gray-900">Security Notice</h3>
                <p className="text-sm text-gray-600">
                  Please verify all details before confirming. Transactions cannot be reversed.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Transfer Details */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-5 w-16 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : transferDetails ? (
                <div className="space-y-4">
                  {/* Transfer Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Transfer Amount</span>
                      <FiInfo className="text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">{transferDetails.amount}</span>
                  </div>

                  {/* Crypto Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>You Receive</span>
                      <FiInfo className="text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">{transferDetails.cryptoAmount}</span>
                  </div>

                  {/* Network */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Network</span>
                      <FiInfo className="text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900">{transferDetails.network}</span>
                  </div>

                  {/* Wallet Address */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Wallet Address</span>
                      <FiInfo className="text-gray-400" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={toggleAddressVisibility}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {showFullAddress ? "Hide" : "Show"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="text-gray-500 hover:text-gray-700"
                          title="Copy address"
                        >
                          <FiCopy className="size-4" />
                        </button>
                      </div>
                      <div className="mt-1 break-all font-mono text-sm text-gray-900">{displayWalletAddress}</div>
                    </div>
                  </div>

                  {/* Fees */}
                  <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Network Fee</span>
                      <span className="text-gray-700">{transferDetails.networkFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Fee</span>
                      <span className="text-gray-700">{transferDetails.processingFee}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700">Total</span>
                      <span className="text-gray-900">{transferDetails.total}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">Failed to load transfer details</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || submitting || !transferDetails}
                className="w-full"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  "Confirm Transfer"
                )}
              </ButtonModule>

              <ButtonModule type="button" variant="outline" size="lg" className="w-full" onClick={() => router.back()}>
                Cancel
              </ButtonModule>
            </div>
          </form>

          {/* Explorer Link */}
          {transferDetails && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <a
                href={`https://bscscan.com/address/${transferDetails.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                View on BscScan <FiExternalLink className="ml-1" />
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ReviewTransfer
