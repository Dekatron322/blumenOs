"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { VscEye } from "react-icons/vsc"
import { ButtonModule } from "components/ui/Button/Button"
import { BillsIdIcon, CategoryIcon, CycleIcon, DateIcon, RevenueGeneratedIcon } from "components/Icons/Icons"
import PdfFile from "public/pdf-file"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchMeterReadings, MeterReading } from "lib/redux/meterReadingSlice"

interface MeterReadingsProps {
  onExport?: () => void
  onGenerateBills?: () => void
  onViewDetails?: (reading: MeterReading) => void
}

const MeterReadings: React.FC<MeterReadingsProps> = ({ onExport, onGenerateBills, onViewDetails }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { meterReadings, meterReadingsLoading, meterReadingsError } = useAppSelector((state) => state.meterReadings)

  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    void dispatch(
      fetchMeterReadings({
        pageNumber: 1,
        pageSize: 10,
      })
    )
  }, [dispatch])

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleViewDetails = (reading: MeterReading) => {
    // Navigate to the meter reading details page
    router.push(`/billing/meter-readings/details/${reading.id}`)
    onViewDetails?.(reading)
  }

  const filteredReadings = meterReadings.filter((reading) => {
    if (!searchText.trim()) return true
    const query = searchText.toLowerCase()
    return (
      reading.customerName.toLowerCase().includes(query) ||
      reading.customerAccountNumber.toLowerCase().includes(query) ||
      reading.period.toLowerCase().includes(query) ||
      reading.id.toString().toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-6"
      >
        {/* Left Column - Meter Readings */}
        <div className="flex-1">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Meter Readings</h3>
              <div className="flex gap-2">
                <ButtonModule icon={<PdfFile />} variant="outline" size="md" onClick={onExport}>
                  Export
                </ButtonModule>
                <ButtonModule variant="primary" size="md" onClick={onGenerateBills}>
                  Generate Bills
                </ButtonModule>
              </div>
            </div>

            <div className="mb-6">
              <SearchModule
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onCancel={handleCancelSearch}
              />
            </div>

            {/* Meter Readings List */}
            <div className="space-y-4">
              {meterReadingsLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((skeleton) => (
                    <div key={skeleton} className="animate-pulse rounded-lg border border-gray-200 bg-[#f9f9f9] p-4">
                      <div className="flex w-full items-start justify-between gap-3">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-32 rounded bg-gray-200" />
                            <div className="h-5 w-20 rounded-full bg-gray-200" />
                          </div>

                          <div className="size-40 rounded bg-gray-200" />
                          <div className="flex items-center gap-2">
                            <div className="size-4 rounded-full bg-gray-200" />
                            <div className="h-4 w-56 rounded bg-gray-200" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="space-y-1 text-right">
                            <div className="h-3 w-28 rounded bg-gray-200" />
                            <div className="h-3 w-32 rounded bg-gray-200" />
                            <div className="h-4 w-36 rounded bg-gray-200" />
                          </div>
                          <div className="h-8 w-24 rounded-md border border-gray-200 bg-white" />
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                        <div className="flex gap-2">
                          <div className="size-5 rounded-full bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-3 w-16 rounded bg-gray-200" />
                            <div className="h-4 w-20 rounded bg-gray-200" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="size-5 rounded-full bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-3 w-20 rounded bg-gray-200" />
                            <div className="h-4 w-16 rounded bg-gray-200" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="size-5 rounded-full bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-3 w-14 rounded bg-gray-200" />
                            <div className="h-4 w-10 rounded bg-gray-200" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="size-5 rounded-full bg-gray-200" />
                          <div className="space-y-1">
                            <div className="h-3 w-24 rounded bg-gray-200" />
                            <div className="h-4 w-16 rounded bg-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!meterReadingsLoading && meterReadingsError && (
                <p className="text-sm text-red-500">Error loading meter readings: {meterReadingsError}</p>
              )}
              {!meterReadingsLoading && !meterReadingsError && filteredReadings.length === 0 && (
                <p className="text-sm text-gray-500">No meter readings found.</p>
              )}
              {!meterReadingsLoading &&
                !meterReadingsError &&
                filteredReadings.map((reading) => {
                  return (
                    <motion.div
                      key={reading.id}
                      className="rounded-lg border border-gray-200 bg-[#f9f9f9] p-4  hover:shadow-sm"
                      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
                    >
                      <div className="flex w-full items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{reading.customerName}</h4>
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                              Period {reading.period}
                            </span>
                          </div>

                          <p className="mt-1 font-medium text-gray-900">{reading.customerAccountNumber}</p>
                          <div className="flex items-center gap-2">
                            {" "}
                            <DateIcon />
                            <p className="text-sm text-gray-600">
                              Captured: {formatDate(reading.capturedAtUtc)} by {reading.capturedByName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              Prev: {reading.previousReadingKwh.toLocaleString()} kWh
                            </p>
                            <p className="text-sm text-gray-500">
                              Present: {reading.presentReadingKwh.toLocaleString()} kWh
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              Valid: {reading.validConsumptionKwh.toLocaleString()} kWh
                            </p>
                          </div>
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(reading)}
                            icon={<VscEye className="size-4" />}
                            iconPosition="start"
                            className="bg-white"
                          >
                            View Details
                          </ButtonModule>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="mt-3 flex justify-between gap-4 border-t pt-3 text-sm">
                        <div className="flex gap-2">
                          <BillsIdIcon />
                          <div>
                            <p className="text-gray-500">Reading ID</p>
                            <p className="font-medium text-gray-900">{reading.id}</p>
                          </div>
                        </div>
                        <div>
                          <div className="flex gap-2">
                            <CategoryIcon />
                            <div>
                              <p className="text-gray-500">Anomaly Score</p>
                              <p className="font-medium text-gray-900">{(reading.anomalyScore ?? 0).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <CycleIcon />
                          <div>
                            <p className="text-gray-500">Flagged</p>
                            <p
                              className={`font-medium ${
                                reading.isFlaggedForReview ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {reading.isFlaggedForReview ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <RevenueGeneratedIcon />
                          <div>
                            <p className="text-gray-500">Estimated Consumption</p>
                            <p className="font-medium text-gray-900">
                              {reading.estimatedConsumptionKwh != null
                                ? `${reading.estimatedConsumptionKwh.toLocaleString()} kWh`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="w-80">
          <div className="space-y-6">
            {/* Bill Actions */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Bill Actions</h3>
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <svg className="size-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Generate Single Bill</h4>
                      <p className="text-sm text-gray-600">Create bill for individual customer</p>
                    </div>
                  </div>
                </button>

                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <svg className="size-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Approve Bills</h4>
                      <p className="text-sm text-gray-600">Review and approve pending bills</p>
                    </div>
                  </div>
                </button>

                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <svg className="size-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Schedule Bills</h4>
                      <p className="text-sm text-gray-600">Set up automated billing</p>
                    </div>
                  </div>
                </button>

                <button className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-2">
                      <svg className="size-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Export Reports</h4>
                      <p className="text-sm text-gray-600">Download billing reports</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Billing Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Generated</span>
                  <span className="font-semibold text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Approval</span>
                  <span className="font-semibold text-yellow-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-semibold text-green-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="font-semibold text-gray-900">₦923.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default MeterReadings
