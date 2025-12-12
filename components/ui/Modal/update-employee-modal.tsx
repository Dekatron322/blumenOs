"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import CloseIcon from "public/close-icon"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { notify } from "components/ui/Notification/Notification"
import { AppDispatch, RootState } from "lib/redux/store"
import { clearUpdateStatus, updateEmployee } from "lib/redux/employeeSlice"
import { fetchRoles } from "lib/redux/roleSlice"
import { clearAreaOffices, fetchAreaOffices } from "lib/redux/areaOfficeSlice"
import { clearDepartments, fetchDepartments } from "lib/redux/departmentSlice"
import { EmployeeDetails } from "lib/redux/employeeSlice"

interface UpdateEmployeeModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
  employee: EmployeeDetails | null
}

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

const UpdateEmployeeModal: React.FC<UpdateEmployeeModalProps> = ({ isOpen, onRequestClose, onSuccess, employee }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { updateLoading, updateError, updateSuccess } = useSelector((state: RootState) => state.employee)
  const { roles, loading: rolesLoading } = useSelector((state: RootState) => state.roles)
  const { areaOffices, loading: areaOfficesLoading } = useSelector((state: RootState) => state.areaOffices)
  const { departments, loading: departmentsLoading } = useSelector((state: RootState) => state.departments)
  const { employees, employeesLoading } = useSelector((state: RootState) => state.employee)

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

  // Initialize form with employee data when modal opens or employee changes
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        fullName: employee.fullName || "",
        phoneNumber: employee.phoneNumber || "",
        isActive: employee.isActive,
        roleIds: employee.roles?.map((role) => role.roleId) || [],
        areaOfficeId: employee.areaOfficeId || 0,
        departmentId: employee.departmentId || 0,
        employeeId: employee.employeeId || "",
        position: employee.position || "",
        emergencyContact: employee.emergencyContact || "",
        address: employee.address || "",
        supervisorId: employee.supervisorId || 0,
        employmentType: employee.employmentType || "FULL_TIME",
      })
    }
  }, [employee, isOpen])

  // Fetch roles, employees, area offices, and departments on modal open
  useEffect(() => {
    if (isOpen) {
      dispatch(
        fetchRoles({
          pageNumber: 1,
          pageSize: 100,
        })
      )

      dispatch(
        fetchAreaOffices({
          PageNumber: 1,
          PageSize: 100,
        })
      )

      dispatch(
        fetchDepartments({
          pageNumber: 1,
          pageSize: 100,
          isActive: true,
        })
      )
    }

    return () => {
      dispatch(clearAreaOffices())
      dispatch(clearDepartments())
    }
  }, [isOpen, dispatch])

  // Handle success and error states
  useEffect(() => {
    if (updateSuccess) {
      notify("success", "Employee updated successfully", {
        description: `${employee?.fullName}'s profile has been updated successfully`,
        duration: 5000,
      })

      if (onSuccess) onSuccess()
      handleClose()
    }

    if (updateError) {
      notify("error", "Failed to update employee", {
        description: updateError,
        duration: 6000,
      })
    }
  }, [updateSuccess, updateError, employee?.fullName, onSuccess])

  const handleClose = () => {
    setFormErrors({})
    dispatch(clearUpdateStatus())
    onRequestClose()
  }

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
      .filter((emp) => emp.isActive && emp.id !== employee?.id) // Exclude current employee from supervisor list
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

  const isFormValid = (): boolean => {
    return (
      formData.employeeId.trim() !== "" &&
      formData.fullName.trim() !== "" &&
      formData.position.trim() !== "" &&
      formData.phoneNumber.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.emergencyContact.trim() !== "" &&
      formData.employmentType !== "" &&
      formData.roleIds.length > 0 &&
      formData.roleIds[0] !== 0 &&
      formData.areaOfficeId !== 0 &&
      formData.departmentId !== 0 &&
      formData.supervisorId !== 0
    )
  }

  if (!isOpen || !employee) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:w-[800px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">Update Employee</h2>
          <button
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 px-4 pb-4 pt-4 sm:grid-cols-2 sm:gap-6 sm:px-6 sm:pb-6 sm:pt-6">
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
                { value: "", label: departmentsLoading ? "Loading departments..." : "Select department" },
                ...departmentOptions.filter((option) => option.value !== 0),
              ]}
              error={formErrors.departmentId}
              required
              disabled={departmentsLoading}
            />

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
              required
            />

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
              options={[{ value: "", label: rolesLoading ? "Loading roles..." : "Select role" }, ...roleOptions]}
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
                { value: 0, label: employeesLoading ? "Loading supervisors..." : "Select supervisor" },
                ...supervisorOptions.filter((option) => option.value !== 0),
              ]}
              error={formErrors.supervisorId}
              required
              disabled={employeesLoading}
            />

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

            {/* Error Display */}
            {Object.keys(formErrors).length > 0 && (
              <div className="col-span-1 rounded-md border border-amber-200 bg-amber-50 p-3 sm:col-span-2 sm:p-4">
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
                          <li key={index} className="text-xs sm:text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-row sm:gap-4 sm:px-6 sm:py-5">
          <ButtonModule
            variant="dangerSecondary"
            className="flex w-full"
            size="md"
            onClick={handleClose}
            disabled={updateLoading}
          >
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex w-full"
            size="md"
            onClick={handleSubmit}
            disabled={!isFormValid() || updateLoading}
          >
            {updateLoading ? "Updating Employee..." : "Update Employee"}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default UpdateEmployeeModal
