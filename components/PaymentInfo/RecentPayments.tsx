import React, { useState } from "react"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"

const RecentPayments = () => {
  const [searchText, setSearchText] = useState("")

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const payments = [
    {
      name: "Fatima Hassan",
      accountNumber: "2301567890",
      amount: "₦425",
      status: "successful",
      paymentMethod: "Bank Transfer",
      reference: "TXN789456123",
      timestamp: "2024-01-15 16:45",
      appliedTo: "BILL-2024-003421",
    },
    {
      name: "John Adebayo",
      accountNumber: "2301456789",
      amount: "₦250",
      status: "successful",
      paymentMethod: "Mobile Money",
      reference: "MM987654321",
      timestamp: "2024-01-15 16:30",
    },
    {
      name: "Grace Okonkwo",
      accountNumber: "2301678901",
      amount: "₦187",
      status: "pending",
      paymentMethod: "POS Agent",
      reference: "POS456789012",
      timestamp: "2024-01-15 16:15",
      appliedTo: "BILL-2024-003423",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
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
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Payments List */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold">Recent Payments</h3>
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search payments..."
            />
          </div>

          {/* Payments List */}
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{payment.name}</h4>
                      <span className="text-sm text-gray-500">{payment.accountNumber}</span>
                    </div>

                    <div className="mb-3 flex items-center gap-3">
                      <p className="text-xl font-bold text-gray-900">{payment.amount}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="mb-1 text-gray-500">Payment Method:</p>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getPaymentMethodColor(
                            payment.paymentMethod
                          )}`}
                        >
                          {payment.paymentMethod}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Reference:</p>
                        <p className="font-medium text-gray-900">{payment.reference}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-gray-500">Timestamp:</p>
                        <p className="font-medium text-gray-900">{payment.timestamp}</p>
                      </div>

                      {payment.appliedTo && (
                        <div>
                          <p className="mb-1 text-gray-500">Applied to:</p>
                          <p className="font-medium text-blue-600">{payment.appliedTo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Payment Statistics */}
      <div className="w-80">
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Payment Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">Successful</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">2 payments</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">1 payment</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700">Failed</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">0 payments</span>
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Today&apos;s Revenue</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">₦862</div>
              <p className="mt-2 text-sm text-gray-600">Total collected today</p>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: "78%" }}></div>
                </div>
                <p className="mt-2 text-sm font-medium text-green-600">78% Success Rate</p>
              </div>
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bank Transfer</span>
                <span className="font-semibold text-blue-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mobile Money</span>
                <span className="font-semibold text-purple-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">POS Agent</span>
                <span className="font-semibold text-orange-600">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Card Payment</span>
                <span className="font-semibold text-gray-600">0</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Successful</span>
                  <span className="font-semibold text-green-600">16:45</span>
                </div>
                <p className="text-xs text-gray-500">Fatima Hassan - ₦425</p>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Pending</span>
                  <span className="font-semibold text-yellow-600">16:15</span>
                </div>
                <p className="text-xs text-gray-500">Grace Okonkwo - ₦187</p>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Today</span>
                  <span className="font-semibold text-blue-600">3</span>
                </div>
                <p className="text-xs text-gray-500">payment transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RecentPayments
