"use client"
import React, { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp, Filter, Grid, LayoutList, SortAsc, SortDesc, X } from "lucide-react"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppSelector } from "lib/hooks/useRedux"
import EmptySearchState from "components/ui/EmptySearchState"

interface SortOption {
  label: string
  value: string
  order: "asc" | "desc"
}

// Types
interface Report {
  id: string
  title: string
  type: "outage" | "maintenance" | "performance" | "compliance" | "financial"
  period: string
  generatedDate: string
  generatedBy: string
  status: "draft" | "pending" | "approved" | "published"
  fileSize: string
  format: "pdf" | "excel" | "csv"
  description: string
  tags: string[]
  downloadCount: number
  lastDownloaded?: string
}

interface ActionDropdownProps {
  report: Report
  onViewDetails: (report: Report) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ report, onViewDetails }) => {
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
    onViewDetails(report)
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
                className="block w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50"
                onClick={() => {
                  console.log("Download report:", report.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f0f9f4" }}
                transition={{ duration: 0.1 }}
              >
                Download
              </motion.button>
              <motion.button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Share report:", report.id)
                  setIsOpen(false)
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
                transition={{ duration: 0.1 }}
              >
                Share
              </motion.button>
              {report.status === "draft" && (
                <motion.button
                  className="block w-full px-4 py-2 text-left text-sm text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    console.log("Edit report:", report.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: "#eff6ff" }}
                  transition={{ duration: 0.1 }}
                >
                  Edit
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Loading Skeleton Component
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
              {[...Array(6)].map((_, i) => (
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
                {[...Array(6)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200">
                      <motion.div
                        className="size-full rounded bg-gray-300"
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          transition: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (rowIndex * 6 + cellIndex) * 0.05,
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
        <div className="size-48 rounded bg-gray-200">
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
          <div className="size-8 rounded bg-gray-200">
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
            <div key={i} className="size-8 rounded bg-gray-200">
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
          <div className="size-8 rounded bg-gray-200">
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

// Mock data
const mockReports: Report[] = []

// Mobile Filter Sidebar Component
const MobileFilterSidebar = ({
  isOpen,
  onClose,
  localFilters,
  handleFilterChange,
  handleSortChange,
  applyFilters,
  resetFilters,
  getActiveFilterCount,
  typeOptions,
  statusOptions,
  formatOptions,
  sortOptions,
}: {
  isOpen: boolean
  onClose: () => void
  localFilters: any
  handleFilterChange: (key: string, value: string | undefined) => void
  handleSortChange: (option: SortOption) => void
  applyFilters: () => void
  resetFilters: () => void
  getActiveFilterCount: () => number
  typeOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  formatOptions: Array<{ value: string; label: string }>
  sortOptions: SortOption[]
}) => {
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-filter-sidebar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-stretch justify-end bg-black/30 backdrop-blur-sm 2xl:hidden"
          onClick={onClose}
        >
          <motion.div
            key="mobile-filter-content"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="flex size-full max-w-sm flex-col bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold">Filters & Sorting</h2>
                  {getActiveFilterCount() > 0 && (
                    <p className="text-xs text-gray-500">{getActiveFilterCount()} active filter(s)</p>
                  )}
                </div>
              </div>
              <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
                Clear All
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 space-y-4">
              {/* Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["outage", "maintenance", "performance", "compliance", "financial"].map((typeValue) => {
                    const typeLabel = typeOptions.find((opt) => opt.value === typeValue)?.label || ""
                    return (
                      <button
                        key={typeValue}
                        onClick={() =>
                          handleFilterChange("type", localFilters.type === typeValue ? undefined : typeValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.type === typeValue
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {typeLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["draft", "pending", "approved", "published"].map((statusValue) => {
                    const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || ""
                    return (
                      <button
                        key={statusValue}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === statusValue
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {statusLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Format Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Format</label>
                <FormSelectModule
                  name="format"
                  value={localFilters.format || ""}
                  onChange={(e) => handleFilterChange("format", e.target.value === "" ? undefined : e.target.value)}
                  options={formatOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.SortBy === option.value && localFilters.SortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.SortBy === option.value && localFilters.SortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-6 border-t bg-white p-4 2xl:hidden">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    applyFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters()
                    onClose()
                  }}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const ReportsTab: React.FC = () => {
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [pageSize, setPageSize] = useState(10)
  const { user } = useAppSelector((state) => state.auth)

  const canGenerateReport = !!user?.privileges?.some(
    (p) => (p.key === "outage-management" || p.key === "reports") && p.actions?.includes("W")
  )
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(false)
  const [isSortExpanded, setIsSortExpanded] = useState(true)

  // Filter state
  const [localFilters, setLocalFilters] = useState<{
    type?: string
    status?: string
    format?: string
    SortBy?: string
    SortOrder?: "asc" | "desc"
  }>({
    SortBy: "",
    SortOrder: "asc",
  })

  const [appliedFilters, setAppliedFilters] = useState<{
    type?: string
    status?: string
    format?: string
    SortBy?: string
    SortOrder?: "asc" | "desc"
  }>({})

  // Filter options
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "outage", label: "Outage" },
    { value: "maintenance", label: "Maintenance" },
    { value: "performance", label: "Performance" },
    { value: "compliance", label: "Compliance" },
    { value: "financial", label: "Financial" },
  ]

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "published", label: "Published" },
  ]

  const formatOptions = [
    { value: "", label: "All Formats" },
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel" },
    { value: "csv", label: "CSV" },
  ]

  const sortOptions: SortOption[] = [
    { label: "Title (A-Z)", value: "title", order: "asc" },
    { label: "Title (Z-A)", value: "title", order: "desc" },
    { label: "Type (A-Z)", value: "type", order: "asc" },
    { label: "Type (Z-A)", value: "type", order: "desc" },
    { label: "Status (A-Z)", value: "status", order: "asc" },
    { label: "Status (Z-A)", value: "status", order: "desc" },
    { label: "Generated Date (Oldest First)", value: "generatedDate", order: "asc" },
    { label: "Generated Date (Newest First)", value: "generatedDate", order: "desc" },
  ]

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | undefined) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  // Handle sort changes
  const handleSortChange = (option: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      SortBy: option.value,
      SortOrder: option.order,
    }))
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      type: localFilters.type,
      status: localFilters.status,
      format: localFilters.format,
      SortBy: localFilters.SortBy || undefined,
      SortOrder: localFilters.SortOrder || undefined,
    })
    setCurrentPage(1)
  }

  // Reset all filters
  const resetFilters = () => {
    setLocalFilters({
      SortBy: "",
      SortOrder: "asc",
    })
    setAppliedFilters({})
    setCurrentPage(1)
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (appliedFilters.type) count++
    if (appliedFilters.status) count++
    if (appliedFilters.format) count++
    if (appliedFilters.SortBy) count++
    return count
  }

  // Filter and sort reports (client-side for now since using mock data)
  const filteredReports = mockReports.filter((report) => {
    if (
      searchText &&
      !report.title.toLowerCase().includes(searchText.toLowerCase()) &&
      !report.description.toLowerCase().includes(searchText.toLowerCase()) &&
      !report.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
    ) {
      return false
    }
    if (appliedFilters.type && report.type !== appliedFilters.type) return false
    if (appliedFilters.status && report.status !== appliedFilters.status) return false
    if (appliedFilters.format && report.format !== appliedFilters.format) return false
    return true
  })

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (!appliedFilters.SortBy) return 0
    const order = appliedFilters.SortOrder === "asc" ? 1 : -1
    switch (appliedFilters.SortBy) {
      case "title":
        return a.title.localeCompare(b.title) * order
      case "type":
        return a.type.localeCompare(b.type) * order
      case "status":
        return a.status.localeCompare(b.status) * order
      case "generatedDate":
        return (new Date(a.generatedDate).getTime() - new Date(b.generatedDate).getTime()) * order
      default:
        return 0
    }
  })

  // Paginate reports
  const paginatedReports = sortedReports.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const totalRecords = sortedReports.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  // In a real app, you would fetch this data from an API
  const isLoading = false
  const isError = false
  const reports = paginatedReports

  const getStatusStyle = (status: Report["status"]) => {
    switch (status) {
      case "draft":
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
        }
      case "pending":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "approved":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      case "published":
        return {
          backgroundColor: "#F0FDF4",
          color: "#16A34A",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getTypeStyle = (type: Report["type"]) => {
    switch (type) {
      case "outage":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
        }
      case "maintenance":
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
        }
      case "performance":
        return {
          backgroundColor: "#EFF6FF",
          color: "#2563EB",
        }
      case "compliance":
        return {
          backgroundColor: "#DBE8FE",
          color: "#7C3AED",
        }
      case "financial":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
        }
    }
  }

  const getFormatIcon = (format: Report["format"]) => {
    switch (format) {
      case "pdf":
        return "📄"
      case "excel":
        return "📊"
      case "csv":
        return "📋"
      default:
        return "📄"
    }
  }

  const handleSearch = (text: string) => {
    setSearchText(text)
    setCurrentPage(1)
  }

  const handleManualSearch = () => {
    const trimmed = searchText.trim()
    const shouldUpdate = trimmed.length === 0 || trimmed.length >= 3

    if (shouldUpdate) {
      setSearchText(trimmed)
      setCurrentPage(1)
    }
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  // Handle view mode change
  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode)
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when page size changes
  }

  // Get page items for pagination
  const getPageItems = (): (number | string)[] => {
    const total = totalPages
    const current = currentPage
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

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Handle view details
  const handleViewDetails = (report: Report) => {
    setSelectedReport(report)
    // In a real app, this would open a modal or navigate to details page
    console.log("View report details:", report)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#004B23]"></div>
          <p className="text-sm text-gray-500">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <svg className="size-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">Failed to load reports</p>
            <p className="mt-1 text-sm text-gray-500">Please try again later</p>
          </div>
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="flex-3 relative flex flex-col-reverse items-start gap-6 2xl:mt-5 2xl:flex-row">
        {/* Main Content */}
        <motion.div
          className={
            showDesktopFilters
              ? "w-full rounded-md border bg-white p-3 md:p-5 2xl:max-w-[calc(100%-356px)] 2xl:flex-1"
              : "w-full rounded-md border bg-white p-3 md:p-5 2xl:flex-1"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="items-center justify-between  py-2 md:flex md:py-4">
            <div>
              <p className="text-lg font-medium max-sm:pb-3 md:text-xl">Reports Management</p>
              <p className="text-sm text-gray-500">Generate and manage system reports</p>
            </div>
            <div className="mt-3 flex w-full flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-end md:mt-0 md:w-auto md:gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 2xl:hidden"
              >
                <Filter className="size-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {/* Active filters badge - Desktop only (2xl and above) */}
              {getActiveFilterCount() > 0 && (
                <div className="hidden items-center gap-2 2xl:flex">
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Hide/Show Filters button - Desktop only (2xl and above) */}
              <button
                type="button"
                onClick={() => setShowDesktopFilters((prev) => !prev)}
                className="hidden items-center gap-1 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900 sm:px-4 2xl:flex"
              >
                {showDesktopFilters ? <X className="size-4" /> : <Filter className="size-4" />}
                {showDesktopFilters ? "Hide filters" : "Show filters"}
              </button>
            </div>
          </div>

          {/* Search Priority Section - Standalone */}
          <div className="mb-4 rounded-xl border border-gray-200 bg-gradient-to-r from-green-50/60 to-white p-4 shadow-sm">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#004B23]">Primary action</p>
              <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Search Reports</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Find reports quickly by title, description, or tags.</p>
            </div>

            <SearchModule
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onCancel={handleCancelSearch}
              onSearch={handleManualSearch}
              placeholder="Search by report title, description, or tags..."
              height="h-14"
              className="!w-full rounded-xl border border-[#004B23]/25 bg-white px-2 shadow-sm md:!w-full [&_button]:min-h-[38px] [&_button]:px-4 [&_button]:text-sm [&_input]:text-sm sm:[&_input]:text-base"
            />
          </div>

          {/* View Toggle */}
          <div className="mb-4 flex items-center gap-2">
            <button
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleViewModeChange("list")}
            >
              <LayoutList className="size-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleViewModeChange("grid")}
            >
              <Grid className="size-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <EmptySearchState
                  title={
                    searchText || getActiveFilterCount() > 0 ? "No matching reports found" : "No reports available"
                  }
                  description={
                    searchText || getActiveFilterCount() > 0
                      ? "Try adjusting your search criteria"
                      : "Start by searching with report title, description, or tags."
                  }
                  className="py-6"
                />
                {(searchText || getActiveFilterCount() > 0) && (
                  <button
                    onClick={resetFilters}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm"
                    >
                      {/* Header */}
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100">
                            <span className="text-sm font-semibold text-indigo-600">
                              {getFormatIcon(report.format)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                            <p className="text-xs text-gray-500">{report.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status and Type Badges */}
                      <div className="mb-3 flex flex-wrap gap-1">
                        <motion.div
                          style={getStatusStyle(report.status)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor:
                                report.status === "draft"
                                  ? "#D97706"
                                  : report.status === "pending"
                                  ? "#2563EB"
                                  : report.status === "approved"
                                  ? "#589E67"
                                  : "#16A34A",
                            }}
                          ></span>
                          <span className="text-xs font-medium">
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </motion.div>
                        <motion.div
                          style={getTypeStyle(report.type)}
                          className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.1 }}
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor:
                                report.type === "outage"
                                  ? "#AF4B4B"
                                  : report.type === "maintenance"
                                  ? "#D97706"
                                  : report.type === "performance"
                                  ? "#2563EB"
                                  : report.type === "compliance"
                                  ? "#7C3AED"
                                  : "#589E67",
                            }}
                          ></span>
                          <span className="text-xs font-medium">
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                          </span>
                        </motion.div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span className="font-medium text-gray-900">{report.format.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium text-gray-900">{report.fileSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Downloads:</span>
                          <span className="font-medium text-gray-900">{report.downloadCount}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-3 border-t border-gray-100 pt-3">
                        <p className="line-clamp-2 text-xs text-gray-500">{report.description}</p>
                      </div>

                      {/* Tags */}
                      {report.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {report.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {report.tags.length > 2 && (
                            <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                              +{report.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-3">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Report Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Type & Period
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          File Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Usage Stats
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {reports.map((report) => (
                        <tr key={report.id} className="transition-colors hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{report.title}</p>
                              <p className="text-xs text-gray-500">{report.description}</p>
                              <p className="text-xs text-gray-500">ID: {report.id}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {report.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {report.tags.length > 2 && (
                                  <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                    +{report.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <motion.div
                                style={getTypeStyle(report.type)}
                                className="inline-flex w-fit items-center justify-center gap-1 rounded-full px-2 py-1"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.1 }}
                              >
                                <span
                                  className="size-2 rounded-full"
                                  style={{
                                    backgroundColor:
                                      report.type === "outage"
                                        ? "#AF4B4B"
                                        : report.type === "maintenance"
                                        ? "#D97706"
                                        : report.type === "performance"
                                        ? "#2563EB"
                                        : report.type === "compliance"
                                        ? "#7C3AED"
                                        : "#589E67",
                                  }}
                                ></span>
                                <span className="text-xs font-medium">
                                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                </span>
                              </motion.div>
                              <div className="text-xs text-gray-500">{report.period}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <motion.div
                              style={getStatusStyle(report.status)}
                              className="inline-flex items-center justify-center gap-1 rounded-full px-2 py-1"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.1 }}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    report.status === "draft"
                                      ? "#D97706"
                                      : report.status === "pending"
                                      ? "#2563EB"
                                      : report.status === "approved"
                                      ? "#589E67"
                                      : "#16A34A",
                                }}
                              ></span>
                              <span className="text-xs font-medium">
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                            </motion.div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getFormatIcon(report.format)}</span>
                              <div>
                                <div className="text-sm text-gray-900">{report.format.toUpperCase()}</div>
                                <div className="text-xs text-gray-500">{report.fileSize}</div>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Generated: {new Date(report.generatedDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{report.downloadCount} downloads</div>
                            {report.lastDownloaded && (
                              <div className="text-xs text-gray-500">
                                Last: {new Date(report.lastDownloaded).toLocaleDateString()}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">By: {report.generatedBy}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleViewDetails(report)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {reports.length > 0 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Rows per page:</span>
                    <div className="relative">
                      <select
                        name="pageSize"
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="h-9 w-16 cursor-pointer appearance-none rounded-md border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <option value={6}>6 rows</option>
                        <option value={10}>10 rows</option>
                        <option value={12}>12 rows</option>
                        <option value={18}>18 rows</option>
                        <option value={24}>24 rows</option>
                        <option value={50}>50 rows</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1">
                        <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className={`flex size-8 items-center justify-center rounded-md border ${
                        currentPage === 1
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageItems().map((item, index) =>
                        typeof item === "number" ? (
                          <button
                            key={item}
                            className={`flex size-8 items-center justify-center rounded-md text-sm ${
                              currentPage === item
                                ? "bg-[#004B23] font-medium text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => paginate(item)}
                          >
                            {item}
                          </button>
                        ) : (
                          <span key={`ellipsis-${index}`} className="px-1 text-sm text-gray-500">
                            {item}
                          </span>
                        )
                      )}
                    </div>

                    <button
                      className={`flex size-8 items-center justify-center rounded-md border ${
                        currentPage === totalPages
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Desktop Filters Sidebar (2xl and above) - Separate Container */}
        {showDesktopFilters && (
          <motion.div
            key="desktop-filters-sidebar"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="hidden w-full flex-col rounded-md border bg-white p-3 md:p-5 2xl:mt-0 2xl:flex 2xl:w-80 2xl:self-start"
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3 md:pb-4">
              <h2 className="text-base font-semibold text-gray-900 md:text-lg">Filters & Sorting</h2>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 md:text-sm"
              >
                <X className="size-3 md:size-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {["outage", "maintenance", "performance", "compliance", "financial"].map((typeValue) => {
                    const typeLabel = typeOptions.find((opt) => opt.value === typeValue)?.label || ""
                    return (
                      <button
                        key={typeValue}
                        onClick={() =>
                          handleFilterChange("type", localFilters.type === typeValue ? undefined : typeValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.type === typeValue
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {typeLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["draft", "pending", "approved", "published"].map((statusValue) => {
                    const statusLabel = statusOptions.find((opt) => opt.value === statusValue)?.label || ""
                    return (
                      <button
                        key={statusValue}
                        onClick={() =>
                          handleFilterChange("status", localFilters.status === statusValue ? undefined : statusValue)
                        }
                        className={`rounded-md px-3 py-2 text-xs transition-colors md:text-sm ${
                          localFilters.status === statusValue
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {statusLabel}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Format Filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Format</label>
                <FormSelectModule
                  name="format"
                  value={localFilters.format || ""}
                  onChange={(e) => handleFilterChange("format", e.target.value === "" ? undefined : e.target.value)}
                  options={formatOptions}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>

              {/* Sort Options */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsSortExpanded((prev) => !prev)}
                  className="mb-1.5 flex w-full items-center justify-between text-xs font-medium text-gray-700 md:text-sm"
                  aria-expanded={isSortExpanded}
                >
                  <span>Sort By</span>
                  {isSortExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {isSortExpanded && (
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => handleSortChange(option)}
                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                          localFilters.SortBy === option.value && localFilters.SortOrder === option.order
                            ? "bg-purple-50 text-purple-700 ring-1 ring-purple-200"
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{option.label}</span>
                        {localFilters.SortBy === option.value && localFilters.SortOrder === option.order && (
                          <span className="text-purple-600">
                            {option.order === "asc" ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 shrink-0 space-y-3 border-t pt-4">
              <button
                onClick={applyFilters}
                className="button-filled flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <Filter className="size-4" />
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="button-oulined flex w-full items-center justify-center gap-2 text-sm md:text-base"
              >
                <X className="size-4" />
                Reset All
              </button>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 shrink-0 rounded-lg bg-gray-50 p-3 md:mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 md:text-base">Summary</h3>
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span className="font-medium">{mockReports.length.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Page:</span>
                  <span className="font-medium">
                    {currentPage} / {totalPages}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Filters:</span>
                  <span className="font-medium">{getActiveFilterCount()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        localFilters={localFilters}
        handleFilterChange={handleFilterChange}
        handleSortChange={handleSortChange}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getActiveFilterCount={getActiveFilterCount}
        typeOptions={typeOptions}
        statusOptions={statusOptions}
        formatOptions={formatOptions}
        sortOptions={sortOptions}
      />
    </div>
  )
}

export default ReportsTab
