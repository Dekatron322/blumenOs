import React from "react"
import { motion } from "framer-motion"
import {
  CollectionIcon,
  DateIcon,
  ExportIcon,
  GenerateListIcon,
  GeneratePaymentIcon,
  MobileMoneyIcon,
  SmsIcon,
} from "components/Icons/Icons"
import CustomerIcon from "public/customer-icon"

type ColorKey = "green" | "blue" | "yellow" | "red"

const COLORS: Record<ColorKey, { bg: string; border: string; text: string; accent: string; progress: string }> = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    accent: "text-green-600",
    progress: "bg-green-500",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "text-blue-600",
    progress: "bg-blue-500",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    accent: "text-yellow-600",
    progress: "bg-yellow-500",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    accent: "text-red-600",
    progress: "bg-red-500",
  },
}

const ReceiveableAging = () => {
  const agingData = [
    {
      period: "Current (0-30 days)",
      accounts: "12,840",
      amount: "₦8,450,000",
      average: "₦658.09",
      color: "green",
      percentage: "65%",
    },
    {
      period: "31-60 days",
      accounts: "8,920",
      amount: "₦5,200,000",
      average: "₦582.95",
      color: "blue",
      percentage: "45%",
    },
    {
      period: "61-90 days",
      accounts: "6,450",
      amount: "₦3,850,000",
      average: "₦596.89",
      color: "yellow",
      percentage: "32%",
    },
    {
      period: "90+ days",
      accounts: "18,450",
      amount: "₦10,900,000",
      average: "₦590.78",
      color: "red",
      percentage: "18%",
    },
  ]

  const collectionActions = [
    {
      icon: <SmsIcon />,
      title: "Send Payment Reminders",
      description: "Send automated reminders to customers with outstanding balances",
    },
    {
      icon: <GenerateListIcon />,
      title: "Generate Disconnection List",
      description: "Create list of accounts eligible for service disconnection",
    },
    {
      icon: <ExportIcon />,
      title: "Export Aging Report",
      description: "Download detailed aging report for analysis",
    },
    {
      icon: <GeneratePaymentIcon />,
      title: "Process Payment Plans",
      description: "Set up installment plans for customers in arrears",
    },
  ]

  const getColorClasses = (color: string) => {
    if (color in COLORS) {
      return COLORS[color as ColorKey]
    }
    return COLORS.green
  }

  const stats = {
    totalAccounts: "46,660",
    totalAmount: "₦28,400,000",
    averageAge: "47 days",
    collectionRate: "78.2%",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex gap-6">
        {/* Left Column - Aging Summary */}
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Accounts Receivable Aging</h3>
              <p className="text-sm text-gray-600">Breakdown of outstanding balances by aging period</p>
            </div>

            <div className="space-y-4">
              {agingData.map((item, index) => {
                const color = getColorClasses(item.color)
                return (
                  <div
                    key={index}
                    className={`rounded-lg border ${color.border} ${color.bg} p-4 transition-all duration-200 hover:shadow-sm`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className={`font-semibold ${color.text}`}>{item.period}</h4>
                      <span className="text-sm font-medium text-gray-500">{item.percentage} collected</span>
                    </div>

                    <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <p className="mb-1 text-sm text-gray-600">Accounts</p>
                        <p className="text-lg font-bold text-gray-900">{item.accounts}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-600">Amount</p>
                        <p className="text-lg font-bold text-gray-900">{item.amount}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-600">Average</p>
                        <p className="text-lg font-bold text-gray-900">{item.average}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className={`h-2 rounded-full ${color.progress}`} style={{ width: item.percentage }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Collection Actions */}
        <div className="w-80">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Collection Actions</h3>
            <div className="space-y-4">
              {collectionActions.map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-lg border-[#0a0a0a]  bg-[#f3f4f6] p-4 text-left transition-all duration-200 hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div>{action.icon}</div>
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold text-gray-900">{action.title}</h4>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="mb-3 font-semibold text-gray-900">Collection Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-semibold text-green-600">₦4.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="text-sm font-semibold text-gray-900">₦3.8M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target</span>
                  <span className="text-sm font-semibold text-blue-600">₦5.0M</span>
                </div>
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Monthly Progress</span>
                    <span>84%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: "84%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ReceiveableAging
