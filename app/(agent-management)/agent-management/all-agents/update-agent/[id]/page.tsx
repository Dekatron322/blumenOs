"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchAgentById, updateAgent, UpdateAgentRequest } from "lib/redux/agentSlice"
import { fetchEmployees } from "lib/redux/employeeSlice"
import { fetchAgents } from "lib/redux/agentSlice"
import { clearDepartments, fetchDepartments } from "lib/redux/departmentSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { fetchServiceStations } from "lib/redux/serviceStationsSlice"
import { fetchDistributionSubstations } from "lib/redux/distributionSubstationsSlice"
import { ArrowLeft, CreditCard, Home, MapPin, Save, User } from "lucide-react"

// === INTERFACES ===

// Update Agent Form Data
interface UpdateAgentFormData {
  status: string
  agentCode: string
  cashCollectionLimit: string
  maxSingleAllowedCashAmount: string
  cashAtHand: string
  canCollectCash: boolean
  lastCashCollectionDate: string
  areaOfficeId: number
  serviceCenterId: number | null
  distributionSubstationId: number | null
  managerAgentId: number | null
  agentType: string
  enforceJurisdiction: boolean
  employeeId: string
  emergencyContact: string
  address: string
  employmentType: string
  supervisorId: number | null
  departmentId: number
}

// Agent type options
const agentTypeOptions = [
  { value: "", label: "Select agent type" },
  { value: "SalesRep", label: "Sales Representative" },
  { value: "Cashier", label: "Cashier" },
  { value: "ClearingCashier", label: "Clearing Cashier" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "FinanceManager", label: "Finance Manager" },
]

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

