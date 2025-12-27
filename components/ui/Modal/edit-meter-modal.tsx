// components/modals/EditMeterModal.tsx
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { editMeter, EditMeterRequest, Meter } from "lib/redux/metersSlice"
import { FormInputModule } from "../Input/Input"
import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { notify } from "../Notification/Notification"

interface EditMeterModalProps {
  isOpen: boolean
  onRequestClose: () => void
  meter: Meter | null
  onSuccess?: () => void
}

const EditMeterModal: React.FC<EditMeterModalProps> = ({ isOpen, onRequestClose, meter, onSuccess }) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.meters)

  const [formData, setFormData] = useState<EditMeterRequest>({
    id: 0,
    customerId: 0,
    customerAccountNumber: "",
    customerFullName: "",
    meterIsPPM: false,
    drn: "",
    sgc: 0,
    krn: "",
    ti: 0,
    ea: 0,
    tct: 0,
    ken: 0,
    mfrCode: 0,
    installationDate: "",
    meterID: "",
    meterAddedBy: "",
    meterEditedBy: "",
    meterDateCreated: "",
    meterTypeId: "",
    meterType: 1,
    meterBrand: "",
    meterCategory: "",
    isMeterActive: true,
    status: 1,
    state: 1,
    sealNumber: "",
    tariffRate: 0,
    tariffIndex: "",
    serviceBand: 1,
    customerClass: "",
    injectionSubstationId: 0,
    locationState: "",
    address: "",
    addressTwo: "",
    city: "",
    apartmentNumber: "",
    latitude: 0,
    longitude: 0,
    tenantFullName: "",
    tenantPhoneNumber: "",
    changeReason: "",
  })

  // Initialize form with meter data
  useEffect(() => {
    if (meter) {
      setFormData({
        id: meter.id,
        customerId: meter.customerId,
        customerAccountNumber: meter.customerAccountNumber,
        customerFullName: meter.customerFullName,
        meterIsPPM: meter.meterIsPPM,
        drn: meter.drn,
        sgc: meter.sgc,
        krn: meter.krn,
        ti: meter.ti,
        ea: meter.ea,
        tct: meter.tct,
        ken: meter.ken,
        mfrCode: meter.mfrCode,
        installationDate: meter.installationDate,
        meterID: meter.meterID,
        meterAddedBy: meter.meterAddedBy || "",
        meterEditedBy: meter.meterEditedBy || "",
        meterDateCreated: meter.meterDateCreated,
        meterTypeId: meter.meterTypeId,
        meterType: meter.meterType,
        meterBrand: meter.meterBrand || "",
        meterCategory: meter.meterCategory || "",
        isMeterActive: meter.isMeterActive,
        status: meter.status,
        state: meter.state,
        sealNumber: meter.sealNumber || "",
        tariffRate: meter.tariffRate,
        tariffIndex: meter.tariffIndex || "",
        serviceBand: meter.serviceBand,
        customerClass: meter.customerClass || "",
        injectionSubstationId: meter.injectionSubstationId,
        locationState: meter.locationState || "",
        address: meter.address,
        addressTwo: meter.addressTwo || "",
        city: meter.city || "",
        apartmentNumber: meter.apartmentNumber || "",
        latitude: meter.latitude,
        longitude: meter.longitude,
        tenantFullName: meter.tenantFullName || "",
        tenantPhoneNumber: meter.tenantPhoneNumber || "",
        changeReason: "",
      })
    }
  }, [meter])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    if (!meter) return

    try {
      console.log("Submitting edit for meter:", meter.id, "with data:", formData)
      await dispatch(editMeter({ id: meter.id, data: formData })).unwrap()
      console.log("Edit successful!")
      notify("success", "Meter updated successfully!", {
        title: "Success",
        description: `Meter ${meter.drn} has been updated.`,
        duration: 4000,
      })
      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to edit meter:", error)
      notify("error", "Failed to update meter", {
        title: "Error",
        description: error.message || "An error occurred while updating the meter.",
        duration: 6000,
      })
    }
  }

  const isFormValid = () => {
    // For edit mode, only require change reason to be provided
    // Users can edit specific fields without filling everything
    return formData.changeReason.trim()
  }

  // Options for dropdowns
  const meterTypeOptions = [
    { value: "1", label: "Smart Meter" },
    { value: "2", label: "Basic Meter" },
  ]

  const statusOptions = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
  ]

  const serviceBandOptions = [
    { value: "1", label: "Band A" },
    { value: "2", label: "Band B" },
    { value: "3", label: "Band C" },
    { value: "4", label: "Band D" },
    { value: "5", label: "Band E" },
  ]

  const stateOptions = [
    { value: "1", label: "Installed" },
    { value: "2", label: "Pending Installation" },
    { value: "3", label: "Decommissioned" },
  ]

  if (!isOpen || !meter) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#F3F4F6] p-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Meter - {meter.drn}</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-8 p-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormInputModule
                label="DRN"
                name="drn"
                type="text"
                placeholder="Enter DRN"
                value={formData.drn}
                onChange={handleInputChange}
                disabled
              />

              <FormInputModule
                label="KRN"
                name="krn"
                type="text"
                placeholder="Enter KRN"
                value={formData.krn}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Meter ID"
                name="meterID"
                type="text"
                placeholder="Enter Meter ID"
                value={formData.meterID}
                onChange={handleInputChange}
              />

              <FormSelectModule
                label="Meter Type"
                name="meterType"
                value={formData.meterType?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, meterType: parseInt(e.target.value) }))}
                options={meterTypeOptions}
              />

              <FormInputModule
                label="Meter Brand"
                name="meterBrand"
                type="text"
                placeholder="Enter meter brand"
                value={formData.meterBrand}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Meter Category"
                name="meterCategory"
                type="text"
                placeholder="Enter meter category"
                value={formData.meterCategory}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Technical Specifications</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormInputModule
                label="SGC"
                name="sgc"
                type="number"
                placeholder="Enter SGC"
                value={formData.sgc}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="TI"
                name="ti"
                type="number"
                placeholder="Enter TI"
                value={formData.ti}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="EA"
                name="ea"
                type="number"
                placeholder="Enter EA"
                value={formData.ea}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="TCT"
                name="tct"
                type="number"
                placeholder="Enter TCT"
                value={formData.tct}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="KEN"
                name="ken"
                type="number"
                placeholder="Enter KEN"
                value={formData.ken}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="MFR Code"
                name="mfrCode"
                type="number"
                placeholder="Enter MFR Code"
                value={formData.mfrCode}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Location & Installation */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Location & Installation</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormInputModule
                label="Installation Date"
                name="installationDate"
                type="datetime-local"
                value={formData.installationDate ? new Date(formData.installationDate).toISOString().slice(0, 16) : ""}
                onChange={handleInputChange}
                placeholder={""}
              />

              <FormInputModule
                label="Address"
                name="address"
                type="text"
                placeholder="Enter primary address"
                value={formData.address}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Address Line 2"
                name="addressTwo"
                type="text"
                placeholder="Enter secondary address"
                value={formData.addressTwo}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="City"
                name="city"
                type="text"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Apartment Number"
                name="apartmentNumber"
                type="text"
                placeholder="Enter apartment number"
                value={formData.apartmentNumber}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Location State"
                name="locationState"
                type="text"
                placeholder="Enter state"
                value={formData.locationState}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Tariff & Service Information */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Tariff & Service Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormInputModule
                label="Tariff Rate"
                name="tariffRate"
                type="number"
                placeholder="Enter tariff rate"
                value={formData.tariffRate}
                onChange={handleInputChange}
                step="0.01"
              />

              <FormInputModule
                label="Tariff Index"
                name="tariffIndex"
                type="text"
                placeholder="Enter tariff index"
                value={formData.tariffIndex}
                onChange={handleInputChange}
              />

              <FormSelectModule
                label="Service Band"
                name="serviceBand"
                value={formData.serviceBand?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, serviceBand: parseInt(e.target.value) }))}
                options={serviceBandOptions}
              />

              <FormInputModule
                label="Customer Class"
                name="customerClass"
                type="text"
                placeholder="Enter customer class"
                value={formData.customerClass}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Injection Substation ID"
                name="injectionSubstationId"
                type="number"
                placeholder="Enter substation ID"
                value={formData.injectionSubstationId}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Status & Configuration */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Status & Configuration</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="meterIsPPM"
                  name="meterIsPPM"
                  checked={formData.meterIsPPM}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="meterIsPPM" className="text-sm font-medium text-gray-700">
                  Is PPM (Prepaid Meter)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isMeterActive"
                  name="isMeterActive"
                  checked={formData.isMeterActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isMeterActive" className="text-sm font-medium text-gray-700">
                  Is Meter Active
                </label>
              </div>

              <FormSelectModule
                label="Status"
                name="status"
                value={formData.status?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: parseInt(e.target.value) }))}
                options={statusOptions}
              />

              <FormSelectModule
                label="State"
                name="state"
                value={formData.state?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: parseInt(e.target.value) }))}
                options={stateOptions}
              />

              <FormInputModule
                label="Seal Number"
                name="sealNumber"
                type="text"
                placeholder="Enter seal number"
                value={formData.sealNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Tenant Information */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Tenant Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormInputModule
                label="Tenant Full Name"
                name="tenantFullName"
                type="text"
                placeholder="Enter tenant name"
                value={formData.tenantFullName}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Tenant Phone Number"
                name="tenantPhoneNumber"
                type="tel"
                placeholder="Enter tenant phone"
                value={formData.tenantPhoneNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Change Reason */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Change Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Change Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="changeReason"
                  value={formData.changeReason}
                  onChange={handleInputChange}
                  placeholder="Please provide a reason for editing this meter..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-4 border-t bg-white p-6">
          <ButtonModule variant="dangerSecondary" className="flex-1" size="lg" onClick={onRequestClose}>
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          >
            Save Changes
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EditMeterModal
