"use client"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { SearchModule } from "components/ui/Search/search-module"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { PlusIcon, UserIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

import { fetchMeterReadings, clearMeterReadings, setPagination } from "lib/redux/meterReadingSlice"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

const CyclesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z"
      fill="currentColor"
    />
    <path d="M10.5 5H9V11L14.2 14.2L15 13L10.5 10.25V5Z" fill="currentColor" />
  </svg>
)

interface MeterReading {
  id: number
  customerId: number
  period: string
  previousReadingKwh: number
  presentReadingKwh: number
  capturedAtUtc: string
  capturedByUserId: number
  capturedByName: string
  customerName: string
  customerAccountNumber: string
  notes: string
  validConsumptionKwh: number
  invalidConsumptionKwh: number
  averageConsumptionBaselineKwh: number
  standardDeviationKwh: number
  lowThresholdKwh: number
  highThresholdKwh: number
  anomalyScore: number
  validationStatus: number
  isFlaggedForReview: boolean
  isRollover: boolean
  rolloverCount: number
  rolloverAdjustmentKwh: number
  estimatedConsumptionKwh: number
  validatedAtUtc: string | null
  validationNotes: string | null
}

interface ActionDropdownProps {
  reading: MeterReading
  onViewDetails: (reading: MeterReading) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ reading, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = () => {
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(reading)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <RxDotsVertical />
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 2
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -10 : 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="py-1">
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Details
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Validate reading:", reading.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Validate Reading
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Flag for review:", reading.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Flag for Review
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                onClick={() => {
                  console.log("Adjust reading:", reading.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#eff6ff" }}
                transition={{ duration: 0.1 }}
              >
                Adjust Reading
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const LoadingSkeleton = () => {
  return (
    <motion.div
      className="mt-5 flex flex-1 flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-40 overflow-hidden rounded bg-gray-200">
          <motion.div
            className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          </div>
          <div className="h-10 w-24 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 overflow-hidden rounded bg-gray-200">
                    <motion.div
                      className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full overflow-hidden rounded bg-gray-200">
                      <motion.div
                        className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: (rowIndex * 11 + cellIndex) * 0.05,
                        }}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="h-10 w-48 overflow-hidden rounded bg-gray-200">
          <motion.div
            className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 overflow-hidden rounded bg-gray-200">
              <motion.div
                className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8 + i * 0.1,
                }}
              />
            </div>
          ))}
          <div className="size-8 overflow-hidden rounded bg-gray-200">
            <motion.div
              className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.3,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const generateReadingData = () => {
  return {
    totalReadings: 2456,
    validatedReadings: 1890,
    pendingValidation: 342,
    flaggedForReview: 224,
    averageConsumption: 45.2,
    totalConsumption: 110890,
  }
}

