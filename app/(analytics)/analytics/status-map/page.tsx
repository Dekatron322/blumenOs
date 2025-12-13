"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MetersProgrammedIcon, TamperIcon, TokenGeneratedIcon, VendingIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import StatusMapInfo from "components/StatusMapInfo/StatusMapInfo"

export default function StatusMapDashboard() {
  const [isLoading] = useState(false)

  // Mock data matching the image
  const metricsData = {
    paymentRate: {
      percentage: "21.5%",
      paid: 43,
      unpaid: 53,
    },
    totalCollections: {
      amount: "₦640,712",
      customers: 200,
    },
    missingLocation: {
      count: 0,
      label: "Needs geocoding",
    },
    networkOutages: {
      count: 5,
      label: "Assets offline",
    },
  }

  return (
    <section className="relative z-0 size-full xl:z-auto">
      <div className="relative z-0 flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-50 pb-20 xl:z-auto">
        <div className="relative z-0 flex w-full flex-col xl:z-auto">
          <DashboardNav />
          <div className="relative z-0 mx-auto flex w-full flex-col px-3 2xl:container xl:px-16 xl:z-auto">
            {/* Page Header */}
            <div className="relative z-0 flex w-full justify-between gap-6 max-md:flex-col max-sm:my-4 md:my-8 xl:z-auto">
              <div>
                <h4 className="text-2xl font-semibold">Status Map</h4>
                <p>Visualize customer and asset status across the network</p>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-0 flex w-full gap-6 max-md:flex-col max-sm:my-4 xl:z-auto">
              <div className="relative z-0 w-full xl:z-auto">
                {isLoading ? (
                  // Loading State
                  <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="small-card rounded-md bg-white p-4 transition duration-500 md:border">
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="size-6 rounded-full bg-gray-200"></div>
                          <div className="h-4 w-32 rounded bg-gray-200"></div>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="h-8 w-24 rounded bg-gray-200"></div>
                          <div className="h-4 w-32 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Loaded State
                  <>
                    {/* Top Metrics Cards */}
                    <motion.div
                      className="relative z-0 mb-6 flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1 xl:z-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Payment Rate Card */}
                      {/* <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-blue-600">
                            <TokenGeneratedIcon />
                          </div>
                          <span className="font-medium">Payment Rate</span>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Rate:</p>
                            <p className="text-secondary text-xl font-bold">{metricsData.paymentRate.percentage}</p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Breakdown:</p>
                            <p className="text-secondary font-medium">
                              {metricsData.paymentRate.paid} paid / {metricsData.paymentRate.unpaid} unpaid
                            </p>
                          </div>
                        </div>
                      </motion.div> */}

                      {/* Total Collections Card */}
                      {/* <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-green-600">
                            <MetersProgrammedIcon />
                          </div>
                          <span className="font-medium">Total Collections</span>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Amount:</p>
                            <p className="text-secondary text-xl font-bold">{metricsData.totalCollections.amount}</p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Customers:</p>
                            <p className="text-secondary font-medium">
                              {metricsData.totalCollections.customers} customers
                            </p>
                          </div>
                        </div>
                      </motion.div> */}

                      {/* Missing Location Card */}
                      {/* <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-orange-600">
                            <VendingIcon />
                          </div>
                          <span className="font-medium">Missing Location</span>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Count:</p>
                            <p className="text-secondary text-xl font-bold">{metricsData.missingLocation.count}</p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Status:</p>
                            <p className="text-secondary font-medium">{metricsData.missingLocation.label}</p>
                          </div>
                        </div>
                      </motion.div> */}

                      {/* Network Outages Card */}
                      {/* <motion.div
                        className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      >
                        <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                          <div className="text-red-600">
                            <TamperIcon />
                          </div>
                          <span className="font-medium">Network Outages</span>
                        </div>
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Count:</p>
                            <p className="text-secondary text-xl font-bold">{metricsData.networkOutages.count}</p>
                          </div>
                          <div className="flex w-full justify-between">
                            <p className="text-grey-200">Status:</p>
                            <p className="text-secondary font-medium">{metricsData.networkOutages.label}</p>
                          </div>
                        </div>
                      </motion.div> */}
                    </motion.div>

                    {/* Status Map Info Component */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="relative z-0 xl:z-auto"
                    >
                      <StatusMapInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
