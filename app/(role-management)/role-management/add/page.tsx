"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiChevronDown,
  FiMail,
  FiPhone,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { Badge } from "components/ui/Badge/badge"
import { useGetUsersQuery } from "lib/redux/customerSlice"
import { useCreateAdminMutation } from "lib/redux/adminSlice"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"

interface Department {
  id: string
  name: string
}

interface User {
  id: number
  firstName: string | null
  lastName: string | null
  phoneNumber: string
  email: string | null
  tag: string | null
  photo: string | null
  status: any
  isVerified: boolean
}

const AddNewEmployee: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [department, setDepartment] = useState("")
  const [role, setRole] = useState<"admin" | "manager" | "staff" | "support">("staff")
  const [isValidEmail, setIsValidEmail] = useState(true)
  const [activeField, setActiveField] = useState<
    "firstName" | "lastName" | "email" | "phone" | "address" | "department" | null
  >(null)
  const [isUserSelectionOpen, setIsUserSelectionOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState<"tag" | "email" | "phoneNumber">("email")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState({
    canViewUsers: true,
    canManageUsers: false,
    canManageAdmin: false,
    canViewDashboard: true,
    canViewTransactions: true,
    canManageSystemSettings: false,
  })
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false)
  const [debouncedTag, setDebouncedTag] = useState("")
  const searchTypeRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const canManageAdmin = user?.admin?.permission?.canManageAdmin

  // Debounce the search term input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTag(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetUsersQuery(
    {
      pageNumber: 1,
      pageSize: 50,
      ...(debouncedTag && { [searchType]: debouncedTag }),
    },
    {
      skip: !isUserSelectionOpen || !debouncedTag || debouncedTag.length < 3, // Only fetch when modal is open and search term is valid
    }
  )

  const [createAdmin] = useCreateAdminMutation()

  const departments: Department[] = [
    { id: "1", name: "Engineering" },
    { id: "2", name: "Marketing" },
    { id: "3", name: "Sales" },
    { id: "4", name: "Human Resources" },
    { id: "5", name: "Operations" },
  ]

  // Close search type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(event.target as Node)) {
        setIsSearchTypeOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (selectedUser) {
      setFirstName(selectedUser.firstName || "")
      setLastName(selectedUser.lastName || "")
      setEmail(selectedUser.email || "")
      setPhone(selectedUser.phoneNumber || "")
    }
  }, [selectedUser])

  const handleGoBack = () => {
    router.back()
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setIsUserSelectionOpen(false)
    setSearchTerm("")
  }

  const handleClearSelection = () => {
    setSelectedUser(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
  }

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchTypeChange = (type: "tag" | "email" | "phoneNumber") => {
    setSearchType(type)
    setIsSearchTypeOpen(false)
    setSearchTerm("")
  }

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case "email":
        return "Email"
      case "phoneNumber":
        return "Phone"
      case "tag":
        return "Tag"
      default:
        return "Email"
    }
  }

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "email":
        return "Search by email..."
      case "phoneNumber":
        return "Search by phone number..."
      case "tag":
        return "Search by tag..."
      default:
        return "Search by email..."
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedUser) {
      notify("error", "Please select a user to make an admin", {
        title: "User Selection Required",
      })
      return
    }

    if (!department) {
      notify("error", "Please select a department", {
        title: "Department Required",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createAdmin({
        userId: selectedUser.id,
        permission: permissions,
      }).unwrap()

      notify("success", `${selectedUser.firstName} ${selectedUser.lastName} has been added as an admin`, {
        title: "Admin Created!",
        duration: 2000,
      })

      setTimeout(() => router.push("/role-management"), 1000)
    } catch (error: any) {
      const errorMessage = error.data?.message || "Admin creation failed. Please try again."
      setError(errorMessage)
      notify("error", errorMessage, {
        title: "Creation Failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setIsValidEmail(validateEmail(value))
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardNav />

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8 flex items-center">
            <button onClick={handleGoBack} className="mr-4 rounded-full p-2 hover:bg-gray-100">
              <FiArrowLeft className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Admin</h1>
              <p className="text-gray-500">Select a user and assign admin permissions</p>
            </div>
          </div>

          {/* User Selection */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">Select User</label>
            {selectedUser ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
                      {selectedUser.firstName ? selectedUser.firstName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="font-semibold text-green-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </div>
                      <div className="text-sm text-green-700">{selectedUser.email || selectedUser.phoneNumber}</div>
                      <div className="text-xs text-green-600">User ID: {selectedUser.id}</div>
                    </div>
                  </div>
                  <button onClick={handleClearSelection} className="rounded-full p-2 text-green-700 hover:bg-green-200">
                    <FiX className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div
                  className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                  onClick={() => setIsUserSelectionOpen(true)}
                >
                  <div className="flex items-center justify-center text-gray-500">
                    <FiSearch className="mr-2" />
                    Click to search and select a user
                  </div>
                </div>

                {/* User Selection Modal */}
                {isUserSelectionOpen && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                    <div className="mb-4">
                      <div className="relative flex items-center rounded-md border border-gray-300 p-1">
                        {/* Search type dropdown */}
                        <div className="relative mr-2" ref={searchTypeRef}>
                          <button
                            type="button"
                            className=" flex items-center  rounded-l-md  px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                            onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)}
                          >
                            {getSearchTypeLabel()}
                            <FiChevronDown className="ml-1" />
                          </button>

                          {isSearchTypeOpen && (
                            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                onClick={() => handleSearchTypeChange("email")}
                              >
                                Email
                              </button>
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                onClick={() => handleSearchTypeChange("phoneNumber")}
                              >
                                Phone
                              </button>
                              <button
                                type="button"
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                onClick={() => handleSearchTypeChange("tag")}
                              >
                                Tag
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Search input */}
                        <div className="relative flex-1 border-l">
                          <FiSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder={getSearchPlaceholder()}
                            className="w-full rounded-r-md  bg-transparent py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={handleSearch}
                          />
                        </div>

                        <button
                          onClick={() => {
                            setIsUserSelectionOpen(false)
                            setSearchTerm("")
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="size-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Search by {getSearchTypeLabel().toLowerCase()}</p>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                      {usersLoading || usersFetching ? (
                        <div className="space-y-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between rounded border p-3">
                              <div className="flex items-center gap-3">
                                <div className="size-10 animate-pulse rounded-full bg-gray-200"></div>
                                <div>
                                  <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                                </div>
                              </div>
                              <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
                            </div>
                          ))}
                        </div>
                      ) : usersData?.data?.length === 0 ? (
                        <div className="py-4 text-center text-gray-500">
                          {searchTerm
                            ? `No users found for "${searchTerm}"`
                            : `Search for users by ${getSearchTypeLabel().toLowerCase()}`}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {usersData?.data?.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between rounded border p-3 hover:bg-gray-50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email && <div>{user.email}</div>}
                                    {user.phoneNumber && <div>{user.phoneNumber}</div>}
                                    {user.tag && <div>Tag: {user.tag}</div>}
                                  </div>
                                </div>
                              </div>
                              <ButtonModule variant="primary" size="sm" onClick={() => handleUserSelect(user)}>
                                Select
                              </ButtonModule>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rest of the form - only show when user is selected */}

          <form onSubmit={handleSubmit}>
            {/* Name Fields */}
            {selectedUser && (
              <>
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                    <div
                      className={`relative rounded-xl border p-3 transition-all ${
                        activeField === "firstName"
                          ? "border-blue-500 bg-white ring-2 ring-blue-200"
                          : "border-gray-200 bg-gray-50"
                      } ${selectedUser ? "opacity-70" : ""}`}
                      onClick={() => !selectedUser && setActiveField("firstName")}
                    >
                      <div className="flex items-center">
                        <FiUser
                          className={`mr-2 text-gray-400 ${activeField === "firstName" ? "text-blue-500" : ""}`}
                        />
                        <input
                          type="text"
                          placeholder="John"
                          className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onFocus={() => !selectedUser && setActiveField("firstName")}
                          onBlur={() => setActiveField(null)}
                          disabled={!!selectedUser}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                    <div
                      className={`relative rounded-xl border p-3 transition-all ${
                        activeField === "lastName"
                          ? "border-blue-500 bg-white ring-2 ring-blue-200"
                          : "border-gray-200 bg-gray-50"
                      } ${selectedUser ? "opacity-70" : ""}`}
                      onClick={() => !selectedUser && setActiveField("lastName")}
                    >
                      <div className="flex items-center">
                        <FiUser className={`mr-2 text-gray-400 ${activeField === "lastName" ? "text-blue-500" : ""}`} />
                        <input
                          type="text"
                          placeholder="Doe"
                          className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onFocus={() => !selectedUser && setActiveField("lastName")}
                          onBlur={() => setActiveField(null)}
                          disabled={!!selectedUser}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <div
                    className={`relative rounded-xl border p-3 transition-all ${
                      activeField === "email"
                        ? "border-blue-500 bg-white ring-2 ring-blue-200"
                        : "border-gray-200 bg-gray-50"
                    } ${selectedUser ? "opacity-70" : ""}`}
                    onClick={() => !selectedUser && setActiveField("email")}
                  >
                    <div className="flex items-center">
                      <FiMail className={`mr-2 text-gray-400 ${activeField === "email" ? "text-blue-500" : ""}`} />
                      <input
                        type="email"
                        placeholder="john.doe@company.com"
                        className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                        value={email}
                        onChange={handleEmailChange}
                        onFocus={() => !selectedUser && setActiveField("email")}
                        onBlur={() => setActiveField(null)}
                        disabled={!!selectedUser}
                        required
                      />
                    </div>
                    {!isValidEmail && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-1 text-xs text-red-500"
                      >
                        Please enter a valid email
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Phone (Optional)</label>
                  <div
                    className={`relative rounded-xl border p-3 transition-all ${
                      activeField === "phone"
                        ? "border-blue-500 bg-white ring-2 ring-blue-200"
                        : "border-gray-200 bg-gray-50"
                    } ${selectedUser ? "opacity-70" : ""}`}
                    onClick={() => !selectedUser && setActiveField("phone")}
                  >
                    <div className="flex items-center">
                      <FiPhone className={`mr-2 text-gray-400 ${activeField === "phone" ? "text-blue-500" : ""}`} />
                      <input
                        type="tel"
                        placeholder="(123) 456-7890"
                        className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onFocus={() => !selectedUser && setActiveField("phone")}
                        onBlur={() => setActiveField(null)}
                        disabled={!!selectedUser}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Department Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Department</label>
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "department"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("department")}
              >
                <div className="flex items-center">
                  <FiBriefcase
                    className={`mr-2 text-gray-400 ${activeField === "department" ? "text-blue-500" : ""}`}
                  />
                  <select
                    className="flex-1 bg-transparent text-gray-800 outline-none"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    onFocus={() => setActiveField("department")}
                    onBlur={() => setActiveField(null)}
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
              <div className="flex flex-wrap gap-2">
                {(["admin", "manager", "staff", "support"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`flex items-center rounded-full px-4 py-2 text-sm transition-colors ${
                      role === r ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setRole(r)}
                  >
                    {role === r && <FiCheck className="mr-1" />}
                    {getRoleBadge(r)}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Admin Permissions</label>
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                {[
                  { key: "canViewUsers", label: "View Users", description: "Can view user list and details" },
                  { key: "canManageUsers", label: "Manage Users", description: "Can create, edit, and delete users" },
                  {
                    key: "canManageAdmin",
                    label: "Manage Admins",
                    description: "Can create and manage other admin accounts",
                  },
                  {
                    key: "canViewDashboard",
                    label: "View Dashboard",
                    description: "Can access dashboard and analytics",
                  },
                  {
                    key: "canViewTransactions",
                    label: "View Transactions",
                    description: "Can view transaction history",
                  },
                  {
                    key: "canManageSystemSettings",
                    label: "Manage System Settings",
                    description: "Can modify system configuration",
                  },
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between rounded border bg-white p-3">
                    <div className="flex-1">
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-600">{description}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePermissionChange(key as keyof typeof permissions)}
                      className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
                        permissions[key as keyof typeof permissions] ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          permissions[key as keyof typeof permissions] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !selectedUser || !department}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Admin...
                  </div>
                ) : (
                  "Create Admin"
                )}
              </ButtonModule>

              <ButtonModule type="button" variant="outline" size="lg" className="w-full" onClick={handleGoBack}>
                Cancel
              </ButtonModule>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default AddNewEmployee
