"use client"
import React from "react"
import { motion } from "framer-motion"
import { AlertCircle, Building, Calendar, History, Mail, MapPin, Phone, User, Zap } from "lucide-react"
import { MeteringOutlineIcon, MeterOutlineIcon } from "components/Icons/Icons"

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

interface AccountNumberHistory {
  requestedAtUtc: string
  oldAccountNumber?: string
  oldAddress?: string
  oldAddressTwo?: string
  oldCity?: string
  oldLatitude?: string
  oldLongitude?: string
  newAccountNumber?: string
  newAddress?: string
  newAddressTwo?: string
  newCity?: string
  newLatitude?: string
  newLongitude?: string
  reason?: string
}

interface BasicInfoTabProps {
  currentCustomer: any
  assets: Asset[]
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
  formatDateTime: (dateString: string) => string
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  currentCustomer,
  assets,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  const currentMonthYear = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  const getStatusLabel = (code: string) => {
    switch (code) {
      case "ACTIVE":
        return "Active"
      case "SUSPENDED":
        return "Suspended"
      case "INACTIVE":
        return "Inactive"
      default:
        return code || "Unknown"
    }
  }

  const getMeterStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Active"
      case 2:
        return "Deactivated"
      case 3:
        return "Suspended"
      case 4:
        return "Retired"
      default:
        return "Unknown"
    }
  }

  const getMeterStateLabel = (state: number) => {
    switch (state) {
      case 1:
        return "Good"
      case 2:
        return "Tamper"
      case 3:
        return "Suspicious"
      case 4:
        return "Missing"
      case 5:
        return "Unknown"
      case 6:
        return "Faulty"
      case 7:
        return "Unassigned"
      default:
        return "Unknown"
    }
  }

  return (
    <>
      {/* Customer Overview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <User className="size-5" />
          Customer Overview
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Customer Number</label>
            <p className="text-sm font-semibold text-gray-900">{currentCustomer.customerNumber}</p>
          </div>

          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Account Number</label>
            <p className="text-sm font-semibold text-gray-900">{currentCustomer.accountNumber}</p>
          </div>
          {/* <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Auto Number</label>
            <p className="text-sm text-gray-900">{currentCustomer.autoNumber}</p>
          </div> */}
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <div className="text-sm font-medium text-gray-500">Status Code</div>
            <p
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                ${
                  currentCustomer.statusCode === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700"
                    : currentCustomer.statusCode === "SUSPENDED"
                    ? "bg-red-50 text-red-700"
                    : currentCustomer.statusCode === "INACTIVE"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {getStatusLabel(currentCustomer.statusCode)}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9f9f9] p-4">
            <label className="text-sm font-medium text-gray-500">Customer Type</label>
            <div className="flex flex-wrap gap-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  currentCustomer.isPPM ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                }`}
              >
                {currentCustomer.isPPM ? "PREPAID" : "POSTPAID"}
              </span>
              {currentCustomer.isCustomerNew && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  NEW
                </span>
              )}
              {currentCustomer.isPostEnumerated && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  POST ENUMERATED
                </span>
              )}
              {currentCustomer.isPPM && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  Prepaid Meter
                </span>
              )}
              {currentCustomer.isMD && (
                <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                  MD Customer
                </span>
              )}
              {currentCustomer.isUrban && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                  Urban Area
                </span>
              )}
              {currentCustomer.isHRB && (
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                  HRB Customer
                </span>
              )}
            </div>
            {/* <div className="mt-2 flex flex-wrap gap-1"></div> */}
          </div>
          {/* <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Ready for Extraction</label>
            <p className="text-sm text-gray-900">{currentCustomer.isReadyforExtraction ? "Yes" : "No"}</p>
          </div> */}
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <User className="size-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-sm font-semibold text-gray-900">{currentCustomer.fullName}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Phone Number</label>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-gray-400" />
              <p className="text-sm text-gray-900">{currentCustomer.phoneNumber}</p>
            </div>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Office Phone</label>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-gray-400" />
              <p className="text-sm text-gray-900">{currentCustomer.phoneOffice || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-gray-400" />
              <p className="text-sm text-gray-900">{currentCustomer.email}</p>
            </div>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Customer Category</label>
            <p className="text-sm text-gray-900">{currentCustomer.category?.name || "N/A"}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Gender</label>
            <p className="text-sm text-gray-900">{currentCustomer.gender || "N/A"}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Last Login</label>
            <p className="text-sm text-gray-900">{formatDateTime(currentCustomer.lastLoginAt)}</p>
          </div>
        </div>
      </motion.div>

      {/* Address Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MapPin className="size-5" />
          Address Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4 ">
            <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
              <label className="text-sm font-medium text-gray-500">Primary Address</label>
              <p className="text-sm text-gray-900">{currentCustomer.address}</p>
            </div>
            <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
              <label className="text-sm font-medium text-gray-500">Secondary Address</label>
              <p className="text-sm text-gray-900">{currentCustomer.addressTwo || "N/A"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="text-sm text-gray-900">{currentCustomer.city}</p>
              </div>
              <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                <label className="text-sm font-medium text-gray-500">State</label>
                <p className="text-sm text-gray-900">{currentCustomer.provinceName || "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
              <label className="text-sm font-medium text-gray-500">LGA</label>
              <p className="text-sm text-gray-900">{currentCustomer.lga || "N/A"}</p>
            </div>
            <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Latitude</label>
                  <p className="text-sm text-gray-900">{currentCustomer.latitude || "N/A"}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Longitude</label>
                  <p className="text-sm text-gray-900">{currentCustomer.longitude || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
              <label className="text-sm font-medium text-gray-500">Service Center</label>
              <p className="text-sm text-gray-900">{currentCustomer.serviceCenterName}</p>
            </div>
            <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
              <label className="text-sm font-medium text-gray-500">VAT Waived</label>
              <p className="text-sm text-gray-900">{currentCustomer.isVATWaved ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        {/* Map */}
        {currentCustomer.latitude && currentCustomer.longitude && (
          <div className="mt-6">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <iframe
                title="Customer location map"
                width="100%"
                height="220"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${currentCustomer.latitude},${currentCustomer.longitude}&z=15&output=embed`}
              ></iframe>
            </div>
          </div>
        )}

        {/* Location Change History */}
        {currentCustomer.accountNumberHistory && currentCustomer.accountNumberHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="size-5" />
              Location Change History
            </h3>
            <div className="space-y-3">
              {currentCustomer.accountNumberHistory.map((history: AccountNumberHistory, index: number) => (
                <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(history.requestedAtUtc).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Account Change
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-red-600">Previous Location</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Account:</span> {history.oldAccountNumber}
                        </p>
                        {history.oldAddress && (
                          <p>
                            <span className="font-medium">Address:</span> {history.oldAddress}
                          </p>
                        )}
                        {history.oldAddressTwo && (
                          <p>
                            <span className="font-medium">Address 2:</span> {history.oldAddressTwo}
                          </p>
                        )}
                        {history.oldCity && (
                          <p>
                            <span className="font-medium">City:</span> {history.oldCity}
                          </p>
                        )}
                        {history.oldLatitude && history.oldLongitude && (
                          <p>
                            <span className="font-medium">Coordinates:</span> {history.oldLatitude},{" "}
                            {history.oldLongitude}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-green-600">New Location</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Account:</span> {history.newAccountNumber}
                        </p>
                        {history.newAddress && (
                          <p>
                            <span className="font-medium">Address:</span> {history.newAddress}
                          </p>
                        )}
                        {history.newAddressTwo && (
                          <p>
                            <span className="font-medium">Address 2:</span> {history.newAddressTwo}
                          </p>
                        )}
                        {history.newCity && (
                          <p>
                            <span className="font-medium">City:</span> {history.newCity}
                          </p>
                        )}
                        {history.newLatitude && history.newLongitude && (
                          <p>
                            <span className="font-medium">Coordinates:</span> {history.newLatitude},{" "}
                            {history.newLongitude}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {history.reason && (
                    <div className="mt-3 rounded-md bg-blue-50 p-3">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {history.reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Distribution Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Zap className="size-5" />
          Distribution Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Distribution Station</label>
            <p className="text-sm text-gray-900">{currentCustomer.distributionSubstation?.dssCode || "N/A"}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Feeder Name</label>
            <p className="text-sm text-gray-900">{currentCustomer.distributionSubstation?.feeder?.name || "N/A"}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Area Office</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.distributionSubstation?.feeder?.injectionSubstation?.areaOffice?.nameOfNewOAreaffice ||
                "N/A"}
            </p>
          </div>

          {currentCustomer.distributionSubstation && (
            <>
              <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                <label className="text-sm font-medium text-gray-500">Transformer Capacity</label>
                <p className="text-sm text-gray-900">
                  {currentCustomer.distributionSubstation?.transformerCapacityInKva || "N/A"} kVA
                </p>
              </div>
              <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                <label className="text-sm font-medium text-gray-500">Number of Units</label>
                <p className="text-sm text-gray-900">{currentCustomer.distributionSubstation?.numberOfUnit || "N/A"}</p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Meter & Billing Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Building className="size-5" />
          Meter & Billing Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Meter Serial Number</label>
            <p className="text-sm font-semibold text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].serialNumber
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Meter DRN</label>
            <p className="text-sm font-semibold text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0 ? currentCustomer.meters[0].drn : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Seal Number</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].sealNumber || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Meter Type</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].meterCategory || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Smart Meter</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].isSmart
                  ? "Yes"
                  : "No"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Installation Date</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? formatDate(currentCustomer.meters[0].installationDate)
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Meter Status</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? getMeterStatusLabel(currentCustomer.meters[0].status)
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Meter State</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? getMeterStateLabel(currentCustomer.meters[0].meterState)
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">SGC</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].sgc || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">KRN</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].krn || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">TI</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].ti || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">EA</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].ea || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">TCT</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].tct || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">KEN</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].ken || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">MFR Code</label>
            <p className="text-sm text-gray-900">
              {currentCustomer.meters && currentCustomer.meters.length > 0
                ? currentCustomer.meters[0].mfrCode || "N/A"
                : "N/A"}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Tariff Rate</label>
            <p className="text-sm text-gray-900">{formatCurrency(currentCustomer.tariffRate)}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Tariff ID</label>
            <p className="text-sm text-gray-900">{currentCustomer.tariffId || "N/A"}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Tariff Class</label>
            <p className="text-sm text-gray-900">{currentCustomer.category?.name || "N/A"}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Tariff Band</label>
            <p className="text-sm text-gray-900">{currentCustomer.subCategory?.name || "N/A"}</p>
          </div>
          {/* <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">New Rate</label>
            <p className="text-sm text-gray-900">{formatCurrency(currentCustomer.newRate)}</p>
          </div> */}
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">VAT</label>
            <p className="text-sm text-gray-900">N/A</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">VAT Waived</label>
            <p className="text-sm text-gray-900">No</p>
          </div>
        </div>
        {/* <div className="mt-4 grid grid-cols-1 gap-4 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${currentCustomer.isPPM ? "bg-blue-500" : "bg-gray-300"}`}></div>
            <span className="text-sm text-gray-700">Prepaid Meter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${currentCustomer.isMD ? "bg-orange-500" : "bg-gray-300"}`}></div>
            <span className="text-sm text-gray-700">MD Customer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${currentCustomer.isUrban ? "bg-green-500" : "bg-gray-300"}`}></div>
            <span className="text-sm text-gray-700">Urban Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${currentCustomer.isHRB ? "bg-purple-500" : "bg-gray-300"}`}></div>
            <span className="text-sm text-gray-700">HRB Customer</span>
          </div>
        </div> */}
      </motion.div>

      {/* Financial Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MeteringOutlineIcon className="size-5" />
          Financial Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Stored Average</label>
            <p className="text-2xl font-bold text-gray-900">{currentCustomer.storedAverage}Kwh</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">{`Current Bill - ${currentMonthYear}`}</label>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(currentCustomer.totalMonthlyVend)}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Monthly Debt</label>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(currentCustomer.totalMonthlyDebt)}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Outstanding Debt</label>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(currentCustomer.customerOutstandingDebtBalance)}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Outstanding Credit</label>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(currentCustomer.customerOutstandingCreditBalance)}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Net Balance</label>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(currentCustomer.customerOutstandingBalance)}
            </p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Lifetime Debit</label>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(currentCustomer.totalLifetimeDebit)}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Lifetime Credit</label>
            <p className="text-2xl font-bold text-teal-600">{formatCurrency(currentCustomer.totalLifetimeCredit)}</p>
          </div>
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 text-center">
            <label className="text-sm font-medium text-gray-500">Tariff Rate</label>
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(currentCustomer.tariff)}/kWh</p>
          </div>
        </div>
      </motion.div>

      {/* Sales & Technical Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <User className="size-5" />
          Sales & Technical Information
        </h3>
        <div className="grid grid-cols-1 gap-6 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4 md:grid-cols-2">
          <div className="space-y-4 rounded-md border border-dashed border-gray-200 bg-[#FFFFFF] p-4">
            <h4 className="font-medium text-gray-700">Sales Representative</h4>
            {currentCustomer.salesRepUser ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  {currentCustomer.salesRepUser.fullName} - (ID:{currentCustomer.salesRepUser.id})
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="size-4" />
                  {currentCustomer.salesRepUser.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="size-4" />
                  {currentCustomer.salesRepUser.phoneNumber}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No sales representative assigned</p>
            )}
          </div>
          <div className="space-y-4 rounded-md border border-dashed border-gray-200 bg-[#FFFFFF] p-4">
            <h4 className="font-medium text-gray-700">Technical Engineer</h4>
            {currentCustomer.technicalEngineerUser ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-900">{currentCustomer.technicalEngineerUser.fullName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="size-4" />
                  {currentCustomer.technicalEngineerUser.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="size-4" />
                  {currentCustomer.technicalEngineerUser.phoneNumber}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No technical engineer assigned</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Additional Information */}
      {/* <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <AlertCircle className="size-5" />
          Additional Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
            <label className="text-sm font-medium text-gray-500">Comment</label>
            <p className="text-sm text-gray-900">{currentCustomer.comment || "No comments"}</p>
          </div>
          {currentCustomer.isSuspended && (
            <>
              <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                <label className="text-sm font-medium text-gray-500">Suspension Reason</label>
                <p className="text-sm text-gray-900">{currentCustomer.suspensionReason || "Not specified"}</p>
              </div>
              <div className="space-y-2 rounded-md border border-dashed border-gray-200 bg-[#F9F9F9] p-4">
                <label className="text-sm font-medium text-gray-500">Suspended At</label>
                <p className="text-sm text-gray-900">{formatDateTime(currentCustomer.suspendedAt)}</p>
              </div>
            </>
          )}
        </div>
      </motion.div> */}

      {/* Account & Meter History */}
      {(currentCustomer.accountNumberHistory?.length > 0 || currentCustomer.meterHistory?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <History className="size-5" />
            History
          </h3>

          {currentCustomer.accountNumberHistory?.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-3 font-medium text-gray-700">Account Number History</h4>
              <div className="space-y-3">
                {currentCustomer.accountNumberHistory.map((history: any, index: number) => (
                  <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600">From: {history.oldAccountNumber}</p>
                        <p className="text-sm text-gray-600">To: {history.newAccountNumber}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(history.requestedAtUtc)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reason: {history.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentCustomer.meterHistory?.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium text-gray-700">Meter History</h4>
              <div className="space-y-3">
                {currentCustomer.meterHistory.map((history: any, index: number) => (
                  <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-600">From: {history.oldMeterNumber}</p>
                        <p className="text-sm text-gray-600">To: {history.newMeterNumber}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(history.requestedAtUtc)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reason: {history.reason}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Assets & Equipment */}
      {/* {assets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MeterOutlineIcon className="size-5" />
            Assets & Equipment
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {assets.map((asset: Asset, index: number) => (
              <div key={asset.serialNo} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100">
                    <MeterOutlineIcon className="size-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Asset #{asset.serialNo}</h4>
                    <p className="text-sm text-gray-600">{asset.supplyStructureType}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Feeder</span>
                    <span className="font-medium">{asset.feederName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-medium">{asset.transformerCapacityKva}kVA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        asset.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-600"
                          : asset.status === "MAINTENANCE"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )} */}
    </>
  )
}

export default BasicInfoTab
