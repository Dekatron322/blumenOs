"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import BankTransferDetailsModal from "components/ui/Modal/generated-bank-transfer-modal"
import { BsLightningCharge, BsPerson, BsPersonPlus } from "react-icons/bs"
import { FaCheckCircle } from "react-icons/fa"
import { notify } from "components/ui/Notification/Notification"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"

// Mock data for meter validation
interface MeterInfo {
  meterNumber: string
  customerName: string
  address: string
  tariff: string
  serviceCenter: string
  outstandingBalance: number
  isActive: boolean
}

const mockMeterData: MeterInfo[] = [
  {
    meterNumber: "04123456789",
    customerName: "John Smith",
    address: "123 Main Street, Ikeja, Lagos",
    tariff: "R2",
    serviceCenter: "Ikeja Service Center",
    outstandingBalance: 15000,
    isActive: true,
  },
  {
    meterNumber: "04198765432",
    customerName: "Jane Doe",
    address: "456 Broad Street, Victoria Island, Lagos",
    tariff: "C1",
    serviceCenter: "Victoria Island SC",
    outstandingBalance: 8500,
    isActive: true,
  },
  {
    meterNumber: "04211223344",
    customerName: "Michael Johnson",
    address: "789 Park Avenue, Garki, Abuja",
    tariff: "A1",
    serviceCenter: "Garki Central",
    outstandingBalance: 0,
    isActive: true,
  },
  {
    meterNumber: "04255667788",
    customerName: "Sarah Williams",
    address: "101 Oak Lane, Maitama, Abuja",
    tariff: "B1",
    serviceCenter: "Maitama District",
    outstandingBalance: 25000,
    isActive: false,
  },
]

