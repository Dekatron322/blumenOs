"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import ArrowIcon from "public/arrow-icon"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { AnimatePresence, motion } from "framer-motion"
import { MetersProgrammedIcon, PlusIcon, TamperIcon, TokenGeneratedIcon, VendingIcon } from "components/Icons/Icons"
import InstallMeterModal from "components/ui/Modal/install-meter-modal"
import AssetManagementInfo from "components/AssetManagementInfo/AssetManagementInfo"
import { usePopover } from "components/Navbar/use-popover"
import {
  AlertsIcon,
  DistributionIcon,
  OfficeIcon,
  PoleIcon,
  ReadingsIcon,
} from "components/AssetManagementInfo/TabNavigation"

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

// Generate mock asset data
const generateAssetData = () => {
  return {
    totalTransformers: 247,
    operationalTransformers: 215,
    activeFeeders: 48,
    operationalFeeders: 45,
    substations: 12,
    operationalSubstations: 12,
    assetsUnderMaintenance: 15,
    maintenanceStatus: "Scheduled work",
  }
}

export default function MeteringDashboard() {
  const router = useRouter()
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [assetData, setAssetData] = useState(generateAssetData())
  const {
    anchorRef: addAssetButtonRef,
    open: isAddAssetMenuOpen,
    handleToggle: toggleAddAssetMenu,
    handleClose: closeAddAssetMenu,
  } = usePopover()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (addAssetButtonRef.current && !addAssetButtonRef.current.contains(target)) {
        closeAddAssetMenu()
      }
    }

    if (isAddAssetMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [addAssetButtonRef, closeAddAssetMenu, isAddAssetMenuOpen])

  // Use mock data
  const {
    totalTransformers,
    operationalTransformers,
    activeFeeders,
    operationalFeeders,
    substations,
    operationalSubstations,
    assetsUnderMaintenance,
    maintenanceStatus,
  } = assetData

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
    // Refresh data after adding customer
    setAssetData(generateAssetData())
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAssetData(generateAssetData())
      setIsLoading(false)
    }, 1000)
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Asset Management</h4>
                <p>Network infrastructure and equipment tracking</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="relative" ref={addAssetButtonRef}>
                  <button
                    onClick={toggleAddAssetMenu}
                    className="flex items-center gap-2 rounded-md bg-[#0a0a0a] px-4 py-2 text-white focus-within:ring-2 focus-within:ring-[#0a0a0a] focus-within:ring-offset-2 hover:border-[#0a0a0a] hover:bg-[#000000]"
                  >
                    <PlusIcon />
                    Add New Asset
                  </button>

                  <AnimatePresence>
                    {isAddAssetMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5"
                      >
                        <div className="flex flex-col py-1">
                          <button
                            onClick={() => {
                              router.push("/assets-management/area-offices/add-area-offices")
                              closeAddAssetMenu()
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <OfficeIcon />
                            <span>Add Area Office</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push("/assets-management/feeders/add-feeders")
                              closeAddAssetMenu()
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <ReadingsIcon />
                            <span>Add Feeder</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push("/assets-management/injection-substations/add-injection-substations")
                              closeAddAssetMenu()
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <AlertsIcon />
                            <span>Add Substation</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push("/assets-management/add-poles")
                              closeAddAssetMenu()
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <PoleIcon />
                            <span>Add Pole</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push("/assets-management/add-distribution-stations")
                              closeAddAssetMenu()
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <DistributionIcon />
                            <span>Add Distribution Station</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showCategories={true} />
                  </>
                ) : (
                  // Loaded State - Asset Management Dashboard
                  <>
                    <motion.div
                      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex w-full max-sm:flex-col">
                        <div className="w-full">
                          <div className="mb-3 flex w-full cursor-pointer gap-3 max-sm:flex-col">
                            {/* Total Transformers Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-blue-600">
                                  <TokenGeneratedIcon />
                                </div>
                                <span className="font-medium">Total Transformers</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Total:</p>
                                  <p className="text-secondary text-xl font-bold">{formatNumber(totalTransformers)}</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Operational:</p>
                                  <p className="text-secondary font-medium">{formatNumber(operationalTransformers)}</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Active Feeders Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-green-600">
                                  <MetersProgrammedIcon />
                                </div>
                                <span className="font-medium">Active Feeders</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Total:</p>
                                  <p className="text-secondary text-xl font-bold">{formatNumber(activeFeeders)}</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Operational:</p>
                                  <p className="text-secondary font-medium">{formatNumber(operationalFeeders)}</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Substations Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-green-600">
                                  <VendingIcon />
                                </div>
                                <span className="font-medium">Substations</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Total:</p>
                                  <p className="text-secondary text-xl font-bold">{formatNumber(substations)}</p>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Status:</p>
                                  <div className="flex items-center gap-1">
                                    <div className="size-2 rounded-full bg-green-500"></div>
                                    <p className="text-secondary font-medium">All operational</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Assets Under Maintenance Card */}
                            <motion.div
                              className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
                              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            >
                              <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
                                <div className="text-yellow-600">
                                  <TamperIcon />
                                </div>
                                <span className="font-medium">Under Maintenance</span>
                              </div>
                              <div className="flex flex-col items-end justify-between gap-3 pt-4">
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Assets:</p>
                                  <div className="flex gap-1">
                                    <p className="text-secondary text-xl font-bold">
                                      {formatNumber(assetsUnderMaintenance)}
                                    </p>
                                    <ArrowIcon />
                                  </div>
                                </div>
                                <div className="flex w-full justify-between">
                                  <p className="text-grey-200">Status:</p>
                                  <p className="text-secondary font-medium">{maintenanceStatus}</p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-6"
                    >
                      <AssetManagementInfo />
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallMeterModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
