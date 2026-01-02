"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useCallback, useEffect, useState } from "react"
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
import { useRouter } from "next/navigation"
import { VscAdd } from "react-icons/vsc"

// Dropdown Popover Component
const DropdownPopover = ({
  options,
  selectedValue,
  onSelect,
  children,
}: {
  options: { value: number; label: string }[]
  selectedValue: number
  onSelect: (value: number) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === selectedValue)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {children}
        <svg
          className={`size-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setIsOpen(false)
                }}
                className={`block w-full px-3 py-2 text-left ${
                  option.value === selectedValue ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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

// Enhanced Skeleton for Departments
const DepartmentsSkeleton = () => {
  return (
    <div className="mt-4 w-full rounded-md border bg-white p-3 md:p-5 lg:mt-0 2xl:w-80">
      <div className="border-b pb-3 md:pb-4">
        <div className="h-6 w-32 rounded bg-gray-200 md:w-40"></div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-4 2xl:grid-cols-1">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-10 rounded bg-gray-200 md:w-12"></div>
                <div className="h-5 w-16 rounded bg-gray-200 md:w-20"></div>
              </div>
              <div className="h-4 w-12 rounded bg-gray-200 md:w-16"></div>
            </div>
            <div className="mt-2 space-y-1 md:mt-3">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded bg-gray-200 md:h-4 md:w-20"></div>
                <div className="h-3 w-12 rounded bg-gray-200 md:h-4 md:w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3 md:mt-6">
        <div className="mb-2 h-5 w-16 rounded bg-gray-200 md:w-20"></div>
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 rounded bg-gray-200 md:h-4 md:w-24"></div>
              <div className="h-3 w-10 rounded bg-gray-200 md:h-4 md:w-12"></div>
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
const LoadingState = ({ showDepartments = true }) => {
  return (
    <div className="flex-3 relative mt-5 flex flex-col items-start gap-6 lg:flex-row">
      <div className={`w-full rounded-md border bg-white p-3 md:p-5 ${showDepartments ? "lg:flex-1" : ""}`}>
        <TableSkeleton />
      </div>

      {showDepartments && <DepartmentsSkeleton />}
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
    )
  }

  return (
    <motion.div
      className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
        {icon}
        <span className="text-sm font-medium md:text-base">{title}</span>
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex w-full justify-between">
          <p className="text-xs text-gray-500 md:text-sm">{description || "Total"}:</p>
          <p className="text-sm font-semibold text-gray-900 md:text-base">{value}</p>
        </div>
        {subItems.map((item, index) => (
          <div key={index} className="flex w-full justify-between">
            <p className="text-xs text-gray-500 md:text-sm">{item.label}:</p>
            <p className="text-xs font-semibold text-gray-900 md:text-sm">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Employee Analytics Summary Cards Component
const EmployeeAnalyticsCards = ({ employeeReport }: { employeeReport: any }) => {
  const formatNumber = (num: number) => {
    return num?.toLocaleString() || "0"
  }

  const calculatePercentage = (part: number, total: number) => {
    return total > 0 ? Math.round((part / total) * 100) : 0
  }

  // Calculate additional metrics
  const departmentCoverage =
    employeeReport?.totalUsers > 0
      ? calculatePercentage(employeeReport?.withDepartmentUsers || 0, employeeReport?.totalUsers)
      : 0

  const emailVerificationRate =
    employeeReport?.totalUsers > 0
      ? calculatePercentage(employeeReport?.emailVerifiedUsers || 0, employeeReport?.totalUsers)
      : 0

  const phoneVerificationRate =
    employeeReport?.totalUsers > 0
      ? calculatePercentage(employeeReport?.phoneVerifiedUsers || 0, employeeReport?.totalUsers)
      : 0

  const activeLast30DaysRate =
    employeeReport?.totalUsers > 0
      ? calculatePercentage(employeeReport?.loggedInLast30Days || 0, employeeReport?.totalUsers)
      : 0

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full">
        <div className="grid w-full grid-cols-1 gap-3 max-md:px-3 sm:grid-cols-2 lg:mb-4 2xl:grid-cols-4">
          {/* User Statistics Card */}
          <motion.div
            className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
              <EmployeeIcon />
              <span className="text-sm font-medium md:text-base">User Statistics</span>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Total Users:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.totalUsers || 0)}
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Active:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.activeUsers || 0)}
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Inactive:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.inactiveUsers || 0)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security Status Card */}
          <motion.div
            className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
              <ContractIcon />
              <span className="text-sm font-medium md:text-base">Security Status</span>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Password Reset Required:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.mustChangePasswordUsers || 0)}
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Email Verified:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.emailVerifiedUsers || 0)} ({emailVerificationRate}%)
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Phone Verified:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.phoneVerifiedUsers || 0)} ({phoneVerificationRate}%)
                </p>
              </div>
            </div>
          </motion.div>

          {/* Department Coverage Card */}
          <motion.div
            className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
              <DepartmentIcon />
              <span className="text-sm font-medium md:text-base">Department Coverage</span>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">With Department:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.withDepartmentUsers || 0)}
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Without Department:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.withoutDepartmentUsers || 0)}
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Coverage Rate:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">{departmentCoverage}%</p>
              </div>
            </div>
          </motion.div>

          {/* Activity & Invitations Card */}
          <motion.div
            className="small-card rounded-md bg-white p-2 transition duration-500 md:border"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center gap-2 border-b pb-4 max-sm:mb-2">
              <PayrollIcon />
              <span className="text-sm font-medium md:text-base">Activity & Invitations</span>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Active Last 30 Days:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.loggedInLast30Days || 0)} ({activeLast30DaysRate}%)
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Pending Invites:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.pendingInvitations || 0)}
                </p>
              </div>
              <div className="flex w-full justify-between">
                <p className="text-xs text-gray-500 md:text-sm">Expiring Invites:</p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatNumber(employeeReport?.expiringInvitations || 0)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function EmployeeManagement() {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(480000) // 8 minutes default
  const dispatch = useAppDispatch()
  const router = useRouter()

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

  const handleRefreshData = useCallback(() => {
    setIsLoading(true)
    dispatch(clearEmployeeReport())
    dispatch(fetchEmployeeReport())
    // Simulate loading state for better UX
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [dispatch])

  const togglePolling = () => {
    setIsPolling(!isPolling)
  }

  const handlePollingIntervalChange = (interval: number) => {
    setPollingInterval(interval)
  }

  // Polling interval options
  const pollingOptions = [
    { value: 480000, label: "8m" },
    { value: 660000, label: "11m" },
    { value: 840000, label: "14m" },
    { value: 1020000, label: "17m" },
    { value: 1200000, label: "20m" },
  ]

  // Auto-refresh polling effect
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(() => {
      handleRefreshData()
    }, pollingInterval)

    return () => clearInterval(interval)
  }, [isPolling, pollingInterval, handleRefreshData])

  const handleOpenAddEmployeeModal = () => {
    router.push("/employees/add-employees")
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="mx-auto flex w-full flex-col 2xl:container">
            {/* Page Header - Always Visible */}
            <div className="my-4 flex w-full justify-between gap-6 px-3 max-md:flex-col max-md:px-3 max-sm:my-4 max-sm:px-3 sm:px-4 md:my-4 md:px-6 2xl:px-16">
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
                    variant="primary"
                    size="md"
                    onClick={handleOpenAddEmployeeModal}
                    icon={<VscAdd />}
                    iconPosition="start"
                    className="text-sm md:text-base"
                  >
                    Add Employee
                  </ButtonModule>
                )}
                {/* <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleRefreshData}
                  icon={<RefreshCircleIcon />}
                  iconPosition="start"
                  loading={employeeReportLoading || isLoading}
                  className="text-sm md:text-base"
                >
                  {employeeReportLoading || isLoading ? "Refreshing..." : "Refresh Data"}
                </ButtonModule> */}
                {/* Auto-refresh Controls */}
                <div className="flex items-center gap-2 rounded-md border-r bg-white p-2 pr-3">
                  <span className="text-sm font-medium text-gray-500">Auto-refresh:</span>
                  <button
                    onClick={togglePolling}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isPolling
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {isPolling ? (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        ON
                      </>
                    ) : (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        OFF
                      </>
                    )}
                  </button>

                  {isPolling && (
                    <DropdownPopover
                      options={pollingOptions}
                      selectedValue={pollingInterval}
                      onSelect={handlePollingIntervalChange}
                    >
                      {pollingOptions.find((opt) => opt.value === pollingInterval)?.label}
                    </DropdownPopover>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Error Message */}
            {employeeReportError && (
              <motion.div
                className="mx-3 mb-4 rounded-md bg-red-50 p-3 text-red-700 md:p-4 xl:mx-16"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm md:text-base">
                  <span className="mr-2">⚠️</span>
                  Error loading employee report: {employeeReportError}
                </p>
              </motion.div>
            )}

            {/* Main Content Area */}
            <div className="flex w-full flex-col-reverse gap-6 px-3 max-md:px-0 max-sm:my-4 sm:px-4 md:px-6 xl:flex-row 2xl:px-16">
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
                    {employeeReport && (
                      <>
                        <EmployeeAnalyticsCards employeeReport={employeeReport} />

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <AllEmployees />
                        </motion.div>
                      </>
                    )}

                    {/* Empty State */}
                    {!employeeReport && !employeeReportLoading && !employeeReportError && (
                      <motion.div
                        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 md:p-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-center">
                          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
                            <EmployeeIcon />
                          </div>
                          <h3 className="mt-4 text-lg font-medium text-gray-900">No Employee Data</h3>
                          <p className="mt-2 text-sm text-gray-500">
                            No employee analytics data available. Try refreshing the data.
                          </p>
                          <ButtonModule
                            variant="primary"
                            size="md"
                            onClick={handleRefreshData}
                            className="mt-4"
                            icon={<RefreshCircleIcon />}
                            iconPosition="start"
                          >
                            Refresh Data
                          </ButtonModule>
                        </div>
                      </motion.div>
                    )}
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
