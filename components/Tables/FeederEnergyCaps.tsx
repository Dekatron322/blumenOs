"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearError,
  FeederEnergyCapsRequestParams,
  fetchFeederEnergyCaps,
  setPagination,
} from "lib/redux/feederEnergyCapSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { AddCustomerIcon } from "components/Icons/Icons"
import { PlusCircle } from "lucide-react"

interface ActionDropdownProps {
  energyCap: FeederEnergyCap
  onViewDetails: (energyCap: FeederEnergyCap) => void
  onUpdateEnergyCap: (energyCapId: number) => void
}

// Use the FeederEnergyCap interface from your slice
interface FeederEnergyCap {
  id: number
  feederId: number
  period: string
  energyCapKwh: number
  tariffOverridePerKwh: number
  capturedAtUtc: string
  capturedByUserId: number
  capturedByName: string
  notes: string
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ energyCap, onViewDetails, onUpdateEnergyCap }) => {
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
    onViewDetails(energyCap)
    setIsOpen(false)
  }

  const handleUpdateEnergyCap = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Update operations for:", energyCap.id)
    onUpdateEnergyCap(energyCap.id)
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
                onClick={handleUpdateEnergyCap}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Update Energy Cap
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

const FeederEnergyCaps: React.FC = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { feederEnergyCaps, feederEnergyCapsLoading, feederEnergyCapsError, pagination } = useAppSelector(
    (state) => state.feederEnergyCaps
  )

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [selectedEnergyCap, setSelectedEnergyCap] = useState<FeederEnergyCap | null>(null)

  // Get pagination values from Redux state
  const currentPage = pagination.currentPage
  const pageSize = pagination.pageSize
  const totalRecords = pagination.totalCount
  const totalPages = pagination.totalPages || 1

  // Fetch feeder energy caps on component mount and when search/pagination changes
  useEffect(() => {
    const fetchParams: FeederEnergyCapsRequestParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(searchText && { period: searchText }),
    }

    dispatch(fetchFeederEnergyCaps(fetchParams))
  }, [dispatch, currentPage, pageSize, searchText])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const getStatusStyle = (energyCapKwh: number) => {
    if (energyCapKwh > 10000) {
      return {
        backgroundColor: "#F7EDED",
        color: "#AF4B4B",
      }
    } else if (energyCapKwh > 5000) {
      return {
        backgroundColor: "#FEF6E6",
        color: "#D97706",
      }
    } else {
      return {
        backgroundColor: "#EEF5F0",
        color: "#589E67",
      }
    }
  }

  const getStatusLabel = (energyCapKwh: number) => {
    if (energyCapKwh > 10000) {
      return "High"
    } else if (energyCapKwh > 5000) {
      return "Medium"
    } else {
      return "Low"
    }
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    // Reset to first page when searching
    dispatch(setPagination({ page: 1, pageSize }))
  }

  const handleCancelSearch = () => {
    setSearchText("")
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

  const handleViewEnergyCapDetails = (energyCap: FeederEnergyCap) => {
    router.push(`/billing/feeder-energy-caps/energy-cap-details/${energyCap.id}`)
  }

  const handleUpdateEnergyCap = (energyCapId: number) => {
    router.push(`/billing/feeder-energy-caps/update-energy-cap/${energyCapId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
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

  if (feederEnergyCapsLoading) return <LoadingSkeleton />
  if (feederEnergyCapsError)
    return <div className="p-4 text-red-500">Error loading feeder energy cap data: {feederEnergyCapsError}</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Feeder Energy Caps</p>
          <p className="text-sm text-gray-600">Manage and monitor feeder energy consumption caps and tariffs</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search by period (e.g., 2024-01)..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <button
            type="button"
            onClick={() => router.push("/billing/feeder-energy-caps/add")}
            className="rounded-md bg-[#004B23] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <PlusCircle className="size-4 md:hidden" />
            <p className="max-md:hidden"> Add Feeder Cap </p>
          </button>
        </div>
      </motion.div>

      {feederEnergyCaps.length === 0 ? (
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
            {searchText ? "No matching feeder energy caps found" : "No feeder energy caps available"}
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
                  <th
                    className="text-500 cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("feederId")}
                  >
                    <div className="flex items-center gap-2">
                      Feeder ID <RxCaretSort />
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
                    onClick={() => toggleSort("energyCapKwh")}
                  >
                    <div className="flex items-center gap-2">
                      Energy Cap (kWh) <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("tariffOverridePerKwh")}
                  >
                    <div className="flex items-center gap-2">
                      Tariff Override <RxCaretSort />
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
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Cap Level <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {feederEnergyCaps.map((energyCap: FeederEnergyCap, index: number) => (
                    <motion.tr
                      key={energyCap.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">FEEDER-{energyCap.feederId}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">{energyCap.period}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {energyCap.energyCapKwh.toLocaleString()} kWh
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {formatCurrency(energyCap.tariffOverridePerKwh)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        {formatDate(energyCap.capturedAtUtc)}
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{energyCap.capturedByName}</td>
                      <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                        <motion.div
                          style={getStatusStyle(energyCap.energyCapKwh)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1 text-xs"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: getStatusStyle(energyCap.energyCapKwh).color,
                            }}
                          ></span>
                          {getStatusLabel(energyCap.energyCapKwh)}
                        </motion.div>
                      </td>
                      <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                        <ButtonModule size="sm" onClick={() => handleViewEnergyCapDetails(energyCap)} variant="primary">
                          View Details
                        </ButtonModule>
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

export default FeederEnergyCaps
