import React from "react"

const TariffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M5 7H15V9H5V7ZM5 11H15V13H5V11ZM5 15H11V17H5V15Z" fill="currentColor" />
  </svg>
)

interface TariffPlan {
  id: number
  name: string
  residential: string
  commercial: string
  industrial: string
  status: "Active" | "Draft" | "Inactive"
}

interface TariffManagementProps {
  onCreateNewTariff?: () => void
  onEditTariff?: (tariff: TariffPlan) => void
  onViewDetails?: (tariff: TariffPlan) => void
}

const TariffManagement: React.FC<TariffManagementProps> = ({ onCreateNewTariff, onEditTariff, onViewDetails }) => {
  const tariffPlans: TariffPlan[] = [
    { id: 1, name: "Band A", residential: "₦68", commercial: "₦125", industrial: "₦155", status: "Active" },
    { id: 2, name: "Band B", residential: "₦92.5", commercial: "₦142.5", industrial: "₦185", status: "Active" },
    { id: 3, name: "Band C", residential: "₦118", commercial: "₦168", industrial: "₦220", status: "Active" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tariff Plans</h3>
        <button
          onClick={onCreateNewTariff}
          className="rounded-md bg-[#004B23] px-4 py-2 text-sm text-white hover:bg-[#000000]"
        >
          Create New Tariff
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tariffPlans.map((tariff) => (
          <div key={tariff.id} className="rounded-lg border bg-white p-4 transition-colors hover:border-gray-300">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{tariff.name}</h4>
              <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(tariff.status)}`}>{tariff.status}</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Residential:</span>
                <span className="font-medium">{tariff.residential}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Commercial:</span>
                <span className="font-medium">{tariff.commercial}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Industrial:</span>
                <span className="font-medium">{tariff.industrial}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onEditTariff?.(tariff)}
                className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => onViewDetails?.(tariff)}
                className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TariffManagement
