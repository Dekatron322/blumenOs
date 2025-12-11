"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearError, fetchMeterReadings, setPagination } from "lib/redux/meterReadingSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { AddCustomerIcon, PlusIcon, UserIcon } from "components/Icons/Icons"
import { PlusCircle } from "lucide-react"
import { fetchCustomers } from "lib/redux/customerSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface ActionDropdownProps {
  reading: MeterReading
  onViewDetails: (reading: MeterReading) => void
  onValidateReading: (readingId: number) => void
}

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

const ActionDropdown: React.FC<ActionDropdownProps> = ({ reading, onViewDetails, onValidateReading }) => {
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

  const handleValidateReading = (e: React.MouseEvent) => {
    e.preventDefault()
    onValidateReading(reading.id)
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
                onClick={handleValidateReading}
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
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-3 sm:p-5">
      {/* Header Section Skeleton */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="mb-3 md:mb-0">
          <div className="mb-2 h-8 w-48 rounded bg-gray-200 sm:w-56"></div>
          <div className="h-4 w-64 rounded bg-gray-200 sm:w-72"></div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-48"></div>
          <div className="h-10 w-24 rounded bg-gray-200 sm:w-28"></div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mt-4 flex flex-wrap gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 w-40 rounded bg-gray-200 sm:w-52"></div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="mt-4 w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(11)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-3 sm:p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(11)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-3 py-2 sm:px-4 sm:py-3">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t py-3 sm:flex-row">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
        </div>
        <div className="h-6 w-32 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

const MeterReadings: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { meterReadings, meterReadingsLoading, meterReadingsError, pagination } = useAppSelector(
    (state) => state.meterReadings
  )
  const { customers } = useAppSelector((state) => state.customers)
  const { areaOffices } = useAppSelector((state) => state.areaOffices)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [selectedReading, setSelectedReading] = useState<MeterReading | null>(null)

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages || 1

  // Load initial data
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
        PageNumber: 1,
        PageSize: 100,
      })
    )
  }, [dispatch])

  // Fetch meter readings on component mount and when search/pagination changes
  useEffect(() => {
    const fetchParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { search: searchText }),
    }

    dispatch(fetchMeterReadings(fetchParams))
  }, [dispatch, currentPage, pageSize, searchText])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Filter state
  const [filters, setFilters] = useState({
    period: "",
    customerId: "",
    areaOfficeId: "",
    feederId: "",
    distributionSubstationId: "",
  })

  // Generate period options
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

    // Add existing periods from data
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

  const periodOptions = generatePeriodOptions()

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
    if (baseline === 0) return { backgroundColor: "#F3F4F6", color: "#6B7280" }

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

  const handleRowsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value)
    dispatch(
      setPagination({
        page: 1,
        pageSize: newPageSize,
      })
    )
  }

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      dispatch(
        setPagination({
          page,
          pageSize: pagination.pageSize,
        })
      )
    }
  }

  const handleViewReadingDetails = (reading: MeterReading) => {
    router.push(`/billing/meter-readings/details/${reading.id}`)
  }

  const handleValidateReading = (readingId: number) => {
    console.log("Validating reading:", readingId)
    // Implement validation logic here
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    items.push(1)

    const showLeftEllipsis = current > 4
    const showRightEllipsis = current < total - 3

    if (!showLeftEllipsis) {
      items.push(2, 3, 4, "...")
    } else if (!showRightEllipsis) {
      items.push("...", total - 3, total - 2, total - 1)
    } else {
      items.push("...", current - 1, current, current + 1, "...")
    }

    if (!items.includes(total)) {
      items.push(total)
    }

    return items
  }

  const getMobilePageItems = (): (number | string)[] => {
    const total = totalPages
    const current = pagination.currentPage
    const items: (number | string)[] = []

    if (total <= 4) {
      for (let i = 1; i <= total; i += 1) {
        items.push(i)
      }
      return items
    }

    if (current <= 3) {
      items.push(1, 2, 3, "...", total)
      return items
    }

    if (current > 3 && current < total - 2) {
      items.push(1, "...", current, "...", total)
      return items
    }

    items.push(1, "...", total - 2, total - 1, total)
    return items
  }

  if (meterReadingsLoading) return <LoadingSkeleton />
  if (meterReadingsError)
    return <div className="p-4 text-red-500">Error loading meter readings data: {meterReadingsError}</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Meter Readings</p>
          <p className="text-sm text-gray-600">Manage and validate customer meter readings</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-full sm:w-64 md:w-[380px]">
            <SearchModule
              value={searchText}
              onChange={handleSearch}
              onCancel={handleCancelSearch}
              placeholder="Search by customer, account or period..."
              className="w-full"
              bgClassName="bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => router.push("/billing/meter-readings/add")}
            className="rounded-md bg-[#004B23] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:px-4"
          >
            <PlusCircle className="size-4 sm:hidden" />
            <p className="max-sm:hidden"> Add Reading </p>
          </button>
        </div>
      </motion.div>

      {/* Filters Section */}
      <div className="mt-4 flex flex-wrap gap-3">
        <FormSelectModule
          label="Period"
          name="period"
          value={filters.period}
          onChange={handleFilterSelectChange}
          options={periodOptions}
          className="w-full sm:w-52"
        />

        <FormSelectModule
          label="Customer"
          name="customerId"
          value={filters.customerId}
          onChange={handleFilterSelectChange}
          options={[
            { value: "", label: "All Customers" },
            ...customers.slice(0, 10).map((customer) => ({
              value: String(customer.id),
              label: `${customer.fullName}`,
            })),
          ]}
          className="w-full sm:w-56"
        />

        <FormSelectModule
          label="Area Office"
          name="areaOfficeId"
          value={filters.areaOfficeId}
          onChange={handleFilterSelectChange}
          options={[
            { value: "", label: "All Area Offices" },
            ...areaOffices.slice(0, 10).map((office) => ({
              value: String(office.id),
              label: office.nameOfNewOAreaffice,
            })),
          ]}
          className="w-full sm:w-56"
        />
      </div>

      {meterReadings.length === 0 ? (
        <motion.div
          className="mt-4 flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
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
          <motion.div
            className="mt-4 w-full overflow-x-auto border-x bg-[#FFFFFF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <table className="w-full min-w-[1200px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerName")}
                  >
                    <div className="flex items-center gap-2">
                      Customer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("period")}
                  >
                    <div className="flex items-center gap-2">
                      Period <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("previousReadingKwh")}
                  >
                    <div className="flex items-center gap-2">
                      Previous Reading <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("presentReadingKwh")}
                  >
                    <div className="flex items-center gap-2">
                      Present Reading <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("validConsumptionKwh")}
                  >
                    <div className="flex items-center gap-2">
                      Consumption <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("validationStatus")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("anomalyScore")}
                  >
                    <div className="flex items-center gap-2">
                      Anomaly Score <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("isFlaggedForReview")}
                  >
                    <div className="flex items-center gap-2">
                      Review Flag <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("capturedAtUtc")}
                  >
                    <div className="flex items-center gap-2">
                      Captured Date <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("capturedByName")}
                  >
                    <div className="flex items-center gap-2">
                      Captured By <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {meterReadings.map((reading: MeterReading, index: number) => (
                    <motion.tr
                      key={reading.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
                            <UserIcon />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{reading.customerName}</div>
                            <div className="text-xs text-gray-500">{reading.customerAccountNumber}</div>
                            <div className="text-xs text-blue-600">ID: {reading.customerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">{reading.period}</td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
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
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
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
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
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
                          className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            reading.isFlaggedForReview ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: reading.isFlaggedForReview ? "#AF4B4B" : "#589E67",
                            }}
                          ></span>
                          {reading.isFlaggedForReview ? "Flagged" : "Clear"}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div>{formatDate(reading.capturedAtUtc)}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(reading.capturedAtUtc)}</div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        {reading.capturedByName}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <ButtonModule
                            size="sm"
                            onClick={() => handleViewReadingDetails(reading)}
                            variant="primary"
                            className="text-xs sm:text-sm"
                          >
                            <span className="hidden sm:inline">View</span>
                            <span className="sm:hidden">View</span>
                          </ButtonModule>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
            <div className="flex items-center gap-1 max-sm:hidden">
              <p className="text-xs sm:text-sm">Show rows</p>
              <select
                value={pagination.pageSize}
                onChange={handleRowsChange}
                className="bg-[#F2F2F2] p-1 text-xs sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  pagination.currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
                }`}
                onClick={() => changePage(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <BiSolidLeftArrow className="size-4 sm:size-5" />
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden items-center gap-1 sm:flex sm:gap-2">
                  {getPageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs sm:h-7 sm:w-8 sm:text-sm ${
                          pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>

                <div className="flex items-center gap-1 sm:hidden">
                  {getMobilePageItems().map((item, index) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${
                          pagination.currentPage === item ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                        }`}
                        onClick={() => changePage(item)}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-gray-500">
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>

              <button
                className={`px-2 py-1 sm:px-3 sm:py-2 ${
                  pagination.currentPage === totalPages || totalPages === 0
                    ? "cursor-not-allowed text-gray-400"
                    : "text-[#000000]"
                }`}
                onClick={() => changePage(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages || totalPages === 0}
              >
                <BiSolidRightArrow className="size-4 sm:size-5" />
              </button>
            </div>

            <p className="text-center text-xs text-gray-600 sm:text-right sm:text-sm">
              Page {pagination.currentPage} of {totalPages || 1} ({totalRecords.toLocaleString()} total entries)
              {searchText.trim() && " - filtered"}
            </p>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default MeterReadings
