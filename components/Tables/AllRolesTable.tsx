"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineCategory,
  MdOutlineDescription,
  MdOutlineKey,
  MdOutlineLock,
  MdOutlineLockOpen,
  MdOutlinePeople,
  MdOutlineShield,
  MdOutlineVisibility,
} from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearPrivileges, fetchPrivileges, fetchRoles, Privilege, Role } from "lib/redux/roleSlice"

interface ActionDropdownProps {
  role: Role
  onViewDetails: (role: Role) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ role, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(role)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open actions"
        role="button"
      >
        <RxDotsVertical />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 6
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 6
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -6 : 6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          ></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const RoleCard: React.FC<{ role: Role; onViewDetails: (role: Role) => void }> = ({ role, onViewDetails }) => {
  const getPrivilegeCount = () => {
    return role.privileges?.length || 0
  }

  const getActionCount = () => {
    if (!role.privileges) return 0
    return role.privileges.reduce((total, privilege) => {
      let count = 0
      if (privilege.actions & 1) count++ // C
      if (privilege.actions & 2) count++ // R
      if (privilege.actions & 4) count++ // U
      if (privilege.actions & 8) count++ // D
      if (privilege.actions & 16) count++ // A
      if (privilege.actions & 32) count++ // V
      return total + count
    }, 0)
  }

  const getTopCategories = () => {
    if (!role.privileges || role.privileges.length === 0) return []
    const categories = role.privileges.map((p) => p.privilegeCategory)
    const uniqueCategories = Array.from(new Set(categories))
    return uniqueCategories.slice(0, 3) // Show top 3 categories
  }

  const categories = getTopCategories()

  return (
    <motion.div
      className="h-full rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-12 items-center justify-center rounded-lg ${
                  role.isSystem ? "bg-purple-50" : "bg-blue-50"
                }`}
              >
                {role.isSystem ? (
                  <MdOutlineLock className={`size-6 ${role.isSystem ? "text-purple-600" : "text-blue-600"}`} />
                ) : (
                  <MdOutlinePeople className="size-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{role.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      role.isSystem ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {role.isSystem ? "System" : "Custom"}
                  </div>
                  <div className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {role.category}
                  </div>
                </div>
              </div>
            </div>
            {/* <ActionDropdown role={role} onViewDetails={onViewDetails} /> */}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MdOutlineKey className="size-4" />
              <span className="font-medium">Slug:</span>
              <code className="rounded bg-gray-50 px-2 py-1 font-mono text-xs">{role.slug}</code>
            </div>

            {role.description && (
              <div>
                <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                  <MdOutlineDescription className="size-4" />
                  <span className="font-medium">Description</span>
                </div>
                <p className="line-clamp-2 text-sm text-gray-700">{role.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getPrivilegeCount()}</div>
                <div className="text-xs text-gray-500">Privileges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getActionCount()}</div>
                <div className="text-xs text-gray-500">Total Actions</div>
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-gray-600">Categories</div>
                <div className="flex flex-wrap gap-1">
                  {categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {category}
                    </span>
                  ))}
                  {role.privileges && role.privileges.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      +{role.privileges.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <ButtonModule
            variant="outline"
            size="sm"
            className="w-full justify-center"
            onClick={() => onViewDetails(role)}
          >
            <MdOutlineVisibility className="mr-2 size-4" />
            View Details
          </ButtonModule>
        </div>
      </div>
    </motion.div>
  )
}

const PrivilegeCard: React.FC<{ privilege: Privilege }> = ({ privilege }) => {
  const getAvailableActions = (availableActions: number): string[] => {
    const actions: string[] = []
    if (availableActions & 1) actions.push("C")
    if (availableActions & 2) actions.push("R")
    if (availableActions & 4) actions.push("U")
    if (availableActions & 8) actions.push("D")
    if (availableActions & 16) actions.push("A")
    if (availableActions & 32) actions.push("V")
    return actions
  }

  const actions = getAvailableActions(privilege.availableActions)

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
              <MdOutlineShield className="size-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{privilege.name}</h4>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <MdOutlineKey className="size-3" />
                {privilege.key}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-1">
              <MdOutlineCategory className="size-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Category</span>
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {privilege.category}
              </span>
            </div>

            <div className="mb-2">
              <div className="mb-1 text-xs font-medium text-gray-600">Available Actions</div>
              <div className="flex flex-wrap gap-1">
                {actions.map((action, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                  >
                    {action}
                  </span>
                ))}
                {actions.length === 0 && <span className="text-xs text-gray-400">No actions</span>}
              </div>
              {/* <div className="mt-1 text-xs text-gray-500">
                Binary: {privilege.availableActions.toString(2).padStart(6, "0")}
              </div> */}
            </div>

            {privilege.description && (
              <div className="mt-2">
                <div className="mb-1 text-xs font-medium text-gray-600">Description</div>
                <p className="line-clamp-2 text-xs text-gray-700">{privilege.description}</p>
              </div>
            )}
          </div>
        </div>
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
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
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
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="h-8 w-full rounded bg-gray-200" />
              <div className="h-8 w-full rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const PrivilegesLoadingSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="size-8 rounded-md bg-gray-200" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="flex gap-1">
                  <div className="h-6 w-8 rounded-full bg-gray-200" />
                  <div className="h-6 w-8 rounded-full bg-gray-200" />
                  <div className="h-6 w-8 rounded-full bg-gray-200" />
                </div>
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
            <div className="h-6 w-10 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

const AllRoleTable: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { roles, loading, error, privileges, privilegesLoading, privilegesError } = useAppSelector(
    (state) => state.roles
  )

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showPrivileges, setShowPrivileges] = useState(true)
  const [privilegeSearch, setPrivilegeSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [roleViewMode, setRoleViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "category" | "type">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = useState<"all" | "system" | "custom">("all")
  const pageSize = 12

  useEffect(() => {
    dispatch(
      fetchRoles({
        pageNumber: 1,
        pageSize: 100,
      })
    )

    dispatch(fetchPrivileges({}))

    // Cleanup function
    return () => {
      dispatch(clearPrivileges())
    }
  }, [dispatch])

  // Extract unique categories from privileges
  const categories = Array.from(new Set(privileges.map((p) => p.category))).sort()

  // Filter privileges based on search and category
  const filteredPrivileges = privileges.filter((privilege) => {
    const matchesSearch =
      privilegeSearch === "" ||
      privilege.name.toLowerCase().includes(privilegeSearch.toLowerCase()) ||
      privilege.key.toLowerCase().includes(privilegeSearch.toLowerCase()) ||
      privilege.description?.toLowerCase().includes(privilegeSearch.toLowerCase())

    const matchesCategory = !selectedCategory || privilege.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Filter and sort roles
  const filteredRoles = roles
    .filter((role) => {
      const matchesSearch =
        searchText === "" ||
        role.name.toLowerCase().includes(searchText.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchText.toLowerCase()) ||
        role.category.toLowerCase().includes(searchText.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchText.toLowerCase())

      const matchesType =
        filterType === "all" ||
        (filterType === "system" && role.isSystem) ||
        (filterType === "custom" && !role.isSystem)

      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      let aValue: string | boolean
      let bValue: string | boolean

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "category":
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case "type":
          aValue = a.isSystem
          bValue = b.isSystem
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

  const totalRecords = filteredRoles.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handlePrivilegeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrivilegeSearch(e.target.value)
  }

  const handleCancelPrivilegeSearch = () => {
    setPrivilegeSearch("")
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  const handleViewDetails = (role: Role) => {
    router.push(`/roles/details/${role.id}`)
  }

  const toggleSort = (column: "name" | "category" | "type") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  if (loading) return <LoadingSkeleton />

  const startIndex = (currentPage - 1) * pageSize
  const pageItems = filteredRoles.slice(startIndex, startIndex + pageSize)

  // Calculate statistics
  const systemRolesCount = roles.filter((role) => role.isSystem).length
  const customRolesCount = roles.filter((role) => !role.isSystem).length
  const totalPrivilegesAcrossRoles = roles.reduce((total, role) => total + (role.privileges?.length || 0), 0)

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="items-center justify-between py-2 md:flex"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">All Roles</p>
          <p className="text-sm text-gray-600">Manage system and custom roles with their permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search roles..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <ButtonModule variant="primary" size="sm" onClick={() => router.push("/roles/create")}>
            Create Role
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
              <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
              <div className="text-sm text-gray-600">Total Roles</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <MdOutlinePeople className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{systemRolesCount}</div>
              <div className="text-sm text-gray-600">System Roles</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <MdOutlineLock className="size-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{customRolesCount}</div>
              <div className="text-sm text-gray-600">Custom Roles</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <MdOutlineLockOpen className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalPrivilegesAcrossRoles}</div>
              <div className="text-sm text-gray-600">Total Privileges</div>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <MdOutlineShield className="size-6 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 flex gap-6">
        {/* Main Content - Roles Cards/Grid */}
        <motion.div
          className={`${showPrivileges ? "w-2/3" : "w-full"} transition-all duration-300`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Controls Bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                <button
                  onClick={() => setRoleViewMode("grid")}
                  className={`px-3 py-2 text-sm ${
                    roleViewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setRoleViewMode("list")}
                  className={`px-3 py-2 text-sm ${
                    roleViewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
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
                  onClick={() => toggleSort("category")}
                  className={`rounded px-2 py-1 ${sortBy === "category" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Category {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("type")}
                  className={`rounded px-2 py-1 ${sortBy === "type" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Type {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterType === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("system")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterType === "system"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                System
              </button>
              <button
                onClick={() => setFilterType("custom")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterType === "custom"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Roles Grid */}
          {loading ? (
            <CardsLoadingSkeleton />
          ) : filteredRoles.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <MdOutlinePeople className="mx-auto mb-4 size-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No roles found</h3>
              <p className="mb-6 text-gray-600">
                {searchText ? "Try adjusting your search or filters" : "Create your first role to get started"}
              </p>
              <ButtonModule variant="primary" onClick={() => router.push("/roles/create")}>
                Create New Role
              </ButtonModule>
            </div>
          ) : roleViewMode === "grid" ? (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {pageItems.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <RoleCard role={role} onViewDetails={handleViewDetails} />
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
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Role</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Privileges</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((role, index) => (
                      <motion.tr
                        key={role.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div>
                            <div className="font-medium text-gray-900">{role.name}</div>
                            <div className="text-sm text-gray-500">{role.slug}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              role.isSystem ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {role.isSystem ? "System" : "Custom"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-700">{role.category}</td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-gray-900">{role.privileges?.length || 0}</div>
                        </td>
                        <td className="p-4">
                          <ButtonModule variant="outline" size="sm" onClick={() => handleViewDetails(role)}>
                            View Details
                          </ButtonModule>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {filteredRoles.length > 0 && (
            <motion.div
              className="mt-6 flex items-center justify-between border-t pt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-gray-700">
                Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} roles
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center rounded-md p-2 ${
                    currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                >
                  <MdOutlineArrowBackIosNew />
                </motion.button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = index + 1
                  } else if (currentPage <= 3) {
                    pageNum = index + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index
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

                {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

                {totalPages > 5 && currentPage < totalPages - 1 && (
                  <motion.button
                    onClick={() => paginate(totalPages)}
                    className="flex size-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {totalPages}
                  </motion.button>
                )}

                <motion.button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center rounded-md p-2 ${
                    currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                  whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                >
                  <MdOutlineArrowForwardIos />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Privileges Sidebar */}
        {showPrivileges && (
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
                      <MdOutlineShield className="size-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Available Privileges</h3>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                        {privileges.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowPrivileges(false)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Hide privileges"
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3">
                    <SearchModule
                      value={privilegeSearch}
                      onChange={handlePrivilegeSearch}
                      onCancel={handleCancelPrivilegeSearch}
                      placeholder="Search privileges..."
                      className="w-full"
                      bgClassName="bg-gray-50"
                    />
                  </div>

                  {categories.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center gap-2">
                        <MdOutlineCategory className="size-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">Filter by Category</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`rounded-full px-3 py-1 text-xs transition-colors ${
                            !selectedCategory
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          All
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-full px-3 py-1 text-xs transition-colors ${
                              selectedCategory === category
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                  {privilegesLoading ? (
                    <PrivilegesLoadingSkeleton />
                  ) : privilegesError ? (
                    <div className="py-8 text-center">
                      <div className="mb-2 text-red-500">Failed to load privileges</div>
                      <button
                        onClick={() => dispatch(fetchPrivileges({}))}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredPrivileges.length === 0 ? (
                    <div className="py-8 text-center">
                      <MdOutlineShield className="mx-auto mb-2 size-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No privileges found</p>
                      {privilegeSearch && (
                        <button
                          onClick={() => setPrivilegeSearch("")}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mb-2 text-xs text-gray-500">
                        Showing {filteredPrivileges.length} of {privileges.length} privileges
                      </div>
                      <AnimatePresence>
                        {filteredPrivileges.map((privilege, index) => (
                          <motion.div
                            key={privilege.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <PrivilegeCard privilege={privilege} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="border-t bg-gray-50 p-4">
                  <div className="text-xs text-gray-600">
                    <div className="mb-1 flex items-center justify-between">
                      <span>Total Categories:</span>
                      <span className="font-medium">{categories.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Actions (sum):</span>
                      <span className="font-medium">
                        {privileges.reduce((sum, p) => {
                          let count = 0
                          if (p.availableActions & 1) count++ // C
                          if (p.availableActions & 2) count++ // R
                          if (p.availableActions & 4) count++ // U
                          if (p.availableActions & 8) count++ // D
                          if (p.availableActions & 16) count++ // A
                          if (p.availableActions & 32) count++ // V
                          return sum + count
                        }, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Show Privileges Toggle Button (when hidden) */}
        {!showPrivileges && (
          <motion.button
            onClick={() => setShowPrivileges(true)}
            className="fixed right-4 top-24 z-10 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-lg"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <MdOutlineShield className="size-4 text-blue-600" />
            <span className="text-sm font-medium">Show Privileges</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {privileges.length}
            </span>
          </motion.button>
        )}
      </div>

      {/* Role Details Modal */}
      <AnimatePresence>
        {selectedRole && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedRole(null)} />
            <motion.div
              className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg"
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-4 text-xl font-semibold">Role Details</h3>
              <div className="space-y-4 text-sm text-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">ID:</span> {selectedRole.id}
                  </div>
                  <div>
                    <span className="font-medium">Name:</span> {selectedRole.name}
                  </div>
                  <div>
                    <span className="font-medium">Slug:</span> {selectedRole.slug}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {selectedRole.category}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedRole.isSystem ? "System" : "Custom"}
                  </div>
                  <div>
                    <span className="font-medium">Privileges:</span> {selectedRole.privileges?.length || 0}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Description:</span> {selectedRole.description || "-"}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
                  onClick={() => setSelectedRole(null)}
                >
                  Close
                </button>
                <ButtonModule
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedRole(null)
                    router.push(`/roles/details/${selectedRole.id}`)
                  }}
                >
                  View Full Details
                </ButtonModule>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AllRoleTable
