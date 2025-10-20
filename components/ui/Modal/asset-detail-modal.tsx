"use client"

import React, { useRef } from "react"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"
import { ButtonModule } from "components/ui/Button/Button"
import PdfFile from "public/pdf-file"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

interface CryptoAsset {
  symbol: string
  name: string
  amount: number
  valueUSD: number
  allocation: number
  price: number
  change24h: number
}

interface AssetActivity {
  id: string
  date: string
  type: "buy" | "sell" | "transfer" | "deposit" | "withdrawal"
  amount: number
  valueUSD: number
  status: "completed" | "pending" | "failed"
}

interface AssetDetailModalProps {
  isOpen: boolean
  asset: CryptoAsset | null
  onRequestClose: () => void
}

const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ isOpen, asset, onRequestClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Sample asset activities data
  const assetActivities: AssetActivity[] = [
    {
      id: "ACT001",
      date: "2023-06-15T10:30:00Z",
      type: "buy",
      amount: 0.1,
      valueUSD: 3000,
      status: "completed",
    },
    {
      id: "ACT002",
      date: "2023-06-16T14:45:00Z",
      type: "deposit",
      amount: 0.4,
      valueUSD: 12000,
      status: "completed",
    },
    {
      id: "ACT003",
      date: "2023-06-18T09:15:00Z",
      type: "sell",
      amount: 0.05,
      valueUSD: 1500,
      status: "pending",
    },
  ]

  // Download a PDF of the modal's contents
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
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
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

      pdf.save(`Asset_${asset?.symbol}_Details.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  // Trigger window.print() to print the current modal view
  const handlePrint = () => {
    window.print()
  }

  // Return a style object (background, color, etc.) based on status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "pending":
        return {
          backgroundColor: "#FBF4EC",
          color: "#D28E3D",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      case "failed":
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
      default:
        return {
          backgroundColor: "#EDF2FE",
          color: "#4976F4",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen || !asset) return null

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-lg outline-none transition-all duration-300 ease-in-out max-sm:w-full"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      ariaHideApp={false}
    >
      <div ref={modalRef} className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#E9F0FF] p-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#003F9F] font-semibold text-white">
              {asset.symbol.charAt(0)}
            </div>
            <p className="text-xl font-semibold text-[#2a2f4b]">{asset.name} Details</p>
          </div>
          <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
            <MdClose size={24} />
          </button>
        </div>

        {/* Asset Summary */}
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-md bg-[#EDF0F4] text-lg font-semibold">
              {asset.symbol}
            </div>
            <div>
              <h2 className="text-lg font-bold">{asset.name}</h2>
              <p className="text-gray-500">{asset.symbol}</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-semibold">{asset.amount}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Value (USD)</p>
              <p className="text-lg font-semibold">${asset.valueUSD.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-lg font-semibold">${asset.price.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">24h Change</p>
              <p className={`text-lg font-semibold ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {asset.change24h >= 0 ? "+" : ""}
                {asset.change24h}%
              </p>
            </div>
          </div>

          {/* Asset Activities */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Recent Activities</h3>
            <div className="space-y-3">
              {assetActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b p-3">
                  <div>
                    <p className="font-medium capitalize">{activity.type}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(activity.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {activity.amount} {asset.symbol}
                    </p>
                    <p className="text-sm">${activity.valueUSD.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
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

export default AssetDetailModal
