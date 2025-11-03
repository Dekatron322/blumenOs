"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { LiaTimesSolid } from "react-icons/lia"
import { ButtonModule } from "components/ui/Button/Button"
import { VscEye } from "react-icons/vsc"
import { WiTime3 } from "react-icons/wi"
import { GoXCircle } from "react-icons/go"

interface Customer {
  id: string
  accountNumber: string
  customerName: string
  customerType: "PREPAID" | "POSTPAID"
  serviceBand: string
  tariffClass: string
  region: string
  businessUnit: string
  feederId: string | null
  transformerId: string | null
  address: string
  phoneNumber: string
  email: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  outstandingArrears: string
  createdAt: string
  updatedAt: string
  meters: any[]
  prepaidAccount: any | null
  postpaidAccount: any | null
}

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  companyNercCode?: string
  oldAreaOffice?: string
  newAreaOffice?: string
  newAreaOfficeNercCode?: string
  oldKaedcoAoCode?: string
  newKaedcoAoCode?: string
  injectionSubstation?: string
  injectionSubstationCode?: string
  feederName?: string
  feederNercCode?: string
  feederKaedcoCode?: string
  feederVoltageKv?: 11 | 33
  htPoleNo?: string
  dssName?: string
  oldDssName?: string
  dssNercCode?: string
  dssCode?: string
  transformerCapacityKva?: number
  latitude?: number
  longitude?: number
  units?: number
  unitCodes?: string[]
  isDedicated?: boolean
  status?: "ACTIVE" | "INACTIVE" | "NEW PROJECT" | "NON-EXISTENT" | string
  remarks?: string
}

