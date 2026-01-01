// components/modals/EditMeterModal.tsx
"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { editMeter, EditMeterRequest, Meter, MeterDetailData } from "lib/redux/metersSlice"
import { fetchMeterCategories, MeterCategory } from "lib/redux/meterCategorySlice"
import { fetchTariffGroups, TariffGroup } from "lib/redux/tariffGroupSlice"
import { fetchMeterBrands } from "lib/redux/meterBrandsSlice"
import { FormInputModule } from "../Input/Input"
import { FormSelectModule } from "../Input/FormSelectModule"
import { ButtonModule } from "../Button/Button"
import { notify } from "../Notification/Notification"

interface EditMeterModalProps {
  isOpen: boolean
  onRequestClose: () => void
  meter: Meter | MeterDetailData | null
  onSuccess?: () => void
}

const EditMeterModal: React.FC<EditMeterModalProps> = ({ isOpen, onRequestClose, meter, onSuccess }) => {
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.meters)
  const { meterCategories, loading: categoriesLoading } = useAppSelector((state) => state.meterCategories)
  const { tariffGroups, tariffGroupsLoading } = useAppSelector((state) => state.tariffGroups)
  const { meterBrands, loading: meterBrandsLoading } = useAppSelector((state) => state.meterBrands)

  const [formData, setFormData] = useState<EditMeterRequest>({
    serialNumber: "",
    drn: "",
    sgc: undefined,
    krn: "",
    ea: 0,
    tct: 0,
    ken: 0,
    mfrCode: 0,
    installationDate: "",
    meterType: 1,
    isSmart: true,
    meterBrand: "",
    meterCategory: "",
    isMeterActive: true,
    status: 1,
    meterState: 1,
    sealNumber: "",
    poleNumber: "",
    tariffId: 0,
    state: 0,
    address: "",
    addressTwo: "",
    city: "",
    apartmentNumber: "",
    latitude: 0,
    longitude: 0,
    changeReason: "",
  })

  // Initialize form with meter data
  useEffect(() => {
    if (meter) {
      setFormData({
        serialNumber: (meter as any).serialNumber || meter.meterID || "",
        drn: meter.drn || "",
        sgc: meter.sgc || 0,
        krn: meter.krn || "",
        ea: meter.ea || 0,
        tct: meter.tct || 0,
        ken: meter.ken || 0,
        mfrCode: meter.mfrCode || 0,
        installationDate: meter.installationDate || "",
        meterType: meter.meterType || 1,
        isSmart: (meter as any).isSmart || true,
        meterBrand: meter.meterBrand || "",
        meterCategory: meter.meterCategory || "",
        isMeterActive: meter.isMeterActive ?? true,
        status: meter.status || 1,
        meterState: (meter as any).meterState || 1,
        sealNumber: meter.sealNumber || "",
        poleNumber: (meter as any).poleNumber || "",
        tariffId: (meter as any).tariffId || 0,
        state: meter.state || 0,
        address: meter.address || "",
        addressTwo: meter.addressTwo || "",
        city: meter.city || "",
        apartmentNumber: meter.apartmentNumber || "",
        latitude: meter.latitude || 0,
        longitude: meter.longitude || 0,
        changeReason: "",
      })
    }
  }, [meter])

  // Fetch meter categories when modal opens
  useEffect(() => {
    if (isOpen && meterCategories.length === 0) {
      dispatch(fetchMeterCategories({ pageNumber: 1, pageSize: 100 }))
    }
  }, [isOpen, dispatch, meterCategories.length])

  // Fetch tariff groups when modal opens
  useEffect(() => {
    if (isOpen && tariffGroups.length === 0) {
      dispatch(fetchTariffGroups({ PageNumber: 1, PageSize: 100, HasNonZeroTariffIndex: true }))
    }
  }, [isOpen, dispatch, tariffGroups.length])

  // Fetch meter brands when modal opens
  useEffect(() => {
    if (isOpen && meterBrands.length === 0) {
      dispatch(fetchMeterBrands({ pageNumber: 1, pageSize: 100 }))
    }
  }, [isOpen, dispatch, meterBrands.length])

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
    return formData.changeReason.trim().length > 0
  }

  // Options for dropdowns
  const meterTypeOptions = [
    { value: "1", label: "Prepaid" },
    { value: "2", label: "Postpaid" },
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
                label="Serial Number"
                name="serialNumber"
                type="text"
                placeholder="Enter serial number"
                value={formData.serialNumber}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Meter Number"
                name="drn"
                type="text"
                placeholder="Enter meter number"
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
                label="SGC"
                name="sgc"
                type="number"
                placeholder="Enter SGC"
                value={formData.sgc?.toString() || ""}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="EA"
                name="ea"
                type="number"
                placeholder="Enter EA"
                value={formData.ea?.toString() || ""}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="TCT"
                name="tct"
                type="number"
                placeholder="Enter TCT"
                value={formData.tct?.toString() || ""}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="KEN"
                name="ken"
                type="number"
                placeholder="Enter KEN"
                value={formData.ken?.toString() || ""}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="MFR Code"
                name="mfrCode"
                type="number"
                placeholder="Enter MFR Code"
                value={formData.mfrCode?.toString() || ""}
                onChange={handleInputChange}
              />

              <FormInputModule
                label="Installation Date"
                name="installationDate"
                type="date"
                placeholder="Enter installation date"
                value={formData.installationDate}
                onChange={handleInputChange}
              />

              <FormSelectModule
                label="Meter Type"
                name="meterType"
                value={formData.meterType?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, meterType: parseInt(e.target.value) }))}
                options={meterTypeOptions}
              />

              <FormSelectModule
                label="Meter Brand"
                name="meterBrand"
                value={formData.meterBrand}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "Select meter brand" },
                  ...meterBrands.map((brand) => ({
                    value: brand.name,
                    label: brand.name,
                  })),
                ]}
                disabled={meterBrandsLoading}
                required
              />

              <FormSelectModule
                label="Meter Category"
                name="meterCategory"
                value={formData.meterCategory}
                onChange={handleInputChange}
                options={[
                  { value: "", label: "Select meter category" },
                  ...meterCategories.map((category) => ({
                    value: category.name,
                    label: category.name,
                  })),
                ]}
                disabled={categoriesLoading}
                required
              />

              <FormSelectModule
                label="Is Smart"
                name="isSmart"
                value={formData.isSmart?.toString() || "true"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isSmart: e.target.value === "true" }))}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />

              <FormSelectModule
                label="Is Meter Active"
                name="isMeterActive"
                value={formData.isMeterActive?.toString() || "true"}
                onChange={(e) => setFormData((prev) => ({ ...prev, isMeterActive: e.target.value === "true" }))}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />

              <FormSelectModule
                label="Status"
                name="status"
                value={formData.status?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: parseInt(e.target.value) }))}
                options={statusOptions}
              />

              <FormSelectModule
                label="Meter State"
                name="meterState"
                value={formData.meterState?.toString() || "1"}
                onChange={(e) => setFormData((prev) => ({ ...prev, meterState: parseInt(e.target.value) }))}
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

              <FormInputModule
                label="Pole Number"
                name="poleNumber"
                type="text"
                placeholder="Enter pole number"
                value={formData.poleNumber}
                onChange={handleInputChange}
              />

              <FormSelectModule
                label="Tariff ID"
                name="tariffId"
                value={formData.tariffId?.toString() || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, tariffId: parseInt(e.target.value) || 0 }))}
                options={[
                  { value: "", label: "Select tariff" },
                  ...tariffGroups.map((tariff) => ({
                    value: tariff.id.toString(),
                    label: `Band-${String.fromCharCode(64 + tariff.serviceBand)} ${tariff.currency}${
                      tariff.tariffRate
                    } tariffIndex-${tariff.tariffIndex}`,
                  })),
                ]}
                disabled={tariffGroupsLoading}
                required
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Location Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                label="Latitude"
                name="latitude"
                type="number"
                placeholder="Enter latitude"
                value={formData.latitude?.toString() || ""}
                onChange={handleInputChange}
                step="0.000001"
              />

              <FormInputModule
                label="Longitude"
                name="longitude"
                type="number"
                placeholder="Enter longitude"
                value={formData.longitude?.toString() || ""}
                onChange={handleInputChange}
                step="0.000001"
              />

              <FormSelectModule
                label="State"
                name="state"
                value={formData.state?.toString() || "0"}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: parseInt(e.target.value) }))}
                options={[
                  { value: "0", label: "Inactive" },
                  { value: "1", label: "Active" },
                ]}
              />
            </div>
          </div>

          {/* Change Reason */}
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-900">Change Reason</h3>
            <div className="grid grid-cols-1 gap-4">
              <textarea
                name="changeReason"
                placeholder="Please provide a reason for these changes..."
                value={formData.changeReason}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 border-t pt-6">
            <ButtonModule type="button" onClick={onRequestClose} variant="outline" className="px-4 py-2">
              Cancel
            </ButtonModule>
            <ButtonModule
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || loading}
              className="px-4 py-2"
            >
              {loading ? "Updating..." : "Update Meter"}
            </ButtonModule>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EditMeterModal
