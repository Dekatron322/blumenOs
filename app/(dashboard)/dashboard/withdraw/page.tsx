"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { FiArrowLeft, FiCheck, FiDollarSign, FiRefreshCw, FiUser, FiX } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"
import { FormInputModule } from "components/ui/Input/Input"
import { useGetBankListQuery, useVerifyAccountMutation, useWithdrawMutation } from "lib/redux/adminSlice"
import { useGetCurrenciesQuery } from "lib/redux/overviewSlice"
import { FaPiggyBank } from "react-icons/fa"

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  isVerified: boolean
  bankCode: string
}

interface UserDetails {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  balances: CurrencyBalance[]
}

interface CurrencyBalance {
  currencyId: number
  balance: number
  currencySymbol: string
  currencyName: string
}

interface Bank {
  bankCode: string
  bankName: string
  bankLongCode: string
}

interface Currency {
  id: number
  name: string
  symbol: string
  ticker: string
  avatar: string
}

interface AccountVerificationResponse {
  isSuccess: boolean
  message: string
  data: {
    number: string
    bank: string
    name: string
  }
}

const MAX_TRANSACTION_AMOUNT = 5000000 // 5,000,000 maximum per transaction

const WithdrawPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [amount, setAmount] = useState("")
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isValidAmount, setIsValidAmount] = useState(true)
  const [activeField, setActiveField] = useState<"amount" | "bank" | "account" | "currency" | null>(null)
  const [showBankList, setShowBankList] = useState(false)
  const [showCurrencyList, setShowCurrencyList] = useState(false)
  const [bankSearchTerm, setBankSearchTerm] = useState("")
  const [currencySearchTerm, setCurrencySearchTerm] = useState("")
  const [narration, setNarration] = useState("")
  const [isAccountVerified, setIsAccountVerified] = useState(false)

  const router = useRouter()

  // Fetch bank list from API
  const {
    data: bankListData,
    isLoading: isBankListLoading,
    error: bankListError,
    refetch: refetchBankList,
  } = useGetBankListQuery()

  // Fetch currencies from API
  const {
    data: currenciesData,
    isLoading: isCurrenciesLoading,
    error: currenciesError,
    refetch: refetchCurrencies,
  } = useGetCurrenciesQuery()

  // Withdraw mutation
  const [withdraw, { isLoading: isWithdrawLoading }] = useWithdrawMutation()

  // Account verification mutation
  const [verifyAccount, { isLoading: isVerifyingAccount }] = useVerifyAccountMutation()

  // Get current balance for selected currency - This should come from your actual API
  const getCurrentBalance = (): number => {
    // In a real application, you would fetch this from your user balance API
    // For now, returning a placeholder value
    return 0
  }

  // Get current currency symbol for display
  const getCurrentCurrencySymbol = (): string => {
    if (!selectedCurrency) return "₦"
    return selectedCurrency.symbol
  }

  // Filter banks based on search term
  const filteredBanks =
    bankListData?.data?.filter((bank: Bank) => bank.bankName.toLowerCase().includes(bankSearchTerm.toLowerCase())) || []

  // Filter currencies based on search term
  const filteredCurrencies =
    currenciesData?.data?.filter((currency: Currency) =>
      currency.name.toLowerCase().includes(currencySearchTerm.toLowerCase())
    ) || []

  useEffect(() => {
    if (bankListError) {
      notify("error", "Bank List Error", {
        description: "Failed to load bank list. Please try again.",
      })
    }
  }, [bankListError])

  useEffect(() => {
    if (currenciesError) {
      notify("error", "Currencies Error", {
        description: "Failed to load currencies. Please try again.",
      })
    }
  }, [currenciesError])

  // Verify account details when account number is entered and bank is selected
  useEffect(() => {
    const verifyAccountDetails = async () => {
      if (accountNumber.length >= 10 && selectedBank) {
        setVerifyingAccount(true)
        setIsAccountVerified(false)

        try {
          const response = await verifyAccount({
            number: accountNumber,
            bank: selectedBank.bankCode,
          }).unwrap()

          if (response.isSuccess && response.data) {
            setAccountName(response.data.name)
            setIsAccountVerified(true)
            notify("success", "Account Verified", {
              description: "Account details verified successfully",
            })
          } else {
            notify("error", "Verification Failed", {
              description: response.message || "Could not verify account details. Please check and try again.",
            })
          }
        } catch (error: any) {
          notify("error", "Verification Error", {
            description: error.data?.message || error.message || "Failed to verify account details. Please try again.",
          })
        } finally {
          setVerifyingAccount(false)
        }
      } else {
        setIsAccountVerified(false)
        setAccountName("")
      }
    }

    // Add a delay to avoid making API calls on every keystroke
    const timeoutId = setTimeout(() => {
      if (accountNumber.length >= 10 && selectedBank) {
        verifyAccountDetails()
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [accountNumber, selectedBank, verifyAccount])

  const handleGoBack = () => {
    router.back()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedCurrency) {
      notify("error", "No Currency Selected", {
        description: "Please select a currency to withdraw",
      })
      return
    }

    if (!selectedBank) {
      notify("error", "No Bank Selected", {
        description: "Please select a bank to withdraw to",
      })
      return
    }

    if (!accountNumber || !isAccountVerified) {
      notify("error", "Account Not Verified", {
        description: "Please enter and verify your account number",
      })
      return
    }

    if (!amount) {
      notify("error", "Amount Required", {
        description: "Please enter an amount to withdraw",
      })
      return
    }

    if (!isValidAmount) {
      notify("error", "Invalid Amount", {
        description: "Please enter a valid amount",
      })
      return
    }

    const withdrawalAmount = parseFloat(amount)

    // Check if amount exceeds maximum transaction limit
    if (withdrawalAmount > MAX_TRANSACTION_AMOUNT) {
      notify("error", "Amount Exceeds Limit", {
        description: `Maximum withdrawal amount is ${getCurrentCurrencySymbol()}${MAX_TRANSACTION_AMOUNT.toLocaleString()}`,
      })
      return
    }

    // Store withdrawal data in session storage for OTP verification
    const withdrawalData = {
      currencyId: selectedCurrency.id,
      amount: withdrawalAmount,
      accountName: accountName,
      accountNumber: accountNumber,
      bankCode: selectedBank.bankCode,
      bankName: selectedBank.bankName,
      narration: narration || `Withdrawal to ${selectedBank.bankName}`,
      currencySymbol: selectedCurrency.symbol,
      currencyName: selectedCurrency.name,
      currencyTicker: selectedCurrency.ticker,
    }

    sessionStorage.setItem("withdrawalData", JSON.stringify(withdrawalData))

    // Redirect to OTP verification page
    router.push("/crypto/verification-code/withdraw")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value)

      const numericValue = parseFloat(value)
      const isValid = !!value && !isNaN(numericValue) && numericValue > 0
      const isWithinLimit = numericValue <= MAX_TRANSACTION_AMOUNT

      setIsValidAmount(isValid && isWithinLimit)
    }
  }

  const handleMaxAmount = () => {
    const currentBalance = getCurrentBalance()
    const maxAmount = Math.min(currentBalance, MAX_TRANSACTION_AMOUNT)
    setAmount(maxAmount.toString())
    setIsValidAmount(true)
  }

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank)
    setShowBankList(false)
    setBankSearchTerm("")
    // Reset account verification when bank changes
    setIsAccountVerified(false)
    setAccountName("")
  }

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency)
    setShowCurrencyList(false)
    setCurrencySearchTerm("")
  }

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Remove non-digit characters
    setAccountNumber(value)
    // Reset verification when account number changes
    if (value.length < 10) {
      setIsAccountVerified(false)
      setAccountName("")
    }
  }

  const clearSelectedBank = () => {
    setSelectedBank(null)
    setAccountNumber("")
    setAccountName("")
    setIsAccountVerified(false)
  }

  const clearSelectedCurrency = () => {
    setSelectedCurrency(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardNav />

      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8 flex items-center">
            <button onClick={handleGoBack} className="mr-4 rounded-full p-2 hover:bg-gray-100">
              <FiArrowLeft className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
              <p className="text-gray-500">Withdraw to your bank account</p>
            </div>
          </div>

          {/* Maximum Transaction Limit Notice */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <FiCheck className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Transaction Limit</h3>
                <p className="mt-1 text-xs text-blue-700">
                  Maximum withdrawal amount: {getCurrentCurrencySymbol()}
                  {MAX_TRANSACTION_AMOUNT.toLocaleString()} per transaction
                </p>
              </div>
            </div>
          </div>

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit}>
            {/* Currency Selection Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Select Currency</label>
              <div className="relative">
                {selectedCurrency ? (
                  <div
                    className={`rounded-xl border p-3 transition-all ${
                      activeField === "currency"
                        ? "border-blue-500 bg-white ring-2 ring-blue-200"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    onClick={() => setActiveField("currency")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {selectedCurrency.avatar ? (
                          <img
                            src={selectedCurrency.avatar}
                            alt={selectedCurrency.name}
                            className="mr-3 size-8 rounded-full"
                          />
                        ) : (
                          <div className="mr-3 flex size-8 items-center justify-center rounded-full bg-blue-100">
                            <FiDollarSign className="text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-800">{selectedCurrency.name}</div>
                          <div className="text-sm text-gray-600">{selectedCurrency.ticker}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedCurrency}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX className="size-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      activeField === "currency"
                        ? "border-blue-500 bg-white ring-2 ring-blue-200"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setShowCurrencyList(true)
                      setActiveField("currency")
                    }}
                  >
                    <div className="flex items-center">
                      <FiDollarSign className="mr-2 text-gray-400" />
                      <span className="text-gray-600">Select currency</span>
                    </div>
                  </button>
                )}

                {/* Currency List Modal */}
                <AnimatePresence>
                  {showCurrencyList && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
                    >
                      <div className="sticky top-0 bg-white p-3">
                        <FormInputModule
                          type="text"
                          placeholder="Search currencies..."
                          value={currencySearchTerm}
                          onChange={(e) => setCurrencySearchTerm(e.target.value)}
                          className="mb-2"
                          label=""
                        />
                      </div>

                      {isCurrenciesLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <FiRefreshCw className="mr-2 animate-spin" />
                            <span>Loading currencies...</span>
                          </div>
                        </div>
                      ) : currenciesError ? (
                        <div className="p-4 text-center text-red-500">
                          <p className="text-sm">Failed to load currencies</p>
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => refetchCurrencies()}
                          >
                            Retry
                          </ButtonModule>
                        </div>
                      ) : filteredCurrencies.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">No currencies found</p>
                        </div>
                      ) : (
                        filteredCurrencies.map((currency: Currency) => (
                          <button
                            key={currency.id}
                            type="button"
                            className="flex w-full items-center justify-between p-3 hover:bg-gray-50"
                            onClick={() => handleCurrencySelect(currency)}
                          >
                            <div className="flex items-center">
                              {currency.avatar ? (
                                <img src={currency.avatar} alt={currency.name} className="mr-3 size-8 rounded-full" />
                              ) : (
                                <div className="mr-3 flex size-8 items-center justify-center rounded-full bg-blue-100">
                                  <FiDollarSign className="text-blue-600" />
                                </div>
                              )}
                              <div className="text-left">
                                <div className="font-medium text-gray-800">{currency.name}</div>
                                <div className="text-sm text-gray-600">{currency.ticker}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bank Selection Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Select Bank</label>
              <div className="relative">
                {selectedBank ? (
                  <div
                    className={`rounded-xl border p-3 transition-all ${
                      activeField === "bank"
                        ? "border-blue-500 bg-white ring-2 ring-blue-200"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    onClick={() => setActiveField("bank")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-blue-100">
                          <FaPiggyBank />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{selectedBank.bankName}</div>
                          <div className="text-sm text-gray-600">Bank selected</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedBank}
                        className="hover:textGray-600 ml-2 text-gray-400"
                      >
                        <FiX className="size-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      activeField === "bank"
                        ? "border-blue-500 bg-white ring-2 ring-blue-200"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setShowBankList(true)
                      setActiveField("bank")
                    }}
                  >
                    <div className="flex items-center">
                      <FaPiggyBank className="mr-2 text-gray-400" />
                      <span className="text-gray-600">Select your bank</span>
                    </div>
                  </button>
                )}

                {/* Bank List Modal */}
                <AnimatePresence>
                  {showBankList && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
                    >
                      <div className="sticky top-0 bg-white p-3">
                        <FormInputModule
                          type="text"
                          placeholder="Search banks..."
                          value={bankSearchTerm}
                          onChange={(e) => setBankSearchTerm(e.target.value)}
                          className="mb-2"
                          label=""
                        />
                      </div>

                      {isBankListLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <FiRefreshCw className="mr-2 animate-spin" />
                            <span>Loading banks...</span>
                          </div>
                        </div>
                      ) : bankListError ? (
                        <div className="p-4 text-center text-red-500">
                          <p className="text-sm">Failed to load banks</p>
                          <ButtonModule variant="outline" size="sm" className="mt-2" onClick={() => refetchBankList()}>
                            Retry
                          </ButtonModule>
                        </div>
                      ) : filteredBanks.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">No banks found</p>
                        </div>
                      ) : (
                        filteredBanks.map((bank: Bank) => (
                          <button
                            key={bank.bankCode}
                            type="button"
                            className="flex w-full items-center justify-between p-3 hover:bg-gray-50"
                            onClick={() => handleBankSelect(bank)}
                          >
                            <div className="itemsCenter flex">
                              <div className="mr-3 flex size-10 items-center justify-center rounded-full bg-blue-100">
                                <FaPiggyBank className="text-blue-600" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium text-gray-800">{bank.bankName}</div>
                                <div className="text-xs text-gray-500">{bank.bankCode}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Account Number Field */}
            {selectedBank && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">Account Number</label>
                <div
                  className={`relative rounded-xl border p-3 transition-all ${
                    activeField === "account"
                      ? "border-blue-500 bg-white ring-2 ring-blue-200"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onClick={() => setActiveField("account")}
                >
                  <div className="flex items-center">
                    <FiUser className={`mr-2 text-gray-400 ${activeField === "account" ? "text-blue-500" : ""}`} />
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter account number"
                      className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                      value={accountNumber}
                      onChange={handleAccountNumberChange}
                      onFocus={() => setActiveField("account")}
                      onBlur={() => setActiveField(null)}
                      maxLength={10}
                      required
                    />
                    {verifyingAccount && (
                      <div className="ml-2 flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        <FiRefreshCw className="mr-1 animate-spin" /> Verifying
                      </div>
                    )}
                    {isAccountVerified && !verifyingAccount && (
                      <div className="ml-2 flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        <FiCheck className="mr-1" /> Verified
                      </div>
                    )}
                  </div>
                </div>
                {accountNumber.length > 0 && accountNumber.length < 10 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs text-yellow-500"
                  >
                    Enter 10-digit account number
                  </motion.p>
                )}
                {isAccountVerified && accountName && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs text-green-600"
                  >
                    Account Name: {accountName}
                  </motion.p>
                )}
              </div>
            )}

            {/* Amount Field */}
            <div className="mb-6">
              {/* <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <button type="button" onClick={handleMaxAmount} className="text-xs text-blue-600 hover:text-blue-800">
                  Max: {getCurrentCurrencySymbol()}
                  {Math.min(getCurrentBalance(), MAX_TRANSACTION_AMOUNT).toLocaleString()}
                </button>
              </div> */}
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "amount"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("amount")}
              >
                <div className="flex items-center">
                  <FiDollarSign className={`mr-2 text-gray-400 ${activeField === "amount" ? "text-blue-500" : ""}`} />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                    value={amount}
                    onChange={handleAmountChange}
                    onFocus={() => setActiveField("amount")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                </div>
                {!isValidAmount && amount && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs text-red-500"
                  >
                    {parseFloat(amount) > MAX_TRANSACTION_AMOUNT
                      ? `Amount exceeds maximum limit of ${getCurrentCurrencySymbol()}${MAX_TRANSACTION_AMOUNT.toLocaleString()}`
                      : "Please enter a valid amount"}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Narration Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
              <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all">
                <input
                  type="text"
                  placeholder="Add a description for this withdrawal"
                  className="w-full bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </div>
            </div>

            {/* Transaction Summary */}
            {amount && isValidAmount && selectedBank && isAccountVerified && selectedCurrency && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-800">Transaction Summary</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-medium">
                      {selectedCurrency.name} ({selectedCurrency.ticker})
                    </span>
                  </div>

                  <div className="justifyBetween flex">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {selectedCurrency.symbol}
                      {parseFloat(amount).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">{selectedCurrency.symbol}0.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-green-600">
                      {selectedCurrency.symbol}
                      {parseFloat(amount).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium">{selectedBank.bankName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Account:</span>
                      <span className="font-medium">{accountNumber}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{accountName}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={
                  loading ||
                  !selectedCurrency ||
                  !selectedBank ||
                  !accountNumber ||
                  !isAccountVerified ||
                  !amount ||
                  !isValidAmount
                }
                className="w-full"
              >
                {loading || isWithdrawLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  "Continue to Verification"
                )}
              </ButtonModule>

              <ButtonModule type="button" variant="outline" size="lg" className="w-full" onClick={handleGoBack}>
                Cancel
              </ButtonModule>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default WithdrawPage
