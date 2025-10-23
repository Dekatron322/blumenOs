import React from "react"
import { motion } from "framer-motion"
import { MapIcon, PostpaidIcon, RateIcon, UserIcon } from "components/Icons/Icons"

const Commissions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-6"
    >
      {/* Left Column - Commission Summary */}
      <div className="flex-1">
        <div className="rounded-lg border bg-white p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Commission Summary - January 2024</h3>
          </div>

          {/* Commission Overview Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Total Commissions */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <RateIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Commissions</p>
                  <p className="text-xl font-semibold text-gray-900">₦2.84M</p>
                </div>
              </div>
            </div>

            {/* Paid Out */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2">
                  <PostpaidIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paid Out</p>
                  <p className="text-xl font-semibold text-gray-900">₦2.12M</p>
                </div>
              </div>
            </div>

            {/* Pending Payment */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <PostpaidIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payment</p>
                  <p className="text-xl font-semibold text-gray-900">₦720K</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Commissions List */}
          <div className="space-y-4">
            {/* Agent 1 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <UserIcon />
                      <h4 className="font-semibold text-gray-900">Tunde Bakare</h4>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MapIcon />
                      <p className="text-sm text-gray-600">Lagos Island</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦1,062.5</p>
                  <div className="flex items-center gap-1">
                    <RateIcon />
                    <p className="text-sm text-gray-500">2.5% rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <UserIcon />
                      <h4 className="font-semibold text-gray-900">Amina Abdullahi</h4>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MapIcon />
                      <p className="text-sm text-gray-600">Ikeja</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦1,037.5</p>
                  <div className="flex items-center gap-1">
                    <RateIcon />
                    <p className="text-sm text-gray-500">2.5% rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm">
              <div className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <UserIcon />
                      <h4 className="font-semibold text-gray-900">Emeka Okonkwo</h4>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MapIcon />
                      <p className="text-sm text-gray-600">Surulere</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦745</p>
                  <div className="flex items-center gap-1">
                    <RateIcon />
                    <p className="text-sm text-gray-500">2% rate</p>
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

export default Commissions
