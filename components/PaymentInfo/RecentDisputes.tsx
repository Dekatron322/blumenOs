"use client"

import React, { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { HiChevronDown, HiChevronUp } from "react-icons/hi"

const RecentDisputes = () => {
  const [searchText, setSearchText] = useState("")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMobileActions, setShowMobileActions] = useState(false)

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const disputes = [
    {
      id: 1,
      customerName: "Fatima Hassan",
      accountNumber: "2301567890",
      disputeAmount: "₦425",
      originalAmount: "₦425",
      status: "pending",
      disputeType: "double-charge",
      paymentMethod: "Bank Transfer",
      reference: "TXN789456123",
      timestamp: "2024-01-15 16:45",
      submittedDate: "2024-01-16",
      dueDate: "2024-01-23",
      priority: "medium",
      assignedTo: "John Adebayo",
      description: "Customer claims they were charged twice for the same service",
    },
    {
      id: 2,
      customerName: "Tech Solutions Ltd",
      accountNumber: "2301789012",
      disputeAmount: "₦1,250",
      originalAmount: "₦1,250",
      status: "under-review",
      disputeType: "service-not-rendered",
      paymentMethod: "Bank Transfer",
      reference: "TXN321654987",
      timestamp: "2024-01-15 15:45",
      submittedDate: "2024-01-16",
      dueDate: "2024-01-25",
      priority: "high",
      assignedTo: "Sarah Johnson",
      description: "Commercial customer claims service was not provided after payment",
    },
    {
      id: 3,
      customerName: "Michael Johnson",
      accountNumber: "2301890123",
      disputeAmount: "₦320",
      originalAmount: "₦320",
      status: "resolved",
      disputeType: "incorrect-amount",
      paymentMethod: "Card Payment",
      reference: "CARD123456789",
      timestamp: "2024-01-15 15:30",
      submittedDate: "2024-01-15",
      dueDate: "2024-01-22",
      priority: "low",
      assignedTo: "James Okafor",
      description: "Customer claims incorrect amount was charged",
      resolution: "Refund processed - system error confirmed",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "under-review":
        return "bg-blue-100 text-blue-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "escalated":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDisputeTypeColor = (type: string) => {
    switch (type) {
      case "double-charge":
        return "bg-red-100 text-red-800"
      case "service-not-rendered":
        return "bg-orange-100 text-orange-800"
      case "incorrect-amount":
        return "bg-blue-100 text-blue-800"
      case "unauthorized-transaction":
        return "bg-purple-100 text-purple-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "Bank Transfer":
        return "bg-blue-100 text-blue-800"
      case "Mobile Money":
        return "bg-purple-100 text-purple-800"
      case "POS Agent":
        return "bg-orange-100 text-orange-800"
      case "Card Payment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDisputeAction = (dispute: any, action: string) => {
    console.log(`Action: ${action} for dispute:`, dispute.id)
    setIsDropdownOpen(false)
    setSelectedDispute(null)

    switch (action) {
      case "view":
        break
      case "update":
        break
      case "assign":
        break
      case "resolve":
        break
      default:
        break
    }
  }

  const ActionDropdown = ({ dispute }: { dispute: any }) => {
    return (
      <div className="relative">
        <button
          onClick={() => {
            setSelectedDispute(dispute)
            setIsDropdownOpen(!isDropdownOpen)
          }}
          className="rounded-lg bg-gray-100 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 md:px-3 md:py-1 md:text-sm"
          aria-label="Open actions menu"
        >
          <span className="hidden md:inline">Actions</span>
          <span className="md:hidden">...</span>
        </button>

        {isDropdownOpen && selectedDispute?.id === dispute.id && (
          <>
            <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsDropdownOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border border-gray-200 bg-white shadow-lg md:absolute md:right-0 md:top-full md:mt-1 md:w-48 md:rounded-md md:rounded-t-none"
            >
              <div className="p-2 md:p-0 md:py-1">
                <div className="mb-2 flex items-center justify-between border-b pb-2 md:hidden">
                  <h3 className="text-sm font-medium text-gray-900">Dispute Actions</h3>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="rounded-full p-1 hover:bg-gray-100"
                    aria-label="Close menu"
                  >
                    <HiChevronDown className="size-4 text-gray-600" />
                  </button>
                </div>
                <button
                  onClick={() => handleDisputeAction(dispute, "view")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDisputeAction(dispute, "update")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  Update Status
                </button>
                <button
                  onClick={() => handleDisputeAction(dispute, "assign")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  Assign to Agent
                </button>
                <button
                  onClick={() => handleDisputeAction(dispute, "resolve")}
                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 md:px-4 md:py-2"
                >
                  Mark Resolved
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    )
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".action-dropdown")) {
        setIsDropdownOpen(false)
        setSelectedDispute(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Auto-hide sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowSidebar(false)
      } else {
        setShowSidebar(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const DisputeCard = ({ dispute, index }: { dispute: any; index: number }) => (
    <motion.div
      key={dispute.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-3 transition-all hover:shadow-sm md:p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
            <h4 className="text-sm font-semibold text-gray-900 md:text-base">{dispute.customerName}</h4>
            <span className="text-xs text-gray-500 md:text-sm">{dispute.accountNumber}</span>
          </div>

          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-lg font-bold text-gray-900 md:text-xl">{dispute.disputeAmount}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(dispute.status)}`}>
                {dispute.status.replace("-", " ")}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                {dispute.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2 md:gap-3 lg:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Dispute Type:</p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getDisputeTypeColor(
                  dispute.disputeType
                )}`}
              >
                {dispute.disputeType.replace("-", " ")}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Payment Method:</p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentMethodColor(
                  dispute.paymentMethod
                )}`}
              >
                {dispute.paymentMethod}
              </span>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Reference:</p>
              <p className="truncate text-xs font-medium text-gray-900 md:text-sm">{dispute.reference}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Submitted:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">{dispute.submittedDate}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Due Date:</p>
              <p className="text-xs font-medium text-gray-900 md:text-sm">{dispute.dueDate}</p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Assigned To:</p>
              <p className="text-xs font-medium text-blue-600 md:text-sm">{dispute.assignedTo}</p>
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-1 text-xs text-gray-500 md:text-sm">Description:</p>
            <p className="text-xs text-gray-700 md:text-sm">{dispute.description}</p>
          </div>

          {dispute.resolution && (
            <div className="mt-2">
              <p className="mb-1 text-xs text-gray-500 md:text-sm">Resolution:</p>
              <p className="text-xs text-green-600 md:text-sm">{dispute.resolution}</p>
            </div>
          )}
        </div>

        <div className="action-dropdown flex justify-end md:block">
          <ActionDropdown dispute={dispute} />
        </div>
      </div>
    </motion.div>
  )

  const StatCard = ({
    title,
    items,
  }: {
    title: string
    items: Array<{ label: string; value: string; color: string; count: number }>
  }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">{title}</h3>
      <div className="space-y-2 md:space-y-3 lg:space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${item.color} md:size-3`}></div>
              <span className="text-xs text-gray-700 md:text-sm">{item.label}</span>
            </div>
            <span className={`text-xs font-semibold md:text-sm ${item.color.replace("bg-", "text-")}`}>
              {item.count} {item.count === 1 ? "dispute" : "disputes"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const QuickActionsCard = () => (
    <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-2 md:gap-3">
        <button className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
          New Dispute
        </button>
        <button className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
          Export Reports
        </button>
        <button className="col-span-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:col-span-1 sm:py-2.5 md:px-4 md:py-2 md:text-sm">
          View Analytics
        </button>
      </div>
    </div>
  )

  const MobileQuickActions = () => (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white shadow-lg ring-1 ring-gray-200 md:hidden">
      <div className="flex items-center gap-1 p-1">
        <button
          onClick={() => setShowMobileActions(!showMobileActions)}
          className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          aria-label="Quick actions"
        >
          <span>Actions</span>
          {showMobileActions ? <HiChevronUp className="size-4" /> : <HiChevronDown className="size-4" />}
        </button>
      </div>

      {showMobileActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
        >
          <button className="mb-1 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New Dispute
          </button>
          <button className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export Reports
          </button>
          <button className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            View Analytics
          </button>
        </motion.div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 lg:flex-row lg:gap-6"
    >
      {/* Left Column - Disputes List */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-3 md:p-4 lg:p-6">
          <div className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between md:block">
              <h3 className="text-base font-semibold md:text-lg">Recent Disputes</h3>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs hover:bg-gray-50 md:hidden"
                aria-label="Toggle sidebar"
              >
                <span>Stats</span>
                {showSidebar ? <HiChevronUp className="size-3" /> : <HiChevronDown className="size-3" />}
              </button>
            </div>
            <div className="flex-1 md:max-w-md">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search disputes..."
                className="w-full"
              />
            </div>
          </div>

          {/* Disputes List */}
          <div className="space-y-3 md:space-y-4">
            {disputes.map((dispute, index) => (
              <DisputeCard key={dispute.id} dispute={dispute} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Dispute Statistics */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full lg:w-80"
          >
            <div className="space-y-4 md:space-y-6">
              {/* Dispute Summary */}
              <StatCard
                title="Dispute Summary"
                items={[
                  { label: "Pending", value: "pending", color: "bg-yellow-500", count: 1 },
                  { label: "Under Review", value: "under-review", color: "bg-blue-500", count: 1 },
                  { label: "Resolved", value: "resolved", color: "bg-green-500", count: 1 },
                  { label: "Rejected", value: "rejected", color: "bg-red-500", count: 0 },
                ]}
              />

              {/* Priority Distribution */}
              <StatCard
                title="Priority Levels"
                items={[
                  { label: "Low", value: "low", color: "bg-green-500", count: 1 },
                  { label: "Medium", value: "medium", color: "bg-yellow-500", count: 1 },
                  { label: "High", value: "high", color: "bg-orange-500", count: 1 },
                  { label: "Critical", value: "critical", color: "bg-red-500", count: 0 },
                ]}
              />

              {/* Dispute Types */}
              <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">Dispute Types</h3>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600 md:text-sm">Double Charge</span>
                    <span className="text-xs font-semibold text-red-600 md:text-sm">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600 md:text-sm">Service Not Rendered</span>
                    <span className="text-xs font-semibold text-orange-600 md:text-sm">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600 md:text-sm">Incorrect Amount</span>
                    <span className="text-xs font-semibold text-blue-600 md:text-sm">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600 md:text-sm">Unauthorized</span>
                    <span className="text-xs font-semibold text-purple-600 md:text-sm">0</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg border border-gray-200 bg-white p-3 md:p-4 lg:p-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-900 md:text-base lg:text-lg">Recent Activity</h3>
                <div className="space-y-2 md:space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Last Submitted</span>
                      <span className="text-xs font-semibold text-blue-600 md:text-sm">16:45</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">Fatima Hassan - ₦425</p>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Last Resolved</span>
                      <span className="text-xs font-semibold text-green-600 md:text-sm">15:30</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">Michael Johnson - ₦320</p>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600 md:text-sm">Total Today</span>
                      <span className="text-xs font-semibold text-gray-600 md:text-sm">3</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">dispute submissions</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions - Desktop */}
              <div className="hidden md:block">
                <QuickActionsCard />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Quick Actions Button */}
      <MobileQuickActions />

      {/* Mobile Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-blue-700 lg:hidden"
        aria-label="Toggle sidebar"
      >
        <span>{showSidebar ? "Hide" : "Show"} Stats</span>
        {showSidebar ? <HiChevronUp className="size-4" /> : <HiChevronDown className="size-4" />}
      </button>
    </motion.div>
  )
}

export default RecentDisputes
