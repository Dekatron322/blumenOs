"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  CashClearance,
  ClearancesRequestParams,
  clearCash,
  ClearCashRequest,
  clearCashStatus,
  clearClearances,
  clearError,
  fetchClearances,
  setClearancesPagination,
} from "lib/redux/agentSlice"
import { format } from "date-fns"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"

interface ActionDropdownProps {
  clearance: CashClearance
  onViewDetails: (clearance: CashClearance) => void
}

interface ClearCashFormErrors {
  collectionOfficerUserId?: string
  amount?: string
  notes?: string
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ clearance, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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
    onViewDetails(clearance)
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
                  // Navigate to clearance details or edit page
                  router.push(`/clearances/${clearance.id}`)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View Full Report
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
    <div className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5">
      {/* Header Section Skeleton */}
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="mb-3 md:mb-0">
          <div className="mb-2 h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 w-48 rounded bg-gray-200"></div>
          <div className="h-10 w-24 rounded bg-gray-200"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section Skeleton */}
      <div className="flex items-center justify-between border-t py-3">
        <div className="h-6 w-48 rounded bg-gray-200"></div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200"></div>
          ))}
          <div className="size-8 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

interface AppliedFilters {
  agentId?: number
  areaOfficeId?: number
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface AgentClearanceTableProps {
  agentId?: number
  appliedFilters?: AppliedFilters
}

const AgentClearanceTable: React.FC<AgentClearanceTableProps> = ({
  agentId,
  appliedFilters = {} as AppliedFilters,
}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { clearances, clearancesLoading, clearancesError, clearancesPagination, clearCashLoading, clearCashError } =
    useAppSelector((state) => state.agents)

  // Memoize appliedFilters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => appliedFilters, [JSON.stringify(appliedFilters)])

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [selectedClearance, setSelectedClearance] = useState<CashClearance | null>(null)
  const [isClearCashPanelOpen, setIsClearCashPanelOpen] = useState(false)
  const [expandedClearanceId, setExpandedClearanceId] = useState<number | null>(null)

  // Clear cash form state
  const [clearCashForm, setClearCashForm] = useState<ClearCashRequest>({
    collectionOfficerUserId: 0,
    amount: 0,
    notes: "",
  })
  const [clearCashFormErrors, setClearCashFormErrors] = useState<ClearCashFormErrors>({})

  // Get pagination values from Redux state
  const currentPage = clearancesPagination?.currentPage || 1
  const pageSize = clearancesPagination?.pageSize || 10
  const totalRecords = clearancesPagination?.totalCount || 0
  const totalPages = clearancesPagination?.totalPages || 1

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Single function to fetch clearances data
  const fetchClearancesData = React.useCallback(() => {
    const fetchParams: ClearancesRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(agentId ? { id: agentId } : {}),
      ...memoizedFilters,
    }

    dispatch(fetchClearances(fetchParams))
  }, [dispatch, agentId, currentPage, pageSize, memoizedFilters])

  const handleViewClearanceDetails = (clearance: CashClearance) => {
    if (agentId) {
      router.push(`/agents/${agentId}/clearances/${clearance.id}`)
    } else {
      router.push(`/clearances/${clearance.id}`)
    }
  }

  const openClearCashPanel = (clearance: CashClearance) => {
    if (!clearance.collectionOfficer) {
      return
    }
    setSelectedClearance(clearance)
    setClearCashForm({
      collectionOfficerUserId: clearance.collectionOfficer.id,
      amount: clearance.amountCleared,
      notes: `Clearance for transaction CL-${clearance.id.toString().padStart(5, "0")}`,
    })
    setClearCashFormErrors({})
    setIsClearCashPanelOpen(true)
  }

