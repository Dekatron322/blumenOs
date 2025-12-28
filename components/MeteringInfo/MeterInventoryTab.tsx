"use client"

import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchMeters, Meter } from "lib/redux/metersSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { VscChevronDown, VscChevronUp, VscEye } from "react-icons/vsc"
import { useRouter } from "next/navigation"
import EditMeterModal from "components/ui/Modal/edit-meter-modal"
import MeterHistoryModal from "components/ui/Modal/meter-history-modal"

interface ActionDropdownProps {
  meter: Meter
  onViewDetails: (meter: Meter) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ meter, onViewDetails }) => {
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
    onViewDetails(meter)
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
                  console.log("Edit meter:", meter.drn)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Edit Meter
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("View history:", meter.drn)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                View History
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
      className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-40 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        </div>
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                },
              }}
            />
          </div>
          <div className="h-10 w-24 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-24 rounded bg-gray-200">
                    <motion.div
                      className="size-full rounded bg-gray-300"
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3],
                        transition: {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.1,
                        },
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
                {[...Array(8)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-20 rounded bg-gray-200">
                      <motion.div
                        className="size-full rounded bg-gray-300"
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (rowIndex * 8 + cellIndex) * 0.05,
                          },
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
        <div className="h-8 w-48 rounded bg-gray-200">
          <motion.div
            className="size-full rounded bg-gray-300"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                },
              }}
            />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-8 rounded bg-gray-200">
              <motion.div
                className="size-full rounded bg-gray-300"
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.8 + i * 0.1,
                  },
                }}
              />
            </div>
          ))}
          <div className="h-8 w-8 rounded bg-gray-200">
            <motion.div
              className="size-full rounded bg-gray-300"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.3,
                },
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const MeterInventoryTable: React.FC = () => {
  const router = useRouter()
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyMeterId, setHistoryMeterId] = useState<number | null>(null)
  const [historyMeterDRN, setHistoryMeterDRN] = useState<string>("")
  const dispatch = useAppDispatch()
  const { meters, error, pagination } = useAppSelector((state) => state.meters)

  // Fetch meters on component mount and when search/page changes
  useEffect(() => {
    const fetchMetersData = () => {
      dispatch(
        fetchMeters({
          pageNumber: currentPage,
          pageSize: pageSize,
          search: searchText || undefined,
        })
      )
    }

    fetchMetersData()
  }, [dispatch, currentPage, pageSize, searchText])

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Helper function to get status color
  const getStatusStyle = (isMeterActive: boolean) => {
    return {
      backgroundColor: isMeterActive ? "#EEF5F0" : "#F7EDED",
      color: isMeterActive ? "#589E67" : "#AF4B4B",
    }
  }

  // Helper function to get meter type display
  const getMeterTypeDisplay = (meterType: number, meterIsPPM: boolean) => {
    if (meterIsPPM) {
      return meterType === 1 ? "Prepaid Smart" : "Prepaid Basic"
    }
    return meterType === 1 ? "Postpaid Smart" : "Postpaid Basic"
  }

  // Helper function to get meter type color
  const getMeterTypeStyle = (meterIsPPM: boolean) => {
    return {
      backgroundColor: meterIsPPM ? "#EFF6FF" : "#F5F3FF",
      color: meterIsPPM ? "#1E40AF" : "#5B21B6",
    }
  }

  const handleEditMeter = (meter: Meter) => {
    setEditingMeter(meter)
    setEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setEditingMeter(null)
  }

  const handleEditSuccess = () => {
    // Refresh the meters list to show updated data
    dispatch(
      fetchMeters({
        pageNumber: currentPage,
        pageSize: pageSize,
        search: searchText || undefined,
      })
    )
  }

  const handleViewHistory = (meter: Meter) => {
    setHistoryMeterId(meter.id)
    setHistoryMeterDRN(meter.drn)
    setHistoryModalOpen(true)
  }

  const handleCloseHistoryModal = () => {
    setHistoryModalOpen(false)
    setHistoryMeterId(null)
    setHistoryMeterDRN("")
  }

  const totalRecords = pagination.totalCount
  const totalPages = Math.ceil(totalRecords / pageSize)
  const isLoading = false // Add your loading state logic here

  if (isLoading) return <LoadingSkeleton />
  if (error) return <div>Error loading meters</div>

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Meter Directory</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search by DRN, Customer, or Address..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <motion.button
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MdOutlineArrowBackIosNew className="h-4 w-4" />
            Export
          </motion.button>
        </div>
      </motion.div>

      {meters.length === 0 ? (
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
            {searchText ? "No matching meters found" : "No meters available"}
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
                      DRN
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("customerFullName")}
                  >
                    <div className="flex items-center gap-2">
                      Customer <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("address")}
                  >
                    <div className="flex items-center gap-2">
                      Address <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("isMeterActive")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("meterType")}
                  >
                    <div className="flex items-center gap-2">
                      Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("tariffRate")}
                  >
                    <div className="flex items-center gap-2">
                      Tariff Rate <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("installationDate")}
                  >
                    <div className="flex items-center gap-2">
                      Installation Date <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {meters.map((meter, index) => (
                    <React.Fragment key={meter.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">{meter.drn}</td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{meter.customerFullName}</td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{meter.address}</td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <motion.div
                            style={getStatusStyle(meter.isMeterActive)}
                            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{
                                backgroundColor: meter.isMeterActive ? "#589E67" : "#AF4B4B",
                              }}
                            ></span>
                            {meter.isMeterActive ? "Online" : "Offline"}
                          </motion.div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          <motion.div
                            style={getMeterTypeStyle(meter.meterIsPPM)}
                            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.1 }}
                          >
                            {getMeterTypeDisplay(meter.meterType, meter.meterIsPPM)}
                          </motion.div>
                        </td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{meter.tariffRate} kWh</td>
                        <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                          {new Date(meter.installationDate).toLocaleDateString()}
                        </td>
                        <td className="flex items-center gap-2 whitespace-nowrap border-b px-4 py-1 text-sm">
                          <ButtonModule
                            icon={<VscEye />}
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/metering/all-meters/${meter.id}`)}
                          >
                            View
                          </ButtonModule>

                          <motion.button
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => setSelectedMeter(selectedMeter?.id === meter.id ? null : meter)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={selectedMeter?.id === meter.id ? "Hide details" : "View details"}
                          >
                            {selectedMeter?.id === meter.id ? (
                              <VscChevronUp className="size-4" />
                            ) : (
                              <VscChevronDown className="size-4" />
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>

                      <AnimatePresence>
                        {selectedMeter?.id === meter.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan={8} className="border-b bg-gray-50 p-0">
                              <motion.div
                                className="p-6"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900">Meter Information</h4>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">DRN:</span>
                                          <span className="font-medium">{selectedMeter.drn}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Status:</span>
                                          <motion.div
                                            style={getStatusStyle(selectedMeter.isMeterActive)}
                                            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                          >
                                            <span
                                              className="size-2 rounded-full"
                                              style={{
                                                backgroundColor: selectedMeter.isMeterActive ? "#589E67" : "#AF4B4B",
                                              }}
                                            ></span>
                                            {selectedMeter.isMeterActive ? "Online" : "Offline"}
                                          </motion.div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Type:</span>
                                          <motion.div
                                            style={getMeterTypeStyle(selectedMeter.meterIsPPM)}
                                            className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                          >
                                            {getMeterTypeDisplay(selectedMeter.meterType, selectedMeter.meterIsPPM)}
                                          </motion.div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900">Customer Information</h4>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Name:</span>
                                          <span className="font-medium">{selectedMeter.customerFullName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Address:</span>
                                          <span className="font-medium">{selectedMeter.address}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Phone:</span>
                                          <span className="font-medium">
                                            {selectedMeter.tenantPhoneNumber || "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900">Technical Details</h4>
                                      <div className="mt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Tariff Rate:</span>
                                          <span className="font-medium">{selectedMeter.tariffRate} kWh</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Service Band:</span>
                                          <span className="font-medium">{selectedMeter.serviceBand || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-500">Installation Date:</span>
                                          <span className="font-medium">
                                            {new Date(selectedMeter.installationDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                  <ButtonModule
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditMeter(selectedMeter)}
                                  >
                                    Edit Meter
                                  </ButtonModule>
                                  <ButtonModule size="sm" onClick={() => handleViewHistory(selectedMeter)}>
                                    View History
                                  </ButtonModule>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
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

      <EditMeterModal
        isOpen={editModalOpen}
        onRequestClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        meter={editingMeter}
      />

      <MeterHistoryModal
        isOpen={historyModalOpen}
        onRequestClose={handleCloseHistoryModal}
        meterId={historyMeterId}
        meterDRN={historyMeterDRN}
      />
    </motion.div>
  )
}

export default MeterInventoryTable
