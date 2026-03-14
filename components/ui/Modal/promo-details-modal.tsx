"use client"

import React, { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Calendar, CheckCircle, Clock, Loader2, MapPin, PauseCircle, Tag, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  ClearancePromo,
  clearPromoDetailsState,
  fetchPromoDetails,
  selectPromoDetails,
  selectPromoDetailsError,
  selectPromoDetailsLoading,
  selectPromoDetailsSuccess,
} from "lib/redux/debtManagementSlice"
import {
  fetchCountries,
  Province,
  selectAllProvinces,
  selectCountriesError,
  selectCountriesLoading,
} from "lib/redux/countriesSlice"
import { AreaOffice, AreaOfficesRequestParams, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { Feeder, FeedersRequestParams, fetchFeeders } from "lib/redux/feedersSlice"
import { notify } from "components/ui/Notification/Notification"

interface PromoDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  promoId: number | null
}

const PromoDetailsModal: React.FC<PromoDetailsModalProps> = ({ isOpen, onRequestClose, promoId }) => {
  const dispatch = useAppDispatch()
  const promoDetails = useAppSelector(selectPromoDetails)
  const loading = useAppSelector(selectPromoDetailsLoading)
  const error = useAppSelector(selectPromoDetailsError)
  const success = useAppSelector(selectPromoDetailsSuccess)

  // Province-related state
  const allProvinces = useAppSelector(selectAllProvinces)
  const countriesLoading = useAppSelector(selectCountriesLoading)
  const countriesError = useAppSelector(selectCountriesError)

  // Area office and feeder state
  const areaOffices = useAppSelector((state: any) => state.areaOffices.areaOffices)
  const areaOfficesLoading = useAppSelector((state: any) => state.areaOffices.loading)
  const feeders = useAppSelector((state: any) => state.feeders.feeders)
  const feedersLoading = useAppSelector((state: any) => state.feeders.loading)

  // Fetch promo details when modal opens and promoId is available
  useEffect(() => {
    if (isOpen && promoId) {
      dispatch(fetchPromoDetails(promoId))
    }
  }, [isOpen, promoId, dispatch])

  // Fetch countries data to get province information
  useEffect(() => {
    if (isOpen && promoDetails?.provinceId && allProvinces.length === 0) {
      dispatch(fetchCountries())
    }
  }, [isOpen, promoDetails?.provinceId, allProvinces.length, dispatch])

  // Fetch area offices data when needed
  useEffect(() => {
    if (isOpen && promoDetails?.areaOfficeId && areaOffices.length === 0) {
      const params: AreaOfficesRequestParams = {
        PageNumber: 1,
        PageSize: 1000, // Get all area offices
      }
      dispatch(fetchAreaOffices(params))
    }
  }, [isOpen, promoDetails?.areaOfficeId, areaOffices.length, dispatch])

  // Fetch feeders data when needed
  useEffect(() => {
    if (isOpen && promoDetails?.feederId && feeders.length === 0) {
      const params: FeedersRequestParams = {
        pageNumber: 1,
        pageSize: 1000, // Get all feeders
      }
      dispatch(fetchFeeders(params))
    }
  }, [isOpen, promoDetails?.feederId, feeders.length, dispatch])

  // Clear state when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch(clearPromoDetailsState())
    }
  }, [isOpen, dispatch])

  // Handle retry on error
  const handleRetry = () => {
    if (promoId) {
      dispatch(fetchPromoDetails(promoId))
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date only helper
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  }

  // Get status color and label
  const getStatusInfo = (promo: ClearancePromo) => {
    const isExpired = new Date(promo.endAtUtc) < new Date()

    if (isExpired) {
      return {
        color: "text-red-600 bg-red-50",
        label: "Expired",
        icon: AlertCircle,
      }
    }

    if (promo.isPaused) {
      return {
        color: "text-yellow-600 bg-yellow-50",
        label: "Paused",
        icon: PauseCircle,
      }
    }

    if (promo.isActive) {
      return {
        color: "text-green-600 bg-green-50",
        label: "Active",
        icon: CheckCircle,
      }
    }

    return {
      color: "text-gray-600 bg-gray-50",
      label: "Inactive",
      icon: AlertCircle,
    }
  }

  // Get province name by ID
  const getProvinceName = (provinceId: number): string => {
    const province = allProvinces.find((p: Province) => p.id === provinceId)
    return province ? province.name : `Province ${provinceId}`
  }

  // Get area office name by ID
  const getAreaOfficeName = (areaOfficeId: number): string => {
    const areaOffice = areaOffices.find((ao: AreaOffice) => ao.id === areaOfficeId)
    return areaOffice ? areaOffice.nameOfNewOAreaffice : `Area Office ${areaOfficeId}`
  }

  // Get feeder name by ID
  const getFeederName = (feederId: number): string => {
    const feeder = feeders.find((f: Feeder) => f.id === feederId)
    return feeder ? feeder.name : `Feeder ${feederId}`
  }

  // Get scope label
  const getScopeLabel = (scope: number) => {
    switch (scope) {
      case 1:
        return "Global"
      case 2:
        return "Regional"
      case 3:
        return "Local"
      default:
        return "Unknown"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onRequestClose}
          />

          {/* Compact Sidebar Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
                <h2 className="text-lg font-semibold text-gray-900">Promo Details</h2>
                <button
                  onClick={onRequestClose}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-3">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm text-gray-600">Loading promo details...</p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="size-6 text-red-600" />
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {success && promoDetails && (
                  <div className="space-y-4">
                    {/* Status Badge and Discount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const statusInfo = getStatusInfo(promoDetails)
                          const StatusIcon = statusInfo.icon
                          return (
                            <>
                              <StatusIcon className="size-4" />
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </>
                          )
                        })()}
                      </div>
                      <div className="text-xl font-bold text-blue-600">{promoDetails.discountPercent}% OFF</div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{promoDetails.name}</h3>
                        <p className="text-xs text-gray-600">
                          Code:{" "}
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                            {promoDetails.code}
                          </span>
                        </p>
                      </div>

                      {promoDetails.description && (
                        <div>
                          <h4 className="mb-1 text-xs font-medium text-gray-700">Description</h4>
                          <p className="rounded bg-gray-50 p-2 text-xs  leading-relaxed text-gray-600">
                            {promoDetails.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Date Information */}
                    <div className="space-y-3">
                      <h4 className="flex items-center text-xs font-medium text-gray-700">
                        <Calendar className="mr-1 h-3 w-3" />
                        Date Information
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded bg-gray-50 p-2">
                          <p className="mb-0.5 text-xs text-gray-500">Start Date</p>
                          <p className="text-xs font-medium text-gray-900">{formatDate(promoDetails.startAtUtc)}</p>
                        </div>
                        <div className="rounded bg-gray-50 p-2">
                          <p className="mb-0.5 text-xs text-gray-500">End Date</p>
                          <p className="text-xs font-medium text-gray-900">{formatDate(promoDetails.endAtUtc)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Scope Information */}
                    <div className="space-y-3">
                      <h4 className="flex items-center text-xs font-medium text-gray-700">
                        <Tag className="mr-1 h-3 w-3" />
                        Scope & Targeting
                      </h4>

                      <div className="rounded bg-gray-50 p-2">
                        <p className="mb-0.5 text-xs text-gray-500">Scope</p>
                        <p className="text-xs font-medium text-gray-900">{getScopeLabel(promoDetails.scope)}</p>
                      </div>

                      {(promoDetails.provinceId || promoDetails.areaOfficeId || promoDetails.feederId) && (
                        <div className="space-y-2">
                          {promoDetails.provinceId && (
                            <div className="rounded bg-gray-50 p-2">
                              <p className="mb-0.5 text-xs text-gray-500">Province</p>
                              <p className="text-xs font-medium text-gray-900">
                                {countriesLoading ? "Loading..." : getProvinceName(promoDetails.provinceId)}
                              </p>
                            </div>
                          )}
                          {promoDetails.areaOfficeId && (
                            <div className="rounded bg-gray-50 p-2">
                              <p className="mb-0.5 text-xs text-gray-500">Area Office</p>
                              <p className="text-xs font-medium text-gray-900">
                                {areaOfficesLoading ? "Loading..." : getAreaOfficeName(promoDetails.areaOfficeId)}
                              </p>
                            </div>
                          )}
                          {promoDetails.feederId && (
                            <div className="rounded bg-gray-50 p-2">
                              <p className="mb-0.5 text-xs text-gray-500">Feeder</p>
                              <p className="text-xs font-medium text-gray-900">
                                {feedersLoading ? "Loading..." : getFeederName(promoDetails.feederId)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* System Information */}
                    <div className="space-y-3">
                      <h4 className="flex items-center text-xs font-medium text-gray-700">
                        <Clock className="mr-1 h-3 w-3" />
                        System Information
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded bg-gray-50 p-2">
                          <p className="mb-0.5 text-xs text-gray-500">Created</p>
                          <p className="text-xs font-medium text-gray-900">{formatDate(promoDetails.createdAt)}</p>
                        </div>
                        {promoDetails.lastUpdated && (
                          <div className="rounded bg-gray-50 p-2">
                            <p className="mb-0.5 text-xs text-gray-500">Last Updated</p>
                            <p className="text-xs font-medium text-gray-900">{formatDate(promoDetails.lastUpdated)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                promoDetails.isActive ? "bg-green-500" : "bg-gray-400"
                              }`}
                            />
                            <span className="text-xs font-medium text-gray-700">Status</span>
                          </div>
                          <p
                            className={`mt-1 text-sm font-semibold ${
                              promoDetails.isActive ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {promoDetails.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                promoDetails.isPaused ? "bg-yellow-500" : "bg-gray-400"
                              }`}
                            />
                            <span className="text-xs font-medium text-gray-700">Pause State</span>
                          </div>
                          <p
                            className={`mt-1 text-sm font-semibold ${
                              promoDetails.isPaused ? "text-yellow-600" : "text-gray-500"
                            }`}
                          >
                            {promoDetails.isPaused ? "Paused" : "Running"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-5 py-3">
                <button
                  onClick={onRequestClose}
                  className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PromoDetailsModal
