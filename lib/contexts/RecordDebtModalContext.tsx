"use client"

import React, { createContext, ReactNode, useContext, useState } from "react"

interface RecordDebtModalContextType {
  isOpen: boolean
  openModal: (customerId?: number, customerName?: string, accountNumber?: string) => void
  closeModal: () => void
  customerId: number
  customerName: string
  accountNumber: string
}

const RecordDebtModalContext = createContext<RecordDebtModalContextType | undefined>(undefined)

export function RecordDebtModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [customerId, setCustomerId] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  const openModal = (newCustomerId?: number, newCustomerName?: string, newAccountNumber?: string) => {
    setCustomerId(newCustomerId || 0)
    setCustomerName(newCustomerName || "")
    setAccountNumber(newAccountNumber || "")
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setCustomerId(0)
    setCustomerName("")
    setAccountNumber("")
  }

  return (
    <RecordDebtModalContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        customerId,
        customerName,
        accountNumber,
      }}
    >
      {children}
    </RecordDebtModalContext.Provider>
  )
}

export function useRecordDebtModal() {
  const context = useContext(RecordDebtModalContext)
  if (context === undefined) {
    throw new Error("useRecordDebtModal must be used within a RecordDebtModalProvider")
  }
  return context
}
