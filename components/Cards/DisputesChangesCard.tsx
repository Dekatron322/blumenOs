"use client"

import { motion } from "framer-motion"
import { TamperIcon } from "components/Icons/Icons"

interface DisputesChangesCardProps {
  billingDisputesRaised: number
  billingDisputesResolved: number
  changeRequestsRaised: number
  changeRequestsResolved: number
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const DisputesChangesCard = ({
  billingDisputesRaised,
  billingDisputesResolved,
  changeRequestsRaised,
  changeRequestsResolved,
}: DisputesChangesCardProps) => {
  const billingDisputeRate =
    billingDisputesRaised > 0 ? Math.round((billingDisputesResolved / billingDisputesRaised) * 100) : 100

  const changeRequestRate =
    changeRequestsRaised > 0 ? Math.round((changeRequestsResolved / changeRequestsRaised) * 100) : 100

  return (
    <motion.div className="mt-6 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-500 hover:shadow-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 shadow-sm">
            <TamperIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Disputes & Changes</h3>
            <p className="text-sm text-gray-500">Track resolution progress</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Side by side sections */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Billing Disputes Section */}
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-semibold text-gray-700">Billing Disputes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                  {billingDisputeRate}% resolved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(billingDisputesRaised)}</p>
                <p className="mt-1 text-xs text-gray-600">Raised</p>
              </div>
              <div className="border-l border-blue-200 text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(billingDisputesResolved)}</p>
                <p className="mt-1 text-xs text-gray-600">Resolved</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${billingDisputeRate}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Change Requests Section */}
          <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm font-semibold text-gray-700">Change Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-600">
                  {changeRequestRate}% resolved
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(changeRequestsRaised)}</p>
                <p className="mt-1 text-xs text-gray-600">Raised</p>
              </div>
              <div className="border-l border-purple-200 text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(changeRequestsResolved)}</p>
                <p className="mt-1 text-xs text-gray-600">Resolved</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${changeRequestRate}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-2">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Issues</p>
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(billingDisputesRaised + changeRequestsRaised)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Resolved</p>
            <p className="text-lg font-bold text-green-600">
              {formatNumber(billingDisputesResolved + changeRequestsResolved)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Overall Rate</p>
            <p className="text-lg font-bold text-blue-600">
              {Math.round(
                ((billingDisputesResolved + changeRequestsResolved) /
                  (billingDisputesRaised + changeRequestsRaised || 1)) *
                  100
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default DisputesChangesCard