const UpdateAgentPage = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const agentId = params.id as string

  const { updateAgentLoading, updateAgentError, updateAgentSuccess, updatedAgent, currentAgent, currentAgentLoading } =
    useAppSelector((state) => state.agents)

  // Form data state
  const [formData, setFormData] = useState<UpdateAgentFormData>({
    status: "",
    agentCode: "",
    cashCollectionLimit: "",
    maxSingleAllowedCashAmount: "",
    cashAtHand: "",
    canCollectCash: false,
    lastCashCollectionDate: "",
    areaOfficeId: 0,
    serviceCenterId: null,
    distributionSubstationId: null,
    managerAgentId: null,
    agentType: "",
    enforceJurisdiction: true,
    employeeId: "",
    emergencyContact: "",
    address: "",
    employmentType: "",
    supervisorId: null,
    departmentId: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Redux selectors
  //   const { employees, employeesLoading, employeesError } = useAppSelector((state) => state.employee)
  const { agents, loading: agentsLoading, error: agentsError } = useAppSelector((state) => state.agents)
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
  const {
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useAppSelector((state) => state.distributionSubstations)

  // === EFFECTS ===

  // Fetch agent data on mount
  useEffect(() => {
    if (agentId) {
      dispatch(fetchAgentById(Number(agentId)))
    }
  }, [agentId, dispatch])

  // Populate form when agent data is available
  useEffect(() => {
    if (currentAgent) {
      setFormData({
        status: currentAgent.status || "",
        agentCode: currentAgent.agentCode || "",
        cashCollectionLimit: currentAgent.cashCollectionLimit?.toString() || "",
        maxSingleAllowedCashAmount: currentAgent.maxSingleAllowedCashAmount?.toString() || "",
        cashAtHand: currentAgent.cashAtHand?.toString() || "",
        canCollectCash: currentAgent.canCollectCash || false,
        lastCashCollectionDate: currentAgent.lastCashCollectionDate || "",
        areaOfficeId: currentAgent.areaOfficeId || 0,
        serviceCenterId: currentAgent.serviceCenterId || null,
        distributionSubstationId: currentAgent.distributionSubstationId || null,
        managerAgentId: currentAgent.managerAgentId || null,
        agentType: currentAgent.agentType || "",
        enforceJurisdiction: currentAgent.enforceJurisdiction !== undefined ? currentAgent.enforceJurisdiction : true,
        employeeId: currentAgent.user?.employeeId || "",
        emergencyContact: currentAgent.user?.emergencyContact || "",
        address: currentAgent.user?.address || "",
        employmentType: currentAgent.user?.employmentType || "",
        supervisorId: currentAgent.user?.supervisorId || null,
        departmentId: currentAgent.user?.departmentId || 0,
      })
    }
  }, [currentAgent])

  // Handle Redux state changes
  useEffect(() => {
    if (updateAgentSuccess && updatedAgent) {
      notify("success", "Agent updated successfully", {
        description: `${updatedAgent.user.fullName} has been updated`,
        duration: 6000,
      })

      // Navigate back after successful update
      setTimeout(() => {
        router.back()
      }, 2000)
    }

    if (updateAgentError) {
      notify("error", "Failed to update agent", {
        description: updateAgentError,
        duration: 6000,
      })
    }
  }, [updateAgentSuccess, updateAgentError, updatedAgent, dispatch, router])

  // Fetch dropdown data on mount
  useEffect(() => {
    dispatch(fetchEmployees({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchAgents({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchDepartments({ pageNumber: 1, pageSize: 100, isActive: true }))
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))
    dispatch(fetchServiceStations({ pageNumber: 1, pageSize: 100 }))
    dispatch(fetchDistributionSubstations({ pageNumber: 1, pageSize: 100 }))

    return () => {
      dispatch(clearDepartments())
      dispatch(clearAreaOffices())
    }
  }, [dispatch])

  // === HELPER FUNCTIONS ===

  // Format dropdown options
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
      label: agentsLoading ? "Loading supervisors..." : "Select supervisor (optional)",
    },
    ...agents
      .filter((agent) => agent.status === "ACTIVE" && agent.id !== Number(agentId))
      .map((agent) => ({
        value: agent.id.toString(),
        label: `${agent.user.fullName} (${agent.user.email}) - ${agent.agentCode}`,
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

  const distributionSubstationOptions = [
    {
      value: "",
      label: distributionSubstationsLoading
        ? "Loading distribution substations..."
        : "Select distribution substation (optional)",
    },
    ...distributionSubstations.map((substation) => ({
      value: substation.id.toString(),
      label: `${substation.dssCode} - ${substation.nercCode}`,
    })),
  ]

  // Filter manager agents based on selected agent type (following the same logic from AddNewAgent)
  const getManagerAgentOptions = () => {
    const baseOptions = [
      {
        value: "",
        label: agentsLoading ? "Loading manager agents..." : "Select manager agent",
      },
    ]

    const filteredAgents = agents.filter((agent) => {
      if (agent.status !== "ACTIVE" || agent.id === Number(agentId)) return false

      // Filter based on selected agent type
      if (formData.agentType === "SalesRep" || formData.agentType === "Cashier") {
        // SalesRep and Cashier can only have ClearingCashier as manager
        return agent.user.position === "Clearing Cashier"
      } else if (formData.agentType === "ClearingCashier") {
        // ClearingCashier can only have Supervisor as manager
        return agent.user.position === "Supervisor"
      } else if (formData.agentType === "Supervisor") {
        // Supervisor can only have FinanceManager as manager
        return agent.user.position === "Finance Manager"
      }

      return false // Don't show any options for FinanceManager or if no agent type is selected
    })

    const mappedAgents = filteredAgents.map((agent) => ({
      value: agent.id.toString(),
      label: `${agent.user.fullName} (${agent.user.email})`,
    }))

    return [...baseOptions, ...mappedAgents]
  }

  // === EVENT HANDLERS ===

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | boolean } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    if (name === "canCollectCash" || name === "enforceJurisdiction") {
      // Handle checkbox
      const checked = "checked" in e ? e.checked : value === "true"
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else if (name === "agentType") {
      // When agent type changes, reset dependent fields
      setFormData((prev) => ({
        ...prev,
        [name]: value as string,
        // Reset manager agent when agent type changes
        managerAgentId: null,
        // Reset cash-related fields based on agent type
        cashCollectionLimit: formData.agentType === "SalesRep" && value !== "SalesRep" ? "" : prev.cashCollectionLimit,
        maxSingleAllowedCashAmount:
          formData.agentType === "Cashier" && value !== "Cashier" ? "" : prev.maxSingleAllowedCashAmount,
        canCollectCash: ["SalesRep", "Cashier"].includes(value as string) ? prev.canCollectCash : false,
        enforceJurisdiction: value === "SalesRep" ? prev.enforceJurisdiction : true,
      }))
    } else {
      // Handle other inputs
      let newValue: string | number | null = value as string | number

      if (
        [
          "areaOfficeId",
          "serviceCenterId",
          "distributionSubstationId",
          "managerAgentId",
          "supervisorId",
          "departmentId",
        ].includes(name)
      ) {
        if (value === "" || value === null) {
          newValue =
            name === "serviceCenterId" ||
            name === "distributionSubstationId" ||
            name === "managerAgentId" ||
            name === "supervisorId"
              ? null
              : 0
        } else {
          const parsed = Number(value)
          newValue = isNaN(parsed) ? 0 : parsed
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }))
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.status.trim()) {
      errors.status = "Status is required"
    }

    if (!formData.agentType.trim()) {
      errors.agentType = "Agent type is required"
    }

    if (!formData.areaOfficeId) {
      errors.areaOfficeId = "Area office is required"
    }

    // Agent type-specific validation
    switch (formData.agentType) {
      case "SalesRep":
        if (!formData.cashCollectionLimit.trim()) {
          errors.cashCollectionLimit = "Cash collection limit is required"
        } else if (parseFloat(formData.cashCollectionLimit.replace(/[₦,]/g, "")) <= 0) {
          errors.cashCollectionLimit = "Cash collection limit must be greater than 0"
        }
        if (!formData.distributionSubstationId) {
          errors.distributionSubstationId = "Distribution substation is required for Sales Rep"
        }
        if (!formData.managerAgentId) {
          errors.managerAgentId = "Manager agent is required for Sales Representative"
        }
        if (formData.canCollectCash === undefined || formData.canCollectCash === null) {
          errors.canCollectCash = "Cash collection permission is required"
        }
        break

      case "Cashier":
        if (!formData.maxSingleAllowedCashAmount.trim()) {
          errors.maxSingleAllowedCashAmount = "Max single allowed cash amount is required"
        } else if (parseFloat(formData.maxSingleAllowedCashAmount.replace(/[₦,]/g, "")) <= 0) {
          errors.maxSingleAllowedCashAmount = "Max single allowed cash amount must be greater than 0"
        }
        if (!formData.managerAgentId) {
          errors.managerAgentId = "Manager agent is required for Cashier"
        }
        if (formData.canCollectCash === undefined || formData.canCollectCash === null) {
          errors.canCollectCash = "Cash collection permission is required"
        }
        break

      case "ClearingCashier":
        if (!formData.managerAgentId) {
          errors.managerAgentId = "Manager agent is required for Clearing Cashier"
        }
        break

      case "Supervisor":
        // Manager agent is optional for Supervisor
        break

      case "FinanceManager":
        // No additional validation for Finance Manager
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submission Function
  const handleSubmit = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    const updateData: UpdateAgentRequest = {
      status: formData.status,
      agentCode: formData.agentCode,
      cashCollectionLimit: formData.cashCollectionLimit
        ? parseFloat(formData.cashCollectionLimit.replace(/[₦,]/g, "")) || 0
        : 0,
      maxSingleAllowedCashAmount: formData.maxSingleAllowedCashAmount
        ? parseFloat(formData.maxSingleAllowedCashAmount.replace(/[₦,]/g, "")) || 0
        : 0,
      cashAtHand: formData.cashAtHand ? parseFloat(formData.cashAtHand.replace(/[₦,]/g, "")) || 0 : 0,
      canCollectCash: formData.canCollectCash,
      lastCashCollectionDate: formData.lastCashCollectionDate || undefined,
      areaOfficeId: formData.areaOfficeId,
      serviceCenterId: formData.serviceCenterId || undefined,
      distributionSubstationId: formData.distributionSubstationId || undefined,
      managerAgentId: formData.managerAgentId || undefined,
      agentType: formData.agentType,
      enforceJurisdiction: formData.enforceJurisdiction,
      employeeId: formData.employeeId,
      emergencyContact: formData.emergencyContact,
      address: formData.address,
      employmentType: formData.employmentType,
      supervisorId: formData.supervisorId || undefined,
      departmentId: formData.departmentId,
    }

    dispatch(updateAgent({ id: Number(agentId), updateData }))
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

  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const formattedValue = formatCurrency(value)

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))
  }

  // Helper to check if field should be shown based on agent type
  const shouldShowField = (fieldName: string): boolean => {
    switch (fieldName) {
      case "cashCollectionLimit":
        return formData.agentType === "SalesRep"
      case "maxSingleAllowedCashAmount":
        return formData.agentType === "Cashier"
      case "distributionSubstationId":
        return formData.agentType === "SalesRep"
      case "managerAgentId":
        return ["SalesRep", "Cashier", "ClearingCashier", "Supervisor"].includes(formData.agentType)
      case "canCollectCash":
        return formData.agentType === "SalesRep" || formData.agentType === "Cashier"
      case "enforceJurisdiction":
        return formData.agentType === "SalesRep"
      default:
        return true
    }
  }

  // === RENDER ===

  if (currentAgentLoading) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="flex w-full flex-col">
            <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#004B23] border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading agent information...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!currentAgent) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="flex w-full flex-col">
            <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">Agent Not Found</h2>
                  <p className="mt-2 text-gray-600">The agent you're trying to update could not be found.</p>
                  <ButtonModule variant="primary" size="md" onClick={() => router.back()} className="mt-4">
                    Go Back
                  </ButtonModule>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 2xl:px-16">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Update Agent</h1>
                    <p className="text-sm text-gray-600">
                      Update information for {currentAgent.user.fullName} ({currentAgent.agentCode})
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule variant="outline" size="md" onClick={() => router.back()} disabled={updateAgentLoading}>
                    Cancel
                  </ButtonModule>
                  <ButtonModule
                    variant="primary"
                    size="md"
                    onClick={() => void handleSubmit()}
                    disabled={updateAgentLoading}
                    icon={<Save />}
                    iconPosition="start"
                  >
                    {updateAgentLoading ? "Updating Agent..." : "Update Agent"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Agent Information</h3>
                <p className="text-sm text-gray-600">Update the agent's information and settings</p>
              </div>

              <form className="space-y-6 rounded-lg bg-[#F9f9f9] p-4 sm:p-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormInputModule
                      label="Agent Code"
                      name="agentCode"
                      type="text"
                      placeholder="Agent code"
                      value={formData.agentCode}
                      onChange={handleInputChange}
                      disabled
                    />

                    <FormSelectModule
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      options={statusOptions}
                      error={formErrors.status}
                      required
                    />

                    <FormSelectModule
                      label="Agent Type"
                      name="agentType"
                      value={formData.agentType}
                      onChange={handleInputChange}
                      options={agentTypeOptions}
                      error={formErrors.agentType}
                      required
                    />

                    <FormInputModule
                      label="Employee ID"
                      name="employeeId"
                      type="text"
                      placeholder="Employee identification number"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                    />

                    <FormSelectModule
                      label="Employment Type"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      options={employmentTypeOptions}
                    />
                  </div>
                </div>

                {/* Department Assignment */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Department Assignment</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormSelectModule
                      label="Department"
                      name="departmentId"
                      value={formData.departmentId.toString()}
                      onChange={handleInputChange}
                      options={departmentOptions}
                      error={formErrors.departmentId}
                      disabled={departmentsLoading}
                    />
                  </div>
                </div>

                {/* Office Assignment */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <MapPin className="size-5" />
                    Office Assignment
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormSelectModule
                      label="Area Office"
                      name="areaOfficeId"
                      value={formData.areaOfficeId.toString()}
                      onChange={handleInputChange}
                      options={areaOfficeSelectOptions}
                      error={formErrors.areaOfficeId}
                      required
                      disabled={areaOfficesLoading}
                    />

                    <FormSelectModule
                      label="Service Center"
                      name="serviceCenterId"
                      value={formData.serviceCenterId?.toString() || ""}
                      onChange={handleInputChange}
                      options={serviceCenterOptions}
                      disabled={serviceStationsLoading}
                    />

                    {/* Distribution Substation - Only for SalesRep */}
                    {shouldShowField("distributionSubstationId") && (
                      <FormSelectModule
                        label="Distribution Substation"
                        name="distributionSubstationId"
                        value={formData.distributionSubstationId?.toString() || ""}
                        onChange={handleInputChange}
                        options={distributionSubstationOptions}
                        error={formErrors.distributionSubstationId}
                        disabled={distributionSubstationsLoading}
                      />
                    )}

                    {/* Manager Agent - For SalesRep, Cashier, ClearingCashier, and Supervisor */}
                    {shouldShowField("managerAgentId") && (
                      <FormSelectModule
                        label={
                          formData.agentType === "SalesRep" || formData.agentType === "Cashier"
                            ? "Manager Agent (Required)"
                            : formData.agentType === "ClearingCashier"
                            ? "Manager Agent (Supervisor)"
                            : "Manager Agent (Finance Manager)"
                        }
                        name="managerAgentId"
                        value={formData.managerAgentId?.toString() || ""}
                        onChange={handleInputChange}
                        options={getManagerAgentOptions()}
                        error={formErrors.managerAgentId}
                        disabled={agentsLoading}
                      />
                    )}
                  </div>
                </div>

                {/* Cash & Financial Information */}
                {["SalesRep", "Cashier", "ClearingCashier"].includes(formData.agentType) && (
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                      <CreditCard className="size-5 text-[#004B23]" />
                      Cash & Financial Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      {/* Cash Collection Limit - Only for SalesRep */}
                      {shouldShowField("cashCollectionLimit") && (
                        <FormInputModule
                          label="Cash Collection Limit (₦)"
                          name="cashCollectionLimit"
                          type="text"
                          placeholder="Maximum cash collection amount"
                          value={formData.cashCollectionLimit}
                          onChange={handleCurrencyInput}
                          error={formErrors.cashCollectionLimit}
                          required
                        />
                      )}

                      {/* Max Single Allowed Cash Amount - Only for Cashier */}
                      {shouldShowField("maxSingleAllowedCashAmount") && (
                        <FormInputModule
                          label="Max Single Allowed Cash Amount (₦)"
                          name="maxSingleAllowedCashAmount"
                          type="text"
                          placeholder="Maximum single cash transaction amount"
                          value={formData.maxSingleAllowedCashAmount}
                          onChange={handleCurrencyInput}
                          error={formErrors.maxSingleAllowedCashAmount}
                          required
                        />
                      )}

                      {/* Can Collect Cash - Only for SalesRep and Cashier */}
                      {shouldShowField("canCollectCash") && (
                        <FormSelectModule
                          label="Can Collect Cash?"
                          name="canCollectCash"
                          value={formData.canCollectCash.toString()}
                          onChange={handleInputChange}
                          options={canCollectCashOptions}
                          error={formErrors.canCollectCash}
                          required
                        />
                      )}

                      {/* Enforce Jurisdiction - Only for SalesRep */}
                      {shouldShowField("enforceJurisdiction") && (
                        <div className="col-span-full">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="enforceJurisdiction"
                              checked={formData.enforceJurisdiction}
                              onChange={(e) => handleInputChange(e)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-900">Enforce Jurisdiction Restrictions</span>
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            Limit agent operations to their assigned area of jurisdiction
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-medium text-gray-900">
                    <Home className="size-5" />
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <FormInputModule
                      label="Emergency Contact"
                      name="emergencyContact"
                      type="text"
                      placeholder="Emergency contact number"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                    />

                    <div className="col-span-full">
                      <FormInputModule
                        label="Address"
                        name="address"
                        type="text"
                        placeholder="Enter complete address"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Agent Type Information Display */}
                {formData.agentType && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <User className="mt-0.5 size-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">
                          {agentTypeOptions.find((opt) => opt.value === formData.agentType)?.label || "Agent"} Settings
                        </h4>
                        <p className="text-sm text-blue-600">
                          {formData.agentType === "SalesRep" &&
                            "Sales Representatives require a distribution substation, cash collection limit, and a Clearing Cashier as manager agent."}
                          {formData.agentType === "Cashier" &&
                            "Cashiers require a max single allowed cash amount and a Clearing Cashier as manager agent."}
                          {formData.agentType === "ClearingCashier" &&
                            "Clearing Cashiers require a Supervisor as manager agent."}
                          {formData.agentType === "Supervisor" &&
                            "Supervisors can optionally have a Finance Manager as manager agent."}
                          {formData.agentType === "FinanceManager" &&
                            "Finance Managers do not require a manager agent."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

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
                <div className="flex flex-col-reverse justify-between gap-4 border-t pt-6 sm:flex-row">
                  <ButtonModule
                    variant="outline"
                    size="md"
                    onClick={() => router.back()}
                    disabled={updateAgentLoading}
                    type="button"
                  >
                    Cancel
                  </ButtonModule>

                  <ButtonModule
                    variant="primary"
                    size="md"
                    onClick={() => void handleSubmit()}
                    disabled={updateAgentLoading}
                    type="button"
                    icon={<Save />}
                    iconPosition="end"
                  >
                    {updateAgentLoading ? "Updating Agent..." : "Update Agent"}
                  </ButtonModule>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UpdateAgentPage
