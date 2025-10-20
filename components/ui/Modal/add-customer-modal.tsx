"use client"
import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { FormInputModule } from "../Input/Input"
import { FormSelectModule } from "../Input/FormSelectModule"

interface AddCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onSuccess?: () => void
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onRequestClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    corporateName: "",
    headOfficeAddress: "",
    headOfficeLgaName: "",
    headOfficeStateName: "",
    countryName: "Nigeria",
    officialEmailAddress: "",
    officialPhoneNO: "",
    dateIncorporated: new Date().toISOString(),
    officialSignatures: "/ydjhbijdfg dfbhsidfghyjfsdfgbfhxf-hgzysrfghjnzdfbgzdt089456745nbhcfbvhdfgdfvdfvdvx",
    taxIdentificationNumber: "",
    registrationNumber: "",
    openingAmount: 0,
    identityTypeID: 0,
    accountProductTypeID: 0,
    accountType: "Savings",
    customerTypeID: 0,
  })

  // Mock data for dropdowns
  const statesData = { data: [] }
  const lgasData = { data: [] }
  const identityTypesData = { data: [] }
  const productTypesData = { data: [] }
  const customerTypesData = { data: [] }
  const isFetchingLGAs = false
  const isAdding = false

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value), // Convert to number for ID fields
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: new Date(value).toISOString(),
    }))
  }

  const handleSubmit = async () => {
    try {
      console.log("Form submitted:", formData)
      onRequestClose()
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Failed to submit form:", error)
    }
  }

  const isFormValid = () => {
    return (
      formData.corporateName.trim() &&
      formData.headOfficeAddress.trim() &&
      formData.officialEmailAddress.trim() &&
      formData.officialPhoneNO.trim() &&
      formData.taxIdentificationNumber.trim()
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="min-w-[1000px] max-w-4xl overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center p-4"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Add New Customer</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 px-4 pb-4">
        <FormInputModule
          label="Corporate Name"
          name="corporateName"
          type="text"
          placeholder="Enter Corporate Name"
          value={formData.corporateName}
          onChange={handleInputChange}
          required
          className="col-span-2"
        />

        <FormInputModule
          label="Head Office Address"
          name="headOfficeAddress"
          type="text"
          placeholder="Enter Head Office Address"
          value={formData.headOfficeAddress}
          onChange={handleInputChange}
          required
          className="col-span-2"
        />

        <FormSelectModule
          label="State"
          name="headOfficeStateName"
          value={formData.headOfficeStateName}
          onChange={handleInputChange}
          options={[{ value: "", label: "Select State" }]}
        />

        <FormSelectModule
          label="LGA"
          name="headOfficeLgaName"
          value={formData.headOfficeLgaName}
          onChange={handleInputChange}
          disabled={true}
          options={[{ value: "", label: "Select LGA" }]}
        />

        <FormInputModule
          label="Country Name"
          name="countryName"
          type="text"
          placeholder="Enter Country Name"
          value={formData.countryName}
          onChange={handleInputChange}
        />

        <FormInputModule
          label="Official Email"
          name="officialEmailAddress"
          type="email"
          placeholder="Enter Official Email"
          value={formData.officialEmailAddress}
          onChange={handleInputChange}
          required
        />

        <FormInputModule
          label="Official Phone Number"
          name="officialPhoneNO"
          type="tel"
          placeholder="Enter Official Phone Number"
          value={formData.officialPhoneNO}
          onChange={handleInputChange}
          required
        />

        <FormInputModule
          label="Date Incorporated"
          name="dateIncorporated"
          placeholder="Enter Date"
          type="date"
          value={new Date(formData.dateIncorporated).toISOString().split("T")[0] || ""}
          onChange={handleDateChange}
        />

        <FormInputModule
          label="TIN"
          name="taxIdentificationNumber"
          type="text"
          placeholder="Enter Tax Identification Number"
          value={formData.taxIdentificationNumber}
          onChange={handleInputChange}
          required
        />

        <FormInputModule
          label="Registration Number"
          name="registrationNumber"
          type="text"
          placeholder="Enter Registration Number"
          value={formData.registrationNumber}
          onChange={handleInputChange}
        />

        <FormInputModule
          label="Opening Amount"
          name="openingAmount"
          type="number"
          placeholder="Enter Opening Amount"
          value={formData.openingAmount}
          onChange={handleNumberInputChange}
        />

        <FormSelectModule
          label="Identity Type"
          name="identityTypeID"
          value={formData.identityTypeID.toString()}
          onChange={handleSelectChange}
          options={[{ value: "0", label: "Select Identity Type" }]}
        />

        <FormSelectModule
          label="Account Product Type"
          name="accountProductTypeID"
          value={formData.accountProductTypeID.toString()}
          onChange={handleSelectChange}
          options={[{ value: "0", label: "Select Product Type" }]}
        />

        <FormSelectModule
          label="Customer Type"
          name="customerTypeID"
          value={formData.customerTypeID.toString()}
          onChange={handleSelectChange}
          options={[{ value: "0", label: "Select Customer Type" }]}
        />

        <FormSelectModule
          label="Account Type"
          name="accountType"
          value={formData.accountType}
          onChange={(e) => setFormData((prev) => ({ ...prev, accountType: e.target.value }))}
          options={[
            { value: "Savings", label: "Savings" },
            { value: "Current", label: "Current" },
            { value: "Fixed Deposit", label: "Fixed Deposit" },
          ]}
        />
      </div>
      <div className="sticky bottom-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <ButtonModule
          variant="primary"
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!isFormValid() || isAdding}
        >
          Add Customer
        </ButtonModule>
      </div>
    </Modal>
  )
}

export default AddCustomerModal
