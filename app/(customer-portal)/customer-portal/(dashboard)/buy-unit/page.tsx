"use client"

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import BankTransferDetailsModal from "components/ui/Modal/generated-bank-transfer-modal"
import CardPaymentModal from "components/ui/Modal/card-payment-modal"
import { BsLightningCharge, BsPerson, BsPersonPlus } from "react-icons/bs"
import { FaCheckCircle } from "react-icons/fa"
import { notify } from "components/ui/Notification/Notification"
import CustomerDashboardNav from "components/Navbar/CustomerDashboardNav"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { customerLookup, getToken, vend, VendToken } from "lib/redux/customersDashboardSlice"
import { useSearchParams } from "next/navigation"

function BuyUnitContent() {
  console.log("BuyUnitContent component mounting/initializing")

  // Redux hooks
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const { customer } = useAppSelector((state) => state.customerAuth)
  const {
    customerLookupData,
    isLookingUpCustomer,
    customerLookupError,
    customerLookupSuccess,
    vendResponseData,
    isVending,
    vendError,
    vendSuccess,
    getTokenResponseData,
    isGettingToken,
    getTokenError,
    getTokenSuccess,
  } = useAppSelector((state) => state.customersDashboard)

  // Step 1: Choose vend type
  const [vendType, setVendType] = useState<"self" | "third-party" | null>(null)

  // Step 2: Meter validation
  const [meterNumber, setMeterNumber] = useState("")
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid")
  const [isValidatingMeter, setIsValidatingMeter] = useState(false)
  const [meterInfo, setMeterInfo] = useState<any>(null)
  const [meterValidationError, setMeterValidationError] = useState<string | null>(null)
  const [selectedMeter, setSelectedMeter] = useState<any>(null)

  // Step 3: Payment details
  const [amountInput, setAmountInput] = useState("")
  const [paymentChannel, setPaymentChannel] = useState<"BankTransfer" | "Card">("BankTransfer")
  const [isVirtualAccountModalOpen, setIsVirtualAccountModalOpen] = useState(false)
  const [isCardPaymentModalOpen, setIsCardPaymentModalOpen] = useState(false)
  const [isInitiatingNewCardPayment, setIsInitiatingNewCardPayment] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [vendReference, setVendReference] = useState<string | null>(null)
  const [tokens, setTokens] = useState<VendToken[]>([])
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const maxPollingAttempts = 12 // 12 attempts × 30 seconds = 6 minutes
  const [isCheckingToken, setIsCheckingToken] = useState(false)
  const [showTokensModal, setShowTokensModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(undefined)
  const [shouldPoll, setShouldPoll] = useState(false)
  const [manuallyClosed, setManuallyClosed] = useState(() => {
    // Check localStorage on initial mount to see if user manually closed modal
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cardPaymentModalManuallyClosed")
      return stored === "true"
    }
    return false
  })
  const [vendData, setVendData] = useState<any>(null)

  // Refs for polling control
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingActiveRef = useRef(false)
  const hasTokensRef = useRef(false)

  // Current logged in customer info (for self vend)
  const customerAccountNumber = customer?.accountNumber || ""
  const customerDRN = customer?.meters?.[0]?.drn || ""
  const customerType = customer?.isMeteredPostpaid ? "postpaid" : "prepaid"

  // Persist manuallyClosed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cardPaymentModalManuallyClosed", manuallyClosed.toString())
    }
  }, [manuallyClosed])
  useEffect(() => {
    return () => {
      stopTokenPolling()
    }
  }, [])

  // Handle meter selection for self vend
  const handleMeterSelection = (meter: any) => {
    setSelectedMeter(meter)
    setMeterValidationError(null)

    if (meter?.drn) {
      setIsValidatingMeter(true)
      dispatch(
        customerLookup({
          reference: meter.drn,
          type: customerType,
        })
      )
    } else {
      setMeterValidationError("Selected meter has no DRN. Please contact support.")
    }
  }

  // Auto-lookup customer when component mounts for self vend
  useEffect(() => {
    if (vendType === "self" && customer && !meterInfo && !isLookingUpCustomer) {
      // Check if customer has meters
      if (!customer.meters || customer.meters.length === 0) {
        setMeterValidationError(
          customerType === "postpaid"
            ? "No meter found for your postpaid account. Please request a meter installation or contact support."
            : "No meter found for your prepaid account. Please request a meter installation or contact support."
        )
        return
      }

      // If customer has only one meter, proceed with lookup automatically
      if (customer.meters.length === 1 && customerDRN) {
        setSelectedMeter(customer.meters[0])
        setIsValidatingMeter(true)
        dispatch(
          customerLookup({
            reference: customerDRN,
            type: customerType,
          })
        )
      }
      // If multiple meters, show selection UI (handled in renderSelfMeterSelection)
    }
  }, [vendType, customer, customerDRN, customerType, meterInfo, isLookingUpCustomer, dispatch])

  // Handle return from card payment checkout using sessionStorage
  useEffect(() => {
    console.log("SessionStorage effect running")
    if (typeof window !== "undefined") {
      const callbackData = sessionStorage.getItem("paymentCallback")
      console.log("SessionStorage callbackData:", callbackData)

      if (callbackData) {
        try {
          const parsedData = JSON.parse(callbackData)
          const { trxref, reference, transactionRef, timestamp } = parsedData as {
            trxref?: string
            reference?: string
            transactionRef?: string
            timestamp: number
          }

          // Only process if it's recent (within 5 minutes)
          if (Date.now() - timestamp < 300000) {
            console.log("Payment callback detected:", { trxref, reference })

            // Set the vend reference and payment status
            setVendReference(transactionRef || reference || null)
            setPaymentStatus("Processing")
            setPaymentChannel("Card")

            notify("info", "Payment received", {
              description: "Checking for your tokens...",
              duration: 3000,
            })

            // Open card payment modal and set polling flag
            setIsCardPaymentModalOpen(true)
            setShouldPoll(true)
          }
        } catch (error) {
          console.error("Error parsing callback data:", error)
        }

        // Clean up sessionStorage after processing
        sessionStorage.removeItem("paymentCallback")
      }
    }
  }, [])

  // Handle URL parameters as fallback (for payment gateway redirects)
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref")
    console.log(
      "URL parameters effect - reference:",
      reference,
      "isCardPaymentModalOpen:",
      isCardPaymentModalOpen,
      "manuallyClosed:",
      manuallyClosed
    )

    if (reference && !isCardPaymentModalOpen && !manuallyClosed) {
      setVendReference(reference)
      setPaymentStatus("Processing")
      setPaymentChannel("Card")

      notify("info", "Payment received", {
        description: "Checking for your tokens...",
        duration: 3000,
      })

      setIsCardPaymentModalOpen(true)
      setShouldPoll(true)
    }
  }, [searchParams, isCardPaymentModalOpen, manuallyClosed])

  // Handle page refresh scenario - detect when page is refreshed with payment parameters
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref")

    // If we have URL parameters and it's a page refresh (not initial navigation),
    // automatically close modal and clear URL
    if (reference && isCardPaymentModalOpen) {
      // Check if this is a page refresh by looking at navigation type
      if (performance.getEntriesByType && performance.getEntriesByType("navigation").length > 0) {
        const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
        if (navigationEntry.type === "reload") {
          console.log("Page refresh detected with payment modal open - auto-closing modal and clearing URL")
          setIsCardPaymentModalOpen(false)
          setManuallyClosed(true)
          window.history.replaceState({}, "", "/customer-portal/buy-unit")
        }
      }
    }
  }, [searchParams, isCardPaymentModalOpen])

  // Handle customer lookup response
  useEffect(() => {
    if (customerLookupSuccess && customerLookupData) {
      setIsValidatingMeter(false)

      const firstMeter = customerLookupData.meters?.[0]
      const meterDRN = firstMeter?.drn
      const meterTariff = firstMeter?.tariffRate

      console.log("Customer lookup response:", {
        customerLookupData,
        firstMeter,
        meterDRN,
        meterTariff,
      })

      setMeterInfo({
        ...customerLookupData,
        meterNumber: meterDRN || "",
        tariff: meterTariff?.toString() || "R2",
        serviceCenter: customerLookupData.serviceCenterName || "Default Service Center",
        outstandingBalance: customerLookupData.customerOutstandingDebtBalance || 0,
        isActive: firstMeter?.isMeterActive || true,
      })

      if (vendType === "self") {
        // Use customerDRN as fallback if meterDRN from lookup is empty
        const finalMeterNumber = meterDRN || customerDRN || ""
        console.log("Self vend - setting meter number:", { meterDRN, customerDRN, finalMeterNumber })
        setMeterNumber(finalMeterNumber)
        notify("success", "Your meter has been validated", {
          description: `Welcome back, ${customerLookupData.fullName}!`,
          duration: 3000,
        })
      } else if (vendType === "third-party") {
        notify("success", "Meter validated successfully", {
          description: `Customer: ${customerLookupData.fullName}`,
          duration: 3000,
        })
      }
    }
  }, [customerLookupSuccess, customerLookupData, vendType])

  // Handle customer lookup error
  useEffect(() => {
    if (customerLookupError) {
      setIsValidatingMeter(false)

      if (vendType === "self") {
        setMeterValidationError("Unable to validate your meter. Please try again or contact support.")
        notify("error", "Meter validation failed", {
          description: customerLookupError,
          duration: 5000,
        })
      } else if (vendType === "third-party") {
        setMeterValidationError(customerLookupError)
        notify("error", "Invalid meter details", {
          description: customerLookupError,
          duration: 5000,
        })
      }
    }
  }, [customerLookupError, vendType])

  // Update loading state
  useEffect(() => {
    setIsValidatingMeter(isLookingUpCustomer)
  }, [isLookingUpCustomer])

  // Main polling effect - only runs when shouldPoll changes
  useEffect(() => {
    if (shouldPoll && vendReference && !isPollingActiveRef.current && !hasTokensRef.current) {
      console.log("Starting polling for vend reference:", vendReference)
      startTokenPolling()
    } else if (!shouldPoll && isPollingActiveRef.current) {
      console.log("Stopping polling as shouldPoll is false")
      stopTokenPolling()
    }
  }, [shouldPoll, vendReference])

  // Stop polling when we have tokens
  useEffect(() => {
    if (tokens.length > 0 && isPollingActiveRef.current) {
      console.log("Tokens received, stopping polling")
      stopTokenPolling()
      hasTokensRef.current = true
    }
  }, [tokens])

  // Handle vend success
  useEffect(() => {
    if (vendSuccess && vendResponseData) {
      setIsSubmittingPayment(false)
      setVendReference(vendResponseData.reference)
      setPaymentStatus(vendResponseData.status)
      setVendData(vendResponseData)

      notify("success", "Vend initiated successfully", {
        description: `Reference: ${vendResponseData.reference}`,
        duration: 3000,
      })

      if (vendResponseData.channel === "Card" && vendResponseData.paymentDetails?.checkoutUrl) {
        setIsCardPaymentModalOpen(true)

        if (isInitiatingNewCardPayment) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "paymentCallback",
              JSON.stringify({
                transactionRef: vendResponseData.reference,
                reference: vendResponseData.reference,
                timestamp: Date.now(),
              })
            )
          }

          window.open(vendResponseData.paymentDetails.checkoutUrl, "_self")
          setIsInitiatingNewCardPayment(false)

          notify("info", "Redirecting to checkout", {
            description: "Complete your payment there. This modal will show your tokens when ready.",
            duration: 5000,
          })

          // Don't start polling yet - wait for callback
        } else {
          // This is for returning from payment - start polling
          setShouldPoll(true)
        }
      } else if (vendResponseData.paymentDetails?.virtualAccount) {
        setIsVirtualAccountModalOpen(true)
        setShouldPoll(true)
      }
    }
  }, [vendSuccess, vendResponseData, isInitiatingNewCardPayment, amountInput, meterInfo])

  // Handle vend error
  useEffect(() => {
    if (vendError) {
      setIsSubmittingPayment(false)
      notify("error", vendError)
    }
  }, [vendError])

  // Handle get token success
  useEffect(() => {
    if (getTokenSuccess && getTokenResponseData) {
      console.log("Get token response data:", getTokenResponseData)

      if (getTokenResponseData.status === "Paid" || getTokenResponseData.status === "Confirmed") {
        // Handle token data - it could be an array or a single object
        let tokenData: VendToken[] = []
        if (getTokenResponseData.tokens && Array.isArray(getTokenResponseData.tokens)) {
          tokenData = getTokenResponseData.tokens
        } else if (getTokenResponseData.token) {
          // Single token object
          tokenData = [getTokenResponseData.token]
        }
        setTokens(tokenData)
        setPaymentStatus(getTokenResponseData.status)
        setVendData(getTokenResponseData) // Update vendData with complete payment information

        // Determine if this is prepaid or postpaid
        const isPrepaid = vendType === "self" ? customerType === "prepaid" : meterType === "prepaid"

        if (tokenData.length > 0) {
          setShouldPoll(false) // This will trigger the polling effect to stop
          setIsCheckingToken(false)
          setPollingAttempts(0)

          notify("success", "Tokens retrieved successfully!", {
            description: `${tokenData.length} tokens available`,
            duration: 3000,
          })

          setShowTokensModal(true)
        } else {
          // No tokens - handle differently for prepaid vs postpaid
          if (isPrepaid) {
            // Prepaid: Show error since tokens are required
            // notify("error", "Token generation failed", {
            //   description: "Payment confirmed but no tokens were generated. Please contact support.",
            //   duration: 5000,
            // })
            setShouldPoll(false)
            setIsCheckingToken(false)
            setPollingAttempts(0)
          } else {
            // Postpaid: Show success since no tokens are expected
            notify("success", "Payment confirmed successfully!", {
              description: "Your payment has been applied to your postpaid account",
              duration: 3000,
            })
            setShouldPoll(false)
            setIsCheckingToken(false)
            setPollingAttempts(0)
          }
        }
      } else if (getTokenResponseData.status === "Pending") {
        notify("info", "Payment still pending", {
          description: "Waiting for payment confirmation...",
          duration: 3000,
        })
      }
    }
  }, [getTokenSuccess, getTokenResponseData])

  // Handle get token error
  useEffect(() => {
    if (getTokenError) {
      console.error("Get token error:", getTokenError)
      setIsCheckingToken(false)
    }
  }, [getTokenError])

  // Handle get token request
  const handleGetToken = useCallback(
    async (isPolling = false) => {
      if (!vendReference) {
        console.log("No vendReference for getToken call, skipping")
        return
      }

      if (!isPolling) {
        setIsCheckingToken(true)
      }

      try {
        const result = await dispatch(getToken({ reference: vendReference })).unwrap()

        if (result?.data?.status === "Paid" || result?.data?.status === "Confirmed") {
          // Handle token data - it could be an array or a single object
          let tokenData: VendToken[] = []
          if (result?.data?.tokens && Array.isArray(result?.data?.tokens)) {
            tokenData = result?.data?.tokens
          } else if (result?.data?.token) {
            // Single token object
            tokenData = [result?.data?.token]
          }
          setTokens(tokenData)
          setPaymentStatus(result?.data?.status)
          setVendData(result?.data) // Update vendData with complete payment information

          // Determine if this is prepaid or postpaid
          const isPrepaid = vendType === "self" ? customerType === "prepaid" : meterType === "prepaid"

          // Stop polling when payment is confirmed
          setShouldPoll(false)
          setIsCheckingToken(false)
          setPollingAttempts(0)

          if (isPrepaid) {
            // PREPAID: Check for tokens and display them
            if (tokenData.length > 0) {
              if (!isPolling) {
                notify("success", "Tokens retrieved successfully!", {
                  description: `${tokenData.length} tokens available`,
                  duration: 3000,
                })
                setShowTokensModal(true)
              }
            } else {
              // Prepaid but no tokens yet - stop polling since prepaid requires tokens
              if (!isPolling) {
                // notify("error", "Token generation failed", {
                //   description: "Payment confirmed but no tokens were generated. Please contact support.",
                //   duration: 5000,
                // })
              }
              // Stop polling for prepaid if no tokens - prepaid requires tokens to be valid
              setShouldPoll(false)
            }
          } else {
            // POSTPAID: Display confirmation message (no tokens expected)
            if (!isPolling) {
              notify("success", "Payment confirmed successfully!", {
                description: "Your payment has been applied to your postpaid account",
                duration: 3000,
              })
            }
          }
        } else {
          if (!isPolling) {
            const isPrepaid = vendType === "self" ? customerType === "prepaid" : meterType === "prepaid"
            notify("info", `Transaction status: ${result?.data?.status || "Pending"}`, {
              description: isPrepaid
                ? "Tokens will be available once payment is confirmed"
                : "Payment confirmation will be processed once payment is confirmed",
              duration: 3000,
            })
            setIsCheckingToken(false)
          }
        }
      } catch (error: any) {
        console.error("Get token failed:", error)
        if (!isPolling) {
          notify("error", "Failed to retrieve tokens", {
            description: error.message || "Please try again",
            duration: 3000,
          })
          setIsCheckingToken(false)
        }
      }
    },
    [vendReference, dispatch]
  )

  // Start token polling
  const startTokenPolling = useCallback(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    // Reset state
    setPollingAttempts(0)
    isPollingActiveRef.current = true
    hasTokensRef.current = false
    setIsCheckingToken(true)

    console.log("Starting new polling interval")

    // Initial call
    handleGetToken(true)

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      setPollingAttempts((prev) => {
        const newAttempts = prev + 1

        // Stop if we have tokens
        if (tokens.length > 0 || hasTokensRef.current) {
          console.log("Tokens available, stopping polling")
          stopTokenPolling()
          return newAttempts
        }

        // Stop after max attempts
        if (newAttempts >= maxPollingAttempts) {
          console.log(`Max polling attempts reached: ${maxPollingAttempts}`)
          stopTokenPolling()
          notify("error", "Token retrieval timed out", {
            description: "Payment confirmation timed out after 6 minutes. Please contact support.",
            duration: 5000,
          })
          return newAttempts
        }

        console.log(`Polling attempt ${newAttempts}/${maxPollingAttempts}`)
        handleGetToken(true)
        return newAttempts
      })
    }, 30000) // Poll every 30 seconds
  }, [handleGetToken, maxPollingAttempts, tokens.length])

  // Stop token polling
  const stopTokenPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log("Polling stopped")
    }
    isPollingActiveRef.current = false
    setShouldPoll(false)
    setIsCheckingToken(false)
  }, [])

  const handleSelectVendType = (type: "self" | "third-party") => {
    setVendType(type)
    setMeterNumber("")
    setMeterType("prepaid")
    setMeterInfo(null)
    setMeterValidationError(null)
    setAmountInput("")

    if (type === "self") {
      // Self vend will be handled by useEffect
    }
  }

  // Handle third-party meter validation
  const validateThirdPartyMeter = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!meterNumber.trim()) {
      setMeterValidationError("Please enter a meter number")
      return
    }

    // Default to prepaid for third party
    const prepaidMeterType = "prepaid"

    setIsValidatingMeter(true)
    setMeterInfo(null)
    setMeterValidationError(null)

    try {
      await dispatch(
        customerLookup({
          reference: meterNumber.trim(),
          type: prepaidMeterType,
        })
      ).unwrap()
    } catch (error) {
      // Error is handled by useEffect
      console.error("Meter validation failed:", error)
    }
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
    if (!meterInfo) return 0

    const tariffRate = meterInfo.tariff
    let ratePerKWh = 24.3 // Default rate for R2 tariff

    if (tariffRate === "C1") ratePerKWh = 35.8
    else if (tariffRate === "A1") ratePerKWh = 42.5
    else if (tariffRate === "B1") ratePerKWh = 28.9

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

    // Clear manuallyClosed state when starting new payment
    setManuallyClosed(false)

    if (paymentChannel === "Card") {
      setIsInitiatingNewCardPayment(true)
    }

    try {
      // For self vend, use customerDRN as fallback if meterNumber is empty
      const customerNumberForVend = vendType === "self" && !meterNumber ? customerDRN : meterNumber

      const vendRequest = {
        customerNumber: customerNumberForVend,
        amount: amount,
        channel: paymentChannel,
        type: vendType === "self" ? customerType : meterType,
        callbackUrl: `${window.location.origin}/customer-portal/buy-unit`,
      }

      console.log("Sending vend request:", {
        vendRequest,
        meterNumber,
        customerNumberForVend,
        vendType,
        customerDRN,
        meterInfo,
      })

      await dispatch(vend(vendRequest)).unwrap()
    } catch (error: any) {
      console.error("Vend failed:", error)
      notify("error", error.message || "Failed to process payment request")
      setIsSubmittingPayment(false)
      setIsInitiatingNewCardPayment(false)
    }
  }

  const resetForm = () => {
    stopTokenPolling()
    setVendType(null)
    setMeterNumber("")
    setMeterType("prepaid")
    setMeterInfo(null)
    setMeterValidationError(null)
    setSelectedMeter(null)
    setAmountInput("")
    setPaymentChannel("BankTransfer")
    setIsVirtualAccountModalOpen(false)
    setIsCardPaymentModalOpen(false)
    setIsInitiatingNewCardPayment(false)
    setShouldPoll(false)
    setVendData(null)
    hasTokensRef.current = false
    setManuallyClosed(false) // This will also clear localStorage via useEffect
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    notify("success", "Copied to clipboard!", {
      duration: 2000,
    })
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
          <li>For self purchase, your meter will be automatically validated</li>
          <li>For third party purchase, you&apos;ll need to enter the recipient&apos;s meter number and type</li>
          <li>For Bank Transfer: All payments are processed via bank transfer</li>
          <li>For Card: Payments are processed securely via payment gateway</li>
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
        <h2 className="text-base font-semibold text-gray-800">Enter Meter Details</h2>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Third Party Purchase
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Enter the meter number of the prepaid customer you want to purchase units for.
        </p>

        <form onSubmit={validateThirdPartyMeter} className="space-y-4">
          <FormInputModule
            label="Customer Meter Number"
            type="text"
            name="meterNumber"
            id="meterNumber"
            placeholder="Enter meter number"
            value={meterNumber}
            onChange={(e) => setMeterNumber(e.target.value)}
            required
            error={meterValidationError || undefined}
          />

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

  const renderSelfMeterSelection = () => (
    <motion.div
      className="rounded-md border bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Select Your Meter</h2>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Self Purchase</span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          You have multiple meters. Please select the meter you want to purchase electricity units for.
        </p>

        {meterValidationError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {meterValidationError}
          </div>
        )}

        <div className="space-y-3">
          {customer?.meters?.map((meter: any, index: number) => (
            <div
              key={meter.id || index}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                selectedMeter?.id === meter.id
                  ? "border-[#004B23] bg-[#004B23]/5"
                  : "border-gray-200 bg-gray-50 hover:border-[#004B23] hover:bg-[#004B23]/5"
              }`}
              onClick={() => handleMeterSelection(meter)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-800">Meter #{index + 1}</h3>
                    {meter.isMeterActive && (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        <FaCheckCircle className="size-3" /> Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                    <div>
                      <span className="font-medium">DRN:</span> {meter.drn || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Serial Number:</span> {meter.serialNumber || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {meter.address || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Meter Type:</span> {meter.isSmart ? "Smart" : "Regular"}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {meter.meterCategory || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Tariff Rate:</span> ₦{meter.tariffRate?.toFixed(2) || "N/A"}
                    </div>
                  </div>
                </div>

                {selectedMeter?.id === meter.id && (
                  <div className="ml-4">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#004B23]">
                      <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <ButtonModule
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => {
              setSelectedMeter(null)
              setVendType(null)
              setMeterValidationError(null)
            }}
          >
            Back
          </ButtonModule>
        </div>
      </div>
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
              <p className="text-base font-bold text-[#004B23]">{meterInfo?.fullName}</p>
            </div>
            <div>
              <span className="font-medium text-[#004B23]">Meter Number:</span>
              <p className="text-base font-bold text-[#004B23]">{selectedMeter?.drn || meterInfo?.meterNumber}</p>
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

          <div className="mt-3">
            <span className="font-medium text-[#004B23]">Meter Type:</span>
            <p className="text-base font-bold text-[#004B23]">
              {vendType === "self"
                ? customerType === "postpaid"
                  ? "Postpaid"
                  : "Prepaid"
                : meterType === "postpaid"
                ? "Postpaid"
                : "Prepaid"}
            </p>
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
              setMeterType("prepaid")
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

          <div className="grid gap-4 sm:grid-cols-1">
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

            {/* <div className="space-y-2">
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
            </div> */}
          </div>

          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-sm font-medium text-gray-700">Payment Method:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaymentChannel("BankTransfer")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  paymentChannel === "BankTransfer"
                    ? "bg-[#004B23] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Bank Transfer
              </button>
              <button
                type="button"
                onClick={() => setPaymentChannel("Card")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  paymentChannel === "Card" ? "bg-[#004B23] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Card Payment
              </button>
            </div>
            {paymentChannel === "Card" && (
              <p className="mt-2 text-xs text-gray-600">
                Card payments are processed securely via our payment gateway.
              </p>
            )}
            {paymentChannel === "BankTransfer" && (
              <p className="mt-2 text-xs text-gray-600">Transfer to the provided virtual account number.</p>
            )}
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
              {isSubmittingPayment ? "Processing..." : paymentChannel === "Card" ? "Proceed to Payment" : "Buy Units"}
            </ButtonModule>
          </div>
        </form>
      </motion.div>
    </>
  )

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <CustomerDashboardNav />
      <div className="flex w-full">
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

              {vendType === "self" &&
                !isValidatingMeter &&
                !meterInfo &&
                customer?.meters &&
                customer.meters.length > 1 &&
                !selectedMeter &&
                renderSelfMeterSelection()}

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
                  <li>For self: Your meter is automatically validated</li>
                  <li>For third-party: Enter meter number and select meter type (prepaid/postpaid)</li>
                  <li>Enter the amount you want to pay (minimum ₦500)</li>
                  <li>Select your preferred payment method (Bank Transfer or Card)</li>
                  <li>Click &quot;Buy Units&quot; or &quot;Proceed to Payment&quot; to continue</li>
                  <li>For Bank Transfer: Make payment to the provided account number</li>
                  <li>For Card: Complete payment via secure checkout</li>
                  <li>Units are delivered immediately after payment confirmation</li>
                </ol>

                <p className="mt-4">
                  <strong>Token Retrieval:</strong>
                </p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>
                    For Bank Transfer: After payment, the system will automatically check for tokens every 30 seconds
                  </li>
                  <li>For Card: Tokens are delivered immediately after successful payment</li>
                  <li>This will continue for up to 6 minutes (12 attempts) for bank transfers</li>
                  <li>Once tokens are available, they will be displayed automatically</li>
                  <li>You can also manually check for tokens using the &quot;Check for Tokens&quot; button</li>
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
        virtualAccount={vendResponseData?.paymentDetails?.virtualAccount}
        vendReference={vendResponseData?.reference}
        onIHavePaid={handleGetToken}
        isCheckingToken={isCheckingToken}
        pollingAttempts={pollingAttempts}
        maxPollingAttempts={maxPollingAttempts}
        paymentStatus={paymentStatus}
        meterType={vendType === "self" ? customerType : meterType}
        tokens={tokens}
        vendData={vendData}
      />

      <CardPaymentModal
        isOpen={isCardPaymentModalOpen && !manuallyClosed}
        onRequestClose={() => {
          setIsCardPaymentModalOpen(false)
          setManuallyClosed(true)
          // Only clear URL parameters if payment is confirmed and user has seen tokens
          if (
            (paymentStatus === "Paid" || paymentStatus === "Confirmed") &&
            ((vendType === "self" ? customerType === "prepaid" : meterType === "prepaid") ? tokens.length > 0 : true)
          ) {
            // Clear URL parameters to prevent modal from reopening
            window.history.replaceState({}, "", "/customer-portal/buy-unit")
          }
        }}
        vendReference={vendReference}
        onPaymentConfirmed={(tokens) => {
          setShowTokensModal(true)
          setIsCardPaymentModalOpen(false)
          setManuallyClosed(true)
          // Don't clear URL parameters here - let the user close the modal manually
        }}
        isCheckingToken={isCheckingToken}
        pollingAttempts={pollingAttempts}
        maxPollingAttempts={maxPollingAttempts}
        paymentStatus={paymentStatus}
        tokens={tokens}
        meterType={vendType === "self" ? customerType : meterType}
        vendData={vendData}
      />
    </section>
  )
}

export default function BuyUnit() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BuyUnitContent />
    </Suspense>
  )
}