const BuyUnit: React.FC = () => {
  // Step 1: Choose vend type
  const [vendType, setVendType] = useState<"self" | "third-party" | null>(null)

  // Step 2: Meter validation
  const [meterNumber, setMeterNumber] = useState("")
  const [isValidatingMeter, setIsValidatingMeter] = useState(false)
  const [meterInfo, setMeterInfo] = useState<MeterInfo | null>(null)
  const [meterValidationError, setMeterValidationError] = useState<string | null>(null)

  // Step 3: Payment details
  const [amountInput, setAmountInput] = useState("")
  const [isVirtualAccountModalOpen, setIsVirtualAccountModalOpen] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  // Current logged in customer info (for self vend)
  const loggedInCustomerMeter = "04123456789" // Mock logged in user's meter

  const handleSelectVendType = (type: "self" | "third-party") => {
    setVendType(type)
    setMeterNumber("")
    setMeterInfo(null)
    setMeterValidationError(null)
    setAmountInput("")

    if (type === "self") {
      // Auto-validate the user's meter
      setIsValidatingMeter(true)

      // Simulate API delay for auto-validation
      setTimeout(() => {
        try {
          const foundMeter = mockMeterData.find((meter) => meter.meterNumber === loggedInCustomerMeter)

          if (foundMeter) {
            if (foundMeter.isActive) {
              setMeterInfo(foundMeter)
              setMeterNumber(loggedInCustomerMeter)
              notify("success", "Your meter has been validated", {
                description: `Welcome back, ${foundMeter.customerName}!`,
                duration: 3000,
              })
            } else {
              setMeterValidationError("Your meter account is inactive. Please contact customer service.")
            }
          } else {
            setMeterValidationError("Unable to retrieve your meter information. Please try again.")
          }
        } catch (error: any) {
          setMeterValidationError("Failed to validate your meter. Please try again.")
        } finally {
          setIsValidatingMeter(false)
        }
      }, 800)
    }
  }

  // Handle third-party meter validation
  const validateThirdPartyMeter = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!meterNumber.trim()) {
      setMeterValidationError("Please enter a meter number")
      return
    }

    setIsValidatingMeter(true)
    setMeterInfo(null)
    setMeterValidationError(null)

    // Simulate API delay
    setTimeout(() => {
      try {
        const foundMeter = mockMeterData.find((meter) => meter.meterNumber === meterNumber.trim())

        if (foundMeter) {
          if (foundMeter.isActive) {
            setMeterInfo(foundMeter)
            notify("success", "Meter validated successfully", {
              description: `Customer: ${foundMeter.customerName}`,
              duration: 3000,
            })
          } else {
            setMeterValidationError("Meter account is inactive. Please contact customer service.")
          }
        } else {
          setMeterValidationError("Invalid meter number. Please check and try again.")
        }
      } catch (error: any) {
        setMeterValidationError("Failed to validate meter. Please try again.")
      } finally {
        setIsValidatingMeter(false)
      }
    }, 1000)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").trim()

    if (raw === "") {
      setAmountInput("")
      return
    }

    if (!/^\d*(\.\d*)?$/.test(raw)) {
      return
    }

    const [intPart, decimalPart] = raw.split(".")
    const formattedInt = intPart ? Number(intPart).toLocaleString() : ""
    const formatted = decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt
    setAmountInput(formatted)
  }

  const calculateUnits = (amount: number): number => {
    // Mock calculation based on tariff
    if (!meterInfo) return 0

    const ratePerKWh =
      meterInfo.tariff === "R2" ? 24.3 : meterInfo.tariff === "C1" ? 35.8 : meterInfo.tariff === "A1" ? 42.5 : 28.9

    return amount / ratePerKWh
  }

  const handleBuyUnit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!meterInfo) {
      notify("error", "Please validate a meter first")
      return
    }

    const rawAmount = amountInput.replace(/,/g, "").trim()
    const amount = Number(rawAmount)

    if (!rawAmount || Number.isNaN(amount) || amount <= 0) {
      notify("error", "Please enter a valid amount greater than 0")
      return
    }

    if (amount < 500) {
      notify("error", "Minimum purchase amount is ₦500")
      return
    }

    setIsSubmittingPayment(true)

    // Simulate payment processing
    setTimeout(() => {
      try {
        const units = calculateUnits(amount)

        notify("success", "Ready to purchase units", {
          description: `You will get ${units.toFixed(2)} kWh for ₦${amount.toLocaleString()}`,
          duration: 3000,
        })

        // Open bank transfer modal
        setIsVirtualAccountModalOpen(true)
      } catch (error: any) {
        notify("error", error.message || "Failed to process payment request")
      } finally {
        setIsSubmittingPayment(false)
      }
    }, 1500)
  }

  const resetForm = () => {
    setVendType(null)
    setMeterNumber("")
    setMeterInfo(null)
    setMeterValidationError(null)
    setAmountInput("")
  }

  const currentStep = !vendType ? 1 : !meterInfo ? 2 : 3

  const StepProgress = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                  step === currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : step < currentStep
                    ? "border-[#004B23] bg-[#004B23] text-white"
                    : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                {step < currentStep ? (
                  <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`mt-2 hidden text-xs font-medium sm:block ${
                  step === currentStep ? "text-[#004B23]" : "text-gray-500"
                }`}
              >
                {step === 1 && "Select Type"}
                {step === 2 && "Meter Info"}
                {step === 3 && "Purchase Units"}
              </span>
            </div>
            {step < 3 && <div className={`mx-2 h-0.5 flex-1 ${step < currentStep ? "bg-[#004B23]" : "bg-gray-300"}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  const renderStep1 = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="mb-3 text-base font-semibold text-gray-800">Select Vend Type</h2>
      <p className="mb-6 text-sm text-gray-600">
        Choose whether you want to buy units for yourself or for someone else.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSelectVendType("self")}
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all duration-200 ${
            vendType === "self"
              ? "border-[#004B23] bg-[#004B23]/5"
              : "border-gray-200 bg-gray-50 hover:border-[#004B23] hover:bg-[#004B23]/5"
          }`}
          disabled={isValidatingMeter}
        >
          <BsPerson className="mb-3 size-12 text-[#004B23]" />
          <h3 className="mb-2 text-lg font-semibold text-gray-800">For Myself</h3>
          <p className="text-center text-sm text-gray-600">Purchase electricity units for your own meter</p>
          <div className="mt-4 rounded-full bg-[#004B23] px-4 py-2 text-xs font-medium text-white">Quick Purchase</div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectVendType("third-party")}
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-all duration-200 ${
            vendType === "third-party"
              ? "border-[#004B23] bg-[#004B23]/5"
              : "border-gray-200 bg-gray-50 hover:border-[#004B23] hover:bg-[#004B23]/5"
          }`}
        >
          <BsPersonPlus className="mb-3 size-12 text-[#004B23]" />
          <h3 className="mb-2 text-lg font-semibold text-gray-800">For Someone Else</h3>
          <p className="text-center text-sm text-gray-600">
            Purchase electricity units for another person&apos;s meter
          </p>
          <div className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white">Third Party</div>
        </button>
      </div>

      <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
        <h4 className="mb-2 font-medium text-blue-800">Important Note:</h4>
        <ul className="ml-5 list-disc space-y-1 text-blue-700">
          <li>For self purchase, your meter number will be automatically validated</li>
          <li>For third party purchase, you&apos;ll need to enter and validate the recipient&apos;s meter number</li>
          <li>All payments are processed via bank transfer</li>
          <li>Units are delivered immediately after successful payment</li>
        </ul>
      </div>
    </motion.div>
  )

  const renderStep2ThirdParty = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Enter Meter Number</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Third Party Purchase
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the 11-digit meter number of the customer you want to purchase units for.
        </p>

        <form onSubmit={validateThirdPartyMeter} className="space-y-4">
          <FormInputModule
            label="Customer Meter Number"
            type="text"
            name="meterNumber"
            id="meterNumber"
            placeholder="Enter 11-digit meter number"
            value={meterNumber}
            onChange={(e) => setMeterNumber(e.target.value)}
            required
            error={meterValidationError || undefined}
          />
          <p className="text-xs text-gray-500">Format: 11 digits (e.g., 04123456789)</p>

          <div className="flex gap-3">
            <ButtonModule type="submit" variant="primary" className="w-full" disabled={isValidatingMeter}>
              {isValidatingMeter ? "Validating..." : "Validate Meter"}
            </ButtonModule>

            <ButtonModule
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setVendType(null)}
              disabled={isValidatingMeter}
            >
              Back
            </ButtonModule>
          </div>
        </form>
      </div>

      {isValidatingMeter && (
        <div className="mt-4 text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-2 border-[#004B23] border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Validating meter information...</p>
        </div>
      )}
    </motion.div>
  )

  const renderLoadingState = () => (
    <motion.div
      className="rounded-md border bg-white p-8 text-center shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 inline-block size-16 animate-spin rounded-full border-4 border-[#004B23] border-t-transparent"></div>
      <h3 className="mb-2 text-lg font-semibold text-gray-800">Validating Your Meter</h3>
      <p className="text-sm text-gray-600">Please wait while we retrieve and validate your meter information...</p>
    </motion.div>
  )

  const renderPurchaseForm = () => (
    <>
      <motion.div
        className="rounded-md border bg-white p-5 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Meter Information</h2>
          <div className="flex items-center gap-2">
            {vendType === "self" && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                Self Purchase
              </span>
            )}
            {vendType === "third-party" && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Third Party</span>
            )}
            {meterInfo?.isActive && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                <FaCheckCircle className="size-3" /> Active
              </span>
            )}
          </div>
        </div>

        <div className="rounded-md border border-dashed border-[#004B23] bg-[#004B23]/5 p-4 text-sm">
          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <span className="font-medium text-[#004B23]">Customer Name:</span>
              <p className="text-base font-bold text-[#004B23]">{meterInfo?.customerName}</p>
            </div>
            <div>
              <span className="font-medium text-[#004B23]">Meter Number:</span>
              <p className="text-base font-bold text-[#004B23]">{meterInfo?.meterNumber}</p>
            </div>
          </div>

          <div className="mb-3">
            <span className="font-medium text-[#004B23]">Address:</span>
            <p className="text-base font-bold text-[#004B23]">{meterInfo?.address}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <span className="font-medium text-[#004B23]">Tariff:</span>
              <p className="text-base font-bold text-[#004B23]">{meterInfo?.tariff}</p>
            </div>
            <div>
              <span className="font-medium text-[#004B23]">Service Center:</span>
              <p className="text-base font-bold text-[#004B23]">{meterInfo?.serviceCenter}</p>
            </div>
            <div>
              <span className="font-medium text-[#004B23]">Outstanding Balance:</span>
              <p className="text-base font-bold text-[#004B23]">₦{meterInfo?.outstandingBalance?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <ButtonModule
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setMeterInfo(null)
              setMeterNumber("")
              setMeterValidationError(null)
            }}
          >
            Change Meter
          </ButtonModule>
        </div>
      </motion.div>

      <motion.div
        className="rounded-md border bg-white p-5 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <h2 className="mb-3 text-base font-semibold text-gray-800">Purchase Units</h2>

        <form onSubmit={handleBuyUnit} className="space-y-5">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2">
              <BsLightningCharge className="text-blue-600" />
              <span className="font-medium text-blue-800">Unit Purchase Information</span>
            </div>
            <div className="text-xs text-blue-700">
              <p>Enter the amount you want to pay to purchase electricity units.</p>
              <p className="mt-1">Units will be calculated based on the customer&apos;s tariff rate.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormInputModule
                label="Amount to Pay"
                name="amount"
                type="text"
                placeholder="Enter amount"
                value={amountInput}
                onChange={handleAmountChange}
                required
                prefix="₦"
                min="500"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum amount: ₦500</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estimated Units</label>
              <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                {amountInput ? (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#004B23]">
                      {calculateUnits(Number(amountInput.replace(/,/g, ""))).toFixed(2)} kWh
                    </span>
                    <BsLightningCharge className="text-[#004B23]" />
                  </div>
                ) : (
                  <span className="text-gray-400">Enter amount to see estimated units</span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-sm font-medium text-gray-700">Payment Method:</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#004B23] px-3 py-1 text-xs font-medium text-white">Bank Transfer</span>
              <span className="text-xs text-gray-600">(Only available payment method)</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <ButtonModule
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={resetForm}
              disabled={isSubmittingPayment}
            >
              Cancel
            </ButtonModule>

            <ButtonModule
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={isSubmittingPayment || !amountInput || Number(amountInput.replace(/,/g, "")) < 500}
            >
              {isSubmittingPayment ? "Processing..." : "Buy Units"}
            </ButtonModule>
          </div>
        </form>
      </motion.div>
    </>
  )

  return (
    <section className="size-full">
      <CustomerDashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="flex w-full flex-col">
          <div className="mx-auto flex w-full flex-col px-3 py-4 lg:container sm:px-4 md:px-6 xl:px-16">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Buy Electricity Units</h1>
                <p className="text-sm text-gray-600">Purchase electricity units for yourself or for someone else.</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <StepProgress />

            <div className="grid items-start gap-6">
              {!vendType && renderStep1()}

              {vendType === "self" && isValidatingMeter && renderLoadingState()}

              {vendType === "third-party" && !meterInfo && renderStep2ThirdParty()}

              {vendType && meterInfo && <div className="grid gap-6 lg:grid-cols-2">{renderPurchaseForm()}</div>}
            </div>

            {/* Information Section */}
            <div className="mt-8 rounded-md border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-gray-800">Important Information</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>Purchase Process:</strong>
                </p>
                <ol className="ml-5 list-decimal space-y-2">
                  <li>Select whether you&apos;re buying for yourself or for someone else</li>
                  <li>Your meter is automatically validated for self purchase</li>
                  <li>Enter the amount you want to pay (minimum ₦500)</li>
                  <li>Click &quot;Buy Units&quot; to generate bank transfer details</li>
                  <li>Make payment to the provided account number</li>
                  <li>Units are delivered immediately after payment confirmation</li>
                </ol>

                <p className="mt-4">
                  <strong>Bank Transfer Instructions:</strong>
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Transfer the exact amount specified in the payment details</li>
                  <li>Use the provided reference number as your transfer narration</li>
                  <li>Units are delivered within 15 minutes of successful payment</li>
                  <li>Keep your transaction receipt for reference</li>
                  <li>Contact customer support if units are not delivered after 30 minutes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BankTransferDetailsModal
        isOpen={isVirtualAccountModalOpen}
        onRequestClose={() => setIsVirtualAccountModalOpen(false)}
      />
    </section>
  )
}

export default BuyUnit
