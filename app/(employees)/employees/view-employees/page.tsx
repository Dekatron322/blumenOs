"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useState } from "react"
import AddEmployeeModal from "components/ui/Modal/add-employee-modal"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { AddIcon, RefreshCircleIcon } from "components/Icons/Icons"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppSelector } from "lib/hooks/useRedux"
import AllEmployees from "components/Tables/AllEmployees"

// Enhanced Skeleton Loader Component for Cards
const SkeletonLoader = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 max-md:px-3 sm:grid-cols-2 lg:mb-4 2xl:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={index}
          className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
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
            <div className="size-4 rounded-full bg-gray-200 sm:size-6"></div>
            <div className="h-3 w-20 rounded bg-gray-200 sm:h-4 sm:w-32"></div>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-full justify-between">
                <div className="h-3 w-16 rounded bg-gray-200 sm:h-4 sm:w-24"></div>
                <div className="h-3 w-12 rounded bg-gray-200 sm:h-4 sm:w-16"></div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Skeleton for the table and grid view
const TableSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-3 md:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between md:pb-4">
        <div className="h-7 w-32 rounded bg-gray-200 sm:h-8 sm:w-40"></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-9 w-full rounded bg-gray-200 sm:h-10 md:w-60 lg:w-80"></div>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View Skeleton */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gray-200 md:size-12"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-5 w-24 rounded bg-gray-200 md:w-32"></div>
                  <div className="mt-1 flex flex-wrap gap-1 md:gap-2">
                    <div className="h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
                    <div className="h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
                  </div>
                </div>
              </div>
              <div className="size-5 rounded bg-gray-200 md:size-6"></div>
            </div>

            <div className="mt-3 space-y-2 md:mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
                  <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-16"></div>
                </div>
              ))}
            </div>

            <div className="mt-2 border-t pt-2 md:mt-3 md:pt-3">
              <div className="h-3 w-full rounded bg-gray-200 md:h-4"></div>
            </div>

            <div className="mt-2 flex gap-2 md:mt-3">
              <div className="h-8 flex-1 rounded bg-gray-200 md:h-9"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
        <div className="order-2 flex items-center gap-2 md:order-1">
          <div className="hidden h-4 w-12 rounded bg-gray-200 md:block md:w-16"></div>
          <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-16"></div>
        </div>

        <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
          <div className="size-7 rounded bg-gray-200 md:size-8"></div>
          <div className="flex gap-1 md:gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-6 rounded bg-gray-200 md:size-7"></div>
            ))}
          </div>
          <div className="size-7 rounded bg-gray-200 md:size-8"></div>
        </div>

        <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block md:w-24"></div>
      </div>
    </div>
  )
}

// List View Skeleton
const ListSkeleton = () => {
  return (
    <div className="flex-1 rounded-md border bg-white p-3 md:p-5">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between md:pb-4">
        <div className="h-7 w-32 rounded bg-gray-200 sm:h-8 sm:w-40"></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="h-9 w-full rounded bg-gray-200 sm:h-10 md:w-60 lg:w-80"></div>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 w-16 rounded bg-gray-200 md:h-10 md:w-20 lg:w-24"></div>
            ))}
          </div>
        </div>
      </div>

      {/* List View Skeleton */}
      <div className="divide-y">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="border-b bg-white p-3 md:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0">
              <div className="flex items-start gap-3 md:items-center md:gap-4">
                <div className="size-8 flex-shrink-0 rounded-full bg-gray-200 md:size-10"></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <div className="h-5 w-32 rounded bg-gray-200 md:w-40"></div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      <div className="h-6 w-12 rounded-full bg-gray-200 md:w-16"></div>
                      <div className="h-6 w-16 rounded-full bg-gray-200 md:w-20"></div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 md:gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-24"></div>
                    ))}
                  </div>
                  <div className="mt-2 hidden h-3 w-40 rounded bg-gray-200 md:block md:h-4 md:w-64"></div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 md:justify-end md:gap-3">
                <div className="hidden text-right md:block">
                  <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
                  <div className="mt-1 h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-14 rounded bg-gray-200 md:h-9 md:w-20"></div>
                  <div className="size-5 rounded bg-gray-200 md:size-6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-4 flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
        <div className="order-2 flex items-center gap-2 md:order-1">
          <div className="hidden h-4 w-12 rounded bg-gray-200 md:block md:w-16"></div>
          <div className="h-7 w-12 rounded bg-gray-200 md:h-8 md:w-16"></div>
        </div>

        <div className="order-1 flex items-center gap-2 md:order-2 md:gap-3">
          <div className="size-7 rounded bg-gray-200 md:size-8"></div>
          <div className="flex gap-1 md:gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="size-6 rounded bg-gray-200 md:size-7"></div>
            ))}
          </div>
          <div className="size-7 rounded bg-gray-200 md:size-8"></div>
        </div>

        <div className="order-3 hidden h-4 w-20 rounded bg-gray-200 md:block md:w-24"></div>
      </div>
    </div>
  )
}

// Main Loading Component
const LoadingState = () => {
  return (
    <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
      <div className="w-full rounded-md border bg-white p-3 md:p-5">
        <TableSkeleton />
      </div>
    </div>
  )
}

export default function EmployeeManagement() {
  const router = useRouter()
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Permissions: show Add Employee only if user has 'W'
  const { user } = useAppSelector((state) => state.auth)
  const canWrite = !!user?.privileges?.some((p) => p.actions?.includes("W"))

  const handleAddEmployeeSuccess = async () => {
    setIsAddEmployeeModalOpen(false)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleRefreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleOpenAddEmployeeModal = () => {
    router.push("/employees/add-employees")
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col xl:container">
            {/* Page Header - Always Visible */}
            <div className="my-4 flex w-full justify-between gap-6 px-3 max-md:flex-col max-md:px-3 max-sm:my-4 max-sm:px-3 md:my-8 xl:px-16">
              <div>
                <h4 className="text-xl font-semibold sm:text-2xl">Employee Management</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  Manage employee records, departments, and HR operations
                </p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {canWrite && (
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={handleOpenAddEmployeeModal}
                    icon={<AddIcon />}
                    iconPosition="start"
                    className="text-sm md:text-base"
                  >
                    Add Employee
                  </ButtonModule>
                )}
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleRefreshData}
                  icon={<RefreshCircleIcon />}
                  iconPosition="start"
                  loading={isLoading}
                  className="text-sm md:text-base"
                >
                  {isLoading ? "Refreshing..." : "Refresh Data"}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full flex-col-reverse gap-6 px-3 max-md:px-0 max-sm:my-4 xl:flex-row xl:px-16">
              <div className="w-full">
                {isLoading ? (
                  // Loading State
                  <>
                    <LoadingState />
                  </>
                ) : (
                  // Loaded State
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <AllEmployees />
                    </motion.div>

                    {/* Empty State - Optional if you want to show when there are no employees */}
                    {/* {!employeesData && !isLoading && (
                      <motion.div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 md:p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-center">
                          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
                            <AddIcon />
                          </div>
                          <h3 className="mt-4 text-lg font-medium text-gray-900">No Employees Found</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            Get started by adding your first employee.
                          </p>
                          {canWrite && (
                            <ButtonModule
                              variant="primary"
                              size="md"
                              onClick={handleOpenAddEmployeeModal}
                              className="mt-4"
                              icon={<AddIcon />}
                              iconPosition="start"
                            >
                              Add Employee
                            </ButtonModule>
                          )}
                        </div>
                      </motion.div>
                    )} */}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onRequestClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={handleAddEmployeeSuccess}
      />
    </section>
  )
}
