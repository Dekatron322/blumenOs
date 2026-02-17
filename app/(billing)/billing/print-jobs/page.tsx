"use client"
import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, Download, FileIcon, Filter, Printer, RefreshCw } from "lucide-react"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import { VscCloudUpload, VscEye } from "react-icons/vsc"

import { ButtonModule } from "components/ui/Button/Button"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { SearchModule } from "components/ui/Search/search-module"
import CsvUploadFailuresModal from "components/ui/Modal/CsvUploadFailuresModal"
import PdfPrintModal from "components/ui/Modal/PdfPrintModal"
import { notify } from "components/ui/Notification/Notification"

import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearSingleBillingPrintStatus,
  downloadPrintJob,
  fetchPrintingJobs,
  markAsReadyToPrint,
  MarkAsReadyToPrintRequest,
  PrintingJobsRequestParams,
  singleBillingPrint,
  SingleBillingPrintRequest,
} from "lib/redux/postpaidSlice"
import { fetchFeeders } from "lib/redux/feedersSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { Customer, fetchCustomers } from "lib/redux/customerSlice"
import { fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { BillingJobRunStatus } from "lib/types/billing"

const groupByOptions = [
  { value: "", label: "All Groupings" },
  { value: "0", label: "None" },
  { value: "1", label: "Feeder" },
  { value: "2", label: "Area Office" },
  { value: "3", label: "Distribution Substation" },
  { value: "4", label: "Province" },
]

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "0", label: "Queued" },
  { value: "1", label: "Running" },
  { value: "2", label: "Completed" },
  { value: "3", label: "Failed" },
]

