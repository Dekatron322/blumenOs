import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"

const PaymentDisputes = () => {
  const [searchText, setSearchText] = useState("")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

    // Handle different actions
    switch (action) {
      case "view":
        // Navigate to dispute details
        break
      case "update":
        // Open update modal
        break
      case "assign":
        // Open assignment modal
        break
      case "resolve":
        // Open resolution modal
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
          className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Actions
        </button>

        {isDropdownOpen && selectedDispute?.id === dispute.id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg"
          >
            <div className="py-1">
              <button
                onClick={() => handleDisputeAction(dispute, "view")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                View Details
              </button>
              <button
                onClick={() => handleDisputeAction(dispute, "update")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Update Status
              </button>
              <button
                onClick={() => handleDisputeAction(dispute, "assign")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Assign to Agent
              </button>
              <button
                onClick={() => handleDisputeAction(dispute, "resolve")}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Mark Resolved
              </button>
            </div>
          </motion.div>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Disputes List */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Recent Disputes</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search disputes..."
            />
          </div>

          {/* Disputes List */}
          <div className="space-y-4">
            {disputes.map((dispute, index) => (
              <div key={dispute.id} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{dispute.customerName}</h4>
                      <span className="text-sm text-gray-500">{dispute.accountNumber}</span>
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <p className="text-xl font-bold text-gray-900">{dispute.disputeAmount}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status.replace("-", " ")}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(dispute.priority)}`}
                      >
                        {dispute.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="mb-1 text-gray-500">Dispute Type:</p>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getDisputeTypeColor(
                            dispute.disputeType
                          )}`}
                        >
                          {dispute.disputeType.replace("-", " ")}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Payment Method:</p>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getPaymentMethodColor(
                            dispute.paymentMethod
                          )}`}
                        >
                          {dispute.paymentMethod}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Reference:</p>
                        <p className="font-medium text-gray-900">{dispute.reference}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Submitted:</p>
                        <p className="font-medium text-gray-900">{dispute.submittedDate}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Due Date:</p>
                        <p className="font-medium text-gray-900">{dispute.dueDate}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Assigned To:</p>
                        <p className="font-medium text-blue-600">{dispute.assignedTo}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="mb-1 text-sm text-gray-500">Description:</p>
                      <p className="text-sm text-gray-700">{dispute.description}</p>
                    </div>

                    {dispute.resolution && (
                      <div className="mt-2">
                        <p className="mb-1 text-sm text-gray-500">Resolution:</p>
                        <p className="text-sm text-green-600">{dispute.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="action-dropdown">
                    <ActionDropdown dispute={dispute} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Dispute Statistics */}
      <div className="w-80">
        <div className="space-y-6">
          {/* Dispute Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Dispute Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">1 dispute</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-700">Under Review</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">1 dispute</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Resolved</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">1 dispute</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">0 disputes</span>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Priority Levels</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Low</span>
                </div>
                <span className="font-semibold text-green-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Medium</span>
                </div>
                <span className="font-semibold text-yellow-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600">High</span>
                </div>
                <span className="font-semibold text-orange-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Critical</span>
                </div>
                <span className="font-semibold text-red-600">0</span>
              </div>
            </div>
          </div>

          {/* Dispute Types */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Dispute Types</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Double Charge</span>
                <span className="font-semibold text-red-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Not Rendered</span>
                <span className="font-semibold text-orange-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incorrect Amount</span>
                <span className="font-semibold text-blue-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unauthorized</span>
                <span className="font-semibold text-purple-600">0</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Submitted</span>
                  <span className="font-semibold text-blue-600">16:45</span>
                </div>
                <p className="text-xs text-gray-500">Fatima Hassan - ₦425</p>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Resolved</span>
                  <span className="font-semibold text-green-600">15:30</span>
                </div>
                <p className="text-xs text-gray-500">Michael Johnson - ₦320</p>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Today</span>
                  <span className="font-semibold text-gray-600">3</span>
                </div>
                <p className="text-xs text-gray-500">dispute submissions</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                New Dispute
              </button>
              <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Export Reports
              </button>
              <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PaymentDisputes
