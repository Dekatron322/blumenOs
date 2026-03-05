"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Download, Loader2, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { clearExportScheduleRunARStatus, exportScheduleRunAR } from "lib/redux/postpaidSlice"
import { fetchAreaOffices, fetchDistributionSubstations, fetchFeeders } from "lib/redux/formDataSlice"
import { ButtonModule } from "components/ui/Button/Button"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"

interface ExportScheduleRunARModalProps {
  isOpen: boolean
  onClose: () => void
  runId: number
  /** Pre-fill area office from the run */
  defaultAreaOfficeId?: number
  /** Pre-fill feeder from the run */
  defaultFeederId?: number
  /** Pre-fill distribution substation from the run */
  defaultDistributionSubstationId?: number
}

const ExportScheduleRunARModal: React.FC<ExportScheduleRunARModalProps> = ({
  isOpen,
  onClose,
  runId,
  defaultAreaOfficeId,
  defaultFeederId,
  defaultDistributionSubstationId,
}) => {
  const dispatch = useAppDispatch()

  const {
    exportScheduleRunARLoading,
    exportScheduleRunARError,
    exportScheduleRunARSuccess,
    exportScheduleRunARMessage,
  } = useAppSelector((state: any) => state.postpaidBilling)

  const { areaOffices, areaOfficesLoading } = useAppSelector((state: any) => state.formData)
  const { feeders, feedersLoading } = useAppSelector((state: any) => state.formData)
  const { distributionSubstations, distributionSubstationsLoading } = useAppSelector((state: any) => state.formData)

  // Form state
  const [selectedAreaOffice, setSelectedAreaOffice] = useState("")
  const [selectedFeeder, setSelectedFeeder] = useState("")
  const [selectedDistributionSubstation, setSelectedDistributionSubstation] = useState("")
  const [selectedStatusCode, setSelectedStatusCode] = useState("")
  const [isScoped, setIsScoped] = useState(true)

  // Search states
  const [areaOfficeSearch, setAreaOfficeSearch] = useState("")
  const [feederSearch, setFeederSearch] = useState("")
  const [distributionSubstationSearch, setDistributionSubstationSearch] = useState("")

  // Fetch dropdown data when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100 }))
      dispatch(fetchFeeders({ PageNumber: 1, PageSize: 100 }))
      dispatch(fetchDistributionSubstations({ PageNumber: 1, PageSize: 100 }))

      // Pre-fill defaults
      setSelectedAreaOffice(defaultAreaOfficeId ? defaultAreaOfficeId.toString() : "")
      setSelectedFeeder(defaultFeederId ? defaultFeederId.toString() : "")
      setSelectedDistributionSubstation(
        defaultDistributionSubstationId ? defaultDistributionSubstationId.toString() : ""
      )
      setSelectedStatusCode("")
      setIsScoped(true)
    }
  }, [isOpen, dispatch, defaultAreaOfficeId, defaultFeederId, defaultDistributionSubstationId])

  // Handle success
  useEffect(() => {
    if (exportScheduleRunARSuccess) {
      onClose()
      dispatch(clearExportScheduleRunARStatus())
    }
  }, [exportScheduleRunARSuccess, onClose, dispatch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearExportScheduleRunARStatus())
    }
  }, [dispatch])

  // Search handlers
  const handleAreaOfficeSearchChange = (searchValue: string) => {
    setAreaOfficeSearch(searchValue)
  }
  const handleAreaOfficeSearchClick = () => {
    dispatch(fetchAreaOffices({ PageNumber: 1, PageSize: 100, Search: areaOfficeSearch }))
  }

  const handleFeederSearchChange = (searchValue: string) => {
    setFeederSearch(searchValue)
  }
  const handleFeederSearchClick = () => {
    dispatch(fetchFeeders({ PageNumber: 1, PageSize: 100, Search: feederSearch }))
  }

  const handleDistributionSubstationSearchChange = (searchValue: string) => {
    setDistributionSubstationSearch(searchValue)
  }
  const handleDistributionSubstationSearchClick = () => {
    dispatch(fetchDistributionSubstations({ PageNumber: 1, PageSize: 100, Search: distributionSubstationSearch }))
  }

  const handleExport = () => {
    dispatch(
      exportScheduleRunAR({
        runId,
        isScoped,
        ...(selectedStatusCode && { statusCode: selectedStatusCode }),
        ...(selectedAreaOffice && { areaOfficeId: parseInt(selectedAreaOffice) }),
        ...(selectedFeeder && { feederId: parseInt(selectedFeeder) }),
        ...(selectedDistributionSubstation && {
          distributionSubstationId: parseInt(selectedDistributionSubstation),
        }),
      })
    )
  }

  const handleClose = () => {
    if (!exportScheduleRunARLoading) {
      dispatch(clearExportScheduleRunARStatus())
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="w-full max-w-lg rounded-lg bg-white shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Export AR Report</h3>
            <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100">
              <X className="size-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {/* Is Scoped */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isScoped"
                checked={isScoped}
                onChange={(e) => setIsScoped(e.target.checked)}
                className="size-4 rounded border-gray-300 text-[#004B23] focus:ring-[#004B23]"
              />
              <label htmlFor="isScoped" className="ml-2 block text-sm text-gray-700">
                Scoped Export
              </label>
            </div>

            {/* Area Office - Optional */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Area Office</label>
              <FormSelectModule
                name="areaOffice"
                value={selectedAreaOffice}
                onChange={(e) => setSelectedAreaOffice(e.target.value)}
                searchable={true}
                searchTerm={areaOfficeSearch}
                onSearchChange={handleAreaOfficeSearchChange}
                onSearchClick={handleAreaOfficeSearchClick}
                loading={areaOfficesLoading}
                options={
                  areaOffices?.map((office: any) => ({
                    value: office.id.toString(),
                    label: office.name,
                  })) || []
                }
              />
            </div>

            {/* Feeder - Optional */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Feeder</label>
              <FormSelectModule
                name="feeder"
                value={selectedFeeder}
                onChange={(e) => setSelectedFeeder(e.target.value)}
                searchable={true}
                searchTerm={feederSearch}
                onSearchChange={handleFeederSearchChange}
                onSearchClick={handleFeederSearchClick}
                loading={feedersLoading}
                options={
                  feeders?.map((feeder: any) => ({
                    value: feeder.id.toString(),
                    label: feeder.name,
                  })) || []
                }
              />
            </div>

            {/* Distribution Substation - Optional */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Distribution Substation</label>
              <FormSelectModule
                name="distributionSubstation"
                value={selectedDistributionSubstation}
                onChange={(e) => setSelectedDistributionSubstation(e.target.value)}
                searchable={true}
                searchTerm={distributionSubstationSearch}
                onSearchChange={handleDistributionSubstationSearchChange}
                onSearchClick={handleDistributionSubstationSearchClick}
                loading={distributionSubstationsLoading}
                options={
                  distributionSubstations?.map((substation: any) => ({
                    value: substation.id.toString(),
                    label: substation.name?.toString() || substation.dssCode || `Substation ${substation.id}`,
                  })) || []
                }
              />
            </div>

            {/* Status Code - Optional */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Status Code</label>
              <FormSelectModule
                name="statusCode"
                value={selectedStatusCode}
                onChange={(e) => setSelectedStatusCode(e.target.value)}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "Draft", label: "Draft" },
                  { value: "Finalized", label: "Finalized" },
                  { value: "Published", label: "Published" },
                ]}
              />
            </div>

            {/* Error Message */}
            {exportScheduleRunARError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{exportScheduleRunARError}</div>
            )}

            {/* Success Message */}
            {exportScheduleRunARSuccess && exportScheduleRunARMessage && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{exportScheduleRunARMessage}</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <ButtonModule
              variant="outline"
              size="md"
              onClick={handleClose}
              disabled={exportScheduleRunARLoading}
              className="flex-1"
            >
              Cancel
            </ButtonModule>
            <ButtonModule
              variant="primary"
              size="md"
              onClick={handleExport}
              disabled={exportScheduleRunARLoading}
              className="flex-1"
              icon={exportScheduleRunARLoading ? <Loader2 className="animate-spin" /> : <Download />}
            >
              {exportScheduleRunARLoading ? "Exporting..." : "Export AR"}
            </ButtonModule>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ExportScheduleRunARModal
