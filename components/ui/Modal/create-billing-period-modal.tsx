"use client"
import React, { useCallback, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MdCalendarToday, MdCheckCircle, MdChevronLeft, MdClose, MdError, MdHistory, MdInfo } from "react-icons/md"

import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCreateCurrentBillingPeriodState,
  clearCreatePastBillingPeriodState,
  createCurrentBillingPeriod,
  createPastBillingPeriod,
} from "lib/redux/billingPeriodsSlice"

interface CreateBillingPeriodModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateBillingPeriodModal: React.FC<CreateBillingPeriodModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState<"current" | "past">("current")

  // Get current date for default values
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const [calendarYear, setCalendarYear] = useState<number>(currentYear)

  // Month names for calendar display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const {
    createCurrentBillingPeriodLoading,
    createCurrentBillingPeriodError,
    createCurrentBillingPeriodSuccess,
    createPastBillingPeriodLoading,
    createPastBillingPeriodError,
    createPastBillingPeriodSuccess,
  } = useAppSelector((state) => state.billingPeriods)

  const handleClose = useCallback(() => {
    if (!createCurrentBillingPeriodLoading && !createPastBillingPeriodLoading) {
      dispatch(clearCreateCurrentBillingPeriodState())
      dispatch(clearCreatePastBillingPeriodState())
      onClose()
    }
  }, [createCurrentBillingPeriodLoading, createPastBillingPeriodLoading, dispatch, onClose])

  const handleCreateCurrentBillingPeriod = useCallback(() => {
    dispatch(createCurrentBillingPeriod())
  }, [dispatch])

  const handleCreatePastBillingPeriod = useCallback(() => {
    dispatch(createPastBillingPeriod({ year: selectedYear, month: selectedMonth }))
  }, [dispatch, selectedYear, selectedMonth])

  // Calendar helper functions
  const handleYearChange = useCallback((direction: "prev" | "next") => {
    setCalendarYear((prev) => (direction === "prev" ? prev - 1 : prev + 1))
  }, [])

  const handleMonthSelect = useCallback(
    (month: number) => {
      setSelectedMonth(month)
      setSelectedYear(calendarYear)
    },
    [calendarYear]
  )

  const isCurrentMonth = useCallback(
    (month: number) => {
      return month === currentMonth && calendarYear === currentYear
    },
    [currentMonth, calendarYear, currentYear]
  )

  const isPastMonth = useCallback(
    (month: number) => {
      if (calendarYear < currentYear) return true
      if (calendarYear > currentYear) return false
      return month < currentMonth
    },
    [calendarYear, currentYear, currentMonth]
  )

  // Generate year options (current year and 5 years back) - keeping for reference but using calendar instead
  const yearOptions = Array.from({ length: 6 }, (_, i) => {
    const year = currentYear - i
    return {
      value: year.toString(),
      label: year.toString(),
    }
  })

  // Close modal on success after a delay
  React.useEffect(() => {
    if (createCurrentBillingPeriodSuccess || createPastBillingPeriodSuccess) {
      const timer = setTimeout(() => {
        handleClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [createCurrentBillingPeriodSuccess, createPastBillingPeriodSuccess, handleClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Modal Header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#004B23] to-[#006B33] px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <MdCalendarToday className="text-2xl text-white" />
                  <h3 className="text-lg font-semibold text-white">Create Billing Period</h3>
                </div>
                <p className="mt-1 text-sm text-white/70">Create current month&apos;s billing period</p>
              </div>
              <motion.button
                onClick={handleClose}
                className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={createCurrentBillingPeriodLoading || createPastBillingPeriodLoading}
              >
                <MdClose className="text-xl" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-1">
              {[
                { id: "current" as const, label: "Current Month", icon: MdCalendarToday },
                { id: "past" as const, label: "Past Period", icon: MdHistory },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab.id ? "bg-white text-[#004B23]" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="text-lg" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === "current" && (
                <motion.div
                  key="current"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Information Section */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <MdInfo className="mt-0.5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">About This Action</h4>
                        <p className="mt-1 text-sm text-blue-700">
                          This will create the current month&apos;s billing period if it doesn&apos;t exist. If a
                          billing period for the current month already exists, it will return the existing one.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {createCurrentBillingPeriodSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-green-200 bg-green-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MdCheckCircle className="text-green-600" />
                        <div>
                          <h4 className="font-semibold text-green-900">Success!</h4>
                          <p className="text-sm text-green-700">
                            Current billing period has been created successfully. The window will close automatically.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {createCurrentBillingPeriodError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MdError className="text-red-600" />
                        <div>
                          <h4 className="font-semibold text-red-900">Error</h4>
                          <p className="text-sm text-red-700">{createCurrentBillingPeriodError}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <ButtonModule
                      variant="outline"
                      onClick={handleClose}
                      disabled={createCurrentBillingPeriodLoading}
                      className="flex-1"
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      onClick={handleCreateCurrentBillingPeriod}
                      disabled={createCurrentBillingPeriodLoading}
                      loading={createCurrentBillingPeriodLoading}
                      className="flex-1"
                    >
                      {createCurrentBillingPeriodLoading ? "Creating..." : "Create Current Period"}
                    </ButtonModule>
                  </div>
                </motion.div>
              )}

              {activeTab === "past" && (
                <motion.div
                  key="past"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Information Section */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <MdInfo className="mt-0.5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">About This Action</h4>
                        <p className="mt-1 text-sm text-blue-700">
                          This will create a billing period for the specified year and month. Use this for historical
                          data or backdated billing periods.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Selection */}
                  <div className="space-y-4">
                    {/* Year Navigation */}
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <button
                        onClick={() => handleYearChange("prev")}
                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                      >
                        <MdChevronLeft className="text-xl" />
                      </button>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">{calendarYear}</h3>
                        <p className="text-xs text-gray-500">Select a month</p>
                      </div>
                      <button
                        onClick={() => handleYearChange("next")}
                        className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                        disabled={calendarYear >= currentYear}
                      >
                        <MdChevronLeft className="rotate-180 text-xl" />
                      </button>
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-3 gap-2 rounded-lg border border-gray-200 p-3">
                      {monthNames.map((month, index) => {
                        const monthNumber = index + 1
                        const isSelected = selectedMonth === monthNumber && selectedYear === calendarYear
                        const isCurrent = isCurrentMonth(monthNumber)
                        const isPast = isPastMonth(monthNumber)
                        const isFuture = !isPast && !isCurrent

                        return (
                          <button
                            key={month}
                            onClick={() => handleMonthSelect(monthNumber)}
                            disabled={isFuture}
                            className={`rounded-lg border p-3 text-center transition-all ${
                              isSelected
                                ? "border-[#004B23] bg-[#004B23] text-white"
                                : isCurrent
                                ? "border-blue-300 bg-blue-50 font-medium text-blue-900"
                                : isPast
                                ? "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                            }`}
                          >
                            <div className="text-sm font-medium">{month.slice(0, 3)}</div>
                            {isCurrent && <div className="mt-1 text-xs">Current</div>}
                          </button>
                        )
                      })}
                    </div>

                    {/* Selected Date Display */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Selected Period</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {monthNames[selectedMonth - 1]} {selectedYear}
                          </p>
                        </div>
                        <MdCalendarToday className="text-2xl text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {createPastBillingPeriodSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-green-200 bg-green-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MdCheckCircle className="text-green-600" />
                        <div>
                          <h4 className="font-semibold text-green-900">Success!</h4>
                          <p className="text-sm text-green-700">
                            Past billing period has been created successfully. The window will close automatically.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {createPastBillingPeriodError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <MdError className="text-red-600" />
                        <div>
                          <h4 className="font-semibold text-red-900">Error</h4>
                          <p className="text-sm text-red-700">{createPastBillingPeriodError}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <ButtonModule
                      variant="outline"
                      onClick={handleClose}
                      disabled={createPastBillingPeriodLoading}
                      className="flex-1"
                    >
                      Cancel
                    </ButtonModule>
                    <ButtonModule
                      variant="primary"
                      onClick={handleCreatePastBillingPeriod}
                      disabled={createPastBillingPeriodLoading}
                      loading={createPastBillingPeriodLoading}
                      className="flex-1"
                    >
                      {createPastBillingPeriodLoading ? "Creating..." : "Create Past Period"}
                    </ButtonModule>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
