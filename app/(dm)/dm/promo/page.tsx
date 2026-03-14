"use client"

import React, { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  ClearancePromo,
  ClearancePromosRequest,
  fetchClearancePromos,
  selectClearancePromos,
  selectClearancePromosError,
  selectClearancePromosLoading,
  selectClearancePromosPagination,
} from "lib/redux/debtManagementSlice"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import PausePromoModal from "components/ui/Modal/pause-promo-modal"
import PromoDetailsModal from "components/ui/Modal/promo-details-modal"
import { AlertCircle, Edit, Eye, FileText, Loader2, Pause, Play, RefreshCw, Search, X } from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"

// Status options for filters
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "true", label: "Active Only" },
  { value: "false", label: "Inactive Only" },
]

const scopeOptions = [
  { value: "", label: "All Scopes" },
  { value: "1", label: "Global" },
  { value: "2", label: "Regional" },
  { value: "3", label: "Local" },
]

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getStatusColor = (isActive: boolean, isPaused: boolean) => {
  if (isPaused) {
    return "text-yellow-600 bg-yellow-50"
  }
  if (isActive) {
    return "text-green-600 bg-green-50"
  }
  return "text-gray-600 bg-gray-50"
}

const getStatusLabel = (isActive: boolean, isPaused: boolean) => {
  if (isPaused) return "Paused"
  if (isActive) return "Active"
  return "Inactive"
}

// Promo Card Component - Compact Version
const PromoCard = ({
  promo,
  onPauseResume,
  onView,
  router,
}: {
  promo: ClearancePromo
  onPauseResume: (promo: ClearancePromo) => void
  onView: (promo: ClearancePromo) => void
  router: ReturnType<typeof useRouter>
}) => {
  const isActive = promo.isActive && !promo.isPaused
  const isExpired = new Date(promo.endAtUtc) < new Date()

  const handlePauseResume = () => {
    onPauseResume(promo)
  }

  const handleView = () => {
    onView(promo)
  }

  const handleEdit = () => {
    router.push(`/dm/promo/edit/${promo.id}`)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-all hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">{promo.name}</h3>
          <p className="text-xs text-gray-500">Code: {promo.code}</p>
        </div>
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
            isExpired ? "bg-red-50 text-red-600" : getStatusColor(promo.isActive, promo.isPaused)
          }`}
        >
          {isExpired ? "Expired" : getStatusLabel(promo.isActive, promo.isPaused)}
        </span>
      </div>

      {promo.description && <p className="mb-2 line-clamp-1 text-xs text-gray-600">{promo.description}</p>}

      <div className="mb-2 flex items-center justify-between">
        <div className="text-lg font-bold text-blue-600">{promo.discountPercent}% OFF</div>
        <div className="text-xs text-gray-500">Scope: {promo.scope}</div>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Start</p>
          <p className="font-medium text-gray-900">{formatDate(promo.startAtUtc)}</p>
        </div>
        <div>
          <p className="text-gray-500">End</p>
          <p className="font-medium text-gray-900">{formatDate(promo.endAtUtc)}</p>
        </div>
      </div>

      <div className="mb-2 flex justify-between text-xs text-gray-500">
        <span>Created: {formatDate(promo.createdAt)}</span>
        {promo.lastUpdated && <span>Updated: {formatDate(promo.lastUpdated)}</span>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1">
        <button
          onClick={handlePauseResume}
          disabled={isExpired}
          className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
            isExpired
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : promo.isPaused
              ? "bg-green-50 text-green-600 hover:bg-green-100"
              : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
          }`}
        >
          {promo.isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
          {promo.isPaused ? "Resume" : "Pause"}
        </button>

        <button
          onClick={handleView}
          className="flex flex-1 items-center justify-center gap-1 rounded bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
        >
          <Eye className="size-3" />
          View
        </button>

        <button
          onClick={handleEdit}
          disabled={isExpired}
          className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ${
            isExpired ? "cursor-not-allowed bg-gray-100 text-gray-400" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Edit className="size-3" />
          Edit
        </button>
      </div>
    </motion.div>
  )
}

