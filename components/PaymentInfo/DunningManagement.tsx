import { ButtonModule } from "components/ui/Button/Button"
import React from "react"

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
}

interface DunningManagementProps {
  onSendSMS?: () => void
  onSendFinalNotices?: () => void
  onGenerateWorkOrders?: () => void
  onReviewPlans?: () => void
}

const DunningManagement: React.FC<DunningManagementProps> = ({
  onSendSMS,
  onSendFinalNotices,
  onGenerateWorkOrders,
  onReviewPlans,
}) => {
  const dunningStages: DunningStage[] = [
    {
      id: 1,
      title: "Reminder Level 1",
      description: "15-30 days overdue",
      customerCount: 4250,
      actionText: "Send SMS Reminders",
      status: "warning",
    },
    {
      id: 2,
      title: "Final Notice",
      description: "60+ days overdue",
      customerCount: 1840,
      actionText: "Send Final Notices",
      status: "danger",
    },
    {
      id: 3,
      title: "Disconnection Queue",
      description: "Ready for disconnection",
      customerCount: 980,
      actionText: "Generate Work Orders",
      status: "critical",
    },
    {
      id: 4,
      title: "Payment Plans",
      description: "Active installment plans",
      customerCount: 2156,
      actionText: "Review Plans",
      status: "info",
    },
  ]

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

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DunningIcon />
          <h2 className="text-xl font-semibold">Dunning Management</h2>
        </div>
        <div className="text-sm text-gray-500">
          Total Customers in Process:{" "}
          <span className="font-semibold text-gray-800">
            {dunningStages.reduce((total, stage) => total + stage.customerCount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dunning Stages Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dunningStages.map((stage) => (
          <div key={stage.id} className="rounded-lg border bg-[#F9F9F9] p-6 shadow-sm transition-all hover:shadow-md ">
            {/* Stage Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
              <p className={`text-sm font-medium ${getStatusTextColor(stage.status)}`}>{stage.description}</p>
            </div>

            {/* Customer Count */}
            <div className="mb-6">
              <div className="text-2xl font-bold text-gray-900">{stage.customerCount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">customers</div>
            </div>

            {/* Action Button */}
            <ButtonModule
              variant={getButtonVariant(stage.status)}
              size="md"
              onClick={() => {
                switch (stage.id) {
                  case 1:
                    onSendSMS?.()
                    break
                  case 2:
                    onSendFinalNotices?.()
                    break
                  case 3:
                    onGenerateWorkOrders?.()
                    break
                  case 4:
                    onReviewPlans?.()
                    break
                }
              }}
              className="w-full"
            >
              {stage.actionText}
            </ButtonModule>

            {/* Progress Indicator */}
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-700">
                  {Math.round(
                    (stage.customerCount / dunningStages.reduce((total, s) => total + s.customerCount, 0)) * 100
                  )}
                  %
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${getStatusBgColor(stage.status)}`}
                  style={{
                    width: `${
                      (stage.customerCount / dunningStages.reduce((total, s) => total + s.customerCount, 0)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DunningManagement
