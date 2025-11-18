"use client"
import React from "react"
import { motion } from "framer-motion"
import { User, Phone, MapPin, Mail } from "lucide-react"
import { CalendarOutlineIcon, MapOutlineIcon, MeteringOutlineIcon, MeterOutlineIcon } from "components/Icons/Icons"

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

interface BasicInfoTabProps {
  currentCustomer: any
  assets: Asset[]
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ currentCustomer, assets, formatCurrency, formatDate }) => {
  return (
    <>
      {/* Account Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <User className="size-5" />
          Account Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Account Number</label>
              <p className="font-semibold text-gray-900">{currentCustomer.accountNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Customer Type</label>
              <p className="font-semibold text-gray-900">{currentCustomer.isPPM ? "PREPAID" : "POSTPAID"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tariff Class</label>
              <p className="font-semibold text-gray-900">{currentCustomer.band}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Meter Number</label>
              <p className="font-semibold text-gray-900">{currentCustomer.meterNumber || "Not assigned"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Stored Average</label>
              <p className="font-semibold text-gray-900">{currentCustomer.storedAverage} kWh</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tariff</label>
              <p className="font-semibold text-gray-900">{currentCustomer.tariff}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Area Office</label>
              <p className="font-semibold text-gray-900">{currentCustomer.areaOfficeName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Service Center</label>
              <p className="font-semibold text-gray-900">{currentCustomer.serviceCenterName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Company</label>
              <p className="font-semibold text-gray-900">{currentCustomer.companyName}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact & Location */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MapOutlineIcon className="size-5" />
          Contact & Location
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                <Phone className="size-5 text-blue-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone Number</label>
                <p className="font-semibold text-gray-900">{currentCustomer.phoneNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                  <MapPin className="size-5 text-purple-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Address</label>
                  <p className="font-semibold text-gray-900">
                    {currentCustomer.address}
                    {currentCustomer.addressTwo && `, ${currentCustomer.addressTwo}`}
                    {currentCustomer.city && `, ${currentCustomer.city}`}
                    {currentCustomer.state && `, ${currentCustomer.state}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                <Mail className="size-5 text-green-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email Address</label>
                <p className="font-semibold text-gray-900">{currentCustomer.email}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full">
        <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
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

      {/* Distribution Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MeterOutlineIcon className="size-5" />
          Distribution Information
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Distribution Substation</label>
              <p className="font-semibold text-gray-900">{currentCustomer.distributionSubstationCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Feeder Name</label>
              <p className="font-semibold text-gray-900">{currentCustomer.feederName}</p>
            </div>
          </div>
          <div className="space-y-4">
            {currentCustomer.salesRepUser && (
              <div>
                <label className="text-sm font-medium text-gray-600">Sales Representative</label>
                <p className="font-semibold text-gray-900">{currentCustomer.salesRepUser.fullName}</p>
                <p className="text-sm text-gray-600">{currentCustomer.salesRepUser.email}</p>
              </div>
            )}
            {currentCustomer.technicalEngineerUser && (
              <div>
                <label className="text-sm font-medium text-gray-600">Technical Engineer</label>
                <p className="font-semibold text-gray-900">{currentCustomer.technicalEngineerUser.fullName}</p>
                <p className="text-sm text-gray-600">{currentCustomer.technicalEngineerUser.email}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Assets & Equipment */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
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

      {/* Meter Information */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MeteringOutlineIcon className="size-5" />
          Meter Information
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                <MeterOutlineIcon className="size-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{currentCustomer.meterNumber || "No meter assigned"}</h4>
                <p className="text-sm text-gray-600">
                  {currentCustomer.isPPM ? "Prepaid" : "Postpaid"} Meter • {currentCustomer.band} Band
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{currentCustomer.isPPM ? "Prepaid" : "Postpaid"}</div>
              <div className="text-xs text-gray-600">{currentCustomer.isMD ? "MD Customer" : "Standard Customer"}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Timeline */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CalendarOutlineIcon className="size-5" />
          Account Timeline
        </h3>
        <div className="space-y-4">
          {currentCustomer.lastLoginAt && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                  <CalendarOutlineIcon className="size-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Last Login</h4>
                  <p className="text-sm text-gray-600">Customer last accessed their account</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formatDate(currentCustomer.lastLoginAt)}</div>
              </div>
            </div>
          )}
          {currentCustomer.isSuspended && currentCustomer.suspendedAt && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                  <CalendarOutlineIcon className="size-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Account Suspended</h4>
                  <p className="text-sm text-gray-600">{currentCustomer.suspensionReason || "No reason provided"}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{formatDate(currentCustomer.suspendedAt)}</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                <CalendarOutlineIcon className="size-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Account Created</h4>
                <p className="text-sm text-gray-600">Customer account was successfully created</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {currentCustomer.createdAt ? formatDate(currentCustomer.createdAt) : "Unknown"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default BasicInfoTab