const booleanOptions = [
  { value: "", label: "All" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
]

// Mark as Ready to Print Modal Component
const MarkAsReadyToPrintModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MarkAsReadyToPrintRequest) => void
  loading: boolean
  error: string | null
  success: boolean
  message: string | null
  billingPeriods: any[]
  feeders: any[]
  areaOffices: any[]
  areaOfficesLoading: boolean
  distributionSubstations: any[]
  distributionSubstationsLoading: boolean
  customers: Customer[]
  customersLoading: boolean
  customerSearchText: string
  setCustomerSearchText: (text: string) => void
  isSearchingCustomers: boolean
  searchedCustomers: Customer[]
}> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  error,
  success,
  message,
  billingPeriods,
  feeders,
  areaOffices,
  areaOfficesLoading,
  distributionSubstations,
  distributionSubstationsLoading,
  customers,
  customersLoading,
  customerSearchText,
  setCustomerSearchText,
  isSearchingCustomers,
  searchedCustomers,
}) => {
  const [formData, setFormData] = useState<MarkAsReadyToPrintRequest>({
    billingPeriodId: 0,
    customerAccountNumbers: [],
    feederId: undefined,
    distributionSubstationId: undefined,
    areaOfficeId: undefined,
    isMd: undefined,
    statusCode: undefined,
    billStatus: undefined,
  })

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      customerAccountNumbers: selectedCustomers,
    })
  }

  // Handle search button click
  const handleCustomerSearch = useCallback(() => {
    // This will be implemented in the parent component
  }, [])

  // Use searched customers if there's a search term, otherwise use all customers
  const displayCustomers = customerSearchText.trim() ? searchedCustomers : customers

  // Check which filters are selected for mutual exclusion
  const hasFeederSelected = !!formData.feederId
  const hasAreaOfficeSelected = !!formData.areaOfficeId
  const hasDistributionSubstationSelected = !!formData.distributionSubstationId
  const hasIsMdSelected = formData.isMd !== undefined
  const hasStatusCodeSelected = formData.statusCode !== undefined
  const hasBillStatusSelected = formData.billStatus !== undefined
  const hasCustomersSelected = selectedCustomers.length > 0

  // Count how many non-billing-period filters are selected
  const selectedFilterCount = [
    hasFeederSelected,
    hasAreaOfficeSelected,
    hasDistributionSubstationSelected,
    hasIsMdSelected,
    hasStatusCodeSelected,
    hasBillStatusSelected,
    hasCustomersSelected,
  ].filter(Boolean).length

  const handleInputChange = (field: keyof MarkAsReadyToPrintRequest, value: any) => {
    // If a filter is being set (not cleared), clear all other filters
    if (value !== undefined && value !== "") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        // Clear all other filter fields
        ...(field !== "feederId" && { feederId: undefined }),
        ...(field !== "areaOfficeId" && { areaOfficeId: undefined }),
        ...(field !== "distributionSubstationId" && { distributionSubstationId: undefined }),
        ...(field !== "isMd" && { isMd: undefined }),
        ...(field !== "statusCode" && { statusCode: undefined }),
        ...(field !== "billStatus" && { billStatus: undefined }),
      }))
      // Clear customer selection when any filter is selected
      setSelectedCustomers([])
    } else {
      // Just clearing the current field
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleCustomerSelection = (accountNumber: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCustomers((prev) => [...prev, accountNumber])
      // Clear all other filters when customers are selected
      setFormData((prev) => ({
        ...prev,
        feederId: undefined,
        areaOfficeId: undefined,
        distributionSubstationId: undefined,
        isMd: undefined,
        statusCode: undefined,
        billStatus: undefined,
      }))
    } else {
      setSelectedCustomers((prev) => prev.filter((acc) => acc !== accountNumber))
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/50 px-3 py-1 font-mono text-sm font-bold text-white/80">
                  MARK READY
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Mark Bills as Ready to Print</h3>
              <p className="mt-1 text-sm text-white">Select bills to mark as ready for printing</p>
            </div>
            <motion.button
              onClick={onClose}
              className="rounded-full bg-white/50 p-2 text-gray-600 transition-colors hover:bg-white/70"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AlertCircle className="text-xl" />
            </motion.button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <motion.div
              className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error</p>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billing Period */}
            <div className="rounded-lg border bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                <FileIcon className="text-gray-600" />
                Billing Information
              </h4>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Billing Period *</label>
                <FormSelectModule
                  name="billingPeriodId"
                  value={formData.billingPeriodId.toString()}
                  onChange={(e) => handleInputChange("billingPeriodId", Number(e.target.value))}
                  options={[
                    { value: "0", label: "Select Billing Period" },
                    ...billingPeriods.map((period) => ({
                      value: period.id.toString(),
                      label: period.displayName,
                    })),
                  ]}
                  className="w-full"
                  controlClassName="h-9 text-sm"
                />
              </div>
            </div>

            {/* Customer Selection */}
            <div
              className={`rounded-lg border bg-white p-4 ${
                selectedFilterCount > 0 && !hasCustomersSelected ? "opacity-50" : ""
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-semibold text-gray-800">
                  <Filter className="text-gray-600" />
                  Customer Selection
                </h4>
                {selectedCustomers.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {selectedCustomers.length} selected
                  </span>
                )}
              </div>

              {/* Warning message when other filters are selected */}
              {selectedFilterCount > 0 && !hasCustomersSelected && (
                <div className="mb-4 rounded-md bg-yellow-50 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        Customer selection is disabled when another filter is selected. Only billing period and one
                        other filter can be used at a time.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="mb-4">
                <SearchModule
                  value={customerSearchText}
                  onChange={(e) => setCustomerSearchText(e.target.value)}
                  onSearch={handleCustomerSearch}
                  placeholder="Search by account number or name..."
                  className="!w-full md:!w-full"
                  bgClassName="bg-white"
                  disabled={selectedFilterCount > 0 && !hasCustomersSelected}
                />
              </div>

              {/* Customer List */}
              <div className="rounded-lg border border-gray-200 bg-gray-50">
                <div className="max-h-48 overflow-y-auto">
                  {customerSearchText && isSearchingCustomers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">Searching...</div>
                    </div>
                  ) : !customerSearchText && customersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-gray-500">Loading customers...</div>
                    </div>
                  ) : displayCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Filter className="mb-2 h-8 w-8 text-gray-300" />
                      <div className="text-sm text-gray-500">
                        {customerSearchText ? "No customers found matching your search" : "No customers available"}
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {displayCustomers.map((customer) => (
                        <div
                          key={customer.accountNumber}
                          className={`flex cursor-pointer items-start p-3 hover:bg-blue-50 ${
                            selectedCustomers.includes(customer.accountNumber) ? "bg-blue-50" : ""
                          }`}
                          onClick={() =>
                            handleCustomerSelection(
                              customer.accountNumber,
                              !selectedCustomers.includes(customer.accountNumber)
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.accountNumber)}
                            onChange={() => {}} // Controlled by parent click
                            disabled={selectedFilterCount > 0 && !hasCustomersSelected}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                                <div className="text-sm text-gray-500">{customer.accountNumber}</div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {customer.feederName && `Feeder: ${customer.feederName}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selection Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {selectedCustomers.length > 0
                    ? `${selectedCustomers.length} of ${displayCustomers.length} customers selected`
                    : `${displayCustomers.length} customers available`}
                </div>
                <div className="flex gap-2">
                  {selectedCustomers.length > 0 && !(selectedFilterCount > 0 && !hasCustomersSelected) && (
                    <button
                      type="button"
                      onClick={() => setSelectedCustomers([])}
                      className="text-xs text-gray-500 transition-colors hover:text-gray-700"
                    >
                      Clear selection
                    </button>
                  )}
                  {displayCustomers.length > 0 &&
                    selectedCustomers.length !== displayCustomers.length &&
                    !(selectedFilterCount > 0 && !hasCustomersSelected) && (
                      <button
                        type="button"
                        onClick={() => setSelectedCustomers(displayCustomers.map((c) => c.accountNumber))}
                        className="text-xs text-blue-600 transition-colors hover:text-blue-700"
                      >
                        Select all
                      </button>
                    )}
                </div>
              </div>
            </div>

            {/* Location Filters */}
            <div className="rounded-lg border bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                <RefreshCw className="text-gray-600" />
                Location Filters
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                  <FormSelectModule
                    name="feederId"
                    value={formData.feederId?.toString() || ""}
                    onChange={(e) => handleInputChange("feederId", e.target.value ? Number(e.target.value) : undefined)}
                    options={[
                      { value: "", label: "All Feeders" },
                      ...feeders.map((feeder) => ({
                        value: feeder.id.toString(),
                        label: feeder.name,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={
                      selectedCustomers.length > 0 ||
                      hasAreaOfficeSelected ||
                      hasDistributionSubstationSelected ||
                      hasIsMdSelected ||
                      hasStatusCodeSelected ||
                      hasBillStatusSelected
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Area Office</label>
                  <FormSelectModule
                    name="areaOfficeId"
                    value={formData.areaOfficeId?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("areaOfficeId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={[
                      { value: "", label: "All Area Offices" },
                      ...areaOffices.map((office) => ({
                        value: office.id.toString(),
                        label: office.nameOfNewOAreaffice,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={
                      selectedCustomers.length > 0 ||
                      hasFeederSelected ||
                      hasDistributionSubstationSelected ||
                      hasIsMdSelected ||
                      hasStatusCodeSelected ||
                      hasBillStatusSelected ||
                      areaOfficesLoading
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">
                    Distribution Substation
                  </label>
                  <FormSelectModule
                    name="distributionSubstationId"
                    value={formData.distributionSubstationId?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("distributionSubstationId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={[
                      { value: "", label: "All Distribution Substations" },
                      ...(distributionSubstations || []).map((ds) => ({
                        value: ds.id.toString(),
                        label: (ds.name as string) || ds.dssCode || `DSS ${ds.id}`,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={
                      selectedCustomers.length > 0 ||
                      hasFeederSelected ||
                      hasAreaOfficeSelected ||
                      hasIsMdSelected ||
                      hasStatusCodeSelected ||
                      hasBillStatusSelected
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is MD</label>
                  <FormSelectModule
                    name="isMd"
                    value={formData.isMd?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "isMd",
                        e.target.value === "true" ? true : e.target.value === "false" ? false : undefined
                      )
                    }
                    options={booleanOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={
                      selectedCustomers.length > 0 ||
                      hasFeederSelected ||
                      hasAreaOfficeSelected ||
                      hasDistributionSubstationSelected ||
                      hasStatusCodeSelected ||
                      hasBillStatusSelected
                    }
                  />
                </div>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="rounded-lg border bg-white p-4">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                <Filter className="text-gray-600" />
                Additional Filters
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status Code</label>
                  <FormSelectModule
                    name="statusCode"
                    value={formData.statusCode?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("statusCode", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={[
                      { value: "", label: "All Status Codes" },
                      { value: "0", label: "Active" },
                      { value: "1", label: "Inactive" },
                      { value: "2", label: "Pending" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={
                      selectedCustomers.length > 0 ||
                      hasFeederSelected ||
                      hasAreaOfficeSelected ||
                      hasDistributionSubstationSelected ||
                      hasIsMdSelected ||
                      hasBillStatusSelected
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Bill Status</label>
                  <FormSelectModule
                    name="billStatus"
                    value={formData.billStatus?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("billStatus", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={[
                      { value: "", label: "All Bill Status" },
                      { value: BillingJobRunStatus.Queued.toString(), label: "Queued" },
                      { value: BillingJobRunStatus.Running.toString(), label: "Running" },
                      { value: BillingJobRunStatus.Completed.toString(), label: "Completed" },
                      { value: BillingJobRunStatus.Failed.toString(), label: "Failed" },
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={
                      selectedCustomers.length > 0 ||
                      hasFeederSelected ||
                      hasAreaOfficeSelected ||
                      hasDistributionSubstationSelected ||
                      hasIsMdSelected ||
                      hasStatusCodeSelected
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {formData.billingPeriodId > 0
                ? `1 billing period${
                    selectedCustomers.length > 0 ? `, ${selectedCustomers.length} customer(s) selected` : ""
                  }`
                : "No billing period selected"}
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} disabled={loading} className="button-outlined rounded-md px-3 py-2 text-sm">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || formData.billingPeriodId === 0}
                className="button-filled rounded-md px-3 py-2 text-sm"
              >
                {loading ? "Processing..." : "Mark as Ready to Print"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const LoadingSkeleton = () => {
  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full px-4 py-8 2xl:container max-sm:px-2 xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Bulk Upload Management</h4>
                <p className="text-gray-600">Track and manage CSV bulk upload jobs</p>
              </div>
            </div>
            <motion.div
              className="flex-3 mt-5 flex flex-col rounded-md border bg-white p-5"
              initial={{ opacity: 0.6 }}
              animate={{
                opacity: [0.6, 1, 0.6],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Main component
const PrintJobs = () => {
  const dispatch = useAppDispatch()
  const {
    downloadPrintJobLoading,
    downloadPrintJobError,
    downloadPrintJobSuccess,
    downloadPrintJobMessage,
    downloadPrintJobData,
    printingJobs,
    printingJobsLoading,
    printingJobsError,
    printingJobsSuccess,
    printingJobsPagination,
    markAsReadyToPrintLoading,
    markAsReadyToPrintError,
    markAsReadyToPrintSuccess,
    markAsReadyToPrintMessage,
    markAsReadyToPrintData,
    singleBillingPrintLoading,
    singleBillingPrintError,
    singleBillingPrintSuccess,
    singleBillingPrintMessage,
  } = useAppSelector((state) => state.postpaidBilling)
  const { feeders, loading: feedersLoading } = useAppSelector((state) => state.feeders)
  const { billingPeriods, loading: billingPeriodsLoading } = useAppSelector((state) => state.billingPeriods)
  const { areaOffices, loading: areaOfficesLoading } = useAppSelector((state) => state.areaOffices)
  const { distributionSubstations, loading: distributionSubstationsLoading } = useAppSelector(
    (state) => state.distributionSubstations
  )
  const { customers, loading: customersLoading } = useAppSelector((state) => state.customers)

  const router = useRouter()

  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [isFailuresModalOpen, setIsFailuresModalOpen] = useState(false)
  const [isMarkReadyModalOpen, setIsMarkReadyModalOpen] = useState(false)
  const [isPdfPrintModalOpen, setIsPdfPrintModalOpen] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  // Customer search state for modal
  const [customerSearchText, setCustomerSearchText] = useState("")
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([])

  // Local state for filters
  const [localFilters, setLocalFilters] = useState<Partial<PrintingJobsRequestParams>>({
    pageNumber: 1,
    pageSize: 10,
    billingPeriodId: undefined,
    groupBy: undefined,
    feederId: undefined,
    areaOfficeId: undefined,
    distributionSubstationId: undefined,
    provinceId: undefined,
    isMd: undefined,
  })

  // Separate state for table-only refresh
  const [tableRefreshKey, setTableRefreshKey] = useState(0)

  // Search function for customers - triggered by search button
  const searchCustomers = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setSearchedCustomers([])
        setIsSearchingCustomers(false)
        return
      }

      setIsSearchingCustomers(true)
      try {
        const result = await dispatch(
          fetchCustomers({
            pageNumber: 1,
            pageSize: 50,
            search: searchTerm.trim(),
          })
        )

        if (fetchCustomers.fulfilled.match(result)) {
          setSearchedCustomers(result.payload.data || [])
        }
      } catch (error) {
        console.error("Error searching customers:", error)
        setSearchedCustomers([])
      } finally {
        setIsSearchingCustomers(false)
      }
    },
    [dispatch]
  )

  // Handle search button click
  const handleCustomerSearch = useCallback(() => {
    searchCustomers(customerSearchText)
  }, [customerSearchText, searchCustomers])

  // Initial load and filter changes
  useEffect(() => {
    // Fetch feeders for dropdown
    void dispatch(fetchFeeders({ pageNumber: 1, pageSize: 1000 }))
    // Fetch billing periods for dropdown
    void dispatch(fetchBillingPeriods({ pageNumber: 1, pageSize: 1000 }))
    // Fetch area offices for dropdown
    void dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 1000 }))
    // Fetch distribution substations for dropdown
    void dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 1000 }))
    // Fetch customers for dropdown
    void dispatch(fetchCustomers({ pageNumber: 1, pageSize: 1000 }))
  }, [dispatch])

  useEffect(() => {
    const fetchParams: PrintingJobsRequestParams = {
      pageNumber: currentPage,
      pageSize: 10,
      ...(localFilters.billingPeriodId && { billingPeriodId: localFilters.billingPeriodId }),
      ...(localFilters.groupBy !== undefined && { groupBy: localFilters.groupBy }),
      ...(localFilters.feederId && { feederId: localFilters.feederId }),
      ...(localFilters.areaOfficeId && { areaOfficeId: localFilters.areaOfficeId }),
      ...(localFilters.distributionSubstationId && { distributionSubstationId: localFilters.distributionSubstationId }),
      ...(localFilters.provinceId && { provinceId: localFilters.provinceId }),
      ...(localFilters.isMd !== undefined && { isMd: localFilters.isMd }),
    }

    void dispatch(fetchPrintingJobs(fetchParams))
    setHasInitialLoad(true)
  }, [dispatch, currentPage, localFilters, tableRefreshKey])

  // Show success notification when mark as ready to print succeeds
  useEffect(() => {
    if (markAsReadyToPrintSuccess && markAsReadyToPrintMessage) {
      notify("success", markAsReadyToPrintMessage)
    }
  }, [markAsReadyToPrintSuccess, markAsReadyToPrintMessage])

  // Handle download print job response
  useEffect(() => {
    if (downloadPrintJobSuccess && downloadPrintJobData) {
      notify("success", downloadPrintJobMessage || "Download URL generated successfully")

      // Trigger download using the returned URL
      const link = document.createElement("a")
      link.href = downloadPrintJobData.url
      link.download = `print-job-${new Date().getTime()}.zip`
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    if (downloadPrintJobError) {
      notify("error", downloadPrintJobError)
    }
  }, [downloadPrintJobSuccess, downloadPrintJobError, downloadPrintJobMessage, downloadPrintJobData])

  // Separate handler for table-only refresh
  const handleRefreshTableData = useCallback(() => {
    // This only triggers a table refresh by incrementing the refresh key
    setTableRefreshKey((prev) => prev + 1)
  }, [])

  const handleDownloadZip = async (job: any) => {
    try {
      // Use the new download print job endpoint
      await dispatch(downloadPrintJob(job.id))
    } catch (error) {
      console.error("Download error:", error)
      notify("error", "Download failed. Please try again.")
    }
  }

  const handleDownloadFile = async (file: any) => {
    try {
      if (file.url) {
        // Create a link and trigger download
        const link = document.createElement("a")
        link.href = file.url
        link.download = file.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  // Keep the existing refresh handler for other purposes if needed
  const handleRefreshData = useCallback(() => {
    const fetchParams: PrintingJobsRequestParams = {
      pageNumber: currentPage,
      pageSize: 10,
      ...(localFilters.billingPeriodId && { billingPeriodId: localFilters.billingPeriodId }),
      ...(localFilters.groupBy !== undefined && { groupBy: localFilters.groupBy }),
      ...(localFilters.feederId && { feederId: localFilters.feederId }),
      ...(localFilters.areaOfficeId && { areaOfficeId: localFilters.areaOfficeId }),
      ...(localFilters.distributionSubstationId && { distributionSubstationId: localFilters.distributionSubstationId }),
      ...(localFilters.provinceId && { provinceId: localFilters.provinceId }),
      ...(localFilters.isMd !== undefined && { isMd: localFilters.isMd }),
    }
    void dispatch(fetchPrintingJobs(fetchParams))
  }, [dispatch, currentPage, localFilters])

  const handleSearch = useCallback(() => {
    const fetchParams: PrintingJobsRequestParams = {
      pageNumber: 1,
      pageSize: 10,
      ...(localFilters.billingPeriodId && { billingPeriodId: localFilters.billingPeriodId }),
      ...(localFilters.groupBy !== undefined && { groupBy: localFilters.groupBy }),
      ...(localFilters.feederId && { feederId: localFilters.feederId }),
      ...(localFilters.areaOfficeId && { areaOfficeId: localFilters.areaOfficeId }),
      ...(localFilters.distributionSubstationId && { distributionSubstationId: localFilters.distributionSubstationId }),
      ...(localFilters.provinceId && { provinceId: localFilters.provinceId }),
      ...(localFilters.isMd !== undefined && { isMd: localFilters.isMd }),
    }
    setCurrentPage(1)
    void dispatch(fetchPrintingJobs(fetchParams))
  }, [dispatch, localFilters])

  const handleFilterChange = (key: keyof PrintingJobsRequestParams, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }))
  }

  const applyFilters = () => {
    setCurrentPage(1)
    // Trigger a fresh fetch with updated filters
    handleRefreshData()
  }

  const resetFilters = () => {
    setLocalFilters({
      pageNumber: 1,
      pageSize: 10,
      billingPeriodId: undefined,
      groupBy: undefined,
      feederId: undefined,
      areaOfficeId: undefined,
      distributionSubstationId: undefined,
      provinceId: undefined,
      isMd: undefined,
    })
    setSearchText("")
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === "pageNumber" || key === "pageSize") return false
      if (value === undefined) return false
      // Only check for empty string if the value is actually a string
      if (typeof value === "string" && value === "") return false
      return true
    }).length
  }

  const getGroupByLabel = (groupBy: number) => {
    const option = groupByOptions.find((opt) => opt.value === groupBy.toString())
    return option?.label || `Group ${groupBy}`
  }

  const getStatusLabel = (status: number) => {
    const option = statusOptions.find((opt) => opt.value === status.toString())
    return option?.label || `Status ${status}`
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0:
        return "text-yellow-600 bg-yellow-50"
      case 1:
        return "text-blue-600 bg-blue-50"
      case 2:
        return "text-green-600 bg-green-50"
      case 3:
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleViewDetails = (printJob: any) => {
    console.log("View details:", printJob)
    // You can implement a modal or navigation to details page
  }

  const handleViewFiles = (job: any) => {
    setSelectedJob(job)
    setIsFailuresModalOpen(true)
  }

  const handleCloseFailuresModal = () => {
    setIsFailuresModalOpen(false)
    setSelectedJob(null)
  }

  const handleMarkAsReadyToPrint = () => {
    setIsMarkReadyModalOpen(true)
  }

  const handleCloseMarkReadyModal = () => {
    setIsMarkReadyModalOpen(false)
  }

  const handleMarkReadySubmit = async (requestData: MarkAsReadyToPrintRequest) => {
    try {
      const result = await dispatch(markAsReadyToPrint(requestData))
      if (markAsReadyToPrint.fulfilled.match(result)) {
        // Success - close modal and refresh data
        setIsMarkReadyModalOpen(false)
        handleRefreshTableData()
      }
    } catch (error) {
      console.error("Error marking as ready to print:", error)
    }
  }

  const handlePdfPrint = () => {
    setIsPdfPrintModalOpen(true)
  }

  const handleClosePdfPrintModal = () => {
    setIsPdfPrintModalOpen(false)
    dispatch(clearSingleBillingPrintStatus())
  }

  const handlePdfPrintSubmit = async (requestData: SingleBillingPrintRequest) => {
    try {
      const result = await dispatch(singleBillingPrint(requestData))
      if (singleBillingPrint.fulfilled.match(result)) {
        notify("success", "PDF print job queued successfully!")
        // Refresh the printing jobs table to show the new job
        handleRefreshTableData()
        // Close modal after a short delay to show success message
        setTimeout(() => {
          handleClosePdfPrintModal()
        }, 2000)
      } else {
        notify("error", "Failed to queue PDF print job")
      }
    } catch (error) {
      console.error("Error queuing PDF print job:", error)
      notify("error" as const, "Error queuing PDF print job")
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (printingJobsLoading && !hasInitialLoad) {
    return <LoadingSkeleton />
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto w-full  px-3 py-8 2xl:container max-sm:px-2 md:px-4 lg:px-6 2xl:px-16">
            <div className="mb-6 flex w-full flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <h4 className="text-2xl font-semibold">Print Jobs Management</h4>
                <p className="text-gray-600">Track and manage print jobs</p>
              </div>
              <div className="flex items-center gap-3">
                <ButtonModule
                  onClick={handlePdfPrint}
                  className="button-filled flex items-center gap-2"
                  disabled={printingJobsLoading || singleBillingPrintLoading}
                  icon={<Printer />}
                >
                  Print PDF
                </ButtonModule>
                <ButtonModule
                  variant="outline"
                  onClick={handleMarkAsReadyToPrint}
                  className="flex items-center gap-2"
                  disabled={printingJobsLoading || markAsReadyToPrintLoading}
                  icon={<VscCloudUpload />}
                >
                  Mark as Ready to Print
                </ButtonModule>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <div className="flex items-center gap-2">
                  {getActiveFilterCount() > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {getActiveFilterCount()} active
                    </span>
                  )}
                  <button onClick={resetFilters} className="rounded-lg p-2 hover:bg-gray-100">
                    <Filter className="size-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Search</label>
                  <SearchModule
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    placeholder="Search jobs..."
                    className="w-full md:w-auto"
                    bgClassName="bg-white"
                  />
                </div>

                {/* Group By Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Group By</label>
                  <FormSelectModule
                    name="groupBy"
                    value={localFilters.groupBy?.toString() || ""}
                    onChange={(e) => handleFilterChange("groupBy", e.target.value ? Number(e.target.value) : undefined)}
                    options={groupByOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Status</label>
                  <FormSelectModule
                    name="status"
                    value={localFilters.groupBy?.toString() || ""}
                    onChange={(e) => {
                      const statusValue = e.target.value
                      // Map status values to the correct groupBy values for printing jobs
                      const mappedValue = statusValue === "" ? undefined : Number(statusValue)
                      handleFilterChange("groupBy", mappedValue)
                    }}
                    options={statusOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Is MD Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Is MD</label>
                  <FormSelectModule
                    name="isMd"
                    value={localFilters.isMd?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "isMd",
                        e.target.value === "true" ? true : e.target.value === "false" ? false : undefined
                      )
                    }
                    options={booleanOptions}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                  />
                </div>

                {/* Billing Period Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Billing Period</label>
                  <FormSelectModule
                    name="billingPeriodId"
                    value={localFilters.billingPeriodId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("billingPeriodId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={[
                      { value: "", label: "All Billing Periods" },
                      ...billingPeriods.map((period) => ({
                        value: period.id.toString(),
                        label: period.displayName,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={billingPeriodsLoading}
                  />
                </div>

                {/* Feeder Name Filter */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 md:text-sm">Feeder</label>
                  <FormSelectModule
                    name="feederId"
                    value={localFilters.feederId?.toString() || ""}
                    onChange={(e) =>
                      handleFilterChange("feederId", e.target.value ? Number(e.target.value) : undefined)
                    }
                    options={[
                      { value: "", label: "All Feeders" },
                      ...feeders.map((feeder) => ({
                        value: feeder.id.toString(),
                        label: feeder.name,
                      })),
                    ]}
                    className="w-full"
                    controlClassName="h-9 text-sm"
                    disabled={feedersLoading}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-end gap-2">
                  <button onClick={applyFilters} className="button-filled flex-1 rounded-md px-3 py-2 text-sm">
                    Apply
                  </button>
                  <button onClick={resetFilters} className="button-outlined flex-1 rounded-md px-3 py-2 text-sm">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="rounded-lg border bg-white">
              {/* Results Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Print Jobs</h3>
                    {printingJobsPagination && (
                      <p className="text-sm text-gray-600">
                        Showing {printingJobs.length} of {printingJobsPagination.totalCount} jobs
                      </p>
                    )}
                  </div>
                  <ButtonModule
                    variant="outline"
                    onClick={handleRefreshTableData}
                    disabled={printingJobsLoading}
                    size="sm"
                  >
                    <RefreshCw className={`size-4 ${printingJobsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </ButtonModule>
                  {printingJobsError && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="size-4" />
                      <span className="text-sm">{printingJobsError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="max-h-[70vh] w-full overflow-x-auto overflow-y-hidden ">
                <div className="min-w-[1200px]">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Period</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Group By</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Area Office</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Feeder</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Progress</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Requested</th>
                        <th className="border-b p-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printingJobs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="border-b p-8 text-center">
                            <div className="text-gray-500">
                              <FileIcon className="mx-auto mb-2 size-12 text-gray-300" />
                              <p>No print jobs found</p>
                              <p className="text-sm">Try adjusting your filters or check back later</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        printingJobs.map((job) => (
                          <tr key={job.id} className="border-b hover:bg-gray-50">
                            <td className="border-b p-3 text-sm">
                              <div className="font-medium">{job.period}</div>
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">{getGroupByLabel(job.groupBy)}</td>
                            <td className="border-b p-3 text-sm">
                              <span
                                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                  job.status
                                )}`}
                              >
                                {getStatusLabel(job.status)}
                              </span>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={job.areaOfficeName}>
                                {job.areaOfficeName || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="max-w-xs truncate whitespace-nowrap" title={job.feederName}>
                                {job.feederName || "N/A"}
                              </div>
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-600"
                                    style={{
                                      width: `${job.totalBills > 0 ? (job.processedBills / job.totalBills) * 100 : 0}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">
                                  {job.totalBills > 0 ? Math.round((job.processedBills / job.totalBills) * 100) : 0}%
                                </span>
                              </div>
                            </td>
                            <td className="whitespace-nowrap border-b p-3 text-sm">
                              {new Date(job.requestedAtUtc).toLocaleString()}
                            </td>
                            <td className="border-b p-3 text-sm">
                              <div className="flex gap-2">
                                {(job.status === 2 || job.status === 3) && (
                                  <ButtonModule
                                    variant="outline"
                                    size="sm"
                                    icon={<Download className="h-4 w-4" />}
                                    onClick={() => handleDownloadZip(job)}
                                    loading={downloadPrintJobLoading}
                                    className="whitespace-nowrap"
                                  >
                                    {downloadPrintJobLoading ? "Generating..." : "Download ZIP"}
                                  </ButtonModule>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {printingJobsPagination && printingJobsPagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {printingJobsPagination.currentPage} of {printingJobsPagination.totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!printingJobsPagination.hasPrevious}
                        className="rounded-lg border p-2 disabled:opacity-50"
                      >
                        <MdOutlineArrowBackIosNew className="size-4" />
                      </button>
                      {[...Array(Math.min(5, printingJobsPagination.totalPages))].map((_, index) => {
                        const pageNumber = index + 1
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`rounded-lg border px-3 py-2 text-sm ${
                              currentPage === pageNumber
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!printingJobsPagination.hasNext}
                        className="rounded-lg border p-2 disabled:opacity-50"
                      >
                        <MdOutlineArrowForwardIos className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Ready to Print Modal */}
      <MarkAsReadyToPrintModal
        isOpen={isMarkReadyModalOpen}
        onClose={handleCloseMarkReadyModal}
        onSubmit={handleMarkReadySubmit}
        loading={markAsReadyToPrintLoading}
        error={markAsReadyToPrintError}
        success={markAsReadyToPrintSuccess}
        message={markAsReadyToPrintMessage}
        billingPeriods={billingPeriods}
        feeders={feeders}
        areaOffices={areaOffices}
        areaOfficesLoading={areaOfficesLoading}
        distributionSubstations={distributionSubstations}
        distributionSubstationsLoading={distributionSubstationsLoading}
        customers={customers}
        customersLoading={customersLoading}
        customerSearchText={customerSearchText}
        setCustomerSearchText={setCustomerSearchText}
        isSearchingCustomers={isSearchingCustomers}
        searchedCustomers={searchedCustomers}
      />

      {/* PDF Print Modal */}
      <PdfPrintModal
        isOpen={isPdfPrintModalOpen}
        onClose={handleClosePdfPrintModal}
        onSubmit={handlePdfPrintSubmit}
        loading={singleBillingPrintLoading}
        error={singleBillingPrintError}
        success={singleBillingPrintSuccess}
        message={singleBillingPrintMessage}
        billingPeriods={billingPeriods}
      />

      {/* Print Job Files Modal */}
      {selectedJob && (
        <CsvUploadFailuresModal
          isOpen={isFailuresModalOpen}
          onClose={handleCloseFailuresModal}
          jobId={selectedJob.id}
          fileName={`Print Job Files - ${selectedJob.period}`}
        />
      )}
    </section>
  )
}

export default PrintJobs
