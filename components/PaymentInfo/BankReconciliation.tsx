import React from "react"

const BankReconciliationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M5 7H15V9H5V7ZM5 11H12V13H5V11ZM5 15H9V17H5V15ZM14 11L17 14L14 17V11Z" fill="currentColor" />
  </svg>
)

interface ReconciliationStats {
  reconciledToday: string
  pendingMatch: string
  unmatchedItems: string
  bankCredits: {
    amount: string
    transactions: number
  }
  systemRecords: {
    amount: string
    transactions: number
  }
}

interface BankReconciliationProps {
  onViewDetails?: () => void
  onReconcileNow?: () => void
  onExportReport?: () => void
}

const BankReconciliation: React.FC<BankReconciliationProps> = ({ onViewDetails, onReconcileNow, onExportReport }) => {
  const reconciliationData: ReconciliationStats = {
    reconciledToday: "₦248.5M",
    pendingMatch: "₦2.1M",
    unmatchedItems: "₦450K",
    bankCredits: {
      amount: "₦251.1M",
      transactions: 2845,
    },
    systemRecords: {
      amount: "₦250.6M",
      transactions: 2830,
    },
  }

  return (
    <div className="space-y-6 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BankReconciliationIcon />
          <h2 className="text-xl font-semibold">Bank Reconciliation</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExportReport}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Export Report
          </button>
          <button
            onClick={onReconcileNow}
            className="rounded-md bg-[#0a0a0a] px-4 py-2 text-sm text-white hover:bg-[#000000]"
          >
            Reconcile Now
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Reconciled Today */}
        <div className="rounded-lg border bg-[#F9F9F9] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Reconciled Today</h3>
            <div className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Completed</div>
          </div>
          <p className="mt-2 text-2xl font-bold">{reconciliationData.reconciledToday}</p>
        </div>

        {/* Pending Match */}
        <div className="rounded-lg border bg-[#F9F9F9] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Pending Match</h3>
            <div className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Processing</div>
          </div>
          <p className="mt-2 text-2xl font-bold">{reconciliationData.pendingMatch}</p>
        </div>

        {/* Unmatched Items */}
        <div className="rounded-lg border bg-[#F9F9F9] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Unmatched Items</h3>
            <div className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Attention needed</div>
          </div>
          <p className="mt-2 text-2xl font-bold">{reconciliationData.unmatchedItems}</p>
        </div>
      </div>

      {/* Today's Reconciliation Summary */}
      <div className="rounded-lg border bg-[#F9F9F9] p-6">
        <h3 className="mb-4 text-lg font-semibold">Today&apos;s Reconciliation Summary</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bank Credits */}
          <div className="space-y-4 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">Bank Credits</h4>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Bank Side</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold">{reconciliationData.bankCredits.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transactions:</span>
                <span className="font-semibold">{reconciliationData.bankCredits.transactions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* System Records */}
          <div className="space-y-4 rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-700">System Records</h4>
              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">System Side</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold">{reconciliationData.systemRecords.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transactions:</span>
                <span className="font-semibold">{reconciliationData.systemRecords.transactions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid gap-4 border-t pt-4 md:grid-cols-3">
          <div className="text-center">
            <div className="text-sm text-gray-500">Difference</div>
            <div className="text-lg font-semibold text-orange-600">₦500K</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Match Rate</div>
            <div className="text-lg font-semibold text-green-600">99.2%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Discrepancies</div>
            <div className="text-lg font-semibold text-red-600">15 items</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankReconciliation
