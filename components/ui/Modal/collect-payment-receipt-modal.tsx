"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface TokenData {
  token: string
  tokenDec?: string
  vendedAmount: string
  unit: string
  description: string
  drn: string
}

interface CollectPaymentReceiptModalProps {
  isOpen: boolean
  onRequestClose: () => void
  tokenData?: TokenData | TokenData[] | null
  paymentData: {
    reference: string
    customerName: string
    customerAccountNumber: string
    customerAddress?: string
    customerPhoneNumber?: string
    customerMeterNumber?: string
    accountType?: string
    tariffRate?: number
    units?: number
    vatRate?: number
    vatAmount?: number
    electricityAmount?: number
    outstandingDebt?: number
    debtPayable?: number
    totalAmountPaid: number
    currency: string
    channel: string
    status?: string
    paymentTypeName?: string
    paidAtUtc: string
    externalReference?: string
    shouldUpgrade?: boolean
    tokens?: TokenData[]
    upgrade?: {
      message: string
      keyChangeTokens: TokenData[]
      creditToken: TokenData
    }
    receipt?: {
      tokens: TokenData[]
    }
  } | null
}

const CollectPaymentReceiptModal: React.FC<CollectPaymentReceiptModalProps> = ({
  isOpen,
  onRequestClose,
  tokenData,
  paymentData,
}) => {
  const [isCopyingAll, setIsCopyingAll] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCopyToken = async (token: string, tokenDec: string) => {
    try {
      await navigator.clipboard.writeText(tokenDec)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (error) {
      console.error("Failed to copy token:", error)
    }
  }

  const getTokens = (): TokenData[] => {
    // Handle upgrade case - check if paymentData has tokens array directly
    if (paymentData?.shouldUpgrade && paymentData?.tokens && Array.isArray(paymentData.tokens)) {
      return paymentData.tokens
    }
    // Handle upgrade case with nested receipt structure
    if (paymentData?.shouldUpgrade && paymentData?.receipt?.tokens) {
      return paymentData.receipt.tokens
    }
    // Handle array tokenData
    if (Array.isArray(tokenData)) {
      return tokenData
    }
    // Handle single tokenData
    if (tokenData) {
      return [tokenData]
    }
    return []
  }

  const handlePrint = () => {
    if (!paymentData) return

    // Create thermal printer optimized receipt (58mm/80mm width)
    const thermalReceiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            padding: 5mm;
            background: white;
            color: black;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          .double-divider {
            border-top: 2px solid #000;
            margin: 8px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
          }
          .row-label { text-align: left; }
          .row-value { text-align: right; font-weight: bold; }
          .header { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .subheader { font-size: 10px; margin-bottom: 10px; }
          .amount-large { font-size: 18px; font-weight: bold; }
          .footer { font-size: 10px; margin-top: 10px; }
          .stamp { 
            font-size: 20px; 
            font-weight: bold; 
            border: 2px solid #000; 
            padding: 5px 15px; 
            display: inline-block;
            margin: 10px 0;
          }
          .logo {
            width: 35mm;
            max-width: 100%;
            height: auto;
            margin-bottom: 8px;
          }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <img src="${window.location.origin}/kadco.svg" alt="KADCO" class="logo" />
          <div class="divider"></div>
          <div class="bold">PAYMENT RECEIPT</div>
          <div class="stamp">PAID</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Ref:</span>
          <span class="row-value">${paymentData.reference}</span>
        </div>
        <div class="row">
          <span class="row-label">Date:</span>
          <span class="row-value">${formatDateTime(paymentData.paidAtUtc)}</span>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="center bold">CUSTOMER DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Name:</span>
          <span class="row-value">${paymentData.customerName}</span>
        </div>
        <div class="row">
          <span class="row-label">Account:</span>
          <span class="row-value">${paymentData.customerAccountNumber}</span>
        </div>
        ${
          paymentData.customerAddress
            ? `
        <div class="row">
          <span class="row-label">Address:</span>
          <span class="row-value" style="max-width: 60%; text-align: right;">${paymentData.customerAddress}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.customerMeterNumber
            ? `
        <div class="row">
          <span class="row-label">Meter:</span>
          <span class="row-value">${paymentData.customerMeterNumber}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.customerPhoneNumber
            ? `
        <div class="row">
          <span class="row-label">Phone:</span>
          <span class="row-value">${paymentData.customerPhoneNumber}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.accountType
            ? `
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${paymentData.accountType}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">PAYMENT DETAILS</div>
        <div class="divider"></div>
        
        <div class="row">
          <span class="row-label">Type:</span>
          <span class="row-value">${paymentData.paymentTypeName || "N/A"}</span>
        </div>
        <div class="row">
          <span class="row-label">Channel:</span>
          <span class="row-value">${paymentData.channel}</span>
        </div>
        <div class="row">
          <span class="row-label">Status:</span>
          <span class="row-value">${paymentData.status || "Confirmed"}</span>
        </div>
        ${
          paymentData.externalReference
            ? `
        <div class="row">
          <span class="row-label">Ext Ref:</span>
          <span class="row-value">${paymentData.externalReference}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center bold">BREAKDOWN</div>
        <div class="divider"></div>
        
        ${
          paymentData.electricityAmount
            ? `
        <div class="row">
          <span class="row-label">Electricity:</span>
          <span class="row-value">${formatCurrency(paymentData.electricityAmount, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.vatAmount
            ? `
        <div class="row">
          <span class="row-label">VAT:</span>
          <span class="row-value">${formatCurrency(paymentData.vatAmount, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.outstandingDebt
            ? `
        <div class="row">
          <span class="row-label">O/S Debt:</span>
          <span class="row-value">${formatCurrency(paymentData.outstandingDebt, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        ${
          paymentData.debtPayable
            ? `
        <div class="row">
          <span class="row-label">Debt Paid:</span>
          <span class="row-value">${formatCurrency(paymentData.debtPayable, paymentData.currency)}</span>
        </div>
        `
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center">
          <div class="bold">TOTAL PAID</div>
          <div class="amount-large">${formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}</div>
        </div>
        
        ${
          paymentData?.shouldUpgrade && paymentData?.tokens && Array.isArray(paymentData.tokens)
            ? `
        <div class="double-divider"></div>
        <div class="center bold">METER UPGRADE TOKENS</div>
        <div style="margin-bottom: 10px; font-size: 10px; text-align: center;">
          ${paymentData.upgrade?.message || "Enter these tokens in order to upgrade your meter"}
        </div>
        ${paymentData.tokens
          .map(
            (token, index) => `
        <div class="token-box" style="margin-bottom: 8px;">
          <div style="font-size: 10px; margin-bottom: 3px;">${token.description}</div>
          <div class="token-value">${token.token}</div>
          ${
            token.vendedAmount && token.unit
              ? `
          <div style="margin-top: 3px; font-size: 10px;">
            ${token.vendedAmount} ${token.unit}
          </div>
          `
              : ""
          }
          <div style="font-size: 10px;">Meter: ${token.drn}</div>
        </div>
        `
          )
          .join("")}
        `
            : paymentData?.shouldUpgrade && paymentData?.receipt?.tokens
            ? `
        <div class="double-divider"></div>
        <div class="center bold">METER UPGRADE TOKENS</div>
        <div style="margin-bottom: 10px; font-size: 10px; text-align: center;">
          ${paymentData.upgrade?.message || "Enter these tokens in order to upgrade your meter"}
        </div>
        ${paymentData.receipt.tokens
          .map(
            (token, index) => `
        <div class="token-box" style="margin-bottom: 8px;">
          <div style="font-size: 10px; margin-bottom: 3px;">${token.description}</div>
          <div class="token-value">${token.token}</div>
          ${
            token.vendedAmount && token.unit
              ? `
          <div style="margin-top: 3px; font-size: 10px;">
            ${token.vendedAmount} ${token.unit}
          </div>
          `
              : ""
          }
          <div style="font-size: 10px;">Meter: ${token.drn}</div>
        </div>
        `
          )
          .join("")}
        `
            : getTokens().length > 0
            ? getTokens()
                .map(
                  (token, index) => `
        <div class="double-divider"></div>
        <div class="center bold">TOKEN ${getTokens().length > 1 ? index + 1 : ""}</div>
        <div class="token-box">
          <div class="token-value">${token.token}</div>
          <div style="margin-top: 8px; font-size: 11px;">
            ${token.vendedAmount || ""} ${token.unit || ""}
          </div>
          ${token?.drn ? `<div style="font-size: 10px; margin-top: 4px;">Meter: ${token.drn}</div>` : ""}
        </div>
        `
                )
                .join("")
            : ""
        }
        
        <div class="double-divider"></div>
        
        <div class="center">
          <div class="bold">COPY ALL</div>
          <button class="token-box" style="margin-bottom: 8px;" onclick="handleCopyAll()">
            <div class="token-value">COPY ALL</div>
          </button>
        </div>
      </body>
      </html>
    `

    // Create a hidden iframe for printing without opening a new page
    const printFrame = document.createElement("iframe")
    printFrame.style.position = "absolute"
    printFrame.style.top = "-9999px"
    printFrame.style.left = "-9999px"
    printFrame.style.width = "0"
    printFrame.style.height = "0"
    printFrame.style.border = "none"
    document.body.appendChild(printFrame)

    const frameDoc = printFrame.contentWindow?.document
    if (frameDoc) {
      frameDoc.open()
      frameDoc.write(thermalReceiptContent)
      frameDoc.close()

      setTimeout(() => {
        printFrame.contentWindow?.focus()
        printFrame.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(printFrame)
        }, 500)
      }, 250)
    }
  }

  const handleDownloadPDF = async () => {
    if (!receiptRef.current || !paymentData) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#EFEFEF",
      })

      const imgData = canvas.toDataURL("image/png")

      // A5 format: 148 x 210 mm = 420 x 595 points at 72 DPI
      const pageWidth = 420
      const pageHeight = 595
      const margin = 20

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a5",
      })

      pdf.setFillColor(239, 239, 239) // #EFEFEF background
      pdf.rect(0, 0, pageWidth, pageHeight, "F")

      // Scale image to fit A5 page with margins
      const maxWidth = pageWidth - margin * 2
      const maxHeight = pageHeight - margin * 2
      const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height)
      const imgWidth = canvas.width * scale
      const imgHeight = canvas.height * scale
      const x = (pageWidth - imgWidth) / 2
      const y = margin

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)

      const fileName = `Payment-Receipt-${paymentData.customerAccountNumber}-${paymentData.reference}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const handleCopyAll = () => {
    if (!paymentData) return

    let text =
      `Payment Receipt\n` +
      `Reference: ${paymentData.reference}\n` +
      `Customer: ${paymentData.customerName}\n` +
      `Account Number: ${paymentData.customerAccountNumber}\n` +
      `Amount Paid: ${formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}\n` +
      `Payment Type: ${paymentData.paymentTypeName}\n` +
      `Payment Channel: ${paymentData.channel}\n` +
      `Status: ${paymentData.status}\n` +
      `Paid At: ${formatDateTime(paymentData.paidAtUtc)}\n` +
      (paymentData.customerMeterNumber ? `Meter Number: ${paymentData.customerMeterNumber}\n` : "") +
      (paymentData.customerAddress ? `Address: ${paymentData.customerAddress}\n` : "") +
      (paymentData.customerPhoneNumber ? `Phone: ${paymentData.customerPhoneNumber}\n` : "") +
      (paymentData.externalReference ? `External Reference: ${paymentData.externalReference}\n` : "")

    if (tokenData) {
      const tokens = Array.isArray(tokenData) ? tokenData : [tokenData]
      tokens.forEach((token, index) => {
        text +=
          `\nToken Information${tokens.length > 1 ? ` ${index + 1}` : ""}:\n` +
          `Token: ${token.token}\n` +
          `Units: ${token.vendedAmount} ${token.unit}\n` +
          `Meter: ${token.drn}\n` +
          `Description: ${token.description}\n`
      })
    }

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setIsCopyingAll(true)
        setTimeout(() => setIsCopyingAll(false), 2000)
      })
    }
  }

  if (!isOpen || !paymentData) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden bg-[#EFEFEF] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={receiptRef}
          className="flex-1 space-y-2 overflow-y-auto px-4 pb-4 text-sm text-gray-800 sm:space-y-3 sm:px-6"
        >
          {/* Header */}
          <div className="flex flex-col items-center justify-between bg-[#EFEFEF]  pt-4 sm:flex-row ">
            <Image src="/kadco.svg" alt="" height={120} width={123} className="max-sm:w-20" />
            <div className="mt-3 text-center sm:mt-0 sm:text-right">
              <h2 className="text-base font-bold text-gray-900 sm:text-lg">Payment Receipt</h2>
              <p className="max-w-[250px] break-words text-xs text-gray-500 sm:max-w-none">
                Reference: {paymentData.reference}
              </p>
            </div>
          </div>

          {/* Paid Stamp Overlay */}
          <div className="pointer-events-none absolute  top-10 z-10 -translate-x-1/2 opacity-90 max-sm:right-0 sm:left-1/2">
            <Image
              src="/paid-stamp.svg"
              alt="Paid stamp"
              width={190}
              height={190}
              className="size-32 select-none sm:size-48 md:h-[190px] md:w-[190px]"
              priority
            />
          </div>

          {/* Customer and Payment Summary */}
          <div className="relative flex flex-col items-start justify-between rounded-lg bg-white p-3 sm:flex-row sm:items-center">
            <div className="mb-2 w-full sm:mb-0 sm:w-auto">
              <p className="text-xs text-gray-500">Customer</p>
              <p className="break-words font-semibold text-gray-900">{paymentData.customerName}</p>
              <p className="text-xs text-gray-500">Account: {paymentData.customerAccountNumber}</p>
              {paymentData.customerAddress && (
                <p className="text-xs text-gray-500">Address: {paymentData.customerAddress}</p>
              )}
              {paymentData.customerPhoneNumber && (
                <p className="text-xs text-gray-500">Phone: {paymentData.customerPhoneNumber}</p>
              )}
              {paymentData.customerMeterNumber && (
                <p className="text-xs text-gray-500">Meter: {paymentData.customerMeterNumber}</p>
              )}
              {paymentData.accountType && <p className="text-xs text-gray-500">Type: {paymentData.accountType}</p>}
            </div>
            <div className="w-full text-left sm:w-auto sm:text-right">
              <p className="text-xs text-gray-500">Amount Paid</p>
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}
              </p>
              <p className="break-words text-xs text-gray-500">Paid at: {formatDateTime(paymentData.paidAtUtc)}</p>
              {paymentData.externalReference && (
                <p className="break-words text-xs text-gray-500">Ext Ref: {paymentData.externalReference}</p>
              )}
            </div>
          </div>

          {/* Billing Details */}
          <div className="rounded-lg bg-white p-3">
            <h4 className="mb-2 font-semibold text-gray-600">Billing Details</h4>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Type:</span>
                <span className="font-medium">{paymentData.paymentTypeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="font-medium">{paymentData.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span
                  className={`font-medium capitalize ${
                    paymentData.status === "Confirmed"
                      ? "text-green-600"
                      : paymentData.status === "Pending"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {paymentData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tariff Rate:</span>
                <span className="font-medium">₦{(paymentData.tariffRate || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="rounded-lg bg-white p-3">
            <h4 className="mb-2 font-semibold text-gray-600">Financial Breakdown</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Electricity Amount:</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.electricityAmount || 0, paymentData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">VAT Amount:</span>
                <span className="font-medium">{formatCurrency(paymentData.vatAmount || 0, paymentData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outstanding Debt:</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.outstandingDebt || 0, paymentData.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Debt Payable:</span>
                <span className="font-medium">
                  {formatCurrency(paymentData.debtPayable || 0, paymentData.currency)}
                </span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Total Amount Paid:</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(paymentData.totalAmountPaid, paymentData.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Token Information */}
          {(paymentData?.tokens && Array.isArray(paymentData.tokens)) ||
          (paymentData?.shouldUpgrade && paymentData?.receipt?.tokens) ? (
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                {paymentData.upgrade?.message || "Enter these tokens in order to upgrade your meter:"}
              </h4>
              <div className="space-y-2">
                {(paymentData?.tokens && Array.isArray(paymentData.tokens)
                  ? paymentData.tokens
                  : paymentData.receipt?.tokens || []
                ).map((token, index) => {
                  const isCreditToken = token.description.includes("Credit") || (token.vendedAmount && token.unit)
                  return (
                    <div
                      key={index}
                      className={`rounded border p-2 ${
                        isCreditToken ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className={`text-xs font-medium ${isCreditToken ? "text-green-700" : "text-orange-700"}`}
                            >
                              {token.description}
                            </span>
                            {token.vendedAmount && token.unit && (
                              <span
                                className={`text-xs font-bold ${isCreditToken ? "text-green-600" : "text-gray-600"}`}
                              >
                                {token.vendedAmount} {token.unit}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex-1 truncate font-mono text-sm font-bold text-gray-900">
                              {token.token}
                            </span>
                            <button
                              onClick={() => handleCopyToken(token.token, token.tokenDec || token.token)}
                              className={`shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                                isCreditToken ? "focus:ring-green-500" : "focus:ring-orange-500"
                              }`}
                              title="Copy token"
                            >
                              {copiedToken === token.token ? (
                                <span className="text-green-600">Copied!</span>
                              ) : (
                                <span className={isCreditToken ? "text-green-600" : "text-orange-600"}>Copy</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : getTokens().length > 0 ? (
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Token Information {getTokens().length > 1 ? `(${getTokens().length} tokens)` : ""}
              </h4>
              <div className="space-y-2">
                {getTokens().map((token, index) => (
                  <div key={index} className="rounded border border-blue-200 bg-blue-50 p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-medium text-blue-700">
                            Electricity Token {getTokens().length > 1 ? index + 1 : ""}
                          </span>
                          {token.vendedAmount && token.unit && (
                            <span className="text-xs font-bold text-blue-600">
                              {token.vendedAmount} {token.unit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 truncate font-mono text-sm font-bold text-gray-900">
                            {token.token}
                          </span>
                          <button
                            onClick={() => handleCopyToken(token.token, token.tokenDec || token.token)}
                            className="shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
                            title="Copy token"
                          >
                            {copiedToken === token.token ? (
                              <span className="text-green-600">Copied!</span>
                            ) : (
                              <span className="text-blue-600">Copy</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>Thank you for your payment!</p>
            <p className="mt-1">This receipt serves as proof of payment.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 border-t bg-white px-6 py-4 max-sm:px-3 sm:gap-4">
          <ButtonModule variant="secondary" className="flex w-full" size="md" onClick={handlePrint}>
            Print
          </ButtonModule>
          <ButtonModule variant="outline" className="flex w-full" size="md" onClick={handleDownloadPDF}>
            Download PDF
          </ButtonModule>
          <ButtonModule variant="primary" className="flex w-full" size="md" onClick={onRequestClose}>
            Close
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CollectPaymentReceiptModal
