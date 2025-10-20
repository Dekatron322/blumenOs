"use client"
import React, { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { FiArrowLeft, FiCheck, FiChevronDown, FiRefreshCw } from "react-icons/fi"
import DashboardNav from "components/Navbar/DashboardNav"
import { useGetMasterAccountQuery, useGetQuotationMutation } from "lib/redux/cryptoSlice"

// Button Component
type ButtonVariant = "primary" | "black" | "secondary" | "outline" | "ghost" | "danger" | "outlineDanger"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps {
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: React.ReactNode
  icon?: React.ReactNode
  iconPosition?: "start" | "end"
}

const ButtonModule: React.FC<ButtonProps> = ({
  type = "button",
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "-z-50",
  children,
  icon,
  iconPosition = "start",
}) => {
  const baseClasses =
    "flex items-center overflow-hidden justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variantClasses = {
    primary: "bg-[#003F9F] text-[#ffffff] hover:bg-[#2F88FC] focus:ring-[#003F9F]",
    black: "bg-[#131319] text-[#ffffff] hover:bg-[#000000] focus:ring-[#131319]",
    secondary: "bg-[#E6F0FF] text-[#003F9F] hover:bg-[#C4DBFF] focus:ring-[#003F9F]",
    outline: "border border-[#003F9F] text-[#003F9F] hover:bg-[#E6F0FF] focus:ring-[#003F9F]",
    outlineDanger: "border border-[#D82E2E] text-[#D82E2E] hover:bg-[#FDF3F3] focus:ring-[#D82E2E]",
    ghost: "text-[#003F9F] hover:bg-[#E6F0FF] focus:ring-[#003F9F]",
    danger: "bg-[#D82E2E] text-white hover:bg-[#F14848] focus:ring-[#F14848]",
  }

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-base",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? "cursor-not-allowed bg-[#7A9BC9]" : ""
      } ${className}`}
    >
      {icon && iconPosition === "start" && <span className="mr-2 inline-flex items-center">{icon}</span>}
      {children}
      {icon && iconPosition === "end" && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </button>
  )
}

// TokenDropdown Component
interface Token {
  symbol: string
  name: string
  color: string
  logo?: string
  balance?: number
  convertedBalance?: number
  referenceCurrency?: string
}

interface TokenDropdownProps {
  selectedToken: Token
  onSelect: (token: Token) => void
  tokens: Token[]
}

const TokenDropdown: React.FC<TokenDropdownProps> = ({ selectedToken, onSelect, tokens }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        type="button"
        className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {selectedToken.logo ? (
          <img
            src={selectedToken.logo}
            alt={selectedToken.symbol}
            className="size-6 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.onerror = null
              target.style.display = "none"
            }}
          />
        ) : (
          <div className={`flex size-6 items-center justify-center rounded-full ${selectedToken.color}`}>
            <span className="text-xs font-medium text-white">{selectedToken.symbol.charAt(0)}</span>
          </div>
        )}
        <span className="font-medium">{selectedToken.symbol}</span>
        <FiChevronDown className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-[9999] mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${
                    selectedToken.symbol === token.symbol ? "bg-gray-50" : ""
                  }`}
                  onClick={() => {
                    onSelect(token)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-center gap-3">
                    {token.logo ? (
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        className="size-6 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.style.display = "none"
                        }}
                      />
                    ) : (
                      <div className={`flex size-6 items-center justify-center rounded-full ${token.color}`}>
                        <span className="text-xs font-medium text-white">{token.symbol.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{token.symbol}</p>
                      <p className="text-xs text-gray-500">{token.name}</p>
                    </div>
                  </div>
                  {selectedToken.symbol === token.symbol && <FiCheck className="text-blue-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main SwapScreen Component
interface CryptoAsset {
  name: string
  symbol: string
  balance: number
  locked: number
  staked: number
  convertedBalance: number
  referenceCurrency: string
  logo: string
  networks?: {
    id: string
    name: string
    deposits_enabled: boolean
    withdraws_enabled: boolean
  }[]
}

interface QuotationData {
  fromCurrency: string
  toCurrency: string
  quotedPrice: number
  quotedCurrency: string
  fromAmount: number
  toAmount: number
  lpFee: string
}

const defaultToken: Token = { symbol: "", name: "", color: "" }

// Create a component that uses useSearchParams
const SwapContent: React.FC = () => {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buyCurrency, setBuyCurrency] = useState<Token>(defaultToken)
  const [receiveCurrency, setReceiveCurrency] = useState<Token>(defaultToken)
  const [showFees, setShowFees] = useState(false)
  const [calculatingFees, setCalculatingFees] = useState(false)
  const [exchangeRate, setExchangeRate] = useState("")
  const [isRateRefreshing, setIsRateRefreshing] = useState(false)
  const [selectedToken, setSelectedToken] = useState<CryptoAsset | null>(null)
  const [availableTokens, setAvailableTokens] = useState<Token[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(true)
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null)
  const [isGettingQuotation, setIsGettingQuotation] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch master account data to get available tokens
  const { data: masterData, isFetching: isMasterFetching } = useGetMasterAccountQuery()
  const [getQuotation] = useGetQuotationMutation()

  useEffect(() => {
    // Process master account data to create token list
    if (masterData?.data) {
      const tokensFromApi: Token[] = masterData.data.map((asset: CryptoAsset) => ({
        symbol: asset.symbol.toUpperCase(),
        name: asset.name,
        color: getColorForSymbol(asset.symbol),
        logo: asset.logo,
        balance: asset.balance,
        convertedBalance: asset.convertedBalance,
        referenceCurrency: asset.referenceCurrency,
      }))

      // Filter out NGN as it's not a cryptocurrency and cannot be swapped
      const cryptoOnlyTokens = tokensFromApi.filter((token) => token.symbol !== "NGN")

      setAvailableTokens(cryptoOnlyTokens)
      setIsLoadingTokens(false)

      // Set default currencies if not already set
      if (!buyCurrency.symbol && cryptoOnlyTokens.length > 0) {
        setBuyCurrency(cryptoOnlyTokens[0]!)
      }
      if (!receiveCurrency.symbol && cryptoOnlyTokens.length > 1) {
        setReceiveCurrency(cryptoOnlyTokens[1]!)
      }
    }
  }, [masterData])

  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get("token")
    if (tokenParam && availableTokens.length > 0) {
      try {
        const token = JSON.parse(decodeURIComponent(tokenParam)) as CryptoAsset
        setSelectedToken(token)

        // Set the buy currency to the selected token
        const tokenSymbol = token.symbol.toUpperCase()
        const matchedToken = availableTokens.find((t) => t.symbol === tokenSymbol)

        if (matchedToken) {
          setBuyCurrency(matchedToken)
        } else {
          // Create a new token entry if not found in available list
          setBuyCurrency({
            symbol: tokenSymbol,
            name: token.name,
            color: getColorForSymbol(token.symbol),
            logo: token.logo,
            balance: token.balance,
          })
        }
      } catch (e) {
        console.error("Failed to parse token from URL", e)
      }
    }
  }, [searchParams, availableTokens])

  useEffect(() => {
    // Fetch quotation when amount or currencies change
    if (amount && parseFloat(amount) > 0 && buyCurrency.symbol && receiveCurrency.symbol) {
      fetchQuotation()
    } else {
      setQuotationData(null)
      setExchangeRate("")
      setShowFees(false)
    }
  }, [amount, buyCurrency.symbol, receiveCurrency.symbol])

  const getColorForSymbol = (symbol: string): string => {
    const colorMap: { [key: string]: string } = {
      BTC: "bg-orange-500",
      ETH: "bg-purple-500",
      USDT: "bg-blue-500",
      USDC: "bg-blue-400",
      BNB: "bg-yellow-500",
      XRP: "bg-gray-500",
      ADA: "bg-gray-700",
      DOGE: "bg-yellow-400",
      DOT: "bg-purple-600",
      UNI: "bg-pink-500",
      LINK: "bg-blue-600",
      LTC: "bg-gray-400",
      BCH: "bg-orange-400",
      SOL: "bg-purple-400",
      MATIC: "bg-purple-300",
    }

    return colorMap[symbol.toUpperCase()] || "bg-gray-500"
  }

  const fetchQuotation = async () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    setIsGettingQuotation(true)
    setCalculatingFees(true)

    try {
      const quotationRequest = {
        fromCurrency: buyCurrency.symbol,
        toCurrency: receiveCurrency.symbol,
        fromAmount: numAmount,
      }

      const result = await getQuotation(quotationRequest).unwrap()

      if (result.isSuccess && result.data) {
        setQuotationData(result.data)
        setExchangeRate(`1 ${result.data.fromCurrency} = ${result.data.quotedPrice} ${result.data.toCurrency}`)
        setShowFees(true)
      } else {
      }
    } catch (error: any) {
      console.error("Quotation error:", error)
      setError(error.message || "Failed to get quotation. Using estimated rates.")

      // Fallback to estimated calculation for crypto-to-crypto swaps only
      const estimatedRate = 0.05 // Default crypto-to-crypto rate
      const estimatedToAmount = numAmount * estimatedRate
      const estimatedFee = numAmount * 0.005

      setQuotationData({
        fromCurrency: buyCurrency.symbol,
        toCurrency: receiveCurrency.symbol,
        quotedPrice: estimatedRate,
        quotedCurrency: receiveCurrency.symbol,
        fromAmount: numAmount,
        toAmount: parseFloat(estimatedToAmount.toFixed(6)),
        lpFee: estimatedFee.toString(),
      })

      setExchangeRate(`1 ${buyCurrency.symbol} = ${estimatedRate} ${receiveCurrency.symbol}`)
      setShowFees(true)
    } finally {
      setIsGettingQuotation(false)
      setCalculatingFees(false)
    }
  }

  const handleSwitch = () => {
    const temp = buyCurrency
    setBuyCurrency(receiveCurrency)
    setReceiveCurrency(temp)
    setAmount("")
    setShowFees(false)
    setQuotationData(null)
    setExchangeRate("")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    const decimalCount = value.split(".").length - 1
    if (decimalCount > 1) return
    setAmount(value)

    if (value.trim() === "") {
      setShowFees(false)
      setQuotationData(null)
      setExchangeRate("")
      return
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Prevent submission if no amount is entered
    if (!amount.trim() || !quotationData) {
      return
    }

    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Navigate to confirmation page with transaction data
      const transactionData = {
        fromAmount: parseFloat(amount),
        fromCurrency: buyCurrency.symbol,
        toAmount: quotationData.toAmount,
        toCurrency: receiveCurrency.symbol,
        rate: exchangeRate,
        fee: parseFloat(quotationData.lpFee),
        total: parseFloat(amount) + parseFloat(quotationData.lpFee),
        timestamp: new Date().toISOString(),
      }

      sessionStorage.setItem("swapTransactionData", JSON.stringify(transactionData))
      router.push("/crypto/verification-code/swap")
    } catch (error: any) {
      setError(error.message || "Swap failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCurrencyChange = (token: Token) => {
    setBuyCurrency(token)
    setShowFees(false)
    setQuotationData(null)
    setExchangeRate("")
  }

  const handleReceiveCurrencyChange = (token: Token) => {
    setReceiveCurrency(token)
    setShowFees(false)
    setQuotationData(null)
    setExchangeRate("")
  }

  const refreshExchangeRate = () => {
    setIsRateRefreshing(true)
    if (amount && parseFloat(amount) > 0) {
      fetchQuotation().finally(() => setIsRateRefreshing(false))
    } else {
      setTimeout(() => setIsRateRefreshing(false), 1000)
    }
  }

  const calculateReceiveAmount = (numAmount: number, rate: number): string => {
    return (numAmount * rate).toFixed(6)
  }

  const handlePercentagePress = (percentage: number) => {
    const balance = buyCurrency.balance || 0
    const newAmount = (balance * percentage).toString()
    setAmount(newAmount)
  }

  // Check if user has sufficient balance
  const hasSufficientBalance = () => {
    if (!amount || !buyCurrency.balance) return true
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount)) return true

    return numAmount <= (buyCurrency.balance || 0)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardNav />
      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8 flex items-center">
            <button type="button" onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-gray-100">
              <FiArrowLeft className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Swap Tokens</h1>
              <p className="text-gray-500">Instant cryptocurrency exchange</p>
            </div>
          </div>

          {/* Loading state */}
          {(isLoadingTokens || isMasterFetching) && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-center">
                <div className="mr-2 size-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-gray-600">Loading tokens...</span>
              </div>
            </div>
          )}

          {/* Swap Form */}
          {!isLoadingTokens && availableTokens.length > 0 && (
            <form onSubmit={handleSubmit}>
              {/* You Pay Section */}
              <motion.div
                className="relative z-10 mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                whileHover={{ y: -2 }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">You Pay</label>
                  <div className="text-sm text-gray-500">
                    Balance: {buyCurrency.balance?.toFixed(4) || "0.0000"} {buyCurrency.symbol}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    className="w-full bg-transparent text-3xl font-medium text-gray-900 outline-none"
                    value={amount}
                    onChange={handleAmountChange}
                  />
                  <div className="relative z-50 bg-white">
                    <TokenDropdown
                      selectedToken={buyCurrency}
                      onSelect={handleBuyCurrencyChange}
                      tokens={availableTokens}
                    />
                  </div>
                </div>
                {!hasSufficientBalance() && <p className="mt-1 text-sm text-red-500">Insufficient balance</p>}

                {/* Percentage buttons */}
                <div className="mt-3 flex space-x-2">
                  {[0.25, 0.5, 0.75, 1].map((percentage) => (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => handlePercentagePress(percentage)}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                    >
                      {percentage * 100}%
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Switch Button */}
              <div className="relative z-0 my-2 flex justify-center">
                <motion.button
                  type="button"
                  onClick={handleSwitch}
                  className="relative z-0 rounded-full border border-gray-200 bg-white p-2 shadow-md hover:bg-gray-50"
                  whileTap={{ scale: 0.9 }}
                >
                  <FiRefreshCw className="size-5 text-gray-700" />
                </motion.button>
              </div>

              {/* You Receive Section */}
              <motion.div
                className="relative z-0 mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                whileHover={{ y: -2 }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">You Receive</label>
                  <div className="text-sm text-gray-500">
                    Balance: {receiveCurrency.balance?.toFixed(4) || "0.0000"} {receiveCurrency.symbol}
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="w-full bg-transparent text-3xl font-medium text-gray-900 outline-none"
                    value={quotationData ? quotationData.toAmount.toFixed(6) : "0.0"}
                    readOnly
                  />
                  <div className="relative z-50">
                    <TokenDropdown
                      selectedToken={receiveCurrency}
                      onSelect={handleReceiveCurrencyChange}
                      tokens={availableTokens}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Exchange Rate */}
              {exchangeRate && (
                <div className="mb-6 flex items-center justify-between px-1">
                  <div className="text-sm text-gray-600">Exchange Rate</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{exchangeRate}</span>
                    <button
                      type="button"
                      onClick={refreshExchangeRate}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={isRateRefreshing || !amount}
                    >
                      <FiRefreshCw className={`size-4 ${isRateRefreshing ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* Fees Breakdown */}
              <AnimatePresence>
                {(showFees || calculatingFees) && (
                  <motion.div
                    className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="mb-3 font-medium text-gray-900">Transaction Details</h3>
                    {calculatingFees || isGettingQuotation ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                          </div>
                        ))}
                      </div>
                    ) : quotationData ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Exchange Rate</span>
                          <span className="text-gray-900">{exchangeRate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">You&apos;ll Receive</span>
                          <span className="text-gray-900">
                            {quotationData.toAmount.toFixed(6)} {quotationData.toCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Liquidity Provider Fee</span>
                          <span className="text-gray-900">
                            {parseFloat(quotationData.lpFee).toFixed(6)} {quotationData.fromCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Network Fee</span>
                          <span className="text-gray-900">0</span>
                        </div>
                        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-medium">
                          <span className="text-gray-700">Total Cost</span>
                          <span className="text-gray-900">
                            {(parseFloat(amount) + parseFloat(quotationData.lpFee)).toFixed(6)}{" "}
                            {quotationData.fromCurrency}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || !amount.trim() || !hasSufficientBalance() || !quotationData}
                className="-z-50 w-full"
              >
                {loading ? (
                  <div className=" flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </div>
                ) : (
                  "Review Swap"
                )}
              </ButtonModule>
            </form>
          )}

          {/* Error state if no tokens available */}
          {!isLoadingTokens && availableTokens.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="text-gray-600">No tokens available for swapping</p>
              <ButtonModule variant="outline" size="lg" className="mt-4 w-full" onClick={() => router.push("/crypto")}>
                Back to Dashboard
              </ButtonModule>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
const SwapScreen: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <DashboardNav />
          <div className="container mx-auto max-w-md px-4 py-8">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 mr-2 size-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                <span className="text-gray-600">Loading swap interface...</span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SwapContent />
    </Suspense>
  )
}

export default SwapScreen
