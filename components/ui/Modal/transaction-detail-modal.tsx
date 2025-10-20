// components/ui/Modal/transaction-detail-modal.tsx
"use client"

import React, { useRef } from "react"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import PdfFile from "public/pdf-file"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { format } from "date-fns"

interface Status {
  toLowerCase(): string
  value: number
  label: string
}

interface Currency {
  id: number
  name: string
  symbol: string
  ticker: string
  avatar: string
}

interface TransactionUser {
  id: number
  tag: string
  firstName: string | null
  lastName: string | null
  photo: string | null
  isVerified: boolean
}

interface TransactionSenderReceiver {
  sender?: string
  bankName?: string
  accountNumber?: string
  sessionId?: string | null
  bankCode?: string
  tag?: string
  reciever?: string
}

interface TransactionType {
  label: string
  value: number
}

interface Transaction {
  id: number
  createdAt: string
  userId: number
  walletId: number
  amount: number
  fee: number
  status: Status
  type: TransactionType
  comment: string
  channel: string
  reference: string
  currency: Currency
  utility: any
  user: TransactionUser
  vasPayload: any
  sender: TransactionSenderReceiver | null
  reciever: TransactionSenderReceiver | null
}

interface TransactionDetailModalProps {
  isOpen: boolean
  transaction: Transaction | null
  onRequestClose: () => void
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ isOpen, transaction, onRequestClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!modalRef.current) return

    try {
      const canvas = await html2canvas(modalRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`Transaction_${transaction?.reference}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusStyle = (status: Status) => {
    const statusValue = status?.label?.toLowerCase() || status?.toLowerCase()

    switch (statusValue) {
      case "completed":
      case "active":
      case "approved":
      case "success":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "pending":
      case "processing":
        return { backgroundColor: "#F7F2E9", color: "#E6A441" }
      case "failed":
      case "inactive":
      case "rejected":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return { backgroundColor: "#EDF0F4", color: "#202B3C" }
    }
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy hh:mm a")
  }

  const formatCurrency = (amount: number, currencyTicker: string) => {
    if (currencyTicker === "NGN") {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount)
    }
    return `${currencyTicker} ${amount} `
  }

  if (!isOpen || !transaction) return null

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-auto w-[481px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div ref={modalRef} className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#E9F0FF] p-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#003F9F] font-semibold text-white">
              T
            </div>
            <p className="text-xl font-semibold text-[#2a2f4b]">Transaction Details</p>
          </div>
          <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
            <MdClose size={24} />
          </button>
        </div>

        {/* Top summary */}
        <div className="flex w-full flex-col items-center justify-center bg-gray-50 p-4">
          <p className="text-sm text-gray-800">
            <span className="font-bold">{formatCurrency(transaction.amount, transaction.currency.ticker)}</span>{" "}
            {transaction.type?.label?.toLowerCase() || "transaction"}
          </p>
          <p className="mt-1 text-sm text-gray-500">{formatDateTime(transaction.createdAt)}</p>
          <div
            style={getStatusStyle(transaction.status)}
            className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium capitalize"
          >
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  transaction.status?.value === 2 ? "#589E67" : transaction.status?.value === 1 ? "#E6A441" : "#AF4B4B",
              }}
            ></span>
            {transaction.status?.label || "Unknown"}
          </div>
        </div>

        {/* Detailed fields */}
        <div className="space-y-4 p-6">
          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Transaction ID:</p>
            <p className="text-gray-800">{transaction.reference}</p>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Type:</p>
            <p className="capitalize text-gray-800">{transaction.type?.label || "N/A"}</p>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Amount:</p>
            <p className="text-gray-800">{formatCurrency(transaction.amount, transaction.currency.ticker)}</p>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Fee:</p>
            <p className="text-gray-800">{formatCurrency(transaction.fee, transaction.currency.ticker)}</p>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Net Amount:</p>
            <p className="text-gray-800">
              {formatCurrency(transaction.amount - transaction.fee, transaction.currency.ticker)}
            </p>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Currency:</p>
            <p className="text-gray-800">{transaction.currency.ticker}</p>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Status:</p>
            <div
              style={getStatusStyle(transaction.status)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium capitalize"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    transaction.status?.value === 2
                      ? "#589E67"
                      : transaction.status?.value === 1
                      ? "#E6A441"
                      : "#AF4B4B",
                }}
              ></span>
              {transaction.status?.label || "Unknown"}
            </div>
          </div>

          <div className="flex w-full justify-between text-sm">
            <p className="font-medium text-gray-600">Date:</p>
            <p className="text-gray-800">{formatDateTime(transaction.createdAt)}</p>
          </div>

          {transaction.comment && (
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Comment:</p>
              <p className="text-gray-800">{transaction.comment}</p>
            </div>
          )}

          {transaction.channel && (
            <div className="flex w-full justify-between text-sm">
              <p className="font-medium text-gray-600">Channel:</p>
              <p className="text-gray-800">{transaction.channel}</p>
            </div>
          )}

          {transaction.sender && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 font-medium text-gray-600">Sender Details:</h4>
              {transaction.sender.tag && (
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Tag:</span>
                  <span className="text-gray-800">{transaction.sender.tag}</span>
                </div>
              )}
              {transaction.sender.bankName && (
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Bank:</span>
                  <span className="text-gray-800">{transaction.sender.bankName}</span>
                </div>
              )}
              {transaction.sender.accountNumber && (
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Account:</span>
                  <span className="text-gray-800">{transaction.sender.accountNumber}</span>
                </div>
              )}
            </div>
          )}

          {transaction.reciever && (
            <div className="mt-4 border-t pt-4">
              <h4 className="mb-2 font-medium text-gray-600">Receiver Details:</h4>
              {transaction.reciever.tag && (
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Tag:</span>
                  <span className="text-gray-800">{transaction.reciever.tag}</span>
                </div>
              )}
              {transaction.reciever.bankName && (
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Bank:</span>
                  <span className="text-gray-800">{transaction.reciever.bankName}</span>
                </div>
              )}
              {transaction.reciever.accountNumber && (
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-600">Account:</span>
                  <span className="text-gray-800">{transaction.reciever.accountNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions: Download PDF + Print */}
          <div className="mt-8 flex justify-between">
            <ButtonModule
              variant="outline"
              size="md"
              icon={<PdfFile />}
              iconPosition="start"
              onClick={handleDownloadPDF}
              className="border-gray-300 hover:bg-gray-50"
            >
              Download Pdf
            </ButtonModule>
            <ButtonModule
              variant="outline"
              size="md"
              icon={<PdfFile />}
              iconPosition="start"
              onClick={handlePrint}
              className="border-gray-300 hover:bg-gray-50"
            >
              Print
            </ButtonModule>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TransactionDetailModal
