"use client"

import React from "react"
import RecordDebtModal from "components/ui/Modal/record-debt-modal"
import { useRecordDebtModal } from "lib/contexts/RecordDebtModalContext"

export default function GlobalRecordDebtModal() {
  const { isOpen, closeModal, customerId, customerName, accountNumber } = useRecordDebtModal()

  return (
    <RecordDebtModal
      isOpen={isOpen}
      onRequestClose={closeModal}
      customerId={customerId}
      customerName={customerName}
      accountNumber={accountNumber}
    />
  )
}