const MeterReadings: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { meterReadings, meterReadingsLoading, meterReadingsError, meterReadingsSuccess, pagination } = useAppSelector(
    (state) => state.meterReadings
  )
  const { customers } = useAppSelector((state) => state.customers)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [readingData, setReadingData] = useState(generateReadingData())
  const [filters, setFilters] = useState({
    period: "",
    customerId: "",
    areaOfficeId: "",
    feederId: "",
    distributionSubstationId: "",
  })

  const generatePeriodOptions = () => {
    const options: { value: string; label: string }[] = [{ value: "", label: "All Periods" }]

    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    })

    // Include current month + next 5 months
    for (let i = 0; i <= 5; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const value = `${year}-${month}`
      const label = formatter.format(date)

      options.push({ value, label })
    }

    const existingPeriods = Array.from(new Set(meterReadings.map((reading) => reading.period)))
    existingPeriods.forEach((period) => {
      const alreadyExists = options.some((opt) => opt.value === period)
      if (!alreadyExists) {
        let label = period
        const match = /^([0-9]{4})-([0-9]{2})$/.exec(period)
        if (match && match[1] && match[2]) {
          const year = parseInt(match[1], 10)
          const monthIndex = parseInt(match[2], 10) - 1
          const date = new Date(year, monthIndex, 1)
          label = formatter.format(date)
        }
        options.push({ value: period, label })
      }
    })

    return options
  }

  const periodOptions = useMemo(() => generatePeriodOptions(), [meterReadings])

  const pageSize = 10
  const currentPage = pagination.currentPage

  useEffect(() => {
    // Load customers for the customer filter dropdown
    dispatch(
      fetchCustomers({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    // Load area offices for the area office filter dropdown
    dispatch(
      fetchAreaOffices({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  useEffect(() => {
    // Fetch meter readings when component mounts or filters change
    dispatch(
      fetchMeterReadings({
        pageNumber: currentPage,
        pageSize,
        ...(filters.period && { period: filters.period }),
        ...(filters.customerId && { customerId: parseInt(filters.customerId) }),
        ...(filters.areaOfficeId && { areaOfficeId: parseInt(filters.areaOfficeId) }),
        ...(filters.feederId && { feederId: parseInt(filters.feederId) }),
        ...(filters.distributionSubstationId && {
          distributionSubstationId: parseInt(filters.distributionSubstationId),
        }),
      })
    )
  }, [dispatch, currentPage, filters])

  const getValidationStatusStyle = (status: number) => {
    switch (status) {
      case 1: // Validated
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case 2: // Pending
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case 3: // Flagged
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case 4: // Adjusted
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getValidationStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Validated"
      case 2:
        return "Pending"
      case 3:
        return "Flagged"
      case 4:
        return "Adjusted"
      default:
        return "Unknown"
    }
  }

  const getAnomalyScoreStyle = (score: number) => {
    if (score >= 80) {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
      }
    } else if (score >= 60) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else if (score >= 40) {
      return {
        backgroundColor: "#EFF6FF",
        color: "#2563EB",
      }
    } else {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    }
  }

  const getConsumptionStyle = (consumption: number, baseline: number) => {
    const ratio = consumption / baseline
    if (ratio > 1.5) {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
      }
    } else if (ratio > 1.2) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else if (ratio < 0.8) {
      return {
        backgroundColor: "#EFF6FF",
        color: "#2563EB",
      }
    } else {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleFilterSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = e.target
    handleFilterChange(name, String(value))
  }

  const paginate = (pageNumber: number) => {
    dispatch(setPagination({ page: pageNumber, pageSize }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleViewDetails = (reading: MeterReading) => {
    router.push(`/billing/meter-readings/details/${reading.id}`)
  }

  if (meterReadingsLoading) return <LoadingSkeleton />
  if (meterReadingsError) return <div>Error loading meter readings: {meterReadingsError}</div>

  return (
    <section className="size-full flex-1 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto px-4 py-8 max-sm:px-2 lg:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Meter Readings</h4>
                <p className="text-gray-600">Manage and validate customer meter readings</p>
              </div>

              <motion.div
                className="flex items-center justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  icon={<PlusIcon />}
                  onClick={() => router.push("/billing/meter-readings/add")}
                >
                  New Reading
                </ButtonModule>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Reading Table Container */}
              <div className="w-full">
                <motion.div
                  className="w-full rounded-lg border bg-white p-4 lg:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-semibold">Meter Reading Directory</h3>
                    <div className="max-w-md">
                      <SearchModule
                        placeholder="Search customers, accounts, or meter numbers..."
                        value={searchText}
                        onChange={handleSearch}
                        onCancel={handleCancelSearch}
                      />
                    </div>

                    {/* Filters */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      <FormSelectModule
                        label="Period"
                        name="period"
                        value={filters.period}
                        onChange={handleFilterSelectChange}
                        options={periodOptions}
                        className="w-52"
                      />

                      <FormSelectModule
                        label="Customer"
                        name="customerId"
                        value={filters.customerId}
                        onChange={handleFilterSelectChange}
                        options={[
                          { value: "", label: "All Customers" },
                          ...customers.map((customer) => ({
                            value: String(customer.id),
                            label: `${customer.fullName}`,
                          })),
                        ]}
                        className="w-56"
                      />

                      <FormSelectModule
                        label="Area Office"
                        name="areaOfficeId"
                        value={filters.areaOfficeId}
                        onChange={handleFilterSelectChange}
                        options={[
                          { value: "", label: "All Area Offices" },
                          ...areaOffices.map((office) => ({
                            value: String(office.id),
                            label: office.nameOfNewOAreaffice,
                          })),
                        ]}
                        className="w-56"
                      />
                    </div>
                  </div>

                  {meterReadings.length === 0 ? (
                    <motion.div
                      className="flex h-60 flex-col items-center justify-center gap-2 rounded-lg bg-[#F6F6F9]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.p
                        className="text-base font-bold text-[#202B3C]"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        {searchText ? "No matching readings found" : "No meter readings available"}
                      </motion.p>
                    </motion.div>
                  ) : (
                    <>
                      {/* Table Container with Max Width and Scroll */}
                      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                        <div className="max-w-full overflow-x-auto">
                          <table className="w-full min-w-[1600px] border-separate border-spacing-0 text-left">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <MdOutlineCheckBoxOutlineBlank className="text-lg text-gray-400" />
                                    Customer
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("period")}
                                >
                                  <div className="flex items-center gap-2">
                                    Period <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("previousReadingKwh")}
                                >
                                  <div className="flex items-center gap-2">
                                    Previous Reading <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("presentReadingKwh")}
                                >
                                  <div className="flex items-center gap-2">
                                    Present Reading <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("validConsumptionKwh")}
                                >
                                  <div className="flex items-center gap-2">
                                    Consumption <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("validationStatus")}
                                >
                                  <div className="flex items-center gap-2">
                                    Status <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("anomalyScore")}
                                >
                                  <div className="flex items-center gap-2">
                                    Anomaly Score <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("isFlaggedForReview")}
                                >
                                  <div className="flex items-center gap-2">
                                    Review Flag <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("capturedAtUtc")}
                                >
                                  <div className="flex items-center gap-2">
                                    Captured Date <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th
                                  className="cursor-pointer whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100"
                                  onClick={() => toggleSort("capturedByName")}
                                >
                                  <div className="flex items-center gap-2">
                                    Captured By <RxCaretSort className="text-gray-400" />
                                  </div>
                                </th>
                                <th className="whitespace-nowrap border-y p-4 text-sm font-semibold text-gray-900">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              <AnimatePresence>
                                {meterReadings.map((reading, index) => (
                                  <motion.tr
                                    key={reading.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">
                                      <div className="flex items-center gap-2">
                                        <UserIcon />
                                        <div>
                                          <div className="font-medium text-gray-900">{reading.customerName}</div>
                                          <div className="text-xs text-gray-500">{reading.customerAccountNumber}</div>
                                          <div className="text-xs text-blue-600">ID: {reading.customerId}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {reading.period}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {reading.previousReadingKwh.toLocaleString()} kWh
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                                      {reading.presentReadingKwh.toLocaleString()} kWh
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getConsumptionStyle(
                                          reading.validConsumptionKwh,
                                          reading.averageConsumptionBaselineKwh
                                        )}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {reading.validConsumptionKwh.toLocaleString()} kWh
                                      </motion.div>
                                      <div className="mt-1 text-xs text-gray-500">
                                        Baseline:{" "}
                                        {reading.averageConsumptionBaselineKwh != null
                                          ? `${reading.averageConsumptionBaselineKwh.toLocaleString()} kWh`
                                          : "N/A"}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getValidationStatusStyle(reading.validationStatus)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        <span
                                          className="size-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              reading.validationStatus === 1
                                                ? "#589E67"
                                                : reading.validationStatus === 2
                                                ? "#D97706"
                                                : reading.validationStatus === 3
                                                ? "#AF4B4B"
                                                : "#2563EB",
                                          }}
                                        ></span>
                                        {getValidationStatusText(reading.validationStatus)}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        style={getAnomalyScoreStyle(reading.anomalyScore)}
                                        className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {reading.anomalyScore}%
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <motion.div
                                        className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs ${
                                          reading.isFlaggedForReview
                                            ? "bg-red-100 text-red-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.1 }}
                                      >
                                        {reading.isFlaggedForReview ? "Flagged" : "Clear"}
                                      </motion.div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      <div>{formatDate(reading.capturedAtUtc)}</div>
                                      <div className="text-xs text-gray-500">
                                        {formatDateTime(reading.capturedAtUtc)}
                                      </div>
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                                      {reading.capturedByName}
                                    </td>
                                    <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                                      <ActionDropdown reading={reading} onViewDetails={handleViewDetails} />
                                    </td>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <motion.div
                        className="flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <div className="text-sm text-gray-700">
                          Showing {(currentPage - 1) * pageSize + 1} to{" "}
                          {Math.min(currentPage * pageSize, pagination.totalCount)} of {pagination.totalCount} entries
                        </div>
                        <div className="flex items-center gap-1">
                          <motion.button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === 1
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
                            }`}
                            whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                          >
                            <MdOutlineArrowBackIosNew size={16} />
                          </motion.button>

                          {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => {
                            let pageNum
                            if (pagination.totalPages <= 5) {
                              pageNum = index + 1
                            } else if (currentPage <= 3) {
                              pageNum = index + 1
                            } else if (currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + index
                            } else {
                              pageNum = currentPage - 2 + index
                            }

                            return (
                              <motion.button
                                key={index}
                                onClick={() => paginate(pageNum)}
                                className={`flex size-8 items-center justify-center rounded-md text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[#0a0a0a] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                {pageNum}
                              </motion.button>
                            )
                          })}

                          {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                            <span className="px-1 text-gray-500">...</span>
                          )}

                          {pagination.totalPages > 5 && currentPage < pagination.totalPages - 1 && (
                            <motion.button
                              onClick={() => paginate(pagination.totalPages)}
                              className={`flex size-8 items-center justify-center rounded-md text-sm ${
                                currentPage === pagination.totalPages
                                  ? "bg-[#0a0a0a] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {pagination.totalPages}
                            </motion.button>
                          )}

                          <motion.button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === pagination.totalPages
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
                            }`}
                            whileHover={{ scale: currentPage === pagination.totalPages ? 1 : 1.1 }}
                            whileTap={{ scale: currentPage === pagination.totalPages ? 1 : 0.95 }}
                          >
                            <MdOutlineArrowForwardIos size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MeterReadings
