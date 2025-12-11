"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort } from "react-icons/rx"
import {
  MdOutlineAdd,
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineBusiness,
  MdOutlineCancel,
  MdOutlineCheckCircle,
  MdOutlineCorporateFare,
  MdOutlineDescription,
  MdOutlineEdit,
  MdOutlineError,
  MdOutlinePeople,
  MdOutlineRefresh,
  MdOutlineVisibility,
} from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  clearCurrentDepartment,
  clearDepartments,
  Department,
  fetchDepartmentById,
  fetchDepartments,
  selectCurrentDepartment,
  selectCurrentDepartmentError,
  selectCurrentDepartmentLoading,
  selectDepartments,
  selectDepartmentsError,
  selectDepartmentsLoading,
  selectDepartmentsSuccess,
} from "lib/redux/departmentSlice"

const DepartmentCard: React.FC<{
  department: Department
  onViewDetails: (department: Department) => void
  onEdit: (department: Department) => void
}> = ({ department, onViewDetails, onEdit }) => {
  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-12 items-center justify-center rounded-lg ${
              department.isActive ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            <MdOutlineBusiness className={`size-6 ${department.isActive ? "text-green-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{department.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  department.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {department.isActive ? "Active" : "Inactive"}
              </div>
              <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Department</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {department.isActive ? (
            <MdOutlineCheckCircle className="size-5 text-green-500" />
          ) : (
            <MdOutlineCancel className="size-5 text-gray-400" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {department.description && (
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
              <MdOutlineDescription className="size-4" />
              <span className="font-medium">Description</span>
            </div>
            <p className="line-clamp-2 text-sm text-gray-700">{department.description}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MdOutlineCorporateFare className="size-4 text-gray-400" />
            <span className="text-sm text-gray-600">Company:</span>
            <span className="text-sm font-medium text-gray-900">{department.companyName}</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex gap-2">
            <ButtonModule
              variant="outline"
              size="sm"
              className="w-1/2 justify-center"
              onClick={() => onViewDetails(department)}
            >
              <MdOutlineVisibility className="mr-2 size-4" />
              View Details
            </ButtonModule>
            <ButtonModule
              variant="primary"
              size="sm"
              className="w-1/2 justify-center"
              onClick={() => onEdit(department)}
            >
              <MdOutlineEdit className="mr-2 size-4" />
              Edit
            </ButtonModule>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const DepartmentDetailsCard: React.FC<{ department: Department }> = ({ department }) => {
  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-14 items-center justify-center rounded-xl ${
              department.isActive ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            <MdOutlineBusiness className={`size-7 ${department.isActive ? "text-green-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{department.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  department.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {department.isActive ? "Active" : "Inactive"}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Department</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {department.description && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MdOutlineDescription className="size-4" />
              Description
            </h3>
            <p className="rounded-lg bg-gray-50 p-4 text-gray-700">{department.description}</p>
          </div>
        )}

        <div className="flex w-full flex-col gap-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MdOutlineCorporateFare className="size-4" />
              Company Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company Name:</span>
                <span className="text-sm font-medium text-gray-900">{department.companyName}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <MdOutlineBusiness className="size-4" />
              Status Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="flex items-center gap-2">
                  {department.isActive ? (
                    <>
                      <MdOutlineCheckCircle className="size-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <MdOutlineCancel className="size-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!department.description && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
            <MdOutlineDescription className="mx-auto mb-2 size-6 text-gray-400" />
            <p className="text-sm text-gray-500">No description provided for this department</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const LoadingSkeleton = () => {
  return (
    <motion.div
      className="mt-5 flex flex-1 flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 rounded bg-gray-200" />
          <div className="h-10 w-24 rounded bg-gray-200" />
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(6)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(6)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const CardsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-20 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="size-7 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3">
              <div className="h-8 w-full rounded bg-gray-200" />
              <div className="h-8 w-full rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const DepartmentsTable: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // State from Redux
  const departments = useAppSelector(selectDepartments)
  const loading = useAppSelector(selectDepartmentsLoading)
  const error = useAppSelector(selectDepartmentsError)
  const success = useAppSelector(selectDepartmentsSuccess)
  const currentDepartment = useAppSelector(selectCurrentDepartment)
  const currentDepartmentLoading = useAppSelector(selectCurrentDepartmentLoading)
  const currentDepartmentError = useAppSelector(selectCurrentDepartmentError)

  // Local state
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "id" | "company">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [pageSize, setPageSize] = useState(12)
  const [companyId, setCompanyId] = useState<number | undefined>(undefined)

  // Fetch departments on mount and when filters change
  useEffect(() => {
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(companyId && { companyId }),
      ...(searchText && { search: searchText }),
      ...(filterStatus !== "all" && { isActive: filterStatus === "active" }),
    }

    dispatch(fetchDepartments(params))

    // Cleanup function
    return () => {
      dispatch(clearDepartments())
      dispatch(clearCurrentDepartment())
    }
  }, [dispatch, currentPage, pageSize, companyId, searchText, filterStatus])

  // Fetch department details when selected
  useEffect(() => {
    if (selectedDepartment) {
      dispatch(fetchDepartmentById(selectedDepartment.id))
    }
  }, [dispatch, selectedDepartment])

  const handleRefreshDepartments = () => {
    const params = {
      pageNumber: currentPage,
      pageSize: pageSize,
      ...(companyId && { companyId }),
      ...(searchText && { search: searchText }),
      ...(filterStatus !== "all" && { isActive: filterStatus === "active" }),
    }
    dispatch(fetchDepartments(params))
  }

  const handleRefreshCurrentDepartment = () => {
    if (selectedDepartment) {
      dispatch(fetchDepartmentById(selectedDepartment.id))
    }
  }

  // Filter departments based on search
  const filteredDepartments = departments.filter((department) => {
    const matchesSearch =
      searchText === "" ||
      department.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (department.description && department.description.toLowerCase().includes(searchText.toLowerCase())) ||
      department.companyName.toLowerCase().includes(searchText.toLowerCase())

    const matchesStatusFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && department.isActive) ||
      (filterStatus === "inactive" && !department.isActive)

    return matchesSearch && matchesStatusFilter
  })

  // Sort departments
  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "id":
        aValue = a.id
        bValue = b.id
        break
      case "company":
        aValue = a.companyName.toLowerCase()
        bValue = b.companyName.toLowerCase()
        break
      default:
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    setCurrentPage(pageNumber)
  }

  const handleViewDetails = (department: Department) => {
    setSelectedDepartment(department)
    setShowDetails(true)
  }

  const handleEdit = (department: Department) => {
    router.push(`/departments/edit/${department.id}`)
  }

  const toggleSort = (column: "name" | "id" | "company") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  // Calculate statistics
  const totalDepartments = departments.length
  const activeDepartments = departments.filter((dept) => dept.isActive).length
  const inactiveDepartments = departments.filter((dept) => !dept.isActive).length
  const uniqueCompanies = new Set(departments.map((dept) => dept.companyId)).size

  // Pagination variables from Redux state
  const pagination = {
    totalCount: departments.length,
    totalPages: Math.ceil(departments.length / pageSize),
    currentPage,
    pageSize,
    hasNext: currentPage * pageSize < departments.length,
    hasPrevious: currentPage > 1,
  }

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + sortedDepartments.length

  if (loading && departments.length === 0) return <LoadingSkeleton />

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="items-center justify-between py-2 md:flex"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Departments</p>
          <p className="text-sm text-gray-600">Manage company departments and their information</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search departments..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <ButtonModule variant="outline" size="sm" onClick={handleRefreshDepartments} disabled={loading}>
            <MdOutlineRefresh className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </ButtonModule>
          <ButtonModule variant="primary" size="sm" onClick={() => router.push("/departments/add")}>
            <MdOutlineAdd className="mr-2 size-4" />
            Create Department
          </ButtonModule>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalDepartments}</div>
              <div className="text-sm text-gray-600">Total Departments</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <MdOutlineBusiness className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeDepartments}</div>
              <div className="text-sm text-gray-600">Active Departments</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <MdOutlineCheckCircle className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{inactiveDepartments}</div>
              <div className="text-sm text-gray-600">Inactive Departments</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <MdOutlineCancel className="size-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{uniqueCompanies}</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <MdOutlineCorporateFare className="size-6 text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-red-700">Error: {error}</div>
            <button
              onClick={handleRefreshDepartments}
              className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {currentDepartmentError && selectedDepartment && (
        <motion.div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-red-700">Error loading department details: {currentDepartmentError}</div>
            <button
              onClick={handleRefreshCurrentDepartment}
              className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <div className="mt-6 flex gap-6">
        {/* Main Content - Departments Cards/Grid */}
        <motion.div
          className={`${showDetails && selectedDepartment ? "w-2/3" : "w-full"} transition-all duration-300`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Controls Bar */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm ${
                    viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm ${
                    viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  List View
                </button>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Sort by:</span>
                <button
                  onClick={() => toggleSort("name")}
                  className={`rounded px-2 py-1 ${sortBy === "name" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("id")}
                  className={`rounded px-2 py-1 ${sortBy === "id" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("company")}
                  className={`rounded px-2 py-1 ${sortBy === "company" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Company {sortBy === "company" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterStatus === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterStatus === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterStatus === "inactive"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Departments Grid */}
          {loading && departments.length > 0 ? (
            <CardsLoadingSkeleton />
          ) : sortedDepartments.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <MdOutlineBusiness className="mx-auto mb-4 size-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No departments found</h3>
              <p className="mb-6 text-gray-600">
                {searchText ? "Try adjusting your search or filters" : "Create your first department to get started"}
              </p>
              <ButtonModule variant="primary" onClick={() => router.push("/departments/add")}>
                Create New Department
              </ButtonModule>
            </div>
          ) : viewMode === "grid" ? (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {sortedDepartments.map((department, index) => (
                  <motion.div
                    key={department.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <DepartmentCard department={department} onViewDetails={handleViewDetails} onEdit={handleEdit} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Department</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">ID</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Company</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDepartments.map((department, index) => (
                      <motion.tr
                        key={department.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-10 items-center justify-center rounded-md ${
                                department.isActive ? "bg-green-50" : "bg-gray-100"
                              }`}
                            >
                              <MdOutlineBusiness
                                className={`size-5 ${department.isActive ? "text-green-600" : "text-gray-400"}`}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{department.name}</div>
                              <p className="line-clamp-1 text-sm text-gray-600">
                                {department.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-gray-700">#{department.id}</td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{department.companyName}</div>
                          <div className="text-xs text-gray-500">ID: #{department.companyId}</div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              department.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {department.isActive ? (
                              <>
                                <MdOutlineCheckCircle className="size-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <MdOutlineCancel className="size-3" />
                                Inactive
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <ButtonModule variant="outline" size="sm" onClick={() => handleViewDetails(department)}>
                              View
                            </ButtonModule>
                            <ButtonModule variant="outline" size="sm" onClick={() => handleEdit(department)}>
                              Edit
                            </ButtonModule>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {sortedDepartments.length > 0 && (
            <motion.div
              className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 md:flex-row"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, pagination.totalCount)} of {pagination.totalCount}{" "}
                departments
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>

                <motion.button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={!pagination.hasPrevious}
                  className={`flex items-center justify-center rounded-md p-2 ${
                    !pagination.hasPrevious ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: pagination.hasPrevious ? 1.05 : 1 }}
                  whileTap={{ scale: pagination.hasPrevious ? 0.95 : 1 }}
                >
                  <MdOutlineArrowBackIosNew />
                </motion.button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = index + 1
                  } else if (currentPage <= 3) {
                    pageNum = index + 1
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + index
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
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.18, delay: index * 0.03 }}
                    >
                      {pageNum}
                    </motion.button>
                  )
                })}

                {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                  <span className="px-2">...</span>
                )}

                {pagination.totalPages > 5 && currentPage < pagination.totalPages - 1 && (
                  <motion.button
                    onClick={() => paginate(pagination.totalPages)}
                    className="flex size-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {pagination.totalPages}
                  </motion.button>
                )}

                <motion.button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`flex items-center justify-center rounded-md p-2 ${
                    !pagination.hasNext ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: pagination.hasNext ? 1.05 : 1 }}
                  whileTap={{ scale: pagination.hasNext ? 0.95 : 1 }}
                >
                  <MdOutlineArrowForwardIos />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Department Details Sidebar */}
        {showDetails && selectedDepartment && (
          <motion.div
            className="w-1/3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="sticky top-4">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdOutlineBusiness className="size-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Department Details</h3>
                        <p className="text-xs text-gray-500">{selectedDepartment.name}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          selectedDepartment.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedDepartment.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRefreshCurrentDepartment}
                        disabled={currentDepartmentLoading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Refresh details"
                      >
                        <MdOutlineRefresh className={`size-4 ${currentDepartmentLoading ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDepartment(null)
                          setShowDetails(false)
                          dispatch(clearCurrentDepartment())
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Close details"
                      >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                  {currentDepartmentLoading ? (
                    <div className="space-y-4">
                      <div className="h-4 w-48 rounded bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-3 w-32 rounded bg-gray-200" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                        <div className="h-3 w-40 rounded bg-gray-200" />
                      </div>
                    </div>
                  ) : currentDepartmentError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-2 text-red-700">
                        <MdOutlineError className="size-4" />
                        <span>Error loading details: {currentDepartmentError}</span>
                      </div>
                    </div>
                  ) : (
                    <DepartmentDetailsCard department={currentDepartment || selectedDepartment} />
                  )}
                </div>

                <div className="border-t bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      <div className="font-medium">Department ID:</div>
                      <div className="mt-1 font-mono">#{selectedDepartment.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <ButtonModule variant="outline" size="sm" onClick={() => handleEdit(selectedDepartment)}>
                        <MdOutlineEdit className="mr-1 size-3.5" />
                        Edit
                      </ButtonModule>
                      <ButtonModule
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/departments/${selectedDepartment.id}/employees`)}
                      >
                        <MdOutlinePeople className="mr-1 size-3.5" />
                        View Employees
                      </ButtonModule>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Show Details Toggle Button (when department is selected but sidebar is hidden) */}
        {!showDetails && selectedDepartment && (
          <motion.button
            onClick={() => setShowDetails(true)}
            className="fixed right-4 top-24 z-10 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-lg"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <MdOutlineBusiness className="size-4 text-blue-600" />
            <div className="text-left">
              <div className="text-sm font-medium">Show Details</div>
              <div className="text-xs text-gray-500">{selectedDepartment.name}</div>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                selectedDepartment.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {selectedDepartment.isActive ? "Active" : "Inactive"}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default DepartmentsTable