  const closeClearCashPanel = () => {
    setIsClearCashPanelOpen(false)
    setSelectedClearance(null)
    setClearCashFormErrors({})
    dispatch(clearCashStatus())
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMM dd, yyyy hh:mm a")
    } catch (error) {
      return dateString
    }
  }

  // Fetch clearances on component mount and when dependencies change
  useEffect(() => {
    fetchClearancesData()
  }, [fetchClearancesData])

  // Clear error and clearances when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearClearances())
      dispatch(clearCashStatus())
    }
  }, [dispatch])

  const validateClearCashForm = () => {
    const errors: ClearCashFormErrors = {}

    if (!clearCashForm.collectionOfficerUserId || clearCashForm.collectionOfficerUserId <= 0) {
      errors.collectionOfficerUserId = "Please enter a valid collection officer user ID"
    }

    if (!clearCashForm.amount || clearCashForm.amount <= 0) {
      errors.amount = "Amount must be greater than 0"
    }

    if (selectedClearance && clearCashForm.amount > selectedClearance.amountCleared) {
      errors.amount = `Amount cannot exceed ${formatCurrency(selectedClearance.amountCleared)}`
    }

    if (!clearCashForm.notes.trim()) {
      errors.notes = "Notes are required"
    }

    setClearCashFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleClearCashInputChange = (field: keyof ClearCashRequest, value: any) => {
    setClearCashForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (clearCashFormErrors[field as keyof ClearCashFormErrors]) {
      setClearCashFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleClearCash = async () => {
    if (!validateClearCashForm() || !selectedClearance) return

    try {
      await dispatch(
        clearCash({
          id: selectedClearance.id,
          clearCashData: clearCashForm,
        })
      ).unwrap()

      // Data will be automatically refetched by the useEffect due to state changes
      closeClearCashPanel()
    } catch (error) {}
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    // Reset to first page when searching
    dispatch(setClearancesPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
    // Reset to first page when clearing search
    dispatch(setClearancesPagination({ page: 1, pageSize }))
  }

  const paginate = (pageNumber: number) => {
    dispatch(setClearancesPagination({ page: pageNumber, pageSize }))
  }

  // Filter clearances based on search text
  const filteredClearances = clearances.filter((clearance) => {
    if (!searchText) return true

    const searchLower = searchText.toLowerCase()
    return (
      clearance.id.toString().includes(searchLower) ||
      formatCurrency(clearance.amountCleared).toLowerCase().includes(searchLower) ||
      formatCurrency(clearance.cashAtHandBefore).toLowerCase().includes(searchLower) ||
      formatCurrency(clearance.cashAtHandAfter).toLowerCase().includes(searchLower) ||
      clearance.notes.toLowerCase().includes(searchLower) ||
      (clearance.collectionOfficer?.fullName || "").toLowerCase().includes(searchLower) ||
      (clearance.clearedBy?.fullName || "").toLowerCase().includes(searchLower) ||
      formatDate(clearance.clearedAt).toLowerCase().includes(searchLower)
    )
  })

  if (clearancesLoading) return <LoadingSkeleton />
  if (clearancesError) return <div className="p-4 text-red-500">Error loading clearance data: {clearancesError}</div>

  return (
    <div className="w-full">
      {/* Search Section */}
      <div className="mb-4 flex items-center justify-end">
        <SearchModule
          value={searchText}
          onChange={handleSearch}
          onCancel={handleCancelSearch}
          placeholder="Search clearances..."
          className="w-full max-w-[380px]"
          bgClassName="bg-white"
        />
      </div>

      {filteredClearances.length === 0 ? (
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
            {searchText ? "No matching clearances found" : "No clearance records available"}
          </motion.p>
          <motion.p
            className="text-sm text-gray-500"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {searchText ? "Try a different search term" : "Cash clearance records will appear here"}
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
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                      ID
                    </div>
                  </th>
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("amountCleared")}
                  >
                    <div className="flex items-center gap-2">
                      Amount Cleared <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("cashAtHandBefore")}
                  >
                    <div className="flex items-center gap-2">
                      Cash Before <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("cashAtHandAfter")}
                  >
                    <div className="flex items-center gap-2">
                      Cash After <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("clearedAt")}
                  >
                    <div className="flex items-center gap-2">
                      Cleared At <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("collectionOfficer")}
                  >
                    <div className="flex items-center gap-2">
                      Collection Officer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("clearedBy")}
                  >
                    <div className="flex items-center gap-2">
                      Cleared By <RxCaretSort />
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
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredClearances.map((clearance, index) => (
                    <React.Fragment key={clearance.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                          CL-{clearance.id.toString().padStart(5, "0")}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                          {formatCurrency(clearance.amountCleared)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          {formatCurrency(clearance.cashAtHandBefore)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          {formatCurrency(clearance.cashAtHandAfter)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          {formatDate(clearance.clearedAt)}
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{clearance.collectionOfficer?.fullName || "N/A"}</span>
                            <span className="text-xs text-gray-500">
                              {clearance.collectionOfficer?.employeeId || ""}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{clearance.clearedBy?.fullName || "N/A"}</span>
                            <span className="text-xs text-gray-500">{clearance.clearedBy?.employeeId || ""}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <motion.div
                            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                            style={{
                              backgroundColor: "#EEF5F0",
                              color: "#589E67",
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor: "#589E67",
                              }}
                            ></span>
                            Completed
                          </motion.div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedClearanceId((prev) => (prev === clearance.id ? null : clearance.id))
                            }
                          >
                            {expandedClearanceId === clearance.id ? "Hide details" : "View details"}
                          </ButtonModule>
                        </td>
                      </motion.tr>

                      {expandedClearanceId === clearance.id && (
                        <tr>
                          <td colSpan={9} className="border-b bg-[#F9FAFB] px-4 py-4 text-sm text-gray-700">
                            <div className="grid gap-4 md:grid-cols-4">
                              <div>
                                <p className="text-xs font-semibold text-gray-500">Notes</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                                  {clearance.notes || "No notes provided"}
                                </p>
                              </div>

                              {clearance.salesRep && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-500">Sales Rep</p>
                                  <p className="mt-1 text-sm font-medium text-gray-800">
                                    {clearance.salesRep.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500">{clearance.salesRep.email}</p>
                                  <p className="text-xs text-gray-500">{clearance.salesRep.phoneNumber}</p>
                                  <p className="text-xs text-gray-500">Acct ID: {clearance.salesRep.accountId}</p>
                                </div>
                              )}

                              <div>
                                <p className="text-xs font-semibold text-gray-500">Collection Officer</p>
                                <p className="mt-1 text-sm font-medium text-gray-800">
                                  {clearance.collectionOfficer?.fullName || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">{clearance.collectionOfficer?.email || ""}</p>
                                <p className="text-xs text-gray-500">
                                  {clearance.collectionOfficer?.phoneNumber || ""}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-gray-500">Cleared By</p>
                                <p className="mt-1 text-sm font-medium text-gray-800">
                                  {clearance.clearedBy?.fullName || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">{clearance.clearedBy?.email || ""}</p>
                                <p className="text-xs text-gray-500">{clearance.clearedBy?.phoneNumber || ""}</p>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                              <div>
                                <p className="text-xs font-semibold text-gray-500">Cleared At</p>
                                <p className="mt-1 text-sm text-gray-800">{formatDate(clearance.clearedAt)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500">Cash Before</p>
                                <p className="mt-1 text-sm text-gray-800">
                                  {formatCurrency(clearance.cashAtHandBefore)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500">Cash After</p>
                                <p className="mt-1 text-sm text-gray-800">
                                  {formatCurrency(clearance.cashAtHandAfter)}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          <motion.div
            className="flex items-center justify-between border-t py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of{" "}
              {totalRecords} entries
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = index + 1
                } else if (currentPage <= 3) {
                  pageNum = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index
                } else {
                  pageNum = currentPage - 2 + index
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#004B23] text-white"
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

              {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

              {totalPages > 5 && currentPage < totalPages - 1 && (
                <motion.button
                  onClick={() => paginate(totalPages)}
                  className={`flex size-8 items-center justify-center rounded-md text-sm ${
                    currentPage === totalPages
                      ? "bg-[#004B23] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {totalPages}
                </motion.button>
              )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

export default AgentClearanceTable
