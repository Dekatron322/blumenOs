"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { VscEye } from "react-icons/vsc"
import { ButtonModule } from "components/ui/Button/Button"
import BillDetailsModal from "components/ui/Modal/bill-details-modal"
import { BillsIcon, BillsIdIcon, CategoryIcon, CycleIcon, DateIcon, RevenueGeneratedIcon } from "components/Icons/Icons"
import PdfFile from "public/pdf-file"

interface RecentBill {
  id: string
  customer: string
  meterNumber: string
  amount: string
  status: "generated" | "pending" | "approved"
  category: string
  consumption: string
  dueDate: string
}

interface RecentBillsProps {
  onExport?: () => void
  onGenerateBills?: () => void
  onViewDetails?: (bill: RecentBill) => void
}

const RecentBills: React.FC<RecentBillsProps> = ({ onExport, onGenerateBills, onViewDetails }) => {
  const [searchText, setSearchText] = useState("")
  const [selectedBill, setSelectedBill] = useState<RecentBill | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleViewDetails = (bill: RecentBill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
    onViewDetails?.(bill)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBill(null)
  }

  const recentBills: RecentBill[] = [
    {
      id: "INV-001234",
      customer: "Fatima Hassan",
      meterNumber: "2301567890",
      amount: "₦562.5",
      status: "generated",
      category: "C1",
      consumption: "450 kWh",
      dueDate: "2024-02-15",
    },
    {
      id: "INV-001235",
      customer: "Adamu Ibrahim",
      meterNumber: "2301567891",
      amount: "₦259",
      status: "pending",
      category: "R2",
      consumption: "280 kWh",
      dueDate: "2024-02-15",
    },
    {
      id: "INV-001236",
      customer: "Grace Okonkwo",
      meterNumber: "2301567892",
      amount: "₦102",
      status: "approved",
      category: "R1",
      consumption: "150 kWh",
      dueDate: "2024-02-15",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "generated":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <svg className="size-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "generated":
        return (
          <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )
      case "pending":
        return (
          <svg className="size-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      default:
        return (
          <svg className="size-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-6"
      >
        {/* Left Column - Recent Bills */}
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Bills</h3>
              <div className="flex gap-2">
                <ButtonModule icon={<PdfFile />} variant="outline" size="md" onClick={onExport}>
                  Export
                </ButtonModule>
                <ButtonModule variant="primary" size="md" onClick={onGenerateBills}>
                  Generate Bills
                </ButtonModule>
              </div>
            </div>

            <div className="mb-6">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
              />
            </div>

            {/* Recent Bills List */}
            <div className="space-y-4">
              {recentBills.map((bill) => (
                <motion.div
                  key={bill.id}
                  className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm"
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{bill.customer}</h4>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(bill.status)}`}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          {bill.category}
                        </span>
                      </div>

                      <p className="mt-1 font-medium text-gray-900">{bill.meterNumber}</p>
                      <div className="flex items-center gap-2">
                        {" "}
                        <DateIcon />
                        <p className="text-sm text-gray-600">Due Date: {formatDate(bill.dueDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{bill.amount}</p>
                        <p className="text-sm text-gray-500">{bill.consumption}</p>
                      </div>
                      <ButtonModule
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(bill)}
                        icon={<VscEye className="size-4" />}
                        iconPosition="start"
                        className="bg-white"
                      >
                        View Details
                      </ButtonModule>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                    <div className="flex gap-2">
                      <BillsIdIcon />
                      <div>
                        <p className="text-gray-500">Bill ID</p>
                        <p className="font-medium text-gray-900">{bill.id}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <CategoryIcon />
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-medium text-gray-900">{bill.category}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <CycleIcon />
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p
                          className={`font-medium ${
                            bill.status === "approved"
                              ? "text-green-600"
                              : bill.status === "generated"
                              ? "text-blue-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <RevenueGeneratedIcon />
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium text-gray-900">{bill.amount}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="w-80">
          <div className="space-y-6">
            {/* Bill Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Bill Actions</h3>
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Generate Single Bill</h4>
                      <p className="text-sm text-gray-600">Create bill for individual customer</p>
                    </div>
                  </div>
                </button>

                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <svg className="size-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Approve Bills</h4>
                      <p className="text-sm text-gray-600">Review and approve pending bills</p>
                    </div>
                  </div>
                </button>

                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <svg className="size-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Schedule Bills</h4>
                      <p className="text-sm text-gray-600">Set up automated billing</p>
                    </div>
                  </div>
                </button>

                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-2">
                      <svg className="size-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Export Reports</h4>
                      <p className="text-sm text-gray-600">Download billing reports</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Billing Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Generated</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Approval</span>
                  <span className="font-semibold text-yellow-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">₦923.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <BillDetailsModal isOpen={isModalOpen} onRequestClose={handleCloseModal} bill={selectedBill} />
    </>
  )
}

export default RecentBills