interface CustomerDetailsModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customer: Customer | null
  assets?: Asset[]
  onUpdateStatus?: () => void
  onSendReminder?: () => void
  onSuspendAccount?: () => void
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onRequestClose,
  customer,
  assets = [],
  onUpdateStatus,
  onSendReminder,
  onSuspendAccount,
}) => {
  if (!isOpen || !customer) return null

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "SUSPENDED":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const getCustomerTypeStyle = (type: string) => {
    switch (type) {
      case "PREPAID":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "POSTPAID":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      default:
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    }
  }

  const getArrearsStyle = (arrears: string) => {
    const amount = parseFloat(arrears)
    if (amount === 0) {
      return { backgroundColor: "#EEF5F0", color: "#589E67" }
    } else if (amount <= 5000) {
      return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
    } else {
      return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { backgroundColor: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#D28E3D" }
      case "SUSPENDED":
        return { backgroundColor: "#AF4B4B" }
      default:
        return {}
    }
  }

  const getAssetStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "INACTIVE":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "NEW PROJECT":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "NON-EXISTENT":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#F1F1F1", color: "#666666" }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm"
            onClick={onRequestClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[1000] mb-6 h-full w-[700px] max-w-full bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-[#F9F9F9] p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
                <p className="text-sm text-gray-600">Complete customer information and account details</p>
              </div>
              <button
                onClick={onRequestClose}
                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
              >
                <LiaTimesSolid className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
              {/* Customer Profile Header */}
              <div className="mb-6 flex items-center gap-4 rounded-lg border bg-[#f9f9f9] p-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-xl font-semibold text-blue-600">
                    {customer.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{customer.customerName}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <div
                      style={getStatusStyle(customer.status)}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    >
                      <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                      {customer.status}
                    </div>
                    <div style={getCustomerTypeStyle(customer.customerType)} className="rounded-full px-3 py-1 text-sm">
                      {customer.customerType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <ButtonModule
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={onUpdateStatus}
                >
                  <VscEye className="size-4" />
                  Update Status
                </ButtonModule>
                <ButtonModule
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={onSendReminder}
                >
                  <WiTime3 className="size-4" />
                  Send Reminder
                </ButtonModule>
                <ButtonModule variant="danger" size="sm" className="flex items-center gap-2" onClick={onSuspendAccount}>
                  <GoXCircle className="size-4" />
                  Suspend
                </ButtonModule>
              </div>

              {/* Customer Information Sections */}
              <div className="space-y-6">
                {/* Account Information */}
                <div className="rounded-lg border bg-[#f9f9f9] p-4">
                  <h4 className="mb-4 font-semibold text-gray-900">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-medium">{customer.accountNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Customer Type:</span>
                      <p className="font-medium">{customer.customerType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Service Band:</span>
                      <p className="font-medium">{customer.serviceBand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Tariff Class:</span>
                      <p className="font-medium">{customer.tariffClass}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Business Unit:</span>
                      <p className="font-medium">{customer.businessUnit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Region:</span>
                      <p className="font-medium">{customer.region}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-lg border bg-[#f9f9f9] p-4">
                  <h4 className="mb-4 font-semibold text-gray-900">Contact Information</h4>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Phone Number:</span>
                      <p className="font-medium">{customer.phoneNumber}</p>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-blue-600">{customer.email}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="rounded-lg border bg-[#f9f9f9] p-4">
                  <h4 className="mb-4 font-semibold text-gray-900">Financial Information</h4>
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Outstanding Arrears:</span>
                      <div
                        style={getArrearsStyle(customer.outstandingArrears)}
                        className="rounded-full px-3 py-1 text-sm font-medium"
                      >
                        ₦{parseFloat(customer.outstandingArrears).toLocaleString()}
                      </div>
                    </div>
                    {customer.prepaidAccount && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Prepaid Account:</span>
                        <p className="font-medium">Active</p>
                      </div>
                    )}
                    {customer.postpaidAccount && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Postpaid Account:</span>
                        <p className="font-medium">Active</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assets Information */}
                {assets.length > 0 && (
                  <div className="rounded-lg border bg-[#f9f9f9] p-4">
                    <h4 className="mb-4 font-semibold text-gray-900">Assets ({assets.length})</h4>
                    <div className="space-y-4">
                      {assets.map((asset, index) => (
                        <div key={asset.serialNo} className="rounded border bg-white p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">Asset #{asset.serialNo}</h5>
                            <div
                              style={getAssetStatusStyle(asset.status || "")}
                              className="rounded-full px-2 py-1 text-xs"
                            >
                              {asset.status || "UNKNOWN"}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Feeder:</span>
                              <p className="font-medium">{asset.feederName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Transformer:</span>
                              <p className="font-medium">{asset.transformerCapacityKva}kVA</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">DSS:</span>
                              <p className="font-medium">{asset.dssName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Area Office:</span>
                              <p className="font-medium">{asset.newAreaOffice}</p>
                            </div>
                            {asset.unitCodes && asset.unitCodes.length > 0 && (
                              <div className="col-span-2 flex items-center gap-2">
                                <span className="text-gray-600">Unit Codes:</span>
                                <p className="font-medium">{asset.unitCodes.join(", ")}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Information */}
                <div className="rounded-lg border bg-[#f9f9f9] p-4">
                  <h4 className="mb-4 font-semibold text-gray-900">Technical Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {customer.feederId && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Feeder ID:</span>
                        <p className="font-medium">{customer.feederId}</p>
                      </div>
                    )}
                    {customer.transformerId && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Transformer ID:</span>
                        <p className="font-medium">{customer.transformerId}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Meters Installed:</span>
                      <p className="font-medium">{customer.meters?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Account Timeline */}
                <div className="rounded-lg border bg-[#f9f9f9] p-4">
                  <h4 className="mb-4 font-semibold text-gray-900">Account Timeline</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Created:</span>
                      <p className="font-medium">{new Date(customer.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Last Updated:</span>
                      <p className="font-medium">{new Date(customer.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t bg-[#f9f9f9] p-6">
              <div className="flex gap-3">
                <ButtonModule variant="secondary" className="flex-1" onClick={onRequestClose}>
                  Close
                </ButtonModule>
                <ButtonModule variant="primary" className="flex-1">
                  Edit Customer
                </ButtonModule>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CustomerDetailsModal
