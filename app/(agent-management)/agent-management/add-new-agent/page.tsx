"use client"
import React, { useRef, useState, useEffect, ChangeEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddAgentIcon, RefreshCircleIcon } from "components/Icons/Icons"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  addAgent,
  clearAddAgent,
  AddAgentRequest,
  addExistingUserAsAgent,
  AddExistingUserAsAgentRequest,
  clearAddExistingUserAsAgent,
} from "lib/redux/agentSlice"
import { fetchRoles } from "lib/redux/roleSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { clearDepartments, fetchDepartments } from "lib/redux/departmentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import {
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  MapPin,
  CreditCard,
  Shield,
  Home,
  FileText,
  Users,
  UserPlus,
  UserCog,
} from "lucide-react"

// === INTERFACES ===

// For adding new agent
interface AgentFormData {
  fullName: string
  phoneNumber: string
  email: string
  roleIds: number[]
  areaOfficeId: number
  serviceCenterId: number | null
  departmentId: number
  employeeId: string
  position: string
  emergencyContact: string
  address: string
  supervisorId: number | null
  employmentType: string
  cashCollectionLimit: string
  canCollectCash: boolean
  status: string
}

// For converting existing user to agent
interface ExistingUserFormData {
  userAccountId: number | null
  areaOfficeId: number
  serviceCenterId: number | null
  status: string
  cashCollectionLimit: string
  canCollectCash: boolean
}

// For CSV bulk upload
interface CSVAgent {
  fullName: string
  phoneNumber: string
  email: string
  roleIds: number[]
  areaOfficeId: number
  serviceCenterId: number | null
  departmentId: number
  employeeId: string
  position: string
  emergencyContact: string
  address: string
  supervisorId: number | null
  employmentType: string
  cashCollectionLimit: string
  canCollectCash: boolean
  status: string
}

