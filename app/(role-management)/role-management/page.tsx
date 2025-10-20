"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { RxCaretSort } from "react-icons/rx"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import DeleteModal from "components/ui/Modal/delete-modal"
import Filtericon from "public/filter-icon"
import DashboardNav from "components/Navbar/DashboardNav"
import { FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi"
import { Badge } from "components/ui/Badge/badge"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { Admin, Permission, useDeleteAdminMutation, useGetAdminsQuery } from "lib/redux/adminSlice"
import PermissionModal from "components/ui/Modal/edit-permission-modal"
import { notify } from "components/ui/Notification/Notification"

type SortOrder = "asc" | "desc" | null

export interface Employee {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "staff" | "support"
  status: "active" | "inactive" | "pending"
  lastActive: string
  department: string
  phoneNumber?: string
  isActive?: boolean
  firstName?: string
  lastName?: string
  tag?: string
  photo?: string
}

// Skeleton Loading Components
const SkeletonRow = () => (
  <tr>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
      </div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="flex gap-2">
        <div className="h-8 w-16 animate-pulse rounded border bg-gray-200"></div>
        <div className="h-8 w-16 animate-pulse rounded border bg-gray-200"></div>
      </div>
    </td>
  </tr>
)

const SkeletonTable = () => (
  <>
    <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {["Employee ID", "Name", "Email", "Department", "Role", "Status", "Last Active", "Actions"].map(
              (header) => (
                <th key={header} className="whitespace-nowrap border-b p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                    {header}
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-t py-3">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
      <div className="flex gap-2">
        <div className="size-7 animate-pulse rounded-md bg-gray-200"></div>
        <div className="size-7 animate-pulse rounded-md bg-gray-200"></div>
        <div className="size-7 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    </div>
  </>
)

const FilterDropdown = ({
  isOpen,
  onClose,
  onFilterChange,
  activeFilters,
  filterOptions,
}: {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filter: string) => void
  activeFilters: string[]
  filterOptions: { value: string; label: string }[]
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm font-medium text-gray-700">Filter by status</div>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`flex w-full items-center px-4 py-2 text-left text-sm ${
              activeFilters.includes(option.value)
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            onClick={() => onFilterChange(option.value)}
          >
            <span className="mr-2">
              {activeFilters.includes(option.value) ? (
                <svg className="size-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="size-4 opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {option.label}
          </button>
        ))}
        <div className="border-t border-gray-100"></div>
        <button
          className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

const EmployeesTable: React.FC<{
  employees: Employee[]
  isLoading: boolean
  adminData: Admin[] | undefined
  refetchAdmins: () => void
}> = ({ employees, isLoading, adminData, refetchAdmins }) => {
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const canManageAdmin = user?.admin?.permission?.canManageAdmin

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<{
    id: number
    name: string
    currentPermissions: Permission | null
  } | null>(null)

  // Use the delete admin mutation
  const [deleteAdmin] = useDeleteAdminMutation()

  const statusFilterOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ]

  const roleFilterOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
    { value: "support", label: "Support" },
  ]

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const filteredEmployees = employees.filter((employee) => {
    const searchMatch = Object.values(employee).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })

    const statusMatch =
      activeFilters.length === 0 || activeFilters.includes(employee.status) || activeFilters.includes(employee.role)

    return searchMatch && statusMatch
  })

  const getInitial = (name: string) => {
    if (!name || name.length === 0) return ""
    return name.charAt(0).toUpperCase()
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "inactive":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      case "pending":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      default:
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>
      case "manager":
        return <Badge variant="outline">Manager</Badge>
      case "staff":
        return <Badge variant="secondary">Staff</Badge>
      case "support":
        return <Badge variant="default">Support</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const toggleSort = (column: keyof Employee) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async (reason: string) => {
    setIsDeleting(true)
    try {
      if (!employeeToDelete) return

      // Extract the admin ID from the employee ID (assuming format "EMP-{id}")
      const adminId = parseInt(employeeToDelete.id.replace("EMP-", ""))

      // Call the delete admin mutation
      const result = await deleteAdmin(adminId).unwrap()

      if (result.isSuccess) {
        // Show success notification
        notify("success", "Admin Deleted!", {
          description: `Admin ${employeeToDelete.name} has been deleted successfully.`,
          duration: 3000,
        })

        // Refresh the admin list
        refetchAdmins()
      } else {
        // Show error notification
        notify("error", "Delete Failed", {
          description: result.message || "Failed to delete admin. Please try again.",
          duration: 5000,
        })
      }

      setIsDeleteModalOpen(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error("Error deleting admin:", error)
      // Show error notification
      notify("error", "Delete Failed", {
        description: "There was an error deleting the admin. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditRole = (employee: Employee) => {
    // Find the actual admin data from the passed adminData prop
    const adminItem = adminData?.find((admin) => admin.id === parseInt(employee.id.replace("EMP-", "")))

    setSelectedAdmin({
      id: parseInt(employee.id.replace("EMP-", "")),
      name: employee.name,
      currentPermissions: adminItem?.permission || null,
    })
    setIsPermissionModalOpen(true)
  }

  const handleAddEmployee = () => {
    router.push("/role-management/add")
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="">
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="h-10 w-64 animate-pulse rounded-md bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-10 w-20 animate-pulse rounded-md bg-gray-200"></div>
              {canManageAdmin && <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200"></div>}
            </div>
          </div>
        </div>
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="">
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-medium max-sm:pb-3 md:text-xl">Employee Roles</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />
          <div className="flex gap-2">
            <div className="relative">
              <ButtonModule variant="black" size="md" icon={<Filtericon />} iconPosition="start" onClick={toggleFilter}>
                <p className="max-sm:hidden">Filter</p>
                {activeFilters.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-bold leading-none text-white">
                    {activeFilters.length}
                  </span>
                )}
              </ButtonModule>
              <FilterDropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
                filterOptions={[...statusFilterOptions, ...roleFilterOptions]}
              />
            </div>
            {canManageAdmin && (
              <ButtonModule
                variant="primary"
                size="md"
                icon={<FiUserPlus />}
                iconPosition="start"
                onClick={handleAddEmployee}
              >
                <p className="max-sm:hidden">Add Employee</p>
              </ButtonModule>
            )}
          </div>
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No employees found.</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
            <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("id")}
                  >
                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                    Employee ID <RxCaretSort />
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("department")}
                  >
                    <div className="flex items-center gap-2">
                      Department <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("role")}
                  >
                    <div className="flex items-center gap-2">
                      Role <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("lastActive")}
                  >
                    <div className="flex items-center gap-2">
                      Last Active <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">
                    <div className="flex items-center gap-2">Actions</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                        {employee.id}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#EDF0F4]">
                          <p>{getInitial(employee.name)}</p>
                        </div>
                        {employee.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{employee.email}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{employee.department}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{getRoleBadge(employee.role)}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <div className="flex">
                        <div
                          style={getStatusStyle(employee.status)}
                          className="flex items-center justify-center gap-1 rounded-full px-2 py-1 capitalize"
                        >
                          {employee.status}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{formatDate(employee.lastActive)}</td>
                    <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                      <div className="flex gap-2">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          icon={<FiEdit2 />}
                          onClick={() => handleEditRole(employee)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Edit
                        </ButtonModule>
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          icon={<FiTrash2 />}
                          onClick={() => handleDeleteClick(employee)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </ButtonModule>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t py-3">
            <div className="text-sm text-gray-700">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredEmployees.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? "cursor-not-allowed text-gray-500" : "text-[#003F9F]"}`}
              >
                <MdOutlineArrowBackIosNew />
              </button>
              <button
                className={`flex size-7 items-center justify-center rounded-md shadow-sm ${
                  currentPage === 1 ? "bg-white text-[#003F9F]" : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => paginate(1)}
              >
                1
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)}
                className={`flex size-7 items-center justify-center rounded-full ${
                  currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)
                    ? "cursor-not-allowed text-gray-500"
                    : "text-[#003F9F]"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
        </>
      )}

      {selectedAdmin && (
        <PermissionModal
          isOpen={isPermissionModalOpen}
          onRequestClose={() => {
            setIsPermissionModalOpen(false)
            setSelectedAdmin(null)
          }}
          admin={selectedAdmin}
          onSuccess={() => {
            // Optional: Refresh data or show success message
          }}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => {
          setIsDeleteModalOpen(false)
          setEmployeeToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        businessName={employeeToDelete?.name || "this admin"}
        successMessage={`Admin ${employeeToDelete?.name || ""} has been deleted successfully.`}
        errorMessage="Failed to delete admin. Please try again."
      />
    </div>
  )
}

const RoleManagementPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data, error, isLoading, refetch } = useGetAdminsQuery({
    pageNumber: currentPage,
    pageSize: pageSize,
  })

  // Transform API data to match Employee interface
  const transformApiDataToEmployees = (apiData: any[]): Employee[] => {
    return apiData.map((admin) => ({
      id: `EMP-${admin.id}`,
      name: `${admin.user?.firstName || ""} ${admin.user?.lastName || ""}`.trim() || "Unknown",
      email: admin.user?.email || "No email",
      role: "admin" as const,
      status: admin.isActive ? ("active" as const) : ("inactive" as const),
      lastActive: new Date().toISOString(),
      department: "Administration",
      phoneNumber: admin.user?.phoneNumber,
      isActive: admin.isActive,
      firstName: admin.user?.firstName,
      lastName: admin.user?.lastName,
      tag: admin.user?.tag,
      photo: admin.user?.photo,
    }))
  }

  const employees = data?.data ? transformApiDataToEmployees(data.data) : []

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <DashboardNav />
        <div className="container mx-auto px-16 py-8">
          <h1 className="mb-6 text-2xl font-bold">Employee Role Management</h1>
          <div className="flex h-60 items-center justify-center">
            <div className="text-lg text-red-600">Error loading employees. Please try again.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <DashboardNav />
      <div className="container mx-auto px-16 py-8">
        <h1 className="mb-6 text-2xl font-bold">Employee Role Management</h1>
        <div>
          <EmployeesTable employees={employees} isLoading={isLoading} adminData={data?.data} refetchAdmins={refetch} />
        </div>
      </div>
    </div>
  )
}

export default RoleManagementPage
