"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import AllBills from "components/BillingInfo/AllBills"
import StartBillingRun from "components/ui/Modal/start-billing-run"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { Download, PlayIcon, X } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

import { fetchAreaOffices, fetchDistributionSubstations, fetchFeeders } from "lib/redux/formDataSlice"
import { fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { clearDownloadARStatus, downloadAR, DownloadARRequestParams } from "lib/redux/postpaidSlice"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"

// Bill Status Enum
enum BillStatus {
  Draft = 0,
  Finalized = 1,
  Refunded = 2,
}

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
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
          <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
            <div className="size-6 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for Customer Categories
const CategoriesSkeleton = () => {
  return (
    <div className="w-80 rounded-md border bg-white p-5">
      <div className="border-b pb-4">
        <div className="h-6 w-40 rounded bg-gray-200"></div>
      </div>

      <div className="mt-4 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-12 rounded bg-gray-200"></div>
                <div className="h-5 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-6 rounded-lg bg-gray-50 p-3">
        <div className="mb-2 h-5 w-20 rounded bg-gray-200"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="h-4 w-12 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gray-200"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200"></div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <div className="size-6 rounded bg-gray-200"></div>
            </div>

            <div className="mt-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-4 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t pt-3">
              <div className="h-4 w-full rounded bg-gray-200"></div>
            </div>

            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// List View Skeleton
const ListSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-5">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="h-8 w-40 rounded bg-gray-200"></div>
        <div className="flex gap-4">
          <div className="h-10 w-80 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-gray-200"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-40 rounded bg-gray-200"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 w-24 rounded bg-gray-200"></div>
                    ))}
                  </div>
                  <div className="mt-1 h-4 w-64 rounded bg-gray-200"></div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="h-4 w-24 rounded bg-gray-200"></div>
                  <div className="mt-1 h-4 w-20 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 rounded bg-gray-200"></div>
                  <div className="size-6 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-8 w-16 rounded bg-gray-200"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="size-8 rounded bg-gray-200"></div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-7 rounded bg-gray-200"></div>
            ))}
          </div>
          <div className="size-8 rounded bg-gray-200"></div>
        </div>

        <div className="h-4 w-24 rounded bg-gray-200"></div>
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = ({ showCategories = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {showCategories ? (
        <>
          <TableSkeleton />
          <CategoriesSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Generate mock meter data
const generateMeterData = () => {
  return {
    smartMeters: 89420,
    conventionalMeters: 29514,
    readSuccessRate: 94.2,
    alerts: 847,
    totalMeters: 89420 + 29514,
  }
}

export default function MeteringDashboard() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isStartBillingRunModalOpen, setIsStartBillingRunModalOpen] = useState(false) // Add this state
  const [isDownloadARModalOpen, setIsDownloadARModalOpen] = useState(false)
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState("")
  const [selectedAreaOffice, setSelectedAreaOffice] = useState("")
  const [selectedFeeder, setSelectedFeeder] = useState("")
  const [selectedDistributionSubstation, setSelectedDistributionSubstation] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isMd, setIsMd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [meterData, setMeterData] = useState(generateMeterData())

  // Search states for dropdowns
  const [areaOfficeSearch, setAreaOfficeSearch] = useState("")
  const [feederSearch, setFeederSearch] = useState("")
  const [distributionSubstationSearch, setDistributionSubstationSearch] = useState("")

  const dispatch = useAppDispatch()
  const { downloadARLoading, downloadARError, downloadARSuccess, downloadARMessage } = useAppSelector(
    (state) => state.postpaidBilling
  )

  // Get data from other slices
  const { billingPeriods, loading: billingPeriodsLoading } = useAppSelector((state) => state.billingPeriods)
  const { areaOffices, areaOfficesLoading } = useAppSelector((state) => state.formData)
  const { feeders, feedersLoading } = useAppSelector((state) => state.formData)
  const { distributionSubstations, distributionSubstationsLoading } = useAppSelector((state) => state.formData)

  // Debug logging for distribution substations
  console.log("Distribution substations data:", {
    distributionSubstations,
    distributionSubstationsLoading,
    length: distributionSubstations?.length,
    firstItem: distributionSubstations?.[0],
  })

  // Use mock data
  const { smartMeters, conventionalMeters, readSuccessRate, alerts, totalMeters } = meterData

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (isDownloadARModalOpen) {
      // Fetch billing periods
      dispatch(fetchBillingPeriods({ pageNumber: 1, pageSize: 100 }))

      // Fetch area offices
      dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))

      // Fetch feeders
      dispatch(fetchFeeders({ PageNumber: 1, PageSize: 100 }))

      // Fetch distribution substations
      dispatch(fetchDistributionSubstations({ PageNumber: 1, PageSize: 100 }))
    }
  }, [isDownloadARModalOpen, dispatch])

  // Search handlers for dropdowns - only update search term state
  const handleAreaOfficeSearchChange = (searchValue: string) => {
    setAreaOfficeSearch(searchValue)
  }

  const handleFeederSearchChange = (searchValue: string) => {
    setFeederSearch(searchValue)
  }

  const handleDistributionSubstationSearchChange = (searchValue: string) => {
    setDistributionSubstationSearch(searchValue)
  }

  // Search button handlers - trigger API calls
  const handleAreaOfficeSearchClick = () => {
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100, Search: areaOfficeSearch }))
  }

  const handleFeederSearchClick = () => {
    dispatch(fetchFeeders({ PageNumber: 1, PageSize: 100, Search: feederSearch }))
  }

  const handleDistributionSubstationSearchClick = () => {
    dispatch(fetchDistributionSubstations({ PageNumber: 1, PageSize: 100, Search: distributionSubstationSearch }))
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    setMeterData(generateMeterData())
  }

  const handleBillingRunSuccess = async () => {
    setIsStartBillingRunModalOpen(false)
    // Refresh data after billing run
    setIsLoading(true)
    setTimeout(() => {
      setMeterData(generateMeterData())
      setIsLoading(false)
    }, 1000)
  }

  const handleDownloadAR = async () => {
    if (!selectedBillingPeriod) {
      notify("warning", "Please select a billing period")
      return
    }

    // Find the billing period name from the billing periods data
    const billingPeriod = billingPeriods?.find((period) => period.id.toString() === selectedBillingPeriod)
    const billingPeriodName = billingPeriod?.displayName || billingPeriod?.periodKey

    const params: DownloadARRequestParams = {
      billingPeriodId: parseInt(selectedBillingPeriod),
      billingPeriodName: billingPeriodName, // Pass the billing period name
      ...(selectedAreaOffice && { areaOfficeId: parseInt(selectedAreaOffice) }),
      ...(selectedFeeder && { feederId: parseInt(selectedFeeder) }),
      ...(selectedDistributionSubstation && {
        distributionSubstationId: parseInt(selectedDistributionSubstation),
      }),
      ...(selectedStatus && { billStatus: parseInt(selectedStatus) }),
      isMd: isMd,
    }

    try {
      const result = await dispatch(downloadAR(params)).unwrap()

      // Log the response to see what filename was used
      console.log("Download completed with filename:", result.data.filename)

      // Close modal and show success message with the actual filename
      setIsDownloadARModalOpen(false)
      notify("success", result.message)
    } catch (error: any) {
      notify("error", error || "Failed to download AR report")
    }
  }

  const handleCloseDownloadARModal = () => {
    setIsDownloadARModalOpen(false)
    dispatch(clearDownloadARStatus())
    // Reset form
    setSelectedBillingPeriod("")
    setSelectedAreaOffice("")
    setSelectedFeeder("")
    setSelectedDistributionSubstation("")
    setIsMd(false)
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setMeterData(generateMeterData())
      setIsLoading(false)
    }, 1000)
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="w-full">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-3 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 sm:px-4 md:my-8 md:px-6 2xl:px-16">
              <div>
                <h4 className="text-2xl font-semibold">Billing Engine</h4>
                <p>Tariff management, bill generation, and billing cycles</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="primary"
                  size="md"
                  className="mt-2"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => setIsDownloadARModalOpen(true)}
                >
                  Download AR
                </ButtonModule>
              </motion.div>
            </div>

            {/* Main Content Area */}
            {isLoading ? (
              // Loading State
              <>
                <SkeletonLoader />
                <LoadingState showCategories={true} />
              </>
            ) : (
              // Loaded State - Redesigned Metering Dashboard
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <AllBills />
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />

      {/* Add the StartBillingRun modal */}
      <StartBillingRun
        isOpen={isStartBillingRunModalOpen}
        onRequestClose={() => setIsStartBillingRunModalOpen(false)}
        onSuccess={handleBillingRunSuccess}
      />

      {/* Download AR Modal */}
      {isDownloadARModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseDownloadARModal}
        >
          <motion.div
            className="w-full max-w-lg rounded-lg bg-white shadow-xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Download AR Report</h3>
                <button onClick={handleCloseDownloadARModal} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="size-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {/* Billing Period - Required */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Billing Period <span className="text-red-500">*</span>
                  </label>
                  {isLoading ? (
                    <div className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                      Loading billing periods...
                    </div>
                  ) : (
                    <FormSelectModule
                      name="billingPeriod"
                      value={selectedBillingPeriod}
                      onChange={(e) => setSelectedBillingPeriod(e.target.value)}
                      options={
                        billingPeriods?.map((period) => ({
                          value: period.id.toString(),
                          label: period.displayName || period.periodKey,
                        })) || []
                      }
                    />
                  )}
                </div>

                {/* Area Office - Optional */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Area Office</label>
                  <FormSelectModule
                    name="areaOffice"
                    value={selectedAreaOffice}
                    onChange={(e) => setSelectedAreaOffice(e.target.value)}
                    searchable={true}
                    searchTerm={areaOfficeSearch}
                    onSearchChange={handleAreaOfficeSearchChange}
                    onSearchClick={handleAreaOfficeSearchClick}
                    loading={areaOfficesLoading}
                    options={
                      areaOffices?.map((office) => ({
                        value: office.id.toString(),
                        label: office.name,
                      })) || []
                    }
                  />
                </div>

                {/* Feeder - Optional */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
                  <FormSelectModule
                    name="feeder"
                    value={selectedFeeder}
                    onChange={(e) => setSelectedFeeder(e.target.value)}
                    searchable={true}
                    searchTerm={feederSearch}
                    onSearchChange={handleFeederSearchChange}
                    onSearchClick={handleFeederSearchClick}
                    loading={feedersLoading}
                    options={
                      feeders?.map((feeder) => ({
                        value: feeder.id.toString(),
                        label: feeder.name,
                      })) || []
                    }
                  />
                </div>

                {/* Distribution Substation - Optional */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
                  <FormSelectModule
                    name="distributionSubstation"
                    value={selectedDistributionSubstation}
                    onChange={(e) => setSelectedDistributionSubstation(e.target.value)}
                    searchable={true}
                    searchTerm={distributionSubstationSearch}
                    onSearchChange={handleDistributionSubstationSearchChange}
                    onSearchClick={handleDistributionSubstationSearchClick}
                    loading={distributionSubstationsLoading}
                    options={
                      distributionSubstations?.map((substation) => ({
                        value: substation.id.toString(),
                        label: substation.name?.toString() || substation.dssCode || `Substation ${substation.id}`,
                      })) || []
                    }
                  />
                </div>

                {/* Bill Status - Optional */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Bill Status</label>
                  <FormSelectModule
                    name="billStatus"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: BillStatus.Draft.toString(), label: "Draft" },
                      { value: BillStatus.Finalized.toString(), label: "Finalized" },
                      { value: BillStatus.Refunded.toString(), label: "Refunded" },
                    ]}
                  />
                </div>

                {/* Is MD - Optional */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isMd"
                    checked={isMd}
                    onChange={(e) => setIsMd(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#004B23] focus:ring-[#004B23]"
                  />
                  <label htmlFor="isMd" className="ml-2 block text-sm text-gray-700">
                    MD Customers Only
                  </label>
                </div>

                {/* Error Message */}
                {downloadARError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{downloadARError}</div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={handleCloseDownloadARModal}
                  disabled={downloadARLoading}
                  className="flex-1"
                >
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleDownloadAR}
                  disabled={downloadARLoading || !selectedBillingPeriod}
                  className="flex-1"
                  icon={<Download />}
                >
                  {downloadARLoading ? "Downloading..." : "Download AR"}
                </ButtonModule>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