// Mock data for dropdowns
const employmentTypeOptions = [
  { value: "", label: "Select employment type" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
]

const statusOptions = [
  { value: "", label: "Select status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
]

const canCollectCashOptions = [
  { value: "", label: "Can collect cash?" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
]

const AddNewAgent = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const {
    addAgentLoading,
    addAgentError,
    addAgentSuccess,
    newlyAddedAgent,
    addExistingUserAsAgentLoading,
    addExistingUserAsAgentError,
    addExistingUserAsAgentSuccess,
    newlyAddedExistingUserAgent,
  } = useAppSelector((state) => state.agents)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // State for tabs
  const [activeTab, setActiveTab] = useState<"new" | "existing" | "bulk">("new")

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVAgent[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1)

  // Form data state
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [newAgentFormData, setNewAgentFormData] = useState<AgentFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    roleIds: [],
    areaOfficeId: 0,
    serviceCenterId: null,
    departmentId: 0,
    employeeId: "",
    position: "",
    emergencyContact: "",
    address: "",
    supervisorId: null,
    employmentType: "",
    cashCollectionLimit: "",
    canCollectCash: false,
    status: "",
  })

  const [existingUserFormData, setExistingUserFormData] = useState<ExistingUserFormData>({
    userAccountId: null,
    areaOfficeId: 0,
    serviceCenterId: null,
    status: "ACTIVE",
    cashCollectionLimit: "",
    canCollectCash: false,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Redux selectors
  const { roles, loading: rolesLoading, error: rolesError } = useAppSelector((state) => state.roles)
  const { employees, employeesLoading, employeesError } = useAppSelector((state) => state.employee)
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
  } = useAppSelector((state) => state.departments)
  const {
    areaOffices,
    loading: areaOfficesLoading,
    error: areaOfficesError,
  } = useAppSelector((state) => state.areaOffices)
  const {
    serviceStations,
    loading: serviceStationsLoading,
    error: serviceStationsError,
  } = useAppSelector((state) => state.serviceStations)

  // === EFFECTS ===

  // Handle Redux state changes for new agent
  useEffect(() => {
    if (addAgentSuccess && newlyAddedAgent) {
      notify("success", "Agent created successfully", {
        description: `${newlyAddedAgent.user.fullName} has been registered with agent code: ${newlyAddedAgent.agentCode}`,
        duration: 6000,
      })

      handleReset()
      setTimeout(() => {
        dispatch(clearAddAgent())
      }, 3000)
    }

    if (addAgentError) {
      notify("error", "Failed to add agent", {
        description: addAgentError,
        duration: 6000,
      })
    }
  }, [addAgentSuccess, addAgentError, newlyAddedAgent, dispatch])

  // Handle Redux state changes for existing user conversion
  useEffect(() => {
    if (addExistingUserAsAgentSuccess && newlyAddedExistingUserAgent) {
      notify("success", "User converted to agent successfully", {
        description: `${newlyAddedExistingUserAgent.user.fullName} is now an agent with code: ${newlyAddedExistingUserAgent.agentCode}`,
        duration: 6000,
      })

      handleResetExistingUserForm()
      setTimeout(() => {
        dispatch(clearAddExistingUserAsAgent())
      }, 3000)
    }

    if (addExistingUserAsAgentError) {
      notify("error", "Failed to convert user to agent", {
        description: addExistingUserAsAgentError,
        duration: 6000,
      })
    }
  }, [addExistingUserAsAgentSuccess, addExistingUserAsAgentError, newlyAddedExistingUserAgent, dispatch])

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchRoles({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchEmployees({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchDepartments({ pageNumber: 1, pageSize: 100, isActive: true }))
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchServiceStations({ pageNumber: 1, pageSize: 100 }))

    return () => {
      dispatch(clearDepartments())
      dispatch(clearAreaOffices())
    }
  }, [dispatch])

  // === HELPER FUNCTIONS ===

  // Format dropdown options
  const roleSelectOptions = roles.map((role) => ({
    value: role.id.toString(),
    label: role.name,
  }))

  const departmentOptions = [
    {
      value: "",
      label: departmentsLoading ? "Loading departments..." : "Select department",
    },
    ...departments.map((department) => ({
      value: department.id.toString(),
      label: `${department.name}${department.description ? ` - ${department.description}` : ""}`,
    })),
  ]

  const supervisorOptions = [
    {
      value: "",
      label: employeesLoading ? "Loading supervisors..." : "Select supervisor (optional)",
    },
    ...employees
      .filter((employee) => employee.isActive)
      .map((employee) => ({
        value: employee.id.toString(),
        label: `${employee.fullName} (${employee.email})`,
      })),
  ]

  const areaOfficeSelectOptions = [
    {
      value: "",
      label: areaOfficesLoading ? "Loading area offices..." : "Select area office",
    },
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id.toString(),
      label: `${areaOffice.nameOfNewOAreaffice} (${areaOffice.newKaedcoCode})`,
    })),
  ]

  const serviceCenterOptions = [
    {
      value: "",
      label: serviceStationsLoading ? "Loading service centers..." : "Select service center (optional)",
    },
    ...serviceStations.map((serviceStation) => ({
      value: serviceStation.id.toString(),
      label: `${serviceStation.name} (${serviceStation.code})`,
    })),
  ]

  // Filter employees for existing users (non-agents)
  const existingUserOptions = [
    {
      value: "",
      label: employeesLoading ? "Loading users..." : "Select user to convert to agent",
    },
    ...employees
      .filter((employee) => employee.isActive)
      .map((employee) => ({
        value: employee.id.toString(),
        label: `${employee.fullName} (${employee.email}) - ${employee.employeeId || "No ID"}`,
      })),
  ]

  // === EVENT HANDLERS ===

  // New Agent Handlers
  const handleNewAgentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    const stringValue = typeof value === "number" ? String(value) : value

    setNewAgentFormData((prev) => ({
      ...prev,
      [name]: stringValue,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleRoleChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const roleId = parseInt(e.target.value as string)
    if (roleId && !selectedRoles.includes(roleId)) {
      const newRoles = [...selectedRoles, roleId]
      setSelectedRoles(newRoles)
      setNewAgentFormData((prev) => ({
        ...prev,
        roleIds: newRoles,
      }))
    }
  }

  const removeRole = (roleId: number) => {
    const newRoles = selectedRoles.filter((id) => id !== roleId)
    setSelectedRoles(newRoles)
    setNewAgentFormData((prev) => ({
      ...prev,
      roleIds: newRoles,
    }))
  }

  // Existing User Handlers
  const handleExistingUserInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    let newValue: string | number | null = value as string | number

    // Parse only numeric fields; keep others (like status) as strings
    if (["userAccountId", "areaOfficeId", "serviceCenterId"].includes(name)) {
      if (value === "" || value === null) {
        newValue = name === "userAccountId" || name === "serviceCenterId" ? null : 0
      } else {
        const parsed = Number(value)
        newValue = isNaN(parsed) ? 0 : parsed
      }
    }

    setExistingUserFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validation
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {}

    if (activeTab === "new") {
      switch (currentStep) {
        case 1: // Personal Information
          if (!newAgentFormData.fullName.trim()) {
            errors.fullName = "Full name is required"
          }
          if (!newAgentFormData.phoneNumber.trim()) {
            errors.phoneNumber = "Phone number is required"
          } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(newAgentFormData.phoneNumber.replace(/\s/g, ""))) {
            errors.phoneNumber = "Please enter a valid Nigerian phone number"
          }
          if (!newAgentFormData.email.trim()) {
            errors.email = "Email is required"
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAgentFormData.email)) {
            errors.email = "Please enter a valid email address"
          }
          break

        case 2: // Employment Information
          if (!newAgentFormData.employeeId.trim()) {
            errors.employeeId = "Employee ID is required"
          }
          if (!newAgentFormData.position.trim()) {
            errors.position = "Position is required"
          }
          if (!newAgentFormData.employmentType) {
            errors.employmentType = "Employment type is required"
          }
          if (!newAgentFormData.roleIds.length) {
            errors.roleIds = "At least one role is required"
          }
          break

        case 3: // Department & Office
          if (!newAgentFormData.departmentId) {
            errors.departmentId = "Department is required"
          }
          if (!newAgentFormData.areaOfficeId) {
            errors.areaOfficeId = "Area office is required"
          }
          break

        case 4: // Cash & Status
          if (!newAgentFormData.cashCollectionLimit.trim()) {
            errors.cashCollectionLimit = "Cash collection limit is required"
          } else if (parseFloat(newAgentFormData.cashCollectionLimit.replace(/[₦,]/g, "")) <= 0) {
            errors.cashCollectionLimit = "Cash collection limit must be greater than 0"
          }
          if (newAgentFormData.canCollectCash === undefined || newAgentFormData.canCollectCash === null) {
            errors.canCollectCash = "Cash collection permission is required"
          }
          if (!newAgentFormData.status) {
            errors.status = "Status is required"
          }
          break

        case 5: // Additional Information
          // All fields in this step are optional
          break
      }
    } else if (activeTab === "existing") {
      // Validate existing user form (single step)
      if (!existingUserFormData.userAccountId) {
        errors.userAccountId = "User selection is required"
      }
      if (!existingUserFormData.areaOfficeId) {
        errors.areaOfficeId = "Area office is required"
      }
      if (!existingUserFormData.cashCollectionLimit.trim()) {
        errors.cashCollectionLimit = "Cash collection limit is required"
      } else if (parseFloat(existingUserFormData.cashCollectionLimit.replace(/[₦,]/g, "")) <= 0) {
        errors.cashCollectionLimit = "Cash collection limit must be greater than 0"
      }
      if (existingUserFormData.canCollectCash === undefined || existingUserFormData.canCollectCash === null) {
        errors.canCollectCash = "Cash collection permission is required"
      }
      if (!existingUserFormData.status) {
        errors.status = "Status is required"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    } else {
      notify("error", "Please fix the form errors before continuing", {
        description: "Some required fields are missing or contain invalid data",
        duration: 4000,
      })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Submission Functions
  const submitNewAgent = async () => {
    if (!validateCurrentStep()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    const agentData: AddAgentRequest = {
      fullName: newAgentFormData.fullName,
      email: newAgentFormData.email,
      phoneNumber: newAgentFormData.phoneNumber,
      roleIds: newAgentFormData.roleIds,
      areaOfficeId: newAgentFormData.areaOfficeId,
      departmentId: newAgentFormData.departmentId,
      employeeId: newAgentFormData.employeeId,
      position: newAgentFormData.position,
      employmentType: newAgentFormData.employmentType,
      cashCollectionLimit: parseFloat(newAgentFormData.cashCollectionLimit.replace(/[₦,]/g, "")),
      canCollectCash: newAgentFormData.canCollectCash,
      status: newAgentFormData.status,
      ...(newAgentFormData.serviceCenterId && { serviceCenterId: newAgentFormData.serviceCenterId }),
      ...(newAgentFormData.emergencyContact && { emergencyContact: newAgentFormData.emergencyContact }),
      ...(newAgentFormData.address && { address: newAgentFormData.address }),
      ...(newAgentFormData.supervisorId && { supervisorId: newAgentFormData.supervisorId }),
    }

    dispatch(addAgent(agentData))
  }

  const submitExistingUserAsAgent = async () => {
    if (!validateCurrentStep()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    const agentData: AddExistingUserAsAgentRequest = {
      userAccountId: existingUserFormData.userAccountId!,
      areaOfficeId: existingUserFormData.areaOfficeId,
      status: existingUserFormData.status,
      cashCollectionLimit: parseFloat(existingUserFormData.cashCollectionLimit.replace(/[₦,]/g, "")),
      canCollectCash: existingUserFormData.canCollectCash,
      ...(existingUserFormData.serviceCenterId && { serviceCenterId: existingUserFormData.serviceCenterId }),
    }

    dispatch(addExistingUserAsAgent(agentData))
  }

  // Reset Functions
  const handleReset = () => {
    setNewAgentFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      roleIds: [],
      areaOfficeId: 0,
      serviceCenterId: null,
      departmentId: 0,
      employeeId: "",
      position: "",
      emergencyContact: "",
      address: "",
      supervisorId: null,
      employmentType: "",
      cashCollectionLimit: "",
      canCollectCash: false,
      status: "",
    })
    setSelectedRoles([])
    setFormErrors({})
    setCurrentStep(1)
  }

  const handleResetExistingUserForm = () => {
    setExistingUserFormData({
      userAccountId: null,
      areaOfficeId: 0,
      serviceCenterId: null,
      status: "ACTIVE",
      cashCollectionLimit: "",
      canCollectCash: false,
    })
    setFormErrors({})
  }

  const handleResetBulkForm = () => {
    setCsvFile(null)
    setCsvData([])
    setCsvErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Utility Functions
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[₦,]/g, "")
    if (!numericValue) return ""

    const number = parseFloat(numericValue)
    if (isNaN(number)) return value

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(number)
      .replace("NGN", "₦")
  }

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>, formType: "new" | "existing") => {
    const { name, value } = e.target
    const formattedValue = formatCurrency(value)

    if (formType === "new") {
      setNewAgentFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }))
    } else {
      setExistingUserFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }))
    }
  }

  const isNewAgentFormValid = (): boolean => {
    return (
      newAgentFormData.fullName.trim() !== "" &&
      newAgentFormData.email.trim() !== "" &&
      newAgentFormData.phoneNumber.trim() !== "" &&
      newAgentFormData.roleIds.length > 0 &&
      newAgentFormData.areaOfficeId > 0 &&
      newAgentFormData.departmentId > 0 &&
      newAgentFormData.employeeId.trim() !== "" &&
      newAgentFormData.position.trim() !== "" &&
      newAgentFormData.employmentType.trim() !== "" &&
      newAgentFormData.cashCollectionLimit.trim() !== "" &&
      newAgentFormData.status.trim() !== "" &&
      newAgentFormData.canCollectCash !== undefined
    )
  }

  const isExistingUserFormValid = (): boolean => {
    return (
      existingUserFormData.userAccountId !== null &&
      existingUserFormData.userAccountId > 0 &&
      existingUserFormData.areaOfficeId > 0 &&
      existingUserFormData.cashCollectionLimit.trim() !== "" &&
      (existingUserFormData.status || "").trim() !== "" &&
      existingUserFormData.canCollectCash !== undefined
    )
  }

  // Step Progress Component
  const StepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4, 5].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  step === currentStep
                    ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                    : step < currentStep
                    ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span className={`mt-2 text-xs font-medium ${step === currentStep ? "text-[#0a0a0a]" : "text-gray-500"}`}>
                {step === 1 && "Personal"}
                {step === 2 && "Employment"}
                {step === 3 && "Department"}
                {step === 4 && "Cash & Status"}
                {step === 5 && "Additional"}
              </span>
            </div>
            {step < 5 && <div className={`mx-4 h-0.5 flex-1 ${step < currentStep ? "bg-[#0a0a0a]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>): void {
    throw new Error("Function not implemented.")
  }

  function downloadTemplate(): void {
    throw new Error("Function not implemented.")
  }

  function handleBulkSubmit() {
    throw new Error("Function not implemented.")
  }

  // === RENDER ===
  return (
    <section className="size-full">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          {/* Page Header */}
          <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
            <div>
              <h4 className="text-2xl font-semibold">Register New Agent</h4>
              <p className="text-gray-600">Add a new agent to the system</p>
            </div>

            <motion.div
              className="flex items-center justify-end gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ButtonModule
                variant="outline"
                size="md"
                onClick={() => {
                  if (activeTab === "new") handleReset()
                  else if (activeTab === "existing") handleResetExistingUserForm()
                  else handleResetBulkForm()
                }}
                disabled={addAgentLoading || addExistingUserAsAgentLoading}
              >
                Reset Form
              </ButtonModule>
              {activeTab === "new" && currentStep === 5 && (
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={() => void submitNewAgent()}
                  disabled={!isNewAgentFormValid() || addAgentLoading}
                  icon={<AddAgentIcon />}
                  iconPosition="start"
                >
                  {addAgentLoading ? "Adding Agent..." : "Add Agent"}
                </ButtonModule>
              )}
              {activeTab === "existing" && (
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={() => void submitExistingUserAsAgent()}
                  disabled={!isExistingUserFormValid() || addExistingUserAsAgentLoading}
                  icon={<UserCog />}
                  iconPosition="start"
                >
                  {addExistingUserAsAgentLoading ? "Converting User..." : "Convert to Agent"}
                </ButtonModule>
              )}
            </motion.div>
          </div>
          <div className="container mx-auto flex w-full flex-col">
            {/* Tab Navigation */}
            <div className="px-16 max-md:px-0 max-sm:px-3">
              <div className="rounded-t-lg border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    onClick={() => {
                      setActiveTab("new")
                      setCurrentStep(1)
                    }}
                    className={`flex-1 rounded-tl-lg px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "new"
                        ? "border-b-2 border-[#0a0a0a] text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="size-4" />
                      New Agent
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("existing")}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "existing"
                        ? "border-b-2 border-[#0a0a0a] text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <UserCog className="size-4" />
                      Convert Existing User
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("bulk")}
                    className={`flex-1 rounded-tr-lg px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === "bulk"
                        ? "border-b-2 border-[#0a0a0a] text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Users className="size-4" />
                      Bulk Upload
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {activeTab === "new" ? (
                  /* NEW AGENT FORM */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-b-lg rounded-tr-lg bg-white p-6 shadow-sm"
                  >
                    <div className="mb-6 border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Create New Agent</h3>
                      <p className="text-sm text-gray-600">Register a completely new agent with all required details</p>
                    </div>

                    <StepProgress />

                    <form id="new-agent-form" className="space-y-8">
                      <AnimatePresence mode="wait">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                          <motion.div
                            key="step-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                          >
                            <div className="border-b pb-4">
                              <div className="flex items-center gap-2">
                                <User className="size-5" />
                                <h4 className="text-lg font-medium text-gray-900">Personal Information</h4>
                              </div>
                              <p className="text-sm text-gray-600">
                                Enter the agent&apos;s personal and contact details
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <FormInputModule
                                label="Full Name"
                                name="fullName"
                                type="text"
                                placeholder="Enter full name"
                                value={newAgentFormData.fullName}
                                onChange={handleNewAgentInputChange}
                                error={formErrors.fullName}
                                required
                              />

                              <FormInputModule
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="Enter email address"
                                value={newAgentFormData.email}
                                onChange={handleNewAgentInputChange}
                                error={formErrors.email}
                                required
                              />

                              <FormInputModule
                                label="Phone Number"
                                name="phoneNumber"
                                type="tel"
                                placeholder="Enter phone number (e.g., 08012345678)"
                                value={newAgentFormData.phoneNumber}
                                onChange={handleNewAgentInputChange}
                                error={formErrors.phoneNumber}
                                required
                              />

                              <FormInputModule
                                label="Emergency Contact (Optional)"
                                name="emergencyContact"
                                type="tel"
                                placeholder="Emergency contact number"
                                value={newAgentFormData.emergencyContact}
                                onChange={handleNewAgentInputChange}
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2: Employment Information */}
                        {currentStep === 2 && (
                          <motion.div
                            key="step-2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                          >
                            <div className="border-b pb-4">
                              <div className="flex items-center gap-2">
                                <Briefcase className="size-5" />
                                <h4 className="text-lg font-medium text-gray-900">Employment Information</h4>
                              </div>
                              <p className="text-sm text-gray-600">Enter the agent&apos;s employment details</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <FormInputModule
                                label="Employee ID"
                                name="employeeId"
                                type="text"
                                placeholder="Employee identification number"
                                value={newAgentFormData.employeeId}
                                onChange={handleNewAgentInputChange}
                                error={formErrors.employeeId}
                                required
                              />

                              <FormInputModule
                                label="Position"
                                name="position"
                                type="text"
                                placeholder="Job position/title"
                                value={newAgentFormData.position}
                                onChange={handleNewAgentInputChange}
                                error={formErrors.position}
                                required
                              />

                              <FormSelectModule
                                label="Employment Type"
                                name="employmentType"
                                value={newAgentFormData.employmentType}
                                onChange={handleNewAgentInputChange}
                                options={employmentTypeOptions}
                                error={formErrors.employmentType}
                                required
                              />

                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Roles</label>
                                <div className="mb-2 flex flex-wrap gap-2">
                                  {selectedRoles.map((roleId) => {
                                    const role = roleSelectOptions.find((r) => r.value === roleId.toString())
                                    return (
                                      <span
                                        key={roleId}
                                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                                      >
                                        {role?.label || `Role ${roleId}`}
                                        <button
                                          type="button"
                                          onClick={() => removeRole(roleId)}
                                          className="ml-1 text-[#0a0a0a] hover:text-blue-700"
                                        >
                                          ×
                                        </button>
                                      </span>
                                    )
                                  })}
                                </div>
                                <FormSelectModule
                                  name="role"
                                  value=""
                                  onChange={handleRoleChange}
                                  options={[
                                    {
                                      value: "",
                                      label: rolesLoading ? "Loading roles..." : "Select role",
                                    },
                                    ...roleSelectOptions,
                                  ]}
                                  label=""
                                  disabled={rolesLoading}
                                />
                                {formErrors.roleIds && <p className="text-sm text-red-600">{formErrors.roleIds}</p>}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Step 3: Department & Office Information */}
                        {currentStep === 3 && (
                          <motion.div
                            key="step-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                          >
                            <div className="border-b pb-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="size-5" />
                                <h4 className="text-lg font-medium text-gray-900">Department & Office</h4>
                              </div>
                              <p className="text-sm text-gray-600">
                                Enter the agent&apos;s department and office assignment
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <FormSelectModule
                                label="Department"
                                name="departmentId"
                                value={newAgentFormData.departmentId.toString()}
                                onChange={(e) =>
                                  handleNewAgentInputChange({
                                    target: { name: "departmentId", value: Number(e.target.value) || 0 },
                                  })
                                }
                                options={departmentOptions}
                                error={formErrors.departmentId}
                                required
                                disabled={departmentsLoading}
                              />

                              <FormSelectModule
                                label="Area Office"
                                name="areaOfficeId"
                                value={newAgentFormData.areaOfficeId.toString()}
                                onChange={(e) =>
                                  handleNewAgentInputChange({
                                    target: { name: "areaOfficeId", value: Number(e.target.value) || 0 },
                                  })
                                }
                                options={areaOfficeSelectOptions}
                                error={formErrors.areaOfficeId}
                                required
                                disabled={areaOfficesLoading}
                              />

                              <FormSelectModule
                                label="Service Center (Optional)"
                                name="serviceCenterId"
                                value={newAgentFormData.serviceCenterId?.toString() || ""}
                                onChange={(e) =>
                                  setNewAgentFormData((prev) => ({
                                    ...prev,
                                    serviceCenterId: e.target.value ? Number(e.target.value) : null,
                                  }))
                                }
                                options={serviceCenterOptions}
                                disabled={serviceStationsLoading}
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Step 4: Cash & Status Information */}
                        {currentStep === 4 && (
                          <motion.div
                            key="step-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                          >
                            <div className="border-b pb-4">
                              <div className="flex items-center gap-2">
                                <CreditCard className="size-5 text-[#0a0a0a]" />
                                <h4 className="text-lg font-medium text-gray-900">Cash & Status</h4>
                              </div>
                              <p className="text-sm text-gray-600">
                                Configure cash collection permissions and agent status
                              </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <FormInputModule
                                label="Cash Collection Limit (₦)"
                                name="cashCollectionLimit"
                                type="text"
                                placeholder="Maximum cash collection amount"
                                value={newAgentFormData.cashCollectionLimit}
                                onChange={(e) => handleCurrencyInput(e, "new")}
                                error={formErrors.cashCollectionLimit}
                                required
                              />

                              <FormSelectModule
                                label="Can Collect Cash?"
                                name="canCollectCash"
                                value={newAgentFormData.canCollectCash.toString()}
                                onChange={(e) =>
                                  setNewAgentFormData((prev) => ({
                                    ...prev,
                                    canCollectCash: e.target.value === "true",
                                  }))
                                }
                                options={canCollectCashOptions}
                                error={formErrors.canCollectCash}
                                required
                              />

                              <FormSelectModule
                                label="Status"
                                name="status"
                                value={newAgentFormData.status}
                                onChange={handleNewAgentInputChange}
                                options={statusOptions}
                                error={formErrors.status}
                                required
                              />

                              <FormSelectModule
                                label="Supervisor (Optional)"
                                name="supervisorId"
                                value={newAgentFormData.supervisorId?.toString() || ""}
                                onChange={(e) =>
                                  setNewAgentFormData((prev) => ({
                                    ...prev,
                                    supervisorId: e.target.value ? Number(e.target.value) : null,
                                  }))
                                }
                                options={supervisorOptions}
                                disabled={employeesLoading}
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* Step 5: Additional Information */}
                        {currentStep === 5 && (
                          <motion.div
                            key="step-5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 rounded-lg bg-[#F9f9f9] p-6"
                          >
                            <div className="border-b pb-4">
                              <div className="flex items-center gap-2">
                                <Home className="size-5" />
                                <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                              </div>
                              <p className="text-sm text-gray-600">Enter additional agent information</p>
                            </div>

                            <div className="space-y-6">
                              <FormInputModule
                                label="Address (Optional)"
                                name="address"
                                type="text"
                                placeholder="Enter complete address"
                                value={newAgentFormData.address}
                                onChange={handleNewAgentInputChange}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Error Summary */}
                      {Object.keys(formErrors).length > 0 && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                          <div className="flex">
                            <div className="shrink-0">
                              <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                              <div className="mt-2 text-sm text-amber-700">
                                <ul className="list-disc space-y-1 pl-5">
                                  {Object.values(formErrors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex justify-between gap-4 border-t pt-6">
                        <div className="flex gap-4">
                          {currentStep > 1 && (
                            <ButtonModule
                              variant="outline"
                              size="lg"
                              onClick={prevStep}
                              disabled={addAgentLoading}
                              type="button"
                              icon={<ArrowLeft />}
                              iconPosition="start"
                            >
                              Previous
                            </ButtonModule>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <ButtonModule
                            variant="dangerSecondary"
                            size="lg"
                            onClick={handleReset}
                            disabled={addAgentLoading}
                            type="button"
                          >
                            Reset
                          </ButtonModule>

                          {currentStep < 5 ? (
                            <ButtonModule
                              variant="primary"
                              size="lg"
                              onClick={nextStep}
                              type="button"
                              icon={<ArrowRight />}
                              iconPosition="end"
                            >
                              Next
                            </ButtonModule>
                          ) : (
                            <ButtonModule
                              variant="primary"
                              size="lg"
                              type="button"
                              onClick={() => void submitNewAgent()}
                              disabled={!isNewAgentFormValid() || addAgentLoading}
                            >
                              {addAgentLoading ? "Adding Agent..." : "Add Agent"}
                            </ButtonModule>
                          )}
                        </div>
                      </div>
                    </form>
                  </motion.div>
                ) : activeTab === "existing" ? (
                  /* CONVERT EXISTING USER FORM */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-b-lg rounded-tr-lg bg-white p-6 shadow-sm"
                  >
                    <div className="mb-6 border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Convert Existing User to Agent</h3>
                      <p className="text-sm text-gray-600">Convert an existing system user to an agent role</p>
                    </div>

                    <div className="space-y-8">
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <UserCog className="mt-0.5 size-5 text-blue-600" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">About this feature</h4>
                            <p className="text-sm text-blue-600">
                              Convert existing users (employees, admins, etc.) to agents. This will add agent-specific
                              capabilities like cash collection while preserving their existing account information.
                            </p>
                          </div>
                        </div>
                      </div>

                      <form className="space-y-6 rounded-lg bg-[#F9f9f9] p-6">
                        {/* User Selection */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium text-gray-900">Select User</h4>
                          <FormSelectModule
                            label="User to Convert"
                            name="userAccountId"
                            value={existingUserFormData.userAccountId?.toString() || ""}
                            onChange={handleExistingUserInputChange}
                            options={existingUserOptions}
                            error={formErrors.userAccountId}
                            required
                            disabled={employeesLoading}
                          />

                          {/* Selected User Info Preview */}
                          {existingUserFormData.userAccountId && (
                            <div className="rounded-md border border-gray-200 bg-white p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {existingUserOptions
                                      .find((opt) => opt.value === existingUserFormData.userAccountId?.toString())
                                      ?.label?.split(" - ")[0] || "Selected User"}
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    This user will gain agent capabilities including cash collection permissions.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Agent Configuration */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-medium text-gray-900">Agent Configuration</h4>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormSelectModule
                              label="Area Office"
                              name="areaOfficeId"
                              value={existingUserFormData.areaOfficeId.toString()}
                              onChange={handleExistingUserInputChange}
                              options={areaOfficeSelectOptions}
                              error={formErrors.areaOfficeId}
                              required
                              disabled={areaOfficesLoading}
                            />

                            <FormSelectModule
                              label="Service Center (Optional)"
                              name="serviceCenterId"
                              value={existingUserFormData.serviceCenterId?.toString() || ""}
                              onChange={(e) =>
                                setExistingUserFormData((prev) => ({
                                  ...prev,
                                  serviceCenterId: e.target.value ? Number(e.target.value) : null,
                                }))
                              }
                              options={serviceCenterOptions}
                              disabled={serviceStationsLoading}
                            />

                            <FormInputModule
                              label="Cash Collection Limit (₦)"
                              name="cashCollectionLimit"
                              type="text"
                              placeholder="Maximum cash collection amount"
                              value={existingUserFormData.cashCollectionLimit}
                              onChange={(e) => handleCurrencyInput(e, "existing")}
                              error={formErrors.cashCollectionLimit}
                              required
                            />

                            <FormSelectModule
                              label="Can Collect Cash?"
                              name="canCollectCash"
                              value={existingUserFormData.canCollectCash.toString()}
                              onChange={(e) =>
                                setExistingUserFormData((prev) => ({
                                  ...prev,
                                  canCollectCash: e.target.value === "true",
                                }))
                              }
                              options={canCollectCashOptions}
                              error={formErrors.canCollectCash}
                              required
                            />

                            <FormSelectModule
                              label="Status"
                              name="status"
                              value={existingUserFormData.status}
                              onChange={handleExistingUserInputChange}
                              options={statusOptions}
                              error={formErrors.status}
                              required
                            />
                          </div>
                        </div>

                        {/* Error Summary */}
                        {Object.keys(formErrors).length > 0 && (
                          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                            <div className="flex">
                              <div className="shrink-0">
                                <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                                <div className="mt-2 text-sm text-amber-700">
                                  <ul className="list-disc space-y-1 pl-5">
                                    {Object.values(formErrors).map((error, index) => (
                                      <li key={index}>{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-between gap-4 border-t pt-6">
                          <ButtonModule
                            variant="dangerSecondary"
                            size="lg"
                            onClick={handleResetExistingUserForm}
                            disabled={addExistingUserAsAgentLoading}
                            type="button"
                          >
                            Reset Form
                          </ButtonModule>

                          <ButtonModule
                            variant="primary"
                            size="lg"
                            onClick={() => void submitExistingUserAsAgent()}
                            disabled={!isExistingUserFormValid() || addExistingUserAsAgentLoading}
                            type="button"
                            icon={<UserCog />}
                            iconPosition="end"
                          >
                            {addExistingUserAsAgentLoading ? "Converting..." : "Convert to Agent"}
                          </ButtonModule>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                ) : (
                  /* BULK UPLOAD SECTION (Remains the same) */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-b-lg rounded-tl-lg bg-white p-6 shadow-sm"
                  >
                    {/* Template Download */}
                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="size-5 text-blue-600" />
                            <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                          </div>
                          <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                        </div>
                        <ButtonModule variant="primary" size="sm" onClick={downloadTemplate}>
                          Download Template
                        </ButtonModule>
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-8 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".csv"
                        className="hidden"
                      />

                      {!csvFile ? (
                        <div>
                          <svg
                            className="mx-auto size-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="mt-4 flex w-full flex-col items-center justify-center">
                            <ButtonModule variant="primary" onClick={() => fileInputRef.current?.click()}>
                              Choose CSV File
                            </ButtonModule>
                            <p className="mt-2 text-sm text-gray-600">or drag and drop your file here</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">CSV files only (max 10MB)</p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="mx-auto size-12 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="mt-2 text-sm font-medium text-gray-900">{csvFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {csvData.length} valid records found
                            {csvErrors.length > 0 && `, ${csvErrors.length} errors`}
                          </p>
                          <div className="mt-4 flex justify-center gap-3">
                            <ButtonModule
                              variant="secondary"
                              onClick={() => {
                                setCsvFile(null)
                                setCsvData([])
                                setCsvErrors([])
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ""
                                }
                              }}
                            >
                              Choose Different File
                            </ButtonModule>
                            {csvErrors.length === 0 && csvData.length > 0 && (
                              <ButtonModule
                                variant="primary"
                                onClick={() => void handleBulkSubmit()}
                                disabled={addAgentLoading}
                              >
                                Process {csvData.length} Agents
                              </ButtonModule>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CSV Errors Display */}
                    {csvErrors.length > 0 && (
                      <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg className="size-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800">
                              CSV Validation Errors ({csvErrors.length})
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                              <ul className="max-h-32 space-y-1 overflow-y-auto">
                                {csvErrors.map((error, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview of Valid Data */}
                    {csvData.length > 0 && (
                      <div className="rounded-md border border-gray-200">
                        <div className="bg-gray-50 px-4 py-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            Preview ({csvData.length} valid records)
                          </h3>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Email
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Employee ID
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((agent, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {agent.fullName}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{agent.email}</td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {agent.employeeId}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">{agent.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {csvData.length > 5 && (
                            <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
                              ... and {csvData.length - 5} more records
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddNewAgent
