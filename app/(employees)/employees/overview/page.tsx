"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useEffect, useState } from "react"
import AddEmployeeModal from "components/ui/Modal/add-employee-modal"
import { motion } from "framer-motion"
import {
  AddIcon,
  ContractIcon,
  DepartmentIcon,
  EmployeeIcon,
  PayrollIcon,
  RefreshCircleIcon,
} from "components/Icons/Icons"
import AllEmployees from "components/Tables/AllEmployees"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearEmployeeReport, fetchEmployeeReport } from "lib/redux/employeeSlice"

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

// Enhanced Skeleton for Departments
const DepartmentsSkeleton = () => {
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
const LoadingState = ({ showDepartments = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {showDepartments ? (
        <>
          <TableSkeleton />
          <DepartmentsSkeleton />
        </>
      ) : (
        <div className="w-full">
          <TableSkeleton />
        </div>
      )}
    </div>
  )
}

// Employee Report Card Component
const EmployeeReportCard = ({
  title,
  value,
  icon,
  description,
  subItems = [],
  isLoading = false,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  subItems?: Array<{ label: string; value: string | number }>
  isLoading?: boolean
}) => {
  if (isLoading) {
    return (
      <motion.div
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
    )
  }

  return (
    <motion.div
      className="small-card rounded-md bg-white p-4 transition duration-500 md:border"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
        {icon}
        {title}
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex w-full justify-between">
          <p className="text-grey-200">{description || "Total"}:</p>
          <p className="text-secondary font-medium">{value}</p>
        </div>
        {subItems.map((item, index) => (
          <div key={index} className="flex w-full justify-between">
            <p className="text-grey-200 text-sm">{item.label}:</p>
            <p className="text-secondary text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function EmployeeManagement() {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const dispatch = useAppDispatch()

  // Get employee report data from Redux store
  const { employeeReport, employeeReportLoading, employeeReportError, employeeReportSuccess } = useAppSelector(
    (state) => state.employee
  )

  // Permissions: show Add Employee only if user has 'W'
  const { user } = useAppSelector((state) => state.auth)
  const canWrite = !!user?.privileges?.some((p) => p.actions?.includes("W"))

  // Fetch employee report on component mount
  useEffect(() => {
    dispatch(fetchEmployeeReport())

    // Cleanup function to clear report data when component unmounts
    return () => {
      dispatch(clearEmployeeReport())
    }
  }, [dispatch])

  const handleAddEmployeeSuccess = async () => {
    setIsAddEmployeeModalOpen(false)
    // Refresh employee report data after adding employee
    dispatch(fetchEmployeeReport())
  }

  const handleRefreshData = () => {
    dispatch(fetchEmployeeReport())
  }

  const handleOpenAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(true)
  }

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num?.toLocaleString() || "0"
  }

  // Calculate additional metrics from the report data
  const calculateAdditionalMetrics = () => {
    if (!employeeReport) return null

    const {
      totalUsers,
      activeUsers,
      inactiveUsers,
      withDepartmentUsers,
      withoutDepartmentUsers,
      withAreaOfficeUsers,
      withoutAreaOfficeUsers,
      emailVerifiedUsers,
      phoneVerifiedUsers,
    } = employeeReport

    const departmentCoverage = totalUsers > 0 ? ((withDepartmentUsers / totalUsers) * 100).toFixed(1) : "0"
    const areaOfficeCoverage = totalUsers > 0 ? ((withAreaOfficeUsers / totalUsers) * 100).toFixed(1) : "0"
    const emailVerificationRate = totalUsers > 0 ? ((emailVerifiedUsers / totalUsers) * 100).toFixed(1) : "0"
    const phoneVerificationRate = totalUsers > 0 ? ((phoneVerifiedUsers / totalUsers) * 100).toFixed(1) : "0"

    return {
      departmentCoverage: `${departmentCoverage}%`,
      areaOfficeCoverage: `${areaOfficeCoverage}%`,
      emailVerificationRate: `${emailVerificationRate}%`,
      phoneVerificationRate: `${phoneVerificationRate}%`,
    }
  }

  const additionalMetrics = calculateAdditionalMetrics()

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            {/* Page Header - Always Visible */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Employee Management</h4>
                <p>Manage employee records, departments, and HR operations</p>
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
                  loading={employeeReportLoading}
                >
                  Refresh Data
                </ButtonModule>
              </motion.div>
            </div>

            {/* Error Message */}
            {employeeReportError && (
              <motion.div
                className="mx-16 mb-4 rounded-md bg-red-50 p-4 text-red-700 max-md:mx-0 max-sm:mx-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="flex items-center gap-2">
                  <span>⚠️</span>
                  Error loading employee report: {employeeReportError}
                </p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {employeeReportLoading ? (
                  // Loading State
                  <>
                    <SkeletonLoader />
                    <LoadingState showDepartments={true} />
                  </>
                ) : (
                  // Loaded State
                  <>
                    <motion.div
                      className="flex w-full gap-3 max-lg:grid max-lg:grid-cols-2 max-sm:grid-cols-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* User Statistics Card */}
                      <EmployeeReportCard
                        title="User Statistics"
                        value={formatNumber(employeeReport?.totalUsers || 0)}
                        icon={<EmployeeIcon />}
                        description="Total Users"
                        subItems={[
                          { label: "Active", value: formatNumber(employeeReport?.activeUsers || 0) },
                          { label: "Inactive", value: formatNumber(employeeReport?.inactiveUsers || 0) },
                        ]}
                        isLoading={employeeReportLoading}
                      />

                      {/* Security Status Card */}
                      <EmployeeReportCard
                        title="Security Status"
                        value={formatNumber(employeeReport?.mustChangePasswordUsers || 0)}
                        icon={<ContractIcon />}
                        description="Password Reset Required"
                        subItems={[
                          { label: "Email Verified", value: formatNumber(employeeReport?.emailVerifiedUsers || 0) },
                          { label: "Phone Verified", value: formatNumber(employeeReport?.phoneVerifiedUsers || 0) },
                        ]}
                        isLoading={employeeReportLoading}
                      />

                      {/* Department Coverage Card */}
                      <EmployeeReportCard
                        title="Department Coverage"
                        value={formatNumber(employeeReport?.withDepartmentUsers || 0)}
                        icon={<DepartmentIcon />}
                        description="With Department"
                        subItems={[
                          {
                            label: "Without Department",
                            value: formatNumber(employeeReport?.withoutDepartmentUsers || 0),
                          },
                          { label: "Coverage", value: additionalMetrics?.departmentCoverage || "0%" },
                        ]}
                        isLoading={employeeReportLoading}
                      />

                      {/* Activity & Invitations Card */}
                      <EmployeeReportCard
                        title="Activity & Invitations"
                        value={formatNumber(employeeReport?.loggedInLast30Days || 0)}
                        icon={<PayrollIcon />}
                        description="Active Last 30 Days"
                        subItems={[
                          { label: "Pending Invites", value: formatNumber(employeeReport?.pendingInvitations || 0) },
                          { label: "Expiring Invites", value: formatNumber(employeeReport?.expiringInvitations || 0) },
                        ]}
                        isLoading={employeeReportLoading}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <AllEmployees />
                    </motion.div>
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
