"use client"

import React, { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"

import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearClearDebt,
  clearCustomerLookup,
  clearPreviewDebtClearance,
  clearPromoCodes,
  clearDebt,
  getPromoCodes,
  lookupCustomer,
  previewDebtClearance,
} from "lib/redux/agentSlice"
import type { PromoCode } from "lib/redux/agentSlice"

// Debug: Check if previewDebtClearance is imported correctly
console.log("previewDebtClearance imported:", typeof previewDebtClearance, previewDebtClearance)

const ClearDebtPage: React.FC = () => {
  const dispatch = useAppDispatch()

  const { customerLookupLoading, customerLookup, customerLookupError, customerLookupSuccess } = useAppSelector(
    (state) => state.agents
  )
  const {
    previewDebtClearance: previewDebtClearanceData,
    previewDebtClearanceLoading,
    previewDebtClearanceError,
    previewDebtClearanceSuccess,
  } = useAppSelector((state) => state.agents)
  const {
    clearDebt: clearDebtData,
    clearDebtLoading,
    clearDebtError,
    clearDebtSuccess,
  } = useAppSelector((state) => state.agents)
  const { promoCodes, promoCodesLoading, promoCodesError, promoCodesSuccess } = useAppSelector((state) => state.agents)

  const [customerReference, setCustomerReference] = useState("")
  const [customerInfo, setCustomerInfo] = useState<{
    id: number
    accountNumber: string
    fullName: string
    phoneNumber: string
    email: string
    status: string
    isSuspended: boolean
    areaOfficeName: string
    feederName: string
    customerOutstandingDebtBalance: number
    minimumPayment: number
  } | null>(null)
  const [isValidatingCustomer, setIsValidatingCustomer] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [showDebtClearancePreview, setShowDebtClearancePreview] = useState(false)
  const [showClearDebtModal, setShowClearDebtModal] = useState(false)
  const [paymentTypeId, setPaymentTypeId] = useState<number>(2) // Default to debt clearance payment type
  const [channel, setChannel] = useState<string>("Cash")
  const [narrative, setNarrative] = useState("")

  useEffect(() => {
    dispatch(clearCustomerLookup())
    dispatch(clearPreviewDebtClearance())
    dispatch(clearClearDebt())
    dispatch(clearPromoCodes())
  }, [dispatch])

  // Customer lookup success effect
  useEffect(() => {
    if (customerLookupSuccess && customerLookup) {
      setCustomerInfo({
        id: customerLookup.id,
        accountNumber: customerLookup.accountNumber,
        fullName: customerLookup.fullName,
        phoneNumber: customerLookup.phoneNumber,
        email: customerLookup.email,
        status: customerLookup.status,
        isSuspended: customerLookup.isSuspended,
        areaOfficeName: customerLookup.areaOfficeName,
        feederName: customerLookup.feederName,
        customerOutstandingDebtBalance: customerLookup.customerOutstandingDebtBalance,
        minimumPayment: customerLookup.minimumPayment || 0,
      })

      // Fetch promo codes for this customer
      dispatch(
        getPromoCodes({
          customerId: customerLookup.id,
          asOfUtc: new Date().toISOString(),
        })
      )

      notify("success", "Customer validated successfully", {
        description: `Customer found: ${customerLookup.fullName}`,
        duration: 3000,
      })
    }
  }, [customerLookupSuccess, customerLookup, dispatch])

  // Customer lookup error effect
  useEffect(() => {
    if (customerLookupError) {
      notify("error", customerLookupError || "Failed to validate customer", {
        duration: 6000,
      })
    }
  }, [customerLookupError])

  // Clear debt clearance preview when customer changes
  useEffect(() => {
    handleClearDebtClearancePreview()
  }, [customerInfo?.id])

  // Preview debt clearance success effect
  useEffect(() => {
    if (previewDebtClearanceSuccess && previewDebtClearanceData) {
      notify("success", "Debt clearance preview loaded", {
        description: `Promo code "${promoCode}" applied successfully`,
        duration: 3000,
      })
    }
  }, [previewDebtClearanceSuccess, previewDebtClearanceData, promoCode])

  // Preview debt clearance error effect
  useEffect(() => {
    if (previewDebtClearanceError) {
      notify("error", previewDebtClearanceError || "Failed to preview debt clearance", {
        duration: 6000,
      })
    }
  }, [previewDebtClearanceError])

  // Clear debt success effect
  useEffect(() => {
    if (clearDebtSuccess && clearDebtData) {
      setShowClearDebtModal(true)
      notify("success", "Debt cleared successfully!", {
        description: `Payment reference: ${clearDebtData.reference}`,
        duration: 5000,
      })
    }
  }, [clearDebtSuccess, clearDebtData])

  // Clear debt error effect
  useEffect(() => {
    if (clearDebtError) {
      notify("error", clearDebtError || "Failed to clear debt", {
        duration: 6000,
      })
    }
  }, [clearDebtError])

  // Promo codes success effect
  useEffect(() => {
    if (promoCodesSuccess && promoCodes) {
      console.log("Available promo codes:", promoCodes)
    }
  }, [promoCodesSuccess, promoCodes])

  // Promo codes error effect
  useEffect(() => {
    if (promoCodesError) {
      console.error("Failed to fetch promo codes:", promoCodesError)
      // Don't show error notification for promo codes as it's not critical
    }
  }, [promoCodesError])

  const handleLookupCustomer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerReference.trim()) {
      notify("error", "Please enter a customer reference (e.g. account number)")
      return
    }

    setCustomerInfo(null)
    dispatch(clearCustomerLookup())

    try {
      setIsValidatingCustomer(true)

      await dispatch(lookupCustomer(customerReference.trim())).unwrap()
    } catch (error: any) {
      // Error is handled by the useEffect above
    } finally {
      setIsValidatingCustomer(false)
    }
  }

  const handlePreviewDebtClearance = async () => {
    console.log("handlePreviewDebtClearance called")
    console.log("previewDebtClearance function:", typeof previewDebtClearance, previewDebtClearance)
    console.log("customerInfo:", customerInfo)
    console.log("promoCode:", promoCode)

    if (!customerInfo) {
      notify("error", "Customer information not found")
      return
    }

    if (!promoCode.trim()) {
      notify("error", "Please enter a promo code")
      return
    }

    try {
      const requestData = {
        customerId: customerInfo.id,
        promoCode: promoCode.trim(),
        asOfUtc: new Date().toISOString(),
      }

      console.log("Request data:", requestData)
      console.log("Calling previewDebtClearance...")

      await dispatch(previewDebtClearance(requestData)).unwrap()
      setShowDebtClearancePreview(true)
    } catch (error: any) {
      console.error("Error in previewDebtClearance:", error)
      notify("error", error.message || "Failed to preview debt clearance")
    }
  }

  const handleClearDebtClearancePreview = () => {
    setShowDebtClearancePreview(false)
    setPromoCode("")
    dispatch(clearPreviewDebtClearance())
  }

  const handleClearDebt = async () => {
    if (!customerInfo) {
      notify("error", "Customer information not found")
      return
    }

    if (!previewDebtClearanceData) {
      notify("error", "Please preview debt clearance first")
      return
    }

    try {
      const requestData = {
        customerId: customerInfo.id,
        amount: previewDebtClearanceData.minimumPayableAmount,
        paymentTypeId,
        channel,
        latitude: 0, // You might want to get actual location
        longitude: 0, // You might want to get actual location
        phoneNumber: customerInfo.phoneNumber || "",
        narrative: narrative.trim() || `Debt clearance for ${customerInfo.fullName}`,
        promoCode: promoCode.trim(),
      }

      await dispatch(clearDebt(requestData)).unwrap()
    } catch (error: any) {
      console.error("Error in clearDebt:", error)
      notify("error", error.message || "Failed to clear debt")
    }
  }

  const handleCloseClearDebtModal = () => {
    setShowClearDebtModal(false)
    dispatch(clearClearDebt())
    // Reset form
    setCustomerReference("")
    setCustomerInfo(null)
    setPromoCode("")
    setShowDebtClearancePreview(false)
    setNarrative("")
  }

  const handleSelectPromoCode = (promo: PromoCode) => {
    setPromoCode(promo.code)
    // Clear previous preview when selecting a new promo code
    dispatch(clearPreviewDebtClearance())
    setShowDebtClearancePreview(false)
  }

  const handleDownloadReceipt = async () => {
    if (!clearDebtData?.reference) return

    try {
      // Create HTML content that matches the modal design
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Debt Clearance Receipt - ${clearDebtData.reference}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                line-height: 1.5;
                color: #111827;
                background: white;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                border-bottom: 1px solid #e5e7eb;
                background: #f9f9f9;
                padding: 16px 24px;
                margin-bottom: 20px;
              }
              .header h2 {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 4px;
              }
              .header p {
                font-size: 14px;
                color: #6b7280;
              }
              .success-card {
                border: 1px solid #bbf7d0;
                background: #f0fdf4;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 20px;
              }
              .success-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
              }
              .success-title {
                font-weight: 600;
                color: #166534;
                font-size: 14px;
              }
              .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                font-size: 14px;
              }
              .detail-item span:first-child {
                color: #6b7280;
                display: block;
                margin-bottom: 4px;
              }
              .detail-item p {
                font-weight: 500;
                color: #111827;
              }
              .pending-notice {
                border: 1px solid #fde68a;
                background: #fef3c7;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 20px;
              }
              .pending-notice p {
                font-size: 14px;
                color: #92400e;
              }
              .receipt-details {
                border: 1px solid #e5e7eb;
                background: #f9fafb;
                border-radius: 6px;
                padding: 16px;
                margin-bottom: 20px;
              }
              .receipt-details h3 {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 12px;
              }
              .receipt-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                font-size: 12px;
              }
              .receipt-item span:first-child {
                color: #6b7280;
                display: block;
                margin-bottom: 2px;
              }
              .receipt-item p {
                font-weight: 500;
                color: #111827;
              }
              .tokens-section {
                margin-top: 12px;
              }
              .token-item {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                padding: 4px;
                font-family: monospace;
                font-size: 12px;
                margin-bottom: 4px;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
              }
              @media print {
                body { margin: 0; padding: 15px; }
                .header { page-break-after: always; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Debt Cleared Successfully</h2>
              <p>Payment has been processed successfully</p>
            </div>

            <div class="success-card">
              <div class="success-header">
                <svg width="20" height="20" fill="#10b981" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="success-title">Payment Confirmed</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <span>Reference:</span>
                  <p>${clearDebtData.reference}</p>
                </div>
                <div class="detail-item">
                  <span>Status:</span>
                  <p>${clearDebtData.status}</p>
                </div>
                <div class="detail-item">
                  <span>Amount Paid:</span>
                  <p>₦${clearDebtData.totalAmountPaid.toLocaleString()}</p>
                </div>
                <div class="detail-item">
                  <span>Payment Channel:</span>
                  <p>${clearDebtData.channel}</p>
                </div>
                <div class="detail-item">
                  <span>Customer:</span>
                  <p>${clearDebtData.customerName}</p>
                </div>
                <div class="detail-item">
                  <span>Account Number:</span>
                  <p>${clearDebtData.customerAccountNumber}</p>
                </div>
              </div>
            </div>

            ${
              clearDebtData.isPending
                ? `
              <div class="pending-notice">
                <p><strong>Note:</strong> This payment is currently being processed. You may check the status later.</p>
              </div>
            `
                : ""
            }

            ${
              clearDebtData.receipt
                ? `
              <div class="receipt-details">
                <h3>Receipt Details</h3>
                <div class="receipt-grid">
                  <div class="receipt-item">
                    <span>Paid At:</span>
                    <p>${new Date(clearDebtData.receipt.paidAtUtc).toLocaleString()}</p>
                  </div>
                  <div class="receipt-item">
                    <span>Currency:</span>
                    <p>${clearDebtData.receipt.currency}</p>
                  </div>
                </div>
                ${
                  clearDebtData.receipt.tokens && clearDebtData.receipt.tokens.length > 0
                    ? `
                  <div class="tokens-section">
                    <span>Tokens:</span>
                    <div style="margin-top: 4px;">
                      ${clearDebtData.receipt.tokens
                        .map((token) => `<div class="token-item">${token.token}</div>`)
                        .join("")}
                    </div>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }

            <div class="footer">
              Generated on ${new Date().toLocaleString()}<br>
              Reference: ${clearDebtData.reference}
            </div>
          </body>
        </html>
      `

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement("a")
      link.href = url
      link.download = `debt-clearance-receipt-${clearDebtData.reference}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up
      window.URL.revokeObjectURL(url)

      notify("success", "Receipt downloaded successfully", {
        description: `Saved as debt-clearance-receipt-${clearDebtData.reference}.html (open in browser to print as PDF)`,
        duration: 4000,
      })
    } catch (error) {
      console.error("Error downloading receipt:", error)
      notify("error", "Failed to download receipt", {
        duration: 6000,
      })
    }
  }

  const handlePrintReceipt = () => {
    if (!clearDebtData?.reference) return

    try {
      // Create receipt content
      const receiptContent = `
DEBT CLEARANCE RECEIPT
========================

Reference: ${clearDebtData.reference}
Status: ${clearDebtData.status}
Date: ${new Date(clearDebtData.receipt?.paidAtUtc || new Date()).toLocaleString()}

CUSTOMER INFORMATION
--------------------
Customer: ${clearDebtData.customerName}
Account Number: ${clearDebtData.customerAccountNumber}

PAYMENT DETAILS
---------------
Amount Paid: ₦${clearDebtData.totalAmountPaid.toLocaleString()}
Payment Channel: ${clearDebtData.channel}
Currency: ${clearDebtData.receipt?.currency || "NGN"}

${
  clearDebtData.receipt?.tokens && clearDebtData.receipt.tokens.length > 0
    ? `TOKENS
------
${clearDebtData.receipt.tokens.map((token, index) => `${index + 1}. ${token.token}`).join("\n")}`
    : ""
}

${
  clearDebtData.isPending
    ? "NOTE: This payment is currently being processed. You may check the status later."
    : "Payment confirmed and processed successfully."
}

========================
Generated on: ${new Date().toLocaleString()}
      `.trim()

      // Create a new window for printing
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        notify("error", "Please allow pop-ups to print receipt", {
          duration: 6000,
        })
        return
      }

      // Write the receipt content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Debt Clearance Receipt - ${clearDebtData.reference}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 20px;
                color: #333;
              }
              pre {
                white-space: pre-wrap;
                font-family: 'Courier New', monospace;
              }
              @media print {
                body { margin: 10px; }
              }
            </style>
          </head>
          <body>
            <pre>${receiptContent}</pre>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()

      notify("success", "Print dialog opened", {
        description: "Use your browser's print dialog to print the receipt",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error printing receipt:", error)
      notify("error", "Failed to open print dialog", {
        duration: 6000,
      })
    }
  }

  // Filter active promo codes
  const activePromoCodes = promoCodes?.filter((promo) => promo.isActive && !promo.isPaused) || []

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 sm:px-4 md:px-4 xl:px-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Clear Debt</h1>
                <p className="text-sm text-gray-600">Look up a customer and preview debt clearance with promo codes.</p>
              </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
              {/* Customer Lookup */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Customer Lookup</h2>

                <form onSubmit={handleLookupCustomer} className="space-y-4">
                  <FormInputModule
                    label="Customer Account Number"
                    type="text"
                    name="customerReference"
                    placeholder="Enter customer account number or meter number"
                    value={customerReference}
                    onChange={(e) => setCustomerReference(e.target.value)}
                    required
                  />

                  <p className="text-xs text-gray-500">
                    Use the customer&apos;s account number or other reference to find the customer record.
                  </p>

                  <div className="mt-4 flex gap-3">
                    <ButtonModule
                      type="submit"
                      variant="primary"
                      className="w-full sm:w-auto"
                      disabled={isValidatingCustomer || customerLookupLoading}
                    >
                      {isValidatingCustomer || customerLookupLoading ? "Validating..." : "Lookup Customer"}
                    </ButtonModule>

                    {customerInfo && (
                      <ButtonModule
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setCustomerReference("")
                          setCustomerInfo(null)
                          handleClearDebtClearancePreview()
                        }}
                        disabled={isValidatingCustomer || customerLookupLoading}
                      >
                        Clear
                      </ButtonModule>
                    )}
                  </div>
                </form>
              </motion.div>

              {/* Customer Details & Debt Clearance */}
              <motion.div
                className="rounded-md border bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
              >
                <h2 className="mb-3 text-base font-semibold text-gray-800">Customer Details</h2>

                {!customerInfo && !isValidatingCustomer && !customerLookupLoading && (
                  <p className="text-sm text-gray-500">
                    No customer selected yet. Use the lookup form on the left to find a customer.
                  </p>
                )}

                {(isValidatingCustomer || customerLookupLoading) && (
                  <p className="text-sm text-gray-500">Searching...</p>
                )}

                {customerInfo && (
                  <div className="mt-4 space-y-5">
                    <div className="rounded-md border border-dashed border-[#004B23] bg-[#004B23]/5 p-4 text-sm">
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-[#004B23]">Customer:</span>
                        <span className="text-base font-bold text-[#004B23]">{customerInfo.fullName}</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-[#004B23]">Account Number:</span>
                        <span className="text-base font-bold text-[#004B23]">{customerInfo.accountNumber}</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="font-medium text-[#004B23]">Status:</span>
                        <span className="text-base font-bold text-[#004B23]">
                          {customerInfo.isSuspended ? "Suspended" : customerInfo.status || "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[#004B23]">Outstanding Balance:</span>
                        <span className="text-base font-bold text-[#004B23]">
                          ₦{Number(customerInfo.customerOutstandingDebtBalance ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* REDESIGNED: Debt Clearance Preview Section with Always Visible Promo Codes */}
                    {customerInfo.customerOutstandingDebtBalance > 0 && (
                      <div className="overflow-hidden rounded-lg border border-purple-200 bg-white shadow-sm">
                        {/* Header */}
                        <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-white px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-purple-100 p-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                                />
                              </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-purple-800">Debt Clearance with Promo Code</h3>
                          </div>
                        </div>

                        {/* Content - Height adjusts automatically */}
                        <div className="p-4">
                          {!showDebtClearancePreview ? (
                            <div className="space-y-4">
                              {/* Available Promo Codes Section - Always Visible */}
                              {activePromoCodes.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-700">
                                      Available Promo Codes ({activePromoCodes.length})
                                    </p>
                                    {promoCodesLoading && <span className="text-xs text-gray-500">Loading...</span>}
                                  </div>

                                  {/* Promo code cards */}
                                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {activePromoCodes.map((promo) => (
                                      <button
                                        key={promo.id}
                                        type="button"
                                        onClick={() => handleSelectPromoCode(promo)}
                                        className={`relative overflow-hidden rounded-xl border-2 text-left transition-all duration-200 ${
                                          promoCode === promo.code
                                            ? "scale-[1.02] border-purple-500 shadow-lg"
                                            : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                                        }`}
                                      >
                                        {/* Card header with gradient */}
                                        <div
                                          className={`relative bg-gradient-to-r ${
                                            promoCode === promo.code
                                              ? "from-purple-500 to-purple-600"
                                              : "from-purple-400 to-purple-500"
                                          } px-3 py-2`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="font-mono text-sm font-bold text-white">{promo.code}</span>
                                            <div className="flex items-center gap-2">
                                              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
                                                {promo.discountPercent}% OFF
                                              </span>
                                              {/* Check mark for selected card */}
                                              {promoCode === promo.code && (
                                                <div className="rounded-full bg-white p-0.5">
                                                  <svg
                                                    className="h-3 w-3 text-purple-600"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <path
                                                      fillRule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clipRule="evenodd"
                                                    />
                                                  </svg>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Card body */}
                                        <div className="p-3">
                                          <p className="mb-1 text-sm font-medium text-gray-900">{promo.name}</p>
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Valid until</span>
                                            <span className="text-xs font-medium text-gray-700">
                                              {new Date(promo.endAtUtc).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })}
                                            </span>
                                          </div>
                                          <div className="mt-2 text-center">
                                            <span className="text-xs font-medium text-purple-600">
                                              {promoCode === promo.code ? "✓ Selected" : "Click to select"}
                                            </span>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {activePromoCodes.length === 0 && !promoCodesLoading && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                                  <p className="text-xs text-gray-500">No active promo codes available</p>
                                </div>
                              )}

                              {/* Promo Code Apply Button */}
                              <div className="flex justify-center">
                                <ButtonModule
                                  type="button"
                                  variant="secondary"
                                  onClick={handlePreviewDebtClearance}
                                  disabled={previewDebtClearanceLoading || !promoCode.trim()}
                                  className="whitespace-nowrap px-6"
                                >
                                  {previewDebtClearanceLoading ? (
                                    <span className="flex items-center gap-1">
                                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                          fill="none"
                                        />
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                      </svg>
                                      Checking
                                    </span>
                                  ) : (
                                    "Apply Code"
                                  )}
                                </ButtonModule>
                              </div>

                              {/* Helper text */}
                              <p className="flex items-center gap-1 text-xs text-gray-500">
                                <svg
                                  className="h-3 w-3 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Select a code from the list or enter manually, then click Apply
                              </p>
                            </div>
                          ) : (
                            /* Preview Mode */
                            <div className="space-y-4">
                              {previewDebtClearanceData && (
                                <>
                                  {/* Discount Preview Card */}
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="overflow-hidden rounded-lg border border-purple-200 bg-purple-50"
                                  >
                                    {/* Applied promo badge */}
                                    <div className="border-b border-purple-200 bg-purple-100/50 px-4 py-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                                            APPLIED
                                          </span>
                                          <span className="font-mono text-sm font-semibold text-purple-800">
                                            {previewDebtClearanceData.promoCode}
                                          </span>
                                        </div>
                                        <span className="text-xs text-purple-600">
                                          {previewDebtClearanceData.promoName}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Calculation breakdown */}
                                    <div className="p-4">
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-600">Original Debt:</span>
                                          <span className="font-medium text-gray-900">
                                            ₦{previewDebtClearanceData.outstandingAmount.toLocaleString()}
                                          </span>
                                        </div>

                                        {previewDebtClearanceData.promoApplied && (
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                              Discount ({previewDebtClearanceData.discountPercent}%):
                                            </span>
                                            <span className="font-medium text-green-600">
                                              -₦{previewDebtClearanceData.discountAmount.toLocaleString()}
                                            </span>
                                          </div>
                                        )}

                                        <div className="my-2 border-t border-dashed border-purple-200" />

                                        <div className="flex justify-between">
                                          <span className="text-sm font-semibold text-purple-800">
                                            Minimum Payable:
                                          </span>
                                          <span className="text-xl font-bold text-purple-800">
                                            ₦{previewDebtClearanceData.minimumPayableAmount.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>

                                  {/* Action buttons */}
                                  <div className="flex gap-3">
                                    <ButtonModule
                                      type="button"
                                      variant="secondary"
                                      onClick={handleClearDebtClearancePreview}
                                      disabled={clearDebtLoading}
                                      className="flex-1"
                                    >
                                      Clear & Try Another
                                    </ButtonModule>
                                    <ButtonModule
                                      type="button"
                                      variant="primary"
                                      onClick={handleClearDebt}
                                      disabled={clearDebtLoading}
                                      className="flex-1"
                                    >
                                      {clearDebtLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle
                                              className="opacity-25"
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                              fill="none"
                                            />
                                            <path
                                              className="opacity-75"
                                              fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                          </svg>
                                          Processing...
                                        </span>
                                      ) : (
                                        "Confirm Payment"
                                      )}
                                    </ButtonModule>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!customerInfo.customerOutstandingDebtBalance ||
                    customerInfo.customerOutstandingDebtBalance <= 0 ? (
                      <div className="rounded-md border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-5 text-green-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-semibold text-green-700">No Outstanding Debt</span>
                        </div>
                        <p className="mt-1 text-sm text-green-600">This customer has no outstanding debt to clear.</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Debt Success Modal */}
      <AnimatePresence>
        {showClearDebtModal && clearDebtData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={() => setShowClearDebtModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-2xl rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-200 bg-[#F9F9F9] px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Debt Cleared Successfully</h2>
                <p className="mt-1 text-sm text-gray-500">Payment has been processed successfully</p>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5 text-green-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold text-green-700">Payment Confirmed</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Reference:</span>
                      <p className="font-medium text-gray-900">{clearDebtData.reference}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-gray-900">{clearDebtData.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount Paid:</span>
                      <p className="font-medium text-gray-900">₦{clearDebtData.totalAmountPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Channel:</span>
                      <p className="font-medium text-gray-900">{clearDebtData.channel}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <p className="font-medium text-gray-900">{clearDebtData.customerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-medium text-gray-900">{clearDebtData.customerAccountNumber}</p>
                    </div>
                  </div>
                </div>

                {clearDebtData.isPending && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-700">
                      <strong>Note:</strong> This payment is currently being processed. You may check the status later.
                    </p>
                  </div>
                )}

                {clearDebtData.receipt && (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-gray-800">Receipt Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div>
                        <span>Paid At:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(clearDebtData.receipt.paidAtUtc).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span>Currency:</span>
                        <p className="font-medium text-gray-900">{clearDebtData.receipt.currency}</p>
                      </div>
                      {clearDebtData.receipt.tokens && clearDebtData.receipt.tokens.length > 0 && (
                        <div className="col-span-2">
                          <span>Tokens:</span>
                          <div className="mt-1 space-y-1">
                            {clearDebtData.receipt.tokens.map((token, index) => (
                              <div key={index} className="rounded border bg-white p-1 font-mono text-xs">
                                {token.token}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:grid-cols-3">
                <ButtonModule type="button" variant="primary" className="flex-1" onClick={handleDownloadReceipt}>
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </span>
                </ButtonModule>
                <ButtonModule type="button" variant="secondary" className="flex-1" onClick={handlePrintReceipt}>
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    Print
                  </span>
                </ButtonModule>
                <ButtonModule type="button" variant="secondary" className="flex-1" onClick={handleCloseClearDebtModal}>
                  Close
                </ButtonModule>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default ClearDebtPage
