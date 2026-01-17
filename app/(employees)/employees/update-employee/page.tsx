"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearUpdateStatus, fetchEmployeeDetails, updateEmployee } from "lib/redux/employeeSlice"
import { fetchRoles } from "lib/redux/roleSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearDepartments, fetchDepartments } from "lib/redux/departmentSlice"
import { EmployeeDetails } from "lib/redux/employeeSlice"

interface EmployeeFormData {
  fullName: string
  phoneNumber: string
  isActive: boolean
  roleIds: number[]
  areaOfficeId: number
  departmentId: number
  employeeId: string
  position: string
  emergencyContact: string
  address: string
  supervisorId: number
  employmentType: string
}

const UpdateEmployeePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get("id")

  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null)

  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: "",
    phoneNumber: "",
    isActive: true,
    roleIds: [],
    areaOfficeId: 0,
    departmentId: 0,
    employeeId: "",
    position: "",
    emergencyContact: "",
    address: "",
    supervisorId: 0,
    employmentType: "FULL_TIME",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { updateLoading, updateError, updateSuccess, employees } = useSelector((state: RootState) => state.employee)
  const { roles, loading: rolesLoading } = useSelector((state: RootState) => state.roles)
  const { areaOffices, loading: areaOfficesLoading } = useSelector((state: RootState) => state.areaOffices)
  const { departments, loading: departmentsLoading } = useSelector((state: RootState) => state.departments)

  // Fetch employee data and options on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!employeeId) {
        notify("error", "Employee ID is required", {
          description: "Please provide an employee ID to update",
          duration: 4000,
        })
        router.push("/employees")
        return
      }

      try {
        // Fetch employee details
        const employeeDetails = await dispatch(fetchEmployeeDetails(Number(employeeId))).unwrap()

        if (!employeeDetails) {
          notify("error", "Employee not found", {
            description: "The specified employee could not be found",
            duration: 4000,
          })
          router.push("/employees")
          return
        }

        setEmployee(employeeDetails)
        setFormData({
          fullName: employeeDetails.fullName || "",
          phoneNumber: employeeDetails.phoneNumber || "",
          isActive: employeeDetails.isActive,
          roleIds: employeeDetails.roles?.map((role) => role.roleId) || [],
          areaOfficeId: employeeDetails.areaOfficeId || 0,
          departmentId: employeeDetails.departmentId || 0,
          employeeId: employeeDetails.employeeId || "",
          position: employeeDetails.position || "",
          emergencyContact: employeeDetails.emergencyContact || "",
          address: employeeDetails.address || "",
          supervisorId: employeeDetails.supervisorId || 0,
          employmentType: employeeDetails.employmentType || "FULL_TIME",
        })

        // Fetch roles, area offices, and departments
        await Promise.all([
          dispatch(
            fetchRoles({
              pageNumber: 1,
              pageSize: 100,
            })
          ),
          dispatch(
            fetchAreaOffices({
              PageNumber: 1,
              PageSize: 100,
            })
          ),
          dispatch(
            fetchDepartments({
              pageNumber: 1,
              pageSize: 100,
              isActive: true,
            })
          ),
        ])
      } catch (error) {
        console.error("Failed to load employee data:", error)
        notify("error", "Failed to load employee data", {
          description: "There was an error loading the employee information",
          duration: 5000,
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearDepartments())
    }
  }, [employeeId, dispatch, router])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Employee updated successfully", {
        description: `${employee?.fullName}'s profile has been updated successfully`,
        duration: 5000,
      })
      router.push("/employees")
    }

    if (updateError) {
      notify("error", "Failed to update employee", {
        description: updateError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, employee?.fullName, router])

  // Generate options from API response
  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }))

  const areaOfficeOptions = [
    { value: 0, label: "Select area office" },
    ...areaOffices.map((areaOffice) => ({
      value: areaOffice.id,
      label: `${areaOffice.nameOfNewOAreaffice} (${areaOffice.newKaedcoCode})`,
    })),
  ]

  const departmentOptions = [
    { value: 0, label: "Select department" },
    ...departments.map((department) => ({
      value: department.id,
      label: `${department.name}${department.description ? ` - ${department.description}` : ""}`,
    })),
  ]

  const supervisorOptions = [
    { value: 0, label: "Select supervisor" },
    ...employees
      .filter((emp) => emp.isActive && emp.id !== employee?.id)
      .map((emp) => ({
        value: emp.id,
        label: `${emp.fullName} (${emp.email})`,
      })),
  ]

  const employmentTypeOptions = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    let processedValue = value
    if (["areaOfficeId", "departmentId", "supervisorId"].includes(name)) {
      processedValue = Number(value)
    } else if (name === "roleIds") {
      processedValue = [Number(value)]
    } else if (name === "isActive") {
      processedValue = value === "true" || value === true
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required"
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!formData.position.trim()) {
      errors.position = "Position is required"
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!/^(\+?234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Please enter a valid Nigerian phone number"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!formData.emergencyContact.trim()) {
      errors.emergencyContact = "Emergency contact is required"
    }

    if (!formData.employmentType) {
      errors.employmentType = "Employment type is required"
    }

    if (formData.roleIds.length === 0 || formData.roleIds[0] === 0) {
      errors.roleIds = "Role is required"
    }

    if (formData.areaOfficeId === 0) {
      errors.areaOfficeId = "Area office is required"
    }

    if (formData.departmentId === 0) {
      errors.departmentId = "Department is required"
    }

    if (formData.supervisorId === 0) {
      errors.supervisorId = "Please select a supervisor or choose 'No supervisor'"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!employee) return

    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      await dispatch(
        updateEmployee({
          id: employee.id,
          employeeData: formData,
        })
      ).unwrap()
    } catch (error: any) {
      console.error("Failed to update employee:", error)
    }
  }

  const handleCancel = () => {
    dispatch(clearUpdateStatus())
    router.push("/employees")
  }

  if (loading) {
    return (
      <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200">
        <DashboardNav />
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#004B23]"></div>
            <p className="mt-4 text-gray-600">Loading employee data...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="mx-auto flex w-full flex-col px-3 py-4 2xl:container sm:px-4 md:px-6 md:py-4 2xl:px-16">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 sm:hidden"
                    aria-label="Go back"
                  >
                    <svg
                      width="1em"
                      height="1em"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="new-arrow-right rotate-180 transform"
                    >
                      <path
                        d="M9.1497 0.80204C9.26529 3.95101 13.2299 6.51557 16.1451 8.0308L16.1447 9.43036C13.2285 10.7142 9.37889 13.1647 9.37789 16.1971L7.27855 16.1978C7.16304 12.8156 10.6627 10.4818 13.1122 9.66462L0.049716 9.43565L0.0504065 7.33631L13.1129 7.56528C10.5473 6.86634 6.93261 4.18504 7.05036 0.80273L9.1497 0.80204Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Update Employee</h1>
                    <p className="text-sm text-gray-600">Update employee information for {employee?.fullName}</p>
                  </div>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <ButtonModule variant="outline" size="sm" onClick={handleCancel} disabled={updateLoading}>
                    Cancel
                  </ButtonModule>
                  <ButtonModule variant="primary" size="sm" onClick={handleSubmit} disabled={updateLoading}>
                    {updateLoading ? "Updating..." : "Update Employee"}
                  </ButtonModule>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg bg-white p-4 shadow-sm sm:p-6"
              >
                {/* Form Header */}
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Employee Information</h3>
                  <p className="text-sm text-gray-600">Update the employee's information</p>
                </div>

                {/* Employee Form */}
                <form className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6">
                    <div className="border-b pb-3">
                      <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                      <p className="text-sm text-gray-600">Enter the employee's basic details</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <FormInputModule
                        label="Employee ID"
                        name="employeeId"
                        type="text"
                        placeholder="Enter employee ID (e.g., EMP00123)"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        error={formErrors.employeeId}
                        required
                      />

                      <FormInputModule
                        label="Full Name"
                        name="fullName"
                        type="text"
                        placeholder="Enter employee full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        error={formErrors.fullName}
                        required
                      />

                      <FormInputModule
                        label="Position"
                        name="position"
                        type="text"
                        placeholder="Enter employee position"
                        value={formData.position}
                        onChange={handleInputChange}
                        error={formErrors.position}
                        required
                      />

                      <FormSelectModule
                        label="Department"
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleInputChange}
                        options={[
                          {
                            value: "",
                            label: departmentsLoading ? "Loading departments..." : "Select department",
                          },
                          ...departmentOptions.filter((option) => option.value !== 0),
                        ]}
                        error={formErrors.departmentId}
                        required
                        disabled={departmentsLoading}
                      />
                    </div>
                  </div>

                  {/* Employment Details Section */}
                  <div className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6">
                    <div className="border-b pb-3">
                      <h4 className="text-lg font-medium text-gray-900">Employment Details</h4>
                      <p className="text-sm text-gray-600">Configure the employee's work arrangements</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <FormSelectModule
                        label="Employment Type"
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        options={[{ value: "", label: "Select employment type" }, ...employmentTypeOptions]}
                        error={formErrors.employmentType}
                        required
                      />

                      <FormSelectModule
                        label="Role"
                        name="roleIds"
                        value={formData.roleIds[0] ?? ""}
                        onChange={handleInputChange}
                        options={[
                          { value: "", label: rolesLoading ? "Loading roles..." : "Select role" },
                          ...roleOptions,
                        ]}
                        error={formErrors.roleIds}
                        required
                        disabled={rolesLoading}
                      />

                      <FormSelectModule
                        label="Area Office"
                        name="areaOfficeId"
                        value={formData.areaOfficeId}
                        onChange={handleInputChange}
                        options={[
                          {
                            value: "",
                            label: areaOfficesLoading ? "Loading area offices..." : "Select area office",
                          },
                          ...areaOfficeOptions.filter((option) => option.value !== 0),
                        ]}
                        error={formErrors.areaOfficeId}
                        required
                        disabled={areaOfficesLoading}
                      />

                      <FormSelectModule
                        label="Supervisor"
                        name="supervisorId"
                        value={formData.supervisorId}
                        onChange={handleInputChange}
                        options={[
                          {
                            value: 0,
                            label: "Loading supervisors...",
                          },
                          ...supervisorOptions.filter((option) => option.value !== 0),
                        ]}
                        error={formErrors.supervisorId}
                        required
                      />

                      <div className="sm:col-span-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormSelectModule
                            label="Status"
                            name="isActive"
                            value={formData.isActive.toString()}
                            onChange={handleInputChange}
                            options={[
                              { value: "true", label: "Active" },
                              { value: "false", label: "Inactive" },
                            ]}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-4 rounded-lg bg-[#f9f9f9] p-4 sm:space-y-6 sm:p-6">
                    <div className="border-b pb-3">
                      <h4 className="text-lg font-medium text-gray-900">Contact Information</h4>
                      <p className="text-sm text-gray-600">Provide contact details and address information</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <FormInputModule
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        placeholder="Enter phone number (e.g., 08099998888)"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        error={formErrors.phoneNumber}
                        required
                      />

                      <FormInputModule
                        label="Emergency Contact"
                        name="emergencyContact"
                        type="tel"
                        placeholder="Enter emergency contact number"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        error={formErrors.emergencyContact}
                      />

                      <div className="sm:col-span-2">
                        <FormInputModule
                          label="Address"
                          name="address"
                          type="text"
                          placeholder="Enter complete address"
                          value={formData.address}
                          onChange={handleInputChange}
                          error={formErrors.address}
                          required
                        />
                      </div>
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
                  <div className="hidden justify-end gap-4 border-t pt-6 sm:flex">
                    <ButtonModule
                      variant="dangerSecondary"
                      size="md"
                      onClick={handleCancel}
                      disabled={updateLoading}
                      type="button"
                    >
                      Cancel
                    </ButtonModule>

                    <ButtonModule
                      variant="primary"
                      size="md"
                      type="button"
                      onClick={handleSubmit}
                      disabled={updateLoading}
                    >
                      {updateLoading ? "Updating Employee..." : "Update Employee"}
                    </ButtonModule>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 shadow-lg sm:hidden">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateLoading}
            className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateLoading}
            className="rounded-lg bg-[#004B23] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003618] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </section>
  )
}

export default UpdateEmployeePage
