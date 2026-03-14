"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { BillPreviewRequestParams, clearBillPreviewStatus, fetchBillPreview } from "lib/redux/postpaidSlice"
import { BillingPeriod, fetchBillingPeriods } from "lib/redux/billingPeriodsSlice"
import { AlertCircle, Loader2, RefreshCw, Search, X } from "lucide-react"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface BillPreviewTabProps {
  scheduleId: string | null
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—"
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return "—"
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatShortDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getCustomerStatusLabel = (code?: string | null) => {
  switch (code) {
    case "02":
      return "Active"
    case "04":
      return "Suspended"
    case "05":
      return "PPM"
    case "07":
      return "Inactive"
    default:
      return code || "Unknown"
  }
}

const BillPreviewTab: React.FC<BillPreviewTabProps> = ({ scheduleId }) => {
  const dispatch = useAppDispatch()
  const { billPreview, billPreviewLoading, billPreviewError, billPreviewSuccess } = useAppSelector(
    (state: any) => state.postpaidBilling
  )
  const { billingPeriods, billingPeriodsLoading } = useAppSelector((state: any) => state.billingPeriods)

  const [selectedRunId, setSelectedRunId] = useState<string>("")
  const [searchParams, setSearchParams] = useState<BillPreviewRequestParams>({
    runId: 0,
  })
  const [showPreview, setShowPreview] = useState(false)
  const barcodeRef = useRef<HTMLCanvasElement>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      dispatch(clearBillPreviewStatus())
    }
  }, [dispatch])

  // Fetch billing periods on component mount
  useEffect(() => {
    dispatch(fetchBillingPeriods({ pageNumber: 1, pageSize: 100 }))
  }, [dispatch])

  // Generate simple 1D-style barcode on canvas using the account number
  const generateBarcode = () => {
    if (!barcodeRef.current || !billPreview) return

    const canvas = barcodeRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const value = String(billPreview.customerAccountNo || "")

    // Canvas sizing for crisp lines
    const width = 220
    const height = 60
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, width, height)

    // Basic hash from the value to vary bar patterns
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0
    }

    const barWidth = 2
    const totalBars = Math.floor(width / barWidth)

    for (let i = 0; i < totalBars; i++) {
      // Derive a pseudo-random pattern from the hash and index
      const bit = (hash >> i % 32) & 1
      if (bit === 1) {
        ctx.fillStyle = "#000000"
        ctx.fillRect(i * barWidth, 4, barWidth, height - 16)
      }
    }

    // Draw the human-readable value below the bars
    ctx.fillStyle = "#000000"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"
    ctx.fillText(value, width / 2, height - 2)
  }

  // Initialize barcode when bill preview changes
  useEffect(() => {
    if (billPreview && showPreview) {
      generateBarcode()
    }
  }, [billPreview, showPreview])

  const handleSearch = () => {
    const runId = parseInt(selectedRunId)
    if (isNaN(runId) || runId <= 0) {
      return
    }

    const params: BillPreviewRequestParams = {
      runId,
      ...(searchParams.billId && { billId: parseInt(searchParams.billId.toString()) }),
      ...(searchParams.billingPeriodId && { billingPeriodId: parseInt(searchParams.billingPeriodId.toString()) }),
      ...(searchParams.accountNumber && { accountNumber: searchParams.accountNumber }),
      ...(searchParams.billNumber && { billNumber: searchParams.billNumber }),
    }

    dispatch(fetchBillPreview(params))
    setShowPreview(true)
  }

  const handleClear = () => {
    setSelectedRunId("")
    setSearchParams({ runId: 0 })
    setShowPreview(false)
    dispatch(clearBillPreviewStatus())
  }

  const handlePrevBill = () => {
    if (billPreview?.navigation.hasPrevious && billPreview.navigation.previousBillId > 0) {
      const params: BillPreviewRequestParams = {
        runId: billPreview.runId,
        billId: billPreview.navigation.previousBillId,
      }
      dispatch(fetchBillPreview(params))
    }
  }

  const handleNextBill = () => {
    if (billPreview?.navigation.hasNext && billPreview.navigation.nextBillId > 0) {
      const params: BillPreviewRequestParams = {
        runId: billPreview.runId,
        billId: billPreview.navigation.nextBillId,
      }
      dispatch(fetchBillPreview(params))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (!invoiceRef.current || !billPreview) return

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
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

      pdf.setFillColor(255, 255, 255)
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

      const fileName = `KAD-ELEC-Bill-Preview-${billPreview.customerAccountNo}-${formatDate(
        new Date().toISOString()
      ).replace(/\s+/g, "-")}.pdf`

      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  // Mock bill data based on template values - in real implementation, this would come from the API
  const getMockBillData = () => {
    if (!billPreview) return null

    // Extract values from template or use defaults
    const template = billPreview.templateValues || {}

    return {
      billingId: billPreview.billingId,
      name: template.billMonth || template.MonthYear || "Current Month",
      customerAccountNumber: billPreview.customerAccountNo,
      customerName: billPreview.customerName,
      areaOfficeName: template.areaOffice || template.summaryAreaOffice || "Main Office",
      serviceCenterName: template.serviceCenter || template.summaryServiceCenter || "Service Center",
      feederName: template.feeder11kv || template.Feeder11kv || "Feeder 1",
      distributionSubstationCode: template.feeder33kv || template.Feeder33Kv || "DSS-001",
      distributionSubstationName: template.dtName || template.DTName || "Main Substation",
      presentReadingKwh: parseFloat(template.presentReading || template.summaryPresentReading || "0"),
      previousReadingKwh: parseFloat(template.previousReading || template.summaryPreviousReading || "0"),
      consumptionKwh: parseFloat(template.consumption || template.summaryConsumption || "0"),
      tariffPerKwh: parseFloat(template.tariffRate?.replace(/[₦,]/g, "") || template.Rate?.replace(/[₦,]/g, "") || "0"),
      customerTariffCode: template.tariffClass || template.Tariff || "R1",
      openingBalance: parseFloat(
        template.openingBalance?.replace(/[₦,]/g, "") || template.summaryOpeningBalance?.replace(/[₦,]/g, "") || "0"
      ),
      adjustedOpeningBalance: parseFloat(
        template.adjustment?.replace(/[₦,]/g, "") || template.summaryAdjustment?.replace(/[₦,]/g, "") || "0"
      ),
      currentBillAmount: parseFloat(
        template.totalPayment?.replace(/[₦,]/g, "") ||
          template.summaryTotalPayments?.replace(/[₦,]/g, "") ||
          template.summaryCurrentBill?.replace(/[₦,]/g, "") ||
          "0"
      ),
      netArrears: parseFloat(
        template.netArrears?.replace(/[₦,]/g, "") || template.summaryNetArrears?.replace(/[₦,]/g, "") || "0"
      ),
      chargeBeforeVat: parseFloat(template.energyCharged?.replace(/[₦,]/g, "") || "0"),
      actualBillAmount: parseFloat(
        template.fixedCharge?.replace(/[₦,]/g, "") || template.summaryFixedCharge?.replace(/[₦,]/g, "") || "0"
      ),
      vatAmount: parseFloat(template.vat?.replace(/[₦,]/g, "") || template.summaryVat?.replace(/[₦,]/g, "") || "0"),
      totalDue: parseFloat(
        template.totalDue?.replace(/[₦,]/g, "") || template.finalAmount?.replace(/[₦,]/g, "") || "0"
      ),
      paymentsPrevMonth: parseFloat(template.lastPaymentAmount?.replace(/[₦,]/g, "") || "0"),
      lastUpdated: new Date().toISOString(),
      customer: {
        fullName: billPreview.customerName,
        address: template.address || template.CustomerAddress || "",
        city: template.city || template.CustomerCity || "",
        state: template.state || template.CustomerState || "",
        phoneNumber: template.phoneNumber || template.CustomerPhoneHome || "",
        areaOfficeName: template.areaOffice || template.summaryAreaOffice || "",
        serviceCenterName: template.serviceCenter || template.summaryServiceCenter || "",
        meterNumber: template.meter || template.summaryMeter || "",
        storedAverage: parseFloat(
          template.adc?.replace(/[₦,]/g, "") || template.summaryAdc?.replace(/[₦,]/g, "") || "0"
        ),
        statusCode: template.statusCode || "02",
        salesRepUser: {
          fullName: template.salesRep || template.SalesRep || "",
        },
        distributionSubstationCode: template.feeder33kv || template.Feeder33Kv || "",
      },
      customerMeterNumber: template.meter || template.summaryMeter || "",
      customerAverageDailyConsumption: parseFloat(
        template.adc?.replace(/[₦,]/g, "") || template.AverageDailyConsumption || "0"
      ),
    }
  }

  const mockBill = getMockBillData()

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Bill Preview</h2>
          <p className="text-sm text-gray-500">Preview bills for a specific schedule run</p>
        </div>

        <div className="space-y-4">
          {/* Run ID (Required) */}
          <div className="flex w-full gap-4">
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Schedule Run ID <span className="text-red-500">*</span>
              </label>
              <FormInputModule
                type="number"
                placeholder="Enter schedule run ID"
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="w-full"
                label={""}
              />
            </div>
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Billing Period</label>
              <FormSelectModule
                name="billingPeriodId"
                value={searchParams.billingPeriodId || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    billingPeriodId: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                options={[
                  { value: "", label: "Select Billing Period" },
                  ...billingPeriods.map((period: BillingPeriod) => ({
                    value: period.id.toString(),
                    label: `${period.displayName}`,
                  })),
                ]}
                disabled={billingPeriodsLoading}
                className=" w-full"
                loading={billingPeriodsLoading}
              />
            </div>
          </div>

          {/* Optional Filters */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Bill ID</label>
              <FormInputModule
                type="number"
                placeholder="Bill ID"
                value={searchParams.billId || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    billId: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                label={""}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Account Number</label>
              <FormInputModule
                type="text"
                placeholder="Account Number"
                value={searchParams.accountNumber || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    accountNumber: e.target.value || undefined,
                  }))
                }
                label={""}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Bill Number</label>
              <FormInputModule
                type="text"
                placeholder="Bill Number"
                value={searchParams.billNumber || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    billNumber: e.target.value || undefined,
                  }))
                }
                label={""}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <ButtonModule
              onClick={handleSearch}
              disabled={!selectedRunId || billPreviewLoading}
              className="inline-flex items-center gap-2"
            >
              <Search className="size-4" />
              {billPreviewLoading ? "Searching..." : "Preview Bill"}
            </ButtonModule>

            <ButtonModule
              variant="outline"
              onClick={handleClear}
              disabled={billPreviewLoading}
              className="inline-flex items-center gap-2"
            >
              <X className="size-4" />
              Clear
            </ButtonModule>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {billPreviewLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading bill preview...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {billPreviewError && !billPreviewLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="size-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Failed to load bill preview</p>
              <p className="mt-1 text-sm text-gray-500">{billPreviewError}</p>
            </div>
            <ButtonModule variant="outline" size="sm" onClick={handleSearch}>
              <RefreshCw className="mr-2 size-4" />
              Retry
            </ButtonModule>
          </div>
        </div>
      )}
      {/* Bill Preview Modal */}
      {billPreviewSuccess && billPreview && !billPreviewLoading && showPreview && mockBill && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowPreview(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative flex w-[80vw] max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex w-full items-center justify-between border-b bg-white p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bill Preview</h3>
                {/* <p className="text-sm text-gray-500">
                  Run ID: {billPreview.runId} | Bill ID: {billPreview.billId}
                </p> */}
              </div>

              <div className="flex items-center gap-2">
                <ButtonModule
                  variant="outline"
                  size="sm"
                  onClick={handlePrevBill}
                  disabled={!billPreview.navigation.hasPrevious}
                  className="inline-flex items-center gap-1"
                >
                  Previous
                </ButtonModule>

                <span className="text-sm text-gray-500">
                  {billPreview.filteredCount} of {billPreview.totalInScope}
                </span>

                <ButtonModule
                  variant="outline"
                  size="sm"
                  onClick={handleNextBill}
                  disabled={!billPreview.navigation.hasNext}
                  className="inline-flex items-center gap-1"
                >
                  Next
                </ButtonModule>

                <button
                  onClick={() => setShowPreview(false)}
                  className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="relative flex-1 overflow-y-auto">
              <div className="">
                {/* Bill Template - Exact copy from PostpaidBillDetailsModal */}
                <div className="overflow-hidden rounded-lg">
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      .print-area, .print-area * {
                        visibility: visible;
                      }
                      .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                      }
                      .print-no-border {
                        border: none !important;
                      }
                      .print-no-border-r {
                        border-right: none !important;
                      }
                      .print-no-border-t {
                        border-top: none !important;
                      }
                      .print-no-border-b {
                        border-bottom: none !important;
                      }
                      .print-no-border-l {
                        border-left: none !important;
                      }
                      .print-hide-label {
                        display: none !important;
                      }
                      .print-show-value {
                        display: block !important;
                      }
                    }
                  `}</style>

                  <div className="print-area w-full bg-white">
                    <div className="relative p-8" ref={invoiceRef}>
                      {/* Header - A5 Optimized */}
                      <div className="a5-header mb-6 flex items-center justify-between">
                        <div className="w-24 text-center">
                          <img src="/kad.svg" alt="KAD-ELEC Logo" className="h-10" />
                        </div>

                        <div className="flex flex-1 justify-center">
                          <canvas ref={barcodeRef} className="h-12 w-40" />
                        </div>

                        <div className="w-24 text-center">
                          <h1 className="mb-1 text-[9pt] font-bold text-gray-900">KAD-ELEC.</h1>
                          <div className="bg-[#6EAD2A] p-1 text-xs font-semibold text-white">
                            #{mockBill.customerAccountNumber}
                          </div>
                        </div>
                      </div>

                      {/* Billing Information */}
                      <div className="a5-section">
                        <div className="flex w-full items-center justify-center bg-[#004B23] p-1.5 text-xs font-semibold text-white">
                          <p>BILLING INFORMATION</p>
                        </div>

                        <div className="flex w-full border border-gray-300 bg-white text-[8pt]">
                          <div className="min-w-0 flex-1 space-y-0.5 border-r border-gray-300">
                            <div className="flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                              <p>AREA OFFICE</p>
                              <div className="flex items-center justify-center bg-white px-4 text-center">
                                <p className="text-black">{mockBill.areaOfficeName}</p>
                              </div>
                            </div>

                            <div className="space-y-2 px-2">
                              <div className="flex justify-between">
                                <span className="font-semibold">Bill #:</span>
                                <span className="px-2 font-semibold">{mockBill.billingId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold">Bill Month:</span>
                                <span className="px-2 font-semibold">{mockBill.name}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Customer Account:</span>
                                <span className="px-2 font-semibold">{mockBill.customerAccountNumber}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Account Name:</span>
                                <span className="px-2 font-semibold">{mockBill.customerName}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Address:</span>
                                <span className="px-2 font-semibold">{mockBill.customer?.address || "-"}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Phone Number:</span>
                                <span className="px-2 font-semibold">{mockBill.customer?.phoneNumber || "-"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold">City:</span>
                                <span className="px-2 font-semibold">{mockBill.customer?.city || "-"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div
                              className="flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold text-white"
                              style={{ backgroundColor: "#008001" }}
                            >
                              <p>SERVICE CENTER:</p>
                              <div className="flex items-center justify-center bg-white px-4">
                                <p className="text-[7pt] text-black">{mockBill.serviceCenterName}</p>
                              </div>
                            </div>

                            <div className="space-y-2 px-2">
                              <div className="flex justify-between">
                                <span className="font-semibold">State:</span>
                                <span className="px-2 font-semibold">{mockBill.customer?.state || "-"}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">11KV Feeder:</span>
                                <span className="px-2 font-semibold">{mockBill.feederName}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">33KV Feeder:</span>
                                <span className="px-2 font-semibold">{mockBill.distributionSubstationCode}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">DT Name:</span>
                                <span className="px-2 font-semibold">{mockBill.distributionSubstationName}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Sales Rep:</span>
                                <span className="px-2 font-semibold">
                                  {mockBill.customer?.salesRepUser?.fullName || "-"}
                                </span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Meter:</span>
                                <span className="px-2 font-semibold">{mockBill.customerMeterNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold">Multiplier:</span>
                                <span className="px-2 font-semibold">1.0</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Billing Charges */}
                      <div className="a5-section">
                        <div className="flex w-full items-center justify-center bg-[#004B23] p-1.5 text-xs font-semibold text-white">
                          <p>BILLING CHARGES</p>
                        </div>

                        <div className="flex w-full border border-gray-300 bg-white text-[8pt]">
                          <div className="min-w-0 flex-1 space-y-0.5 border-r border-gray-300">
                            <div className="flex w-full items-center justify-between bg-[#6CAD2B] px-2 py-1 font-semibold">
                              <p>CHARGES</p>
                              <p>TOTAL</p>
                            </div>

                            <div className="space-y-2 px-2">
                              <div className="mt-2 flex justify-between">
                                <span className="font-semibold">Last Payment Date:</span>
                                <span className="px-2 font-semibold">{formatShortDate(mockBill.lastUpdated)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Last Payment Amount:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.paymentsPrevMonth)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">ADC:</span>
                                <span className="px-2 font-semibold">{mockBill.customer?.storedAverage || "-"}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Present Reading:</span>
                                <span className="px-2 font-semibold">{mockBill.presentReadingKwh}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Previous Reading:</span>
                                <span className="px-2 font-semibold">{mockBill.previousReadingKwh}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Consumption:</span>
                                <span className="px-2 font-semibold">{mockBill.consumptionKwh}kwh</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Tariff Rate:</span>
                                <span className="px-2 font-semibold">{mockBill.tariffPerKwh}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Tariff Class:</span>
                                <span className="px-2 font-semibold">{mockBill.customerTariffCode}</span>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div
                              className="flex w-full items-center justify-between bg-[#008001] px-2 py-1 font-semibold text-white"
                              style={{ backgroundColor: "#008001" }}
                            >
                              <p>CHARGES</p>
                              <p>TOTAL</p>
                            </div>

                            <div className="space-y-2 px-2">
                              <div className="mt-2 flex justify-between">
                                <span className="font-semibold">Status Code:</span>
                                <span className="px-2 font-semibold">
                                  {getCustomerStatusLabel(mockBill.customer?.statusCode)}
                                </span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Opening Balance:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.openingBalance)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Adjustment:</span>
                                <span className="px-2 font-semibold">
                                  {formatCurrency(mockBill.adjustedOpeningBalance)}
                                </span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Total Payment Amt:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.currentBillAmount)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Net Arrears:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.netArrears)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Energy Charged:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.chargeBeforeVat)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">Fixed Charge:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.actualBillAmount)}</span>
                              </div>
                              <div className="mt-1 flex justify-between">
                                <span className="font-semibold">VAT:</span>
                                <span className="px-2 font-semibold">{formatCurrency(mockBill.vatAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Due */}
                      <div className="flex w-full border border-gray-300">
                        <div className="flex-1 bg-[#6CAD2B]">
                          <div className="px-2 py-1.5">&nbsp;</div>
                        </div>

                        <div className="min-w-0 flex-1 bg-[#E1E1E1]">
                          <div
                            className="flex w-full items-center justify-between bg-[#008001] px-2 py-1.5 font-semibold text-white"
                            style={{ backgroundColor: "#008001" }}
                          >
                            <p className="text-[8pt]">TOTAL DUE:</p>
                            <div className="flex items-center justify-center bg-white px-4 py-0.5">
                              <p className="text-[8pt] font-bold text-black">{formatCurrency(mockBill.totalDue)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Notice */}

                      {/* Summary Section */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
export default BillPreviewTab
