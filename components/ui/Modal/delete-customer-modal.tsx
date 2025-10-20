"use client"

import React, { useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "../Button/Button"
import { useRouter } from "next/navigation"

interface DeleteCustomerModalProps {
  isOpen: boolean
  onRequestClose: () => void
  customerId: number
  customerName: string
  onDeleteSuccess?: () => void // Optional callback for parent component
}

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  isOpen,
  onRequestClose,
  customerId,
  customerName,
  onDeleteSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful deletion
      console.log(`Customer ${customerId} deleted successfully`)

      // Remove from localStorage if exists
      localStorage.removeItem("selectedCustomer")

      // Call optional success callback
      if (onDeleteSuccess) {
        onDeleteSuccess()
      }

      // Close modal
      onRequestClose()

      // Redirect to customers list
      router.push("/customers")
    } catch (err) {
      setError("Failed to delete customer. Please try again.")
      console.error("Error deleting customer:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[350px] max-w-md overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-hidden flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Suspend User</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>
      <div className="px-4 pb-6">
        <p className="my-4 text-sm">
          Are you sure you want to permanently suspend <span className="font-semibold">{customerName}</span>? This
          action cannot be undone.
        </p>

        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

        <div className="flex w-full justify-end gap-4">
          <ButtonModule className="w-full" variant="danger" size="lg" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 size-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Suspending...
              </div>
            ) : (
              "Suspend User"
            )}
          </ButtonModule>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteCustomerModal
