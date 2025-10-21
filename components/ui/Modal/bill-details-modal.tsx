"use client"

import React from "react"
import { motion } from "framer-motion"
import { VscEye } from "react-icons/vsc"
import { ButtonModule } from "../Button/Button"
import { PdfFileIcon } from "components/Icons/Icons"

interface BillDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  bill: {
    id: string
    customer: string
    meterNumber: string
    amount: string
    status: "generated" | "pending" | "approved"
    category: string
    consumption: string
    dueDate: string
  } | null
}

const BillDetailsModal: React.FC<BillDetailsModalProps> = ({ isOpen, onRequestClose, bill }) => {
  if (!isOpen || !bill) return null

  // Parse consumption to extract kWh value for calculations
  const consumptionKWh = parseInt(bill.consumption.split(" ")[0] ?? "0", 10)

  // Calculate billing details based on the provided information
  const tariffRate = 92.5 // ₦92.50/kWh for Band B
  const energyCharge = consumptionKWh * tariffRate
  const vatRate = 0.075 // 7.5%
  const vatAmount = energyCharge * vatRate
  const serviceCharge = 42.188
  const totalAmount = energyCharge + vatAmount + serviceCharge

  const formatCurrency = (amount: number) => {
    return `₦${amount.toFixed(3)}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "generated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log("Downloading PDF for bill:", bill.id)
    // Add your PDF generation logic here
  }

  const handleSendEmail = () => {
    // Implement email sending functionality
    console.log("Sending email for bill:", bill.id)
    // Add your email sending logic here
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[90vw] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bill Details</h2>
            <p className="mt-1 text-sm text-gray-600">Bill ID: {bill.id}</p>
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column - Customer Information */}
            <div className="space-y-6">
              {/* Customer Card */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Customer Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-semibold text-blue-600">
                        {bill.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-semibold text-gray-900">{bill.customer}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="font-medium text-gray-900">{bill.meterNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer Category</p>
                      <p className="font-medium text-gray-900">{bill.category}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(bill.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Consumption Details */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Consumption Details</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Previous Reading:</span>
                    <span className="font-medium text-gray-900">1,250 kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Reading:</span>
                    <span className="font-medium text-gray-900">1,700 kWh</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-sm font-medium text-gray-900">Consumption:</span>
                    <span className="font-medium text-gray-900">{bill.consumption}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tariff Rate (Band B):</span>
                    <span className="font-medium text-gray-900">₦92.50/kWh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Billing Summary */}
            <div className="space-y-6">
              {/* Billing Summary */}
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Billing Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Energy Charge:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(energyCharge)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">VAT (7.5%):</span>
                    <span className="font-medium text-gray-900">{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service Charge:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-semibold text-gray-900">{bill.amount}</span>
                  </div>
                </div>
              </div>

              {/* Status Card */}
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(
                        bill.status
                      )}`}
                    >
                      {bill.status === "approved" && (
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {bill.status === "generated" && (
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      {bill.status === "pending" && (
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Consumption</p>
                    <p className="font-semibold text-gray-900">{bill.consumption}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                <h4 className="mb-3 font-semibold text-blue-900">Quick Actions</h4>
                <div className="flex gap-3">
                  <ButtonModule variant="primary" size="md" className="flex-1" onClick={handleDownloadPDF}>
                    Download PDF
                  </ButtonModule>
                  <ButtonModule
                    variant="outline"
                    size="md"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={handleSendEmail}
                  >
                    Send Email
                  </ButtonModule>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="outline" size="lg" className="flex-1" onClick={onRequestClose}>
            Close
          </ButtonModule>
          <ButtonModule
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleDownloadPDF}
            icon={<PdfFileIcon />}
            iconPosition="start"
          >
            Download PDF
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BillDetailsModal
