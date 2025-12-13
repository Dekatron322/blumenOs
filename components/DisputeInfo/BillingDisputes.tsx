import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { BillingDisputeData, getAllBillingDisputes, GetAllDisputesParams } from "lib/redux/billingDisputeSlice"
import { formatCurrency } from "utils/formatCurrency"

const BillingDisputes = () => {
  const dispatch = useAppDispatch()

  const [searchText, setSearchText] = useState("")
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const pageSize = 10

  const { loadingDisputes, disputes: apiDisputes, disputesError } = useAppSelector((state) => state.billingDispute)

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const formatDate = (value: string | null | undefined): string => {
    if (!value) return "-"
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  const mapStatus = (status: number): string => {
    switch (status) {
      case 0:
        return "pending"
      case 1:
        return "under-review"
      case 2:
        return "resolved"
      case 3:
        return "rejected"
      default:
        return "pending"
    }
  }

  const mapPriorityFromStatus = (status: number): string => {
    switch (status) {
      case 0:
        return "medium"
      case 1:
        return "high"
      case 2:
        return "low"
      case 3:
        return "critical"
      default:
        return "medium"
    }
  }

  const mapDisputeType = (_dispute: BillingDisputeData): string => {
    return "other"
  }

  const mapPaymentMethod = (payment?: { paymentTypeName: string }): string => {
    if (!payment) return "Bank Transfer"
    return payment.paymentTypeName || "Bank Transfer"
  }

  const mapBillingDisputeToCard = (dispute: BillingDisputeData) => {
    const firstPayment = dispute.payments && dispute.payments.length > 0 ? dispute.payments[0] : undefined

    const disputeAmountNumber = firstPayment?.overPaymentAmount ?? 0
    const originalAmountNumber = firstPayment?.billTotalDue ?? 0

    return {
      id: dispute.id,
      customerName: dispute.customerName,
      accountNumber: dispute.customerAccountNumber,
      disputeAmount: formatCurrency(disputeAmountNumber, "₦"),
      originalAmount: formatCurrency(originalAmountNumber, "₦"),
      status: mapStatus(dispute.status),
      disputeType: mapDisputeType(dispute),
      paymentMethod: mapPaymentMethod(firstPayment),
      reference: firstPayment?.reference || "-",
      timestamp: formatDate(firstPayment?.paidAtUtc || dispute.raisedAtUtc),
      submittedDate: formatDate(dispute.raisedAtUtc),
      dueDate: formatDate(dispute.resolvedAtUtc || dispute.raisedAtUtc),
      priority: mapPriorityFromStatus(dispute.status),
      assignedTo: dispute.raisedByName || "-",
      description: dispute.reason || dispute.details,
      resolution: dispute.resolutionNotes || undefined,
    }
  }

  const mappedDisputes = (apiDisputes || []).map(mapBillingDisputeToCard)

  const filteredDisputes = mappedDisputes.filter((d) => {
    if (!searchText) return true
    const q = searchText.toLowerCase()
    return (
      d.customerName.toLowerCase().includes(q) ||
      d.accountNumber.toLowerCase().includes(q) ||
      d.reference.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    )
  })

  const statusSummary = {
    pending: mappedDisputes.filter((d) => d.status === "pending").length,
    underReview: mappedDisputes.filter((d) => d.status === "under-review").length,
    resolved: mappedDisputes.filter((d) => d.status === "resolved").length,
    rejected: mappedDisputes.filter((d) => d.status === "rejected").length,
  }

  const prioritySummary = {
    low: mappedDisputes.filter((d) => d.priority === "low").length,
    medium: mappedDisputes.filter((d) => d.priority === "medium").length,
    high: mappedDisputes.filter((d) => d.priority === "high").length,
    critical: mappedDisputes.filter((d) => d.priority === "critical").length,
  }

  const typeSummary = {
    doubleCharge: mappedDisputes.filter((d) => d.disputeType === "double-charge").length,
    serviceNotRendered: mappedDisputes.filter((d) => d.disputeType === "service-not-rendered").length,
    incorrectAmount: mappedDisputes.filter((d) => d.disputeType === "incorrect-amount").length,
    unauthorized: mappedDisputes.filter((d) => d.disputeType === "unauthorized-transaction").length,
    other: mappedDisputes.filter((d) => d.disputeType === "other").length,
  }

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

  useEffect(() => {
    const params: GetAllDisputesParams = {
      PageNumber: 1,
      PageSize: pageSize,
    }

    dispatch(getAllBillingDisputes(params))
  }, [dispatch, pageSize])

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
          className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 sm:px-3 sm:text-sm"
        >
          {isMobile ? "⋮" : "Actions"}
        </button>

        {isDropdownOpen && selectedDispute?.id === dispute.id && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg sm:w-48"
          >
            <div className="py-1">
              <button
                onClick={() => handleDisputeAction(dispute, "view")}
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 sm:px-4 sm:text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => handleDisputeAction(dispute, "update")}
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 sm:px-4 sm:text-sm"
              >
                Update Status
              </button>
              <button
                onClick={() => handleDisputeAction(dispute, "assign")}
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 sm:px-4 sm:text-sm"
              >
                Assign to Agent
              </button>
              <button
                onClick={() => handleDisputeAction(dispute, "resolve")}
                className="block w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 sm:px-4 sm:text-sm"
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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".action-dropdown")) {
        setIsDropdownOpen(false)
        setSelectedDispute(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Mobile Dispute Card Component
  const MobileDisputeCard = ({ dispute }: { dispute: any }) => {
    return (
      <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Customer Info */}
            <div className="mb-3">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{dispute.customerName}</h4>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(dispute.status)}`}>
                  {dispute.status.replace("-", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-500">{dispute.accountNumber}</p>
            </div>

            {/* Amount and Priority */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-bold text-gray-900">{dispute.disputeAmount}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                {dispute.priority} priority
              </span>
            </div>

            {/* Dispute Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="mb-1 text-gray-500">Type:</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getDisputeTypeColor(dispute.disputeType)}`}
                >
                  {dispute.disputeType.replace("-", " ")}
                </span>
              </div>

              <div>
                <p className="mb-1 text-gray-500">Payment:</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getPaymentMethodColor(
                    dispute.paymentMethod
                  )}`}
                >
                  {dispute.paymentMethod}
                </span>
              </div>

              <div>
                <p className="mb-1 text-gray-500">Submitted:</p>
                <p className="font-medium text-gray-900">{dispute.submittedDate}</p>
              </div>

              <div>
                <p className="mb-1 text-gray-500">Due:</p>
                <p className="font-medium text-gray-900">{dispute.dueDate}</p>
              </div>

              <div className="col-span-2">
                <p className="mb-1 text-gray-500">Assigned To:</p>
                <p className="font-medium text-blue-600">{dispute.assignedTo}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <p className="mb-1 text-xs text-gray-500">Description:</p>
              <p className="line-clamp-2 text-xs text-gray-700">{dispute.description}</p>
            </div>

            {/* Resolution */}
            {dispute.resolution && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-gray-500">Resolution:</p>
                <p className="line-clamp-2 text-xs text-green-600">{dispute.resolution}</p>
              </div>
            )}
          </div>

          <div className="action-dropdown">
            <ActionDropdown dispute={dispute} />
          </div>
        </div>
      </div>
    )
  }

  // Desktop Dispute Row Component
  const DesktopDisputeRow = ({ dispute }: { dispute: any }) => {
    return (
      <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4 hover:shadow-sm">
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
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                {dispute.priority}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-gray-500">Dispute Type:</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getDisputeTypeColor(dispute.disputeType)}`}
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
    )
  }

  // Mobile Statistics Component
  const MobileStatistics = ({
    statusSummary,
    prioritySummary,
  }: {
    statusSummary: { pending: number; underReview: number; resolved: number; rejected: number }
    prioritySummary: { low: number; medium: number; high: number; critical: number }
  }) => (
    <div className="mt-6 space-y-4">
      {/* Dispute Summary Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-base font-semibold">Dispute Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Pending",
              count: statusSummary.pending,
              color: "bg-yellow-500",
              textColor: "text-yellow-600",
            },
            {
              label: "Under Review",
              count: statusSummary.underReview,
              color: "bg-blue-500",
              textColor: "text-blue-600",
            },
            {
              label: "Resolved",
              count: statusSummary.resolved,
              color: "bg-green-500",
              textColor: "text-green-600",
            },
            {
              label: "Rejected",
              count: statusSummary.rejected,
              color: "bg-red-500",
              textColor: "text-red-600",
            },
          ].map((item, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <p className={`mt-1 text-lg font-bold ${item.textColor}`}>{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Levels Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-base font-semibold">Priority Levels</h3>
        <div className="space-y-2">
          {[
            {
              label: "Low",
              count: prioritySummary.low,
              color: "bg-green-500",
              textColor: "text-green-600",
            },
            {
              label: "Medium",
              count: prioritySummary.medium,
              color: "bg-yellow-500",
              textColor: "text-yellow-600",
            },
            {
              label: "High",
              count: prioritySummary.high,
              color: "bg-orange-500",
              textColor: "text-orange-600",
            },
            {
              label: "Critical",
              count: prioritySummary.critical,
              color: "bg-red-500",
              textColor: "text-red-600",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className={`font-semibold ${item.textColor}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-base font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
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
  )

  // Desktop Statistics Component
  const DesktopStatistics = ({
    statusSummary,
    prioritySummary,
    typeSummary,
  }: {
    statusSummary: { pending: number; underReview: number; resolved: number; rejected: number }
    prioritySummary: { low: number; medium: number; high: number; critical: number }
    typeSummary: {
      doubleCharge: number
      serviceNotRendered: number
      incorrectAmount: number
      unauthorized: number
      other: number
    }
  }) => (
    <div className="space-y-6">
      {/* Dispute Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">Dispute Summary</h3>
        <div className="space-y-3 sm:space-y-4">
          {[
            {
              label: "Pending",
              count: statusSummary.pending,
              color: "bg-yellow-500",
            },
            {
              label: "Under Review",
              count: statusSummary.underReview,
              color: "bg-blue-500",
            },
            {
              label: "Resolved",
              count: statusSummary.resolved,
              color: "bg-green-500",
            },
            {
              label: "Rejected",
              count: statusSummary.rejected,
              color: "bg-red-500",
            },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`size-2 rounded-full sm:size-3 ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {item.count} dispute{item.count === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">Priority Levels</h3>
        <div className="space-y-2 sm:space-y-3">
          {[
            { label: "Low", count: prioritySummary.low, color: "bg-green-500" },
            { label: "Medium", count: prioritySummary.medium, color: "bg-yellow-500" },
            { label: "High", count: prioritySummary.high, color: "bg-orange-500" },
            { label: "Critical", count: prioritySummary.critical, color: "bg-red-500" },
          ].map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${item.color}`}></div>
                <span className="text-gray-600">{item.label}</span>
              </div>
              <span
                className={`font-semibold ${
                  item.label === "Low"
                    ? "text-green-600"
                    : item.label === "Medium"
                    ? "text-yellow-600"
                    : item.label === "High"
                    ? "text-orange-600"
                    : "text-red-600"
                }`}
              >
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dispute Types */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">Dispute Types</h3>
        <div className="space-y-2 sm:space-y-3">
          {[
            { label: "Double Charge", count: typeSummary.doubleCharge, color: "text-red-600" },
            { label: "Service Not Rendered", count: typeSummary.serviceNotRendered, color: "text-orange-600" },
            { label: "Incorrect Amount", count: typeSummary.incorrectAmount, color: "text-blue-600" },
            { label: "Unauthorized", count: typeSummary.unauthorized, color: "text-purple-600" },
          ].map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className={`font-semibold ${item.color}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">Recent Activity</h3>
        <div className="space-y-2 sm:space-y-3">
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
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">Quick Actions</h3>
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
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {loadingDisputes && (
        <div className="mb-4 rounded-lg border bg-white p-4 text-sm text-gray-600">Loading billing disputes...</div>
      )}
      {!loadingDisputes && disputesError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Error loading billing disputes: {disputesError}
        </div>
      )}
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="space-y-6">
          {/* Header and Search */}
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-4">
              <h3 className="mb-3 text-lg font-semibold">Billing Disputes</h3>
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
                placeholder="Search disputes..."
              />
            </div>

            {/* Disputes List - Mobile Cards */}
            <div className="space-y-4">
              {filteredDisputes.map((dispute) => (
                <MobileDisputeCard key={dispute.id} dispute={dispute} />
              ))}
              {!loadingDisputes && filteredDisputes.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">No disputes found</p>
              )}
            </div>
          </div>

          {/* Mobile Statistics */}
          <MobileStatistics statusSummary={statusSummary} prioritySummary={prioritySummary} />
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Column - Disputes List */}
          <div className="flex-1">
            <div className="rounded-lg border bg-white p-4 sm:p-6">
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold sm:text-xl">Billing Disputes</h3>
                <div className="max-w-md">
                  <SearchModule
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onCancel={handleCancelSearch}
                    placeholder="Search disputes..."
                  />
                </div>
              </div>

              {/* Disputes List */}
              <div className="space-y-4">
                {filteredDisputes.map((dispute) => (
                  <DesktopDisputeRow key={dispute.id} dispute={dispute} />
                ))}
                {!loadingDisputes && filteredDisputes.length === 0 && (
                  <p className="py-4 text-center text-sm text-gray-500">No disputes found</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Dispute Statistics */}
          <div className="w-full lg:w-80">
            <DesktopStatistics
              statusSummary={statusSummary}
              prioritySummary={prioritySummary}
              typeSummary={typeSummary}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default BillingDisputes
