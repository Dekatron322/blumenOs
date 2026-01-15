"use client"

import React from "react"
import RecordDebtModal from "components/ui/Modal/record-debt-modal"

export default function AddDebtPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(true)

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Redirect back to debt management overview after closing
    window.location.href = "/dm/overview"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <RecordDebtModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        customerId={0}
        customerName=""
        accountNumber=""
      />
    </div>
  )
}