const DebtPromoManagement = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // Redux state
  const promos = useAppSelector(selectClearancePromos)
  const loading = useAppSelector(selectClearancePromosLoading)
  const error = useAppSelector(selectClearancePromosError)
  const pagination = useAppSelector(selectClearancePromosPagination)

  // Local state
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [scopeFilter, setScopeFilter] = useState<string>("")
  const [isPausedFilter, setIsPausedFilter] = useState<string>("")
  const [pauseModalOpen, setPauseModalOpen] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<ClearancePromo | null>(null)
  const [promoDetailsModalOpen, setPromoDetailsModalOpen] = useState(false)
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null)

  // Fetch promos function
  const fetchPromos = useCallback(() => {
    const params: ClearancePromosRequest = {
      PageNumber: currentPage,
      PageSize: 12,
      Search: searchTerm || undefined,
      Code: undefined,
      Scope: scopeFilter ? Number(scopeFilter) : undefined,
      IsActive: statusFilter ? statusFilter === "true" : undefined,
      IsPaused: isPausedFilter ? isPausedFilter === "true" : undefined,
      AsOfUtc: undefined,
    }

    dispatch(fetchClearancePromos(params))
  }, [dispatch, currentPage, searchTerm, statusFilter, scopeFilter, isPausedFilter])

  // Initial fetch and when filters change
  useEffect(() => {
    fetchPromos()
  }, [fetchPromos])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleScopeFilter = (value: string) => {
    setScopeFilter(value)
    setCurrentPage(1)
  }

  const handlePausedFilter = (value: string) => {
    setIsPausedFilter(value)
    setCurrentPage(1)
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchPromos()
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setScopeFilter("")
    setIsPausedFilter("")
    setCurrentPage(1)
  }

  // Handle pause/resume modal
  const handlePauseResumeModal = (promo: ClearancePromo) => {
    setSelectedPromo(promo)
    setPauseModalOpen(true)
  }

  const handleClosePauseModal = () => {
    setPauseModalOpen(false)
    setSelectedPromo(null)
  }

  // Handle promo details modal
  const handleViewPromoDetails = (promo: ClearancePromo) => {
    setSelectedPromoId(promo.id)
    setPromoDetailsModalOpen(true)
  }

  const handleClosePromoDetailsModal = () => {
    setPromoDetailsModalOpen(false)
    setSelectedPromoId(null)
  }

  // Handle add promo navigation
  const handleAddPromo = () => {
    router.push("/dm/promo/add")
  }

  const hasActiveFilters = searchTerm || statusFilter || scopeFilter || isPausedFilter

  const renderContent = () => {
    if (loading && promos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="mb-2 size-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Loading promos...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="mb-2 size-6 text-red-500" />
          <p className="text-sm font-medium text-red-600">Error loading promos</p>
          <p className="mt-1 text-xs text-gray-600">{error}</p>
          <ButtonModule variant="primary" size="sm" onClick={handleRefresh} className="mt-2">
            Try Again
          </ButtonModule>
        </div>
      )
    }

    if (promos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <FileText className="mb-2 size-6 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">No promos found</p>
          <p className="mt-1 text-xs text-gray-500">
            {hasActiveFilters ? "Try adjusting your filters" : "No promos available at the moment"}
          </p>
          {hasActiveFilters && (
            <ButtonModule variant="outline" size="sm" onClick={handleClearFilters} className="mt-2">
              Clear Filters
            </ButtonModule>
          )}
        </div>
      )
    }

    return (
      <>
        <div className="p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Available Promos {pagination && `(${pagination.totalCount} total)`}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {promos.map((promo) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                onPauseResume={handlePauseResumeModal}
                onView={handleViewPromoDetails}
                router={router}
              />
            ))}
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevious}
                  className="rounded border border-gray-300 p-1 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MdOutlineArrowBackIosNew className="size-3" />
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNumber = index + 1
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`rounded border px-2 py-1 text-xs ${
                        currentPage === pageNumber
                          ? "border-[#004B23] bg-[#e9f5ef] text-[#004B23]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="rounded border border-gray-300 p-1 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MdOutlineArrowForwardIos className="size-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pb-24 sm:pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-xl">Debt Clearance Promos</h1>
                    <p className="mt-0.5 text-xs text-gray-600">Manage and view debt clearance promotions</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <ButtonModule
                    variant="primary"
                    size="sm"
                    onClick={handleAddPromo}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Promo
                  </ButtonModule>
                  <ButtonModule
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                  {hasActiveFilters && (
                    <ButtonModule
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="border-red-300 bg-white text-red-700 hover:bg-red-50"
                    >
                      <X className="size-3" />
                      Clear
                    </ButtonModule>
                  )}
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 rounded-lg border border-gray-200/60 bg-white"
            >
              <div className="p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 transform text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search promos..."
                        className="w-full rounded border border-gray-300 py-1.5 pl-7 pr-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <FormSelectModule
                      name="status"
                      value={statusFilter}
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      options={statusOptions}
                      className="w-full"
                      controlClassName="h-8 text-sm"
                    />
                  </div>

                  {/* Scope Filter */}
                  <div>
                    <FormSelectModule
                      name="scope"
                      value={scopeFilter}
                      onChange={(e) => handleScopeFilter(e.target.value)}
                      options={scopeOptions}
                      className="w-full"
                      controlClassName="h-8 text-sm"
                    />
                  </div>

                  {/* Paused Filter */}
                  <div>
                    <FormSelectModule
                      name="paused"
                      value={isPausedFilter}
                      onChange={(e) => handlePausedFilter(e.target.value)}
                      options={[
                        { value: "", label: "All" },
                        { value: "true", label: "Paused" },
                        { value: "false", label: "Not Paused" },
                      ]}
                      className="w-full"
                      controlClassName="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-hidden rounded-lg border border-gray-200/60 bg-transparent"
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pause/Resume Promo Modal */}
      <PausePromoModal isOpen={pauseModalOpen} onRequestClose={handleClosePauseModal} promo={selectedPromo} />

      {/* Promo Details Modal */}
      <PromoDetailsModal
        isOpen={promoDetailsModalOpen}
        onRequestClose={handleClosePromoDetailsModal}
        promoId={selectedPromoId}
      />
    </section>
  )
}

export default DebtPromoManagement
