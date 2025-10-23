import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { BillsIcon, CycleIcon, DateIcon, RevenueGeneratedIcon, StatusIcon } from "components/Icons/Icons"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface BillingCycle {
  id: number
  name: string
  status: "Completed" | "In Progress" | "Scheduled"
  startDate: string
  endDate: string
  billsGenerated: string
  totalAmount: string
  approvedBy?: string
}

interface BillingCyclesProps {
  onStartNewCycle?: () => void
}

const BillingCycles: React.FC<BillingCyclesProps> = ({ onStartNewCycle }) => {
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const billingCycles: BillingCycle[] = [
    {
      id: 1,
      name: "January 2024 Billing",
      status: "Completed",
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      billsGenerated: "89,540",
      totalAmount: "₦42,500,000",
      approvedBy: "Revenue Manager",
    },
    {
      id: 2,
      name: "February 2024 Billing",
      status: "In Progress",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      billsGenerated: "0",
      totalAmount: "Pending",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Billing Cycles */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Billing Cycles</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
            />
          </div>

          {/* Billing Cycles List */}
          <div className="space-y-4">
            {/* Billing Cycle 1 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-3">
                      <DateIcon />
                      <h4 className="font-semibold text-gray-900">January 2024 Billing</h4>
                    </div>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Completed
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Monthly Cycle
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Dec 1, 2023 to Dec 31, 2023</p>
                  <p className="text-sm text-gray-600">Approved by: Revenue Manager</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">₦42,500,000</p>
                    <p className="text-gray-500">2024-01-15 14:30</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <BillsIcon />
                    <p className="text-gray-500">Bills Generated</p>
                  </div>
                  <p className="font-medium text-green-600">₦42,500,000</p>
                </div>
                <div>
                  <div className="flex gap-2">
                    <CycleIcon />
                    <div>
                      <p className="text-gray-500">Cycle Status</p>
                      <p className="font-medium text-green-600">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusIcon />
                  <div>
                    <p className="text-gray-500">Approval</p>
                    <p className="font-medium text-green-600">Approved</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <RevenueGeneratedIcon />
                  <div>
                    <p className="text-gray-500">Revenue</p>

                    <p className="font-medium text-green-600">₦42.5M</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Cycle 2 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-3">
                      <DateIcon />
                      <h4 className="font-semibold text-gray-900">February 2024 Billing</h4>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      In Progress
                    </span>
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                      Monthly Cycle
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Jan 1, 2024 to Jan 31, 2024</p>
                  <p className="text-sm text-gray-600">Pending approval</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Pending</p>
                    <p className="text-gray-500">2024-02-15 10:20</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div className="flex gap-2">
                  <BillsIcon />
                  <div>
                    <p className="text-gray-500">Bills Generated</p>
                    <p className="font-medium text-yellow-600">0</p>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2">
                    <CycleIcon />
                    <div>
                      <p className="text-gray-500">Cycle Status</p>
                      <p className="font-medium text-blue-600">In Progress</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusIcon />
                  <div>
                    <p className="text-gray-500">Approval</p>
                    <p className="font-medium text-yellow-600">Pending</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <RevenueGeneratedIcon />
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-medium text-yellow-600">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Cycle 3 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-3">
                      <DateIcon />
                      <h4 className="font-semibold text-gray-900">March 2024 Billing</h4>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                      Scheduled
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Monthly Cycle
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-gray-900">Feb 1, 2024 to Feb 29, 2024</p>
                  <p className="text-sm text-gray-600">Starts in 15 days</p>
                </div>

                <div className="text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">-</p>
                    <p className="text-gray-500">Starts: 2024-03-01</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                <div className="flex gap-2">
                  <BillsIcon />
                  <div>
                    <p className="text-gray-500">Bills Generated</p>
                    <p className="font-medium text-gray-600">-</p>
                  </div>
                </div>
                <div>
                  <div className="flex gap-2">
                    <CycleIcon />
                    <div>
                      <p className="text-gray-500">Cycle Status</p>
                      <p className="font-medium text-gray-600">Scheduled</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <StatusIcon />
                  <div>
                    <p className="text-gray-500">Approval</p>
                    <p className="font-medium text-gray-600">Not Started</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <RevenueGeneratedIcon />
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-medium text-gray-600">-</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - System Overview */}
      <div className="w-80">
        <div className="space-y-6">
          {/* Cycle Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Cycle Actions</h3>
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
                    <h4 className="font-medium text-gray-900">Create New Cycle</h4>
                    <p className="text-sm text-gray-600">Start a new billing period</p>
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Configure Routes</h4>
                    <p className="text-sm text-gray-600">Manage billing routes</p>
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Export Billing Data</h4>
                    <p className="text-sm text-gray-600">Download reports and data</p>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Approve Pending Bills</h4>
                    <p className="text-sm text-gray-600">Review and approve bills</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BillingCycles
