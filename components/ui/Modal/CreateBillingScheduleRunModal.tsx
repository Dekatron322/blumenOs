"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { CreateBillingScheduleRunRequest } from "lib/redux/fileManagementSlice"

interface CreateBillingScheduleRunModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  formData: CreateBillingScheduleRunRequest
  onFormDataChange: (data: CreateBillingScheduleRunRequest) => void
  scheduleType: string
  loading?: boolean
  billingPeriods?: any[]
  billingPeriodsLoading?: boolean
  feeders?: any[]
  feedersLoading?: boolean
  areaOffices?: any[]
  areaOfficesLoading?: boolean
  distributionSubstations?: any[]
  distributionSubstationsLoading?: boolean
}

export const CreateBillingScheduleRunModal: React.FC<CreateBillingScheduleRunModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormDataChange,
  scheduleType,
  loading = false,
  billingPeriods = [],
  billingPeriodsLoading = false,
  feeders = [],
  feedersLoading = false,
  areaOffices = [],
  areaOfficesLoading = false,
  distributionSubstations = [],
  distributionSubstationsLoading = false,
}) => {
  const router = useRouter()

  const handleInputChange = (field: keyof CreateBillingScheduleRunRequest, value: any) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  const handleCancel = () => {
    onClose()
    router.push("/billing/generate")
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="mx-4 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Create Billing Schedule Run</h2>
                <button
                  onClick={handleCancel}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title Field - Common for all types */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter run title"
                  />
                </div>

                {/* Billing Period Field - Common for all types */}
                <div>
                  <FormSelectModule
                    label="Billing Period"
                    name="billingPeriodId"
                    value={formData.billingPeriodId}
                    onChange={(e) => handleInputChange("billingPeriodId", parseInt(e.target.value) || 0)}
                    options={
                      billingPeriods?.map((period: any) => ({
                        value: period.id,
                        label: period.displayName,
                      })) || []
                    }
                    loading={billingPeriodsLoading}
                    disabled={billingPeriodsLoading}
                    required
                  />
                </div>

                {/* Conditional Fields Based on Schedule Type */}
                {scheduleType === "Feeder" && (
                  <div>
                    <FormSelectModule
                      label="Feeder"
                      name="feederId"
                      value={formData.feederId}
                      onChange={(e) => handleInputChange("feederId", parseInt(e.target.value) || 0)}
                      options={
                        feeders?.map((feeder: any) => ({
                          value: feeder.id,
                          label: `${feeder.name} (${feeder.nercCode})`,
                        })) || []
                      }
                      loading={feedersLoading}
                      disabled={feedersLoading}
                      required
                    />
                  </div>
                )}

                {scheduleType === "AreaOffice" && (
                  <div>
                    <FormSelectModule
                      label="Area Office"
                      name="areaOfficeId"
                      value={formData.areaOfficeId}
                      onChange={(e) => handleInputChange("areaOfficeId", parseInt(e.target.value) || 0)}
                      options={
                        areaOffices?.map((office: any) => ({
                          value: office.id,
                          label: `${office.nameOfNewOAreaffice} (${office.newKaedcoCode})`,
                        })) || []
                      }
                      loading={areaOfficesLoading}
                      disabled={areaOfficesLoading}
                      required
                    />
                  </div>
                )}

                {scheduleType === "Distribution Substation" && (
                  <div>
                    <FormSelectModule
                      label="Distribution Substation"
                      name="distributionSubstationId"
                      value={formData.distributionSubstationId}
                      onChange={(e) => handleInputChange("distributionSubstationId", parseInt(e.target.value) || 0)}
                      options={
                        distributionSubstations?.map((dss: any) => ({
                          value: dss.id,
                          label: `${dss.dssCode} (${dss.nercCode})`,
                        })) || []
                      }
                      loading={distributionSubstationsLoading}
                      disabled={distributionSubstationsLoading}
                      required
                    />
                  </div>
                )}

                {/* For Custom MD, Non-MD, MD Private, MD Public - no additional fields */}
              </div>

              <div className="flex gap-3 pt-4">
                <ButtonModule className="flex-1" variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancel
                </ButtonModule>
                <ButtonModule className="flex-1" onClick={onSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Create Run"}
                </ButtonModule>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
