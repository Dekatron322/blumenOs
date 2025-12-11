"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearError, clearFilters, fetchPostpaidBills, setFilters, setPagination } from "lib/redux/postpaidSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { AddCustomerIcon, MapIcon, UserIcon } from "components/Icons/Icons"
import { PlusCircle } from "lucide-react"

interface ActionDropdownProps {
  bill: Bill
  onViewDetails: (bill: Bill) => void
  onUpdateBill: (billId: number) => void
}

// Use the PostpaidBill interface from your slice and transform to our Bill interface
interface PostpaidBill {
  id: number
  customerName: string
  customerAccountNumber: string
  period: string
  name?: string
  totalDue: number
  status: number
  dueDate?: string
  createdAt?: string
  category: number
  feederName?: string
  areaOfficeName?: string
  consumptionKwh?: number
  tariffPerKwh?: number
}

interface Bill {
  id: number
  customerName: string
  accountNumber: string
  billingCycle: string
  name: string
  amount: string
  status: "Paid" | "Pending" | "Overdue" | "Cancelled"
  dueDate: string
  issueDate: string
  customerType: "Residential" | "Commercial" | "Industrial"
  location: string
  consumption: string
  tariff: string
}

interface AllBillsProps {
  onViewBillDetails?: (bill: Bill) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ bill, onViewDetails, onUpdateBill }) => {
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
    onViewDetails(bill)
    setIsOpen(false)
  }

  const handleUpdateBill = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Update bill:", bill.id)
    onUpdateBill(bill.id)
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
                onClick={handleUpdateBill}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Bill
              </motion.button>

              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {}}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Download PDF
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
          <div className="mb-2 h-8 w-40 rounded bg-gray-200 sm:w-48"></div>
          <div className="h-4 w-56 rounded bg-gray-200 sm:w-64"></div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-10 w-full rounded bg-gray-200 sm:w-48"></div>
          <div className="h-10 w-24 rounded bg-gray-200 sm:w-28"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(9)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-3 sm:p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(9)].map((_, cellIndex) => (
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
      <div className="flex flex-col items-center justify-between gap-3 border-t py-3 sm:flex-row">
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

const AllBills: React.FC<AllBillsProps> = ({ onViewBillDetails }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { bills, loading, error, pagination, filters } = useAppSelector((state) => state.postpaidBilling)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages || 1

  // Fetch bills on component mount and when search/pagination changes
  useEffect(() => {
    console.log("AllBills useEffect triggered - fetching bills...")

    const fetchParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { accountNumber: searchText }),
      ...filters,
    }

    dispatch(fetchPostpaidBills(fetchParams))
  }, [dispatch, currentPage, pageSize, searchText, filters])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const getStatusStyle = (status: Bill["status"]) => {
    switch (status) {
      case "Paid":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Pending":
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
        }
      case "Overdue":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "Cancelled":
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getCustomerTypeStyle = (type: Bill["customerType"]) => {
    switch (type) {
      case "Residential":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "Commercial":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "Industrial":
        return {
          backgroundColor: "#F4EDF7",
          color: "#954BAF",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    if (value.trim()) {
      dispatch(setFilters({ accountNumber: value.trim() }))
    } else {
      dispatch(clearFilters())
    }
    // Reset to first page when searching
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    dispatch(clearFilters())
    // Reset to first page when clearing search
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

  const handleViewBillDetails = (bill: Bill) => {
    router.push(`/billing/bills/${bill.id}`)
    onViewBillDetails?.(bill)
  }

  const handleUpdateBill = (billId: number) => {
    router.push(`/billing/bills/update/${billId}`)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount: string) => {
    // If amount already has ₦ symbol, return as is
    if (amount.includes("₦")) return amount

    // Otherwise try to parse as number
    const num = parseFloat(amount.replace(/[^0-9.-]+/g, ""))
    if (isNaN(num)) return amount

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(num)
  }

  // Transform API PostpaidBill data to component Bill format
  const transformApiBillsToTableBills = (): Bill[] => {
    if (!bills || bills.length === 0) {
      console.log("No API bills to transform")
      return []
    }

    console.log("Transforming API bills to table format, count:", bills.length)

    return bills.map((apiBill) => {
      // Determine status based on bill data
      let status: "Paid" | "Pending" | "Overdue" | "Cancelled" = "Pending"

      // Map your API status to component status
      if (apiBill.status === 1) status = "Paid"
      else if (apiBill.status === 2) status = "Pending"
      else if (apiBill.status === 3) status = "Overdue"
      else if (apiBill.status === 4) status = "Cancelled"

      // Determine customer type based on category
      let customerType: "Residential" | "Commercial" | "Industrial" = "Residential"
      if (apiBill.category === 1) customerType = "Residential"
      else if (apiBill.category === 2) customerType = "Commercial"
      else if (apiBill.category === 3) customerType = "Industrial"

      // Format amount
      const amount = `₦${(apiBill.totalDue || 0).toLocaleString()}`

      // Format consumption
      const consumption = `${apiBill.consumptionKwh || 0} kWh`

      // Use feeder name or area office as location
      const location = apiBill.feederName || apiBill.areaOfficeName || "Unknown"

      // Format dates - ensure we always return a string, never undefined
      const formatApiDate = (dateString?: string) => {
        try {
          const date = new Date(dateString ?? new Date())
          return date.toISOString().split("T")[0]
        } catch {
          return new Date().toISOString().split("T")[0]
        }
      }

      return {
        id: apiBill.id,
        customerName: apiBill.customerName || "Unknown Customer",
        accountNumber: apiBill.customerAccountNumber || "N/A",
        billingCycle: apiBill.period || "Unknown Period",
        name: apiBill.name || "Unnamed Bill",
        amount,
        status,
        dueDate: formatApiDate(apiBill.dueDate),
        issueDate: formatApiDate(apiBill.createdAt),
        customerType,
        location,
        consumption,
        tariff: `₦${apiBill.tariffPerKwh || 0}/kWh`,
      } as Bill
    })
  }

  const tableBills = transformApiBillsToTableBills()
  console.log("Transformed table bills:", tableBills)

  // Fallback data if no API data
  const fallbackBills: Bill[] = [
    {
      id: 1,
      customerName: "Fatima Hassan",
      accountNumber: "2301567890",
      billingCycle: "January 2024",
      name: "January, 2024",
      amount: "₦425",
      status: "Paid",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Residential",
      location: "Lagos Island",
      consumption: "35 kWh",
      tariff: "₦12/kWh",
    },
    {
      id: 2,
      customerName: "John Adebayo",
      accountNumber: "2301456789",
      billingCycle: "January 2024",
      name: "January, 2024",
      amount: "₦250",
      status: "Pending",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Residential",
      location: "Ikeja",
      consumption: "25 kWh",
      tariff: "₦10/kWh",
    },
    {
      id: 3,
      customerName: "Grace Okonkwo",
      accountNumber: "2301678901",
      billingCycle: "January 2024",
      name: "January, 2024",
      amount: "₦187",
      status: "Overdue",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Commercial",
      location: "Surulere",
      consumption: "55 kWh",
      tariff: "₦3.4/kWh",
    },
    {
      id: 4,
      customerName: "Tech Solutions Ltd",
      accountNumber: "2301789012",
      billingCycle: "January 2024",
      name: "January, 2024",
      amount: "₦1,250",
      status: "Paid",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Commercial",
      location: "Victoria Island",
      consumption: "230 kWh",
      tariff: "₦5.4/kWh",
    },
    {
      id: 5,
      customerName: "Michael Johnson",
      accountNumber: "2301890123",
      billingCycle: "January 2024",
      name: "January, 2024",
      amount: "₦320",
      status: "Cancelled",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Residential",
      location: "Lekki",
      consumption: "30 kWh",
      tariff: "₦10.7/kWh",
    },
    {
      id: 6,
      customerName: "Sarah Blumenthal",
      accountNumber: "2301901234",
      billingCycle: "January 2024",
      name: "January, 2024",
      amount: "₦550",
      status: "Paid",
      dueDate: "2024-01-31",
      issueDate: "2024-01-01",
      customerType: "Industrial",
      location: "Ilupeju",
      consumption: "580 kWh",
      tariff: "₦0.95/kWh",
    },
  ]

  // Only show fallback if no data and not loading
  const shouldShowFallback = !loading && tableBills.length === 0
  const displayBills = shouldShowFallback ? fallbackBills : tableBills

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

  if (loading) return <LoadingSkeleton />
  if (error) return <div className="p-4 text-red-500">Error loading bills data: {error}</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">All Bills</p>
          <p className="text-sm text-gray-600">Manage and monitor all customer bills and payments</p>
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
          {/* <button
            type="button"
            onClick={() => router.push("/billing/bills/add")}
            className="rounded-md bg-[#004B23] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:px-4"
          >
            <PlusCircle className="size-4 sm:hidden" />
            <p className="max-sm:hidden"> Add Bill </p>
          </button> */}
        </div>
      </motion.div>

      {displayBills.length === 0 ? (
        <motion.div
          className="flex h-60 flex-col items-center justify-center gap-2 bg-[#F6F6F9]"
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
            {searchText ? "No matching bills found" : "No bills available"}
          </motion.p>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="w-full overflow-x-auto border-x bg-[#FFFFFF]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
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
                    onClick={() => toggleSort("billingCycle")}
                  >
                    <div className="flex items-center gap-2">
                      Billing Cycle <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("dueDate")}
                  >
                    <div className="flex items-center gap-2">
                      Due Date <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerType")}
                  >
                    <div className="flex items-center gap-2">
                      Customer Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("location")}
                  >
                    <div className="flex items-center gap-2">
                      Location <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("consumption")}
                  >
                    <div className="flex items-center gap-2">
                      Consumption <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {displayBills.map((bill: Bill, index: number) => (
                    <motion.tr
                      key={bill.id}
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
                            <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
                            <div className="text-xs text-gray-500">{bill.accountNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                          <div className="text-xs text-gray-500">{bill.billingCycle}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-semibold text-gray-900">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <motion.div
                          style={getStatusStyle(bill.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(bill.status).color,
                            }}
                          ></span>
                          {bill.status}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        {formatDate(bill.dueDate)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                        <motion.div
                          style={getCustomerTypeStyle(bill.customerType)}
                          className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          {bill.customerType}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapIcon />
                          {bill.location}
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-3 text-sm text-gray-600">
                        <div>
                          <div className="font-medium">{bill.consumption}</div>
                          <div className="text-xs text-gray-500">{bill.tariff}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <ButtonModule
                            size="sm"
                            onClick={() => handleViewBillDetails(bill)}
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
                        className={`flex size-6 items-center justify-center rounded-md text-xs sm:h-7 sm:w-8 sm:text-sm ${
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
                        className={`flex size-6 items-center justify-center rounded-md text-xs ${
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

export default AllBills
