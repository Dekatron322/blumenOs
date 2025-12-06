// src/components/DunningManagement/DunningManagement.tsx
import { ButtonModule } from "components/ui/Button/Button"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { fetchPaymentDunningCases, PaymentDunningCase } from "lib/redux/paymentDunningSlice"

const DunningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path
      d="M10 15C10.5523 15 11 14.5523 11 14C11 13.4477 10.5523 13 10 13C9.44772 13 9 13.4477 9 14C9 14.5523 9.44772 15 10 15Z"
      fill="currentColor"
    />
    <path
      d="M10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z"
      fill="currentColor"
    />
  </svg>
)

interface DunningStage {
  id: number
  title: string
  description: string
  customerCount: number
  actionText: string
  status: "warning" | "danger" | "critical" | "info"
  stage: "SoftReminder" | "HardReminder" | "FieldVisit" | "DisconnectionNotice"
  statusFilter: "Open" | "OnHold" | "Resolved" | "Cancelled" | null
}

interface DunningManagementProps {
  onSendSMS?: () => void
  onSendFinalNotices?: () => void
  onGenerateWorkOrders?: () => void
  onReviewPlans?: () => void
  onViewCases?: (stage: DunningStage) => void
}

const DunningManagement: React.FC<DunningManagementProps> = ({
  onSendSMS,
  onSendFinalNotices,
  onGenerateWorkOrders,
  onReviewPlans,
  onViewCases,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { dunningCases, loading, pagination } = useSelector((state: RootState) => state.paymentDunnings)

  const [dunningStages, setDunningStages] = useState<DunningStage[]>([
    {
      id: 1,
      title: "Soft Reminder",
      description: "Initial reminder stage",
      customerCount: 0,
      actionText: "View Cases",
      status: "warning",
      stage: "SoftReminder",
      statusFilter: "Open",
    },
    {
      id: 2,
      title: "Hard Reminder",
      description: "Stronger follow-up required",
      customerCount: 0,
      actionText: "View Cases",
      status: "danger",
      stage: "HardReminder",
      statusFilter: "Open",
    },
    {
      id: 3,
      title: "Field Visit",
      description: "Physical visit required",
      customerCount: 0,
      actionText: "View Cases",
      status: "critical",
      stage: "FieldVisit",
      statusFilter: "Open",
    },
    {
      id: 4,
      title: "Disconnection Notice",
      description: "Final notice before disconnection",
      customerCount: 0,
      actionText: "View Cases",
      status: "critical",
      stage: "DisconnectionNotice",
      statusFilter: "Open",
    },
    {
      id: 5,
      title: "On Hold Cases",
      description: "Cases temporarily paused",
      customerCount: 0,
      actionText: "View Cases",
      status: "info",
      stage: null as any,
      statusFilter: "OnHold",
    },
    {
      id: 6,
      title: "Resolved Cases",
      description: "Successfully completed cases",
      customerCount: 0,
      actionText: "View Cases",
      status: "info",
      stage: null as any,
      statusFilter: "Resolved",
    },
  ])

  // Fetch dunning cases on component mount
  useEffect(() => {
    const fetchAllDunningCases = async () => {
      try {
        await dispatch(
          fetchPaymentDunningCases({
            pageNumber: 1,
            pageSize: 1000, // Fetch a large number to get all cases for counting
          })
        ).unwrap()
      } catch (error) {
        console.error("Failed to fetch dunning cases:", error)
      }
    }

    fetchAllDunningCases()
  }, [dispatch])

  // Update stage counts when dunning cases change
  useEffect(() => {
    if (dunningCases.length > 0) {
      const updatedStages = dunningStages.map((stage) => {
        let count = 0

        if (stage.stage && stage.statusFilter) {
          // Filter by both stage and status
          count = dunningCases.filter(
            (caseItem) => caseItem.stage === stage.stage && caseItem.status === stage.statusFilter
          ).length
        } else if (stage.stage) {
          // Filter by stage only
          count = dunningCases.filter((caseItem) => caseItem.stage === stage.stage).length
        } else if (stage.statusFilter) {
          // Filter by status only
          count = dunningCases.filter((caseItem) => caseItem.status === stage.statusFilter).length
        }

        return {
          ...stage,
          customerCount: count,
        }
      })

      setDunningStages(updatedStages)
    }
  }, [dunningCases])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning":
        return "border-l-4 border-l-yellow-500"
      case "danger":
        return "border-l-4 border-l-orange-500"
      case "critical":
        return "border-l-4 border-l-red-500"
      case "info":
        return "border-l-4 border-l-blue-500"
      default:
        return "border-l-4 border-l-gray-500"
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "warning":
        return "text-yellow-600"
      case "danger":
        return "text-orange-600"
      case "critical":
        return "text-red-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "warning":
        return "bg-yellow-500"
      case "danger":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getButtonVariant = (status: string) => {
    switch (status) {
      case "warning":
        return "primary"
      case "danger":
        return "primary"
      case "critical":
        return "danger"
      case "info":
        return "primary"
      default:
        return "primary"
    }
  }

  const handleStageAction = (stage: DunningStage) => {
    if (onViewCases) {
      onViewCases(stage)
    } else {
      // Default behavior - log the action
      console.log(`Viewing cases for stage: ${stage.title}`, {
        stage: stage.stage,
        status: stage.statusFilter,
      })
    }
  }

  const totalCustomers = dunningStages.reduce((total, stage) => total + stage.customerCount, 0)

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DunningIcon />
          <h2 className="text-xl font-semibold">Payment Dunning Management</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total Cases: <span className="font-semibold text-gray-800">{totalCustomers.toLocaleString()}</span>
          </div>
          {loading && <div className="text-sm text-blue-500">Loading...</div>}
        </div>
      </div>

      {/* Dunning Stages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dunningStages.map((stage) => (
          <div key={stage.id} className="rounded-lg border bg-[#F9F9F9] p-6 shadow-sm transition-all hover:shadow-md">
            {/* Stage Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
              <p className={`text-sm font-medium ${getStatusTextColor(stage.status)}`}>{stage.description}</p>
            </div>

            {/* Customer Count */}
            <div className="mb-6">
              <div className="text-2xl font-bold text-gray-900">{stage.customerCount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">cases</div>
            </div>

            {/* Action Button */}
            <ButtonModule
              variant={getButtonVariant(stage.status)}
              size="md"
              onClick={() => handleStageAction(stage)}
              className="w-full"
              disabled={stage.customerCount === 0}
            >
              {stage.actionText}
            </ButtonModule>

            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-700">
                  {totalCustomers > 0 ? Math.round((stage.customerCount / totalCustomers) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${getStatusBgColor(stage.status)}`}
                  style={{
                    width: `${totalCustomers > 0 ? (stage.customerCount / totalCustomers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Stage Details */}
            <div className="mt-3 text-xs text-gray-500">
              {stage.stage && <div>Stage: {stage.stage}</div>}
              {stage.statusFilter && <div>Status: {stage.statusFilter}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {dunningStages.filter((s) => s.statusFilter === "Open").reduce((total, s) => total + s.customerCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Open Cases</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {dunningStages.filter((s) => s.statusFilter === "OnHold").reduce((total, s) => total + s.customerCount, 0)}
          </div>
          <div className="text-sm text-gray-600">On Hold</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {dunningStages
              .filter((s) => s.statusFilter === "Resolved")
              .reduce((total, s) => total + s.customerCount, 0)}
          </div>
          <div className="text-sm text-gray-600">Resolved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {dunningCases.filter((c) => c.status === "Cancelled").length}
          </div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
      </div>
    </div>
  )
}

export default DunningManagement
