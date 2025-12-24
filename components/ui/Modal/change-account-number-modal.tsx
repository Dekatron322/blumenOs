"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { FormTextAreaModule } from "components/ui/Input/FormTextAreaModule"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { notify } from "components/ui/Notification/Notification"
import { changeAccountNumber } from "lib/redux/customerSlice"
import { fetchCountries } from "lib/redux/countriesSlice"
import type { ChangeAccountNumberRequest, Customer } from "lib/redux/customerSlice"

interface ChangeAccountNumberModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  accountNumber: string
  currentCustomer?: Customer
}

type FormErrors = {
  [K in keyof ChangeAccountNumberRequest]?: string
}

const ChangeAccountNumberModal: React.FC<ChangeAccountNumberModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  accountNumber,
  currentCustomer,
}) => {
  const dispatch = useAppDispatch()
  const { changeAccountNumberLoading, changeAccountNumberSuccess } = useAppSelector((state) => state.customers)
  const { countries, loading: countriesLoading } = useAppSelector((state) => state.countries)

  const [formData, setFormData] = useState<ChangeAccountNumberRequest>({
    reason: "",
    address: currentCustomer?.address || "",
    addressTwo: currentCustomer?.addressTwo || "",
    city: currentCustomer?.city || "",
    provinceId: currentCustomer?.distributionSubstationId || 0,
    latitude: currentCustomer?.latitude || 0,
    longitude: currentCustomer?.longitude || 0,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Fetch countries data on component mount
  React.useEffect(() => {
    dispatch(fetchCountries())
  }, [dispatch])

  // Province (state) options from countries endpoint (Nigeria only)
  const nigeria = countries.find(
    (country) => country.name.toLowerCase() === "nigeria" || country.abbreviation.toUpperCase() === "NG"
  )

  const provinceOptions = [
    { value: 0, label: "Select state" },
    ...((nigeria?.provinces ?? []).map((province) => ({
      value: province.id,
      label: province.name,
    })) || []),
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    if (formData.provinceId <= 0) {
      newErrors.provinceId = "Please select a valid province"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ChangeAccountNumberRequest, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(
        changeAccountNumber({
          id: customerId,
          changeData: formData,
        })
      )

      if (result.meta.requestStatus === "fulfilled") {
        notify("success", "Account number changed successfully!", {
          duration: 3000,
        })
        onRequestClose()
        // Reset form
        setFormData({
          reason: "",
          address: currentCustomer?.address || "",
          addressTwo: currentCustomer?.addressTwo || "",
          city: currentCustomer?.city || "",
          provinceId: currentCustomer?.distributionSubstationId || 0,
          latitude: currentCustomer?.latitude || 0,
          longitude: currentCustomer?.longitude || 0,
        })
      }
    } catch (error) {
      console.error("Error changing account number:", error)
    }
  }

  const handleClose = () => {
    if (!changeAccountNumberLoading) {
      onRequestClose()
      setErrors({})
      setFormData({
        reason: "",
        address: currentCustomer?.address || "",
        addressTwo: currentCustomer?.addressTwo || "",
        city: currentCustomer?.city || "",
        provinceId: currentCustomer?.distributionSubstationId || 0,
        latitude: currentCustomer?.latitude || 0,
        longitude: currentCustomer?.longitude || 0,
      })
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-3 backdrop-blur-sm sm:px-4"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md  rounded-lg bg-white shadow-2xl sm:max-w-lg md:max-w-xl 2xl:max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-4 sm:px-6 sm:py-5">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg md:text-xl">Change Account Number</h2>
          <button
            onClick={handleClose}
            className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 sm:size-8"
            disabled={changeAccountNumberLoading}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] ">
          <div className="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="mb-2 w-full text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-900 sm:text-lg">{customerName}</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Account: {accountNumber}</p>
            </div>

            <p className="text-xs text-gray-500 sm:text-sm">
              Please provide the reason and new address details for changing the account number.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormInputModule
                label="City"
                name="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                required
                disabled={changeAccountNumberLoading}
                error={errors.city}
                type=""
              />

              <FormSelectModule
                label="State"
                name="provinceId"
                value={formData.provinceId}
                onChange={(e) => handleInputChange("provinceId", parseInt(e.target.value) || 0)}
                options={provinceOptions}
                required
                disabled={changeAccountNumberLoading || countriesLoading}
                error={errors.provinceId}
              />
              <FormInputModule
                label="New Address"
                name="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter new address"
                required
                disabled={changeAccountNumberLoading}
                error={errors.address}
                type=""
                className="sm:col-span-2"
              />

              <FormInputModule
                label="Address Line 2"
                name="addressTwo"
                value={formData.addressTwo}
                onChange={(e) => handleInputChange("addressTwo", e.target.value)}
                placeholder="Enter address line 2 (optional)"
                disabled={changeAccountNumberLoading}
                type=""
                className="sm:col-span-2"
              />

              {/* <FormInputModule
                label="Latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", parseFloat(e.target.value) || 0)}
                placeholder="0.000000"
                disabled={changeAccountNumberLoading}
              />

              <FormInputModule
                label="Longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", parseFloat(e.target.value) || 0)}
                placeholder="0.000000"
                disabled={changeAccountNumberLoading}
              /> */}
              <FormTextAreaModule
                label="Reason for Change"
                name="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Please provide a reason for changing the account number"
                required
                disabled={changeAccountNumberLoading}
                error={errors.reason}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:gap-4 sm:px-6 sm:py-5"
        >
          <ButtonModule
            variant="secondary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            onClick={handleClose}
            disabled={changeAccountNumberLoading}
          >
            Cancel
          </ButtonModule>

          <ButtonModule
            variant="primary"
            className="flex w-full text-sm sm:text-base"
            size="md"
            type="submit"
            disabled={changeAccountNumberLoading}
          >
            {changeAccountNumberLoading ? "Changing..." : "Change Account Number"}
          </ButtonModule>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default ChangeAccountNumberModal
