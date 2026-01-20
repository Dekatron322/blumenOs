"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { assignCashiers, clearAssignCashiers, fetchAgents } from "lib/redux/agentSlice"
import { notify } from "components/ui/Notification/Notification"
import { Check, Loader2, Search, Users } from "lucide-react"

interface AssignCashierModalProps {
  isOpen: boolean
  onRequestClose: () => void
  agentId: number
  agentName: string
  onSuccess?: () => void
}

const AssignCashierModal: React.FC<AssignCashierModalProps> = ({
  isOpen,
  onRequestClose,
  agentId,
  agentName,
  onSuccess,
}) => {
  const dispatch = useAppDispatch()
  const { agents, loading, assignCashiersLoading, assignCashiersSuccess, assignCashiersError } = useAppSelector(
    (state) => state.agents
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCashierIds, setSelectedCashierIds] = useState<number[]>([])

  // Filter agents to only show Cashiers/SalesReps that are NOT already assigned to this clearing cashier
  const availableCashiers = agents.filter(
    (agent) =>
      (agent.agentType === "Cashier" || agent.agentType === "SalesRep") &&
      agent.id !== agentId &&
      agent.status === "ACTIVE" &&
      agent.managerAgentId !== agentId // Exclude already assigned agents
  )

  // Filter by search term
  const filteredCashiers = availableCashiers.filter(
    (cashier) =>
      cashier.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cashier.agentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cashier.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch cashiers and salesreps when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fetch all agents - we'll filter by type and status on the client side
      dispatch(
        fetchAgents({
          pageNumber: 1,
          pageSize: 200,
        })
      )
      setSelectedCashierIds([])
      setSearchTerm("")
    }
  }, [isOpen, dispatch])

  // Handle success/error states
  useEffect(() => {
    if (assignCashiersSuccess) {
      notify("success", "Cashiers assigned successfully")
      dispatch(clearAssignCashiers())
      onRequestClose()
      if (onSuccess) onSuccess()
    }
    if (assignCashiersError) {
      notify("error", assignCashiersError)
      dispatch(clearAssignCashiers())
    }
  }, [assignCashiersSuccess, assignCashiersError, dispatch, onRequestClose, onSuccess])

  const handleToggleCashier = (cashierId: number) => {
    setSelectedCashierIds((prev) =>
      prev.includes(cashierId) ? prev.filter((id) => id !== cashierId) : [...prev, cashierId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCashierIds.length === filteredCashiers.length) {
      setSelectedCashierIds([])
    } else {
      setSelectedCashierIds(filteredCashiers.map((c) => c.id))
    }
  }

  const handleSubmit = async () => {
    if (selectedCashierIds.length === 0) {
      notify("error", "Please select at least one cashier")
      return
    }

    dispatch(
      assignCashiers({
        id: agentId,
        cashierIds: selectedCashierIds,
      })
    )
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex w-full items-center justify-between bg-[#F3F4F6] p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Cashiers</h2>
            <p className="mt-1 text-sm text-gray-600">
              Assign cashiers to <span className="font-medium">{agentName}</span>
            </p>
          </div>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cashiers by name, code, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cashiers List */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-blue-500" />
              <p className="mt-2 text-sm text-gray-500">Loading cashiers...</p>
            </div>
          ) : filteredCashiers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="size-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">
                {searchTerm ? "No cashiers found matching your search" : "No available cashiers found"}
              </p>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-600">
                  {selectedCashierIds.length} of {filteredCashiers.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {selectedCashierIds.length === filteredCashiers.length ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Cashier Items */}
              <div className="space-y-2">
                {filteredCashiers.map((cashier) => (
                  <div
                    key={cashier.id}
                    onClick={() => handleToggleCashier(cashier.id)}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${
                      selectedCashierIds.includes(cashier.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
                        selectedCashierIds.includes(cashier.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedCashierIds.includes(cashier.id) && <Check className="size-3 text-white" />}
                    </div>

                    {/* Avatar */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                      {cashier.user.fullName.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{cashier.user.fullName}</p>
                      <p className="truncate text-sm text-gray-500">
                        {cashier.agentCode} • {cashier.user.email}
                      </p>
                    </div>

                    {/* Area Office */}
                    <div className="hidden text-right sm:block">
                      <p className="text-sm text-gray-500">{cashier.areaOfficeName || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 p-4">
          <ButtonModule variant="secondary" onClick={onRequestClose} disabled={assignCashiersLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedCashierIds.length === 0 || assignCashiersLoading}
          >
            {assignCashiersLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Users className="mr-2 size-4" />
                Assign {selectedCashierIds.length > 0 ? `(${selectedCashierIds.length})` : ""}
              </>
            )}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AssignCashierModal
