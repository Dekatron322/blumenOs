"use client"

import React, { useState } from "react"
import { RxCaretSort } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import TransactionDetailModal from "components/ui/Modal/transaction-detail-modal"
import { ButtonModule } from "components/ui/Button/Button"
import ExportIcon from "public/export-icon"
import AssetDetailModal from "components/ui/Modal/asset-detail-modal"
import NotificationModal from "components/ui/Modal/notification-modal"
import { motion } from "framer-motion"
import {
  useAddBonusMutation,
  useDisableWalletMutation,
  useGetUserByIdQuery,
  useGetUserCryptoQuery,
  useGetUserTransactionsQuery,
} from "lib/redux/customerSlice"
import { useNotifyUserMutation } from "lib/redux/adminSlice"
import { useParams } from "next/navigation"
import LoadingSkeleton from "components/ui/Loader/LoadingSkeleton"
import { format, subDays } from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { notify } from "components/ui/Notification/Notification"
import Modal from "react-modal"
import { MdClose } from "react-icons/md"

const CustomTabs = ({
  activeTab,
  setActiveTab,
  children,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
  children: React.ReactNode
}) => {
  return (
    <div className="w-full">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "transactions" ? "border-b-2 border-[#003F9F] text-[#003F9F]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "assets" ? "border-b-2 border-[#003F9F] text-[#003F9F]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("assets")}
        >
          Crypto Assets
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

const TransactionTableSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto border-l border-r bg-[#FFFFFF]">
      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
        <thead className="border-t">
          <tr>
            <th className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm">
              <MdOutlineCheckBoxOutlineBlank className="text-lg" />
              Transaction ID
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Date <RxCaretSort />
              </div>
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Type <RxCaretSort />
              </div>
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Amount <RxCaretSort />
              </div>
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Status <RxCaretSort />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CryptoAssetsSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto border-l border-r bg-[#FFFFFF]">
      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Asset <RxCaretSort />
              </div>
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Balance <RxCaretSort />
              </div>
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Value <RxCaretSort />
              </div>
            </th>
            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
              <div className="flex items-center gap-2">
                Networks <RxCaretSort />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="whitespace-nowrap border-b px-4 py-2">
                <div className="flex items-center">
                  <div className="size-8 animate-pulse rounded-md bg-gray-200"></div>
                  <div className="ml-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const DateRangeFilter = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onSearch,
}: {
  startDate: Date | null
  endDate: Date | null
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
  onSearch: () => void
}) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">From:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          maxDate={endDate || new Date()}
          className="rounded-md border border-gray-300 bg-white p-2 text-sm"
          placeholderText="Start date"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">To:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate as Date | undefined}
          maxDate={new Date()}
          className="rounded-md border border-gray-300 bg-white p-2 text-sm"
          placeholderText="End date"
        />
      </div>
      <button
        onClick={() => {
          setStartDate(null)
          setEndDate(null)
        }}
        className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
      >
        Clear Dates
      </button>
      <button onClick={onSearch} className="rounded-md bg-[#003F9F] px-3 py-2 text-sm text-white hover:bg-[#002d7a]">
        Apply Filter
      </button>
    </div>
  )
}

interface AddBonusModalProps {
  isOpen: boolean
  wallet: any
  customerName: string
  onRequestClose: () => void
  onAddBonus: (data: { walletId: number; bonus: number; campaign: string; message: string }) => Promise<any>
}

const AddBonusModal: React.FC<AddBonusModalProps> = ({ isOpen, wallet, customerName, onRequestClose, onAddBonus }) => {
  const [bonusAmount, setBonusAmount] = useState("")
  const [campaign, setCampaign] = useState("")
  const [message, setMessage] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleAddBonus = async () => {
    if (!bonusAmount || !wallet) return

    setIsAdding(true)
    try {
      const bonusData = {
        walletId: wallet.id,
        bonus: parseFloat(bonusAmount),
        campaign: campaign || "Admin Bonus",
        message: message || "Bonus added by admin",
      }

      await onAddBonus(bonusData)
      setIsSuccess(true)
      setTimeout(() => {
        onRequestClose()
        setIsSuccess(false)
        setBonusAmount("")
        setCampaign("")
        setMessage("")
      }, 1500)
    } catch (error) {
      console.error("Failed to add bonus:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-auto w-[500px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#E9F0FF] p-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-[#003F9F] font-semibold text-white">
              ₦
            </div>
            <p className="text-xl font-semibold text-[#2a2f4b]">Add Bonus</p>
          </div>
          <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-5xl text-green-500">✓</div>
              <h3 className="mb-1 text-lg font-semibold">Bonus Added!</h3>
              <p className="text-gray-600">
                {bonusAmount} {wallet?.currency?.ticker || "Unknown"} bonus has been added to {customerName}&apos;s
                wallet
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="mb-2 text-sm text-gray-600">
                  Customer: {customerName} ({wallet?.currency?.ticker || "Unknown"} Wallet)
                </p>

                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Bonus Amount</label>
                  <input
                    type="number"
                    className="w-full rounded-md border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-[#003F9F]"
                    placeholder="Enter bonus amount"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Campaign (Optional)</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-[#003F9F]"
                    placeholder="Enter campaign name"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Message (Optional)</label>
                  <textarea
                    className="h-20 w-full rounded-md border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-[#003F9F]"
                    placeholder="Enter message for the user"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={onRequestClose}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={handleAddBonus}
                  disabled={!bonusAmount || isAdding || parseFloat(bonusAmount) <= 0}
                >
                  {isAdding ? "Adding..." : "Add Bonus"}
                </ButtonModule>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

interface DisableWalletModalProps {
  isOpen: boolean
  wallet: any
  customerName: string
  onRequestClose: () => void
  onDisableWallet: (data: { walletId: number; disable: boolean }) => Promise<any>
}

const DisableWalletModal: React.FC<DisableWalletModalProps> = ({
  isOpen,
  wallet,
  customerName,
  onRequestClose,
  onDisableWallet,
}) => {
  const [isDisabling, setIsDisabling] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [actionType, setActionType] = useState<"disable" | "enable">("disable")

  const handleDisableWallet = async () => {
    if (!wallet) return

    setIsDisabling(true)
    try {
      const disableData = {
        walletId: wallet.id,
        disable: actionType === "disable",
      }

      await onDisableWallet(disableData)
      setIsSuccess(true)
      setTimeout(() => {
        onRequestClose()
        setIsSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Failed to disable wallet:", error)
    } finally {
      setIsDisabling(false)
    }
  }

  // Determine if we're enabling or disabling based on current state
  const isCurrentlyDisabled = wallet?.disableWithdrawal
  const modalTitle = isCurrentlyDisabled ? "Enable Wallet" : "Disable Wallet"
  const actionVerb = isCurrentlyDisabled ? "enable" : "disable"
  const confirmText = isCurrentlyDisabled
    ? "Are you sure you want to enable this wallet?"
    : "Are you sure you want to disable this wallet?"

  React.useEffect(() => {
    if (wallet) {
      setActionType(wallet.disableWithdrawal ? "enable" : "disable")
    }
  }, [wallet])

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="flex h-auto w-[500px] overflow-hidden rounded-md bg-white shadow-lg outline-none max-sm:w-full max-sm:max-w-[380px]"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#E9F0FF] p-4">
          <div className="flex items-center justify-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-md ${
                actionType === "disable" ? "bg-red-500" : "bg-green-500"
              } font-semibold text-white`}
            >
              {actionType === "disable" ? "!" : "✓"}
            </div>
            <p className="text-xl font-semibold text-[#2a2f4b]">{modalTitle}</p>
          </div>
          <button onClick={onRequestClose} className="cursor-pointer text-gray-600 hover:text-gray-800">
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-5xl text-green-500">✓</div>
              <h3 className="mb-1 text-lg font-semibold">
                Wallet {actionType === "disable" ? "Disabled" : "Enabled"}!
              </h3>
              <p className="text-gray-600">
                The {wallet?.currency?.ticker || "Unknown"} wallet has been{" "}
                {actionType === "disable" ? "disabled" : "enabled"} for {customerName}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="mb-2 text-sm text-gray-600">
                  Customer: {customerName} ({wallet?.currency?.ticker || "Unknown"} Wallet)
                </p>

                <div className="mb-4 rounded-md bg-gray-100 p-4">
                  <p className="text-center text-gray-700">{confirmText}</p>
                </div>

                {actionType === "disable" && (
                  <div className="mb-4 rounded-md bg-yellow-50 p-3">
                    <p className="text-sm text-yellow-700">
                      Note: Disabling a wallet will prevent the user from making any transactions with this wallet.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={onRequestClose}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </ButtonModule>
                <ButtonModule
                  variant={actionType === "disable" ? "danger" : "primary"}
                  size="md"
                  onClick={handleDisableWallet}
                  disabled={isDisabling}
                >
                  {isDisabling ? "Processing..." : modalTitle}
                </ButtonModule>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

const CustomerInfo = () => {
  const { id } = useParams()
  const userId = Array.isArray(id) ? id[0] : id

  // State for search and filters
  const [searchText, setSearchText] = useState("")
  const [referenceSearch, setReferenceSearch] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [isFilterApplied, setIsFilterApplied] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const { data: userResponse, isLoading, isError, refetch: refetchUser } = useGetUserByIdQuery(Number(userId))

  const {
    data: transactionsResponse,
    isLoading: isLoadingTransactions,
    isFetching: isFetchingTransactions,
    refetch: refetchTransactions,
  } = useGetUserTransactionsQuery({
    id: Number(userId),
    pageNumber: currentPage,
    pageSize,
    ...(isFilterApplied && startDate && { startDate: startDate.toISOString().split("T")[0] }),
    ...(isFilterApplied && endDate && { endDate: endDate.toISOString().split("T")[0] }),
    ...(searchText && { search: searchText }),
    ...(referenceSearch && { referenceNumber: referenceSearch }),
  })

  const {
    data: cryptoResponse,
    isLoading: isLoadingCrypto,
    isFetching: isFetchingCrypto,
  } = useGetUserCryptoQuery(Number(userId))

  // Add the notification mutation hook
  const [notifyUser, { isLoading: isNotifying }] = useNotifyUserMutation()

  // Add the bonus mutation hook
  const [addBonus, { isLoading: isAddingBonus }] = useAddBonusMutation()

  // Add the disable wallet mutation hook
  const [disableWallet, { isLoading: isDisablingWallet }] = useDisableWalletMutation()

  const [activeTab, setActiveTab] = useState("transactions")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isAddBonusModalOpen, setIsAddBonusModalOpen] = useState(false)
  const [isDisableWalletModalOpen, setIsDisableWalletModalOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<any>(null)

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy hh:mm a")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusStyle = (status: any) => {
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

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleAssetClick = (asset: any) => {
    setSelectedAsset(asset)
    setIsAssetModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTransaction(null)
  }

  const closeAssetModal = () => {
    setIsAssetModalOpen(false)
    setSelectedAsset(null)
  }

  const handleOpenAddBonusModal = (wallet: any) => {
    setSelectedWallet(wallet)
    setIsAddBonusModalOpen(true)
  }

  const handleCloseAddBonusModal = () => {
    setIsAddBonusModalOpen(false)
    setSelectedWallet(null)
  }

  const handleOpenDisableWalletModal = (wallet: any) => {
    setSelectedWallet(wallet)
    setIsDisableWalletModalOpen(true)
  }

  const handleCloseDisableWalletModal = () => {
    setIsDisableWalletModalOpen(false)
    setSelectedWallet(null)
  }

  // Update the handleSendNotification function to use the API
  const handleSendNotification = async (title: string, message: string) => {
    if (!userResponse?.data?.id) {
      notify("error", "User ID is required to send notification")
      return
    }

    try {
      const result = await notifyUser({
        userId: userResponse.data.id,
        title: title,
        message: message,
      }).unwrap()

      if (result.isSuccess) {
        notify("success", "Notification sent successfully!")
        return result
      } else {
        notify("error", result.message || "Failed to send notification")
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Failed to send notification:", error)
      notify("error", error.data?.message || error.message || "Failed to send notification")
      throw error
    }
  }

  // Handle adding bonus
  const handleAddBonus = async (bonusData: { walletId: number; bonus: number; campaign: string; message: string }) => {
    try {
      const result = await addBonus(bonusData).unwrap()

      if (result.isSuccess) {
        notify("success", "Bonus added successfully!")
        // Refetch user data to update the wallet balances
        refetchUser()
        return result
      } else {
        notify("error", result.message || "Failed to add bonus")
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Failed to add bonus:", error)
      notify("error", error.data?.message || error.message || "Failed to add bonus")
      throw error
    }
  }

  // Handle disabling wallet
  const handleDisableWallet = async (disableData: { walletId: number; disable: boolean }) => {
    try {
      const result = await disableWallet(disableData).unwrap()

      if (result.isSuccess) {
        notify("success", `Wallet ${disableData.disable ? "disabled" : "enabled"} successfully!`)
        // Refetch user data to update the wallet status
        refetchUser()
        return result
      } else {
        notify("error", result.message || `Failed to ${disableData.disable ? "disable" : "enable"} wallet`)
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Failed to disable wallet:", error)
      notify(
        "error",
        error.data?.message || error.message || `Failed to ${disableData.disable ? "disable" : "enable"} wallet`
      )
      throw error
    }
  }

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    setIsFilterApplied(true)
    refetchTransactions()
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isError || !userResponse?.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load customer data</p>
        </div>
      </div>
    )
  }

  const customer = userResponse.data
  const transactions = transactionsResponse?.data || []
  const totalCount = transactionsResponse?.totalCount || 0
  const totalPages = transactionsResponse?.totalPages || 1
  const cryptoAssets = cryptoResponse?.data?.data || []
  const baseCurrency = cryptoResponse?.data?.base?.[0] || null

  const totalCryptoValue = cryptoAssets.reduce((total, asset) => {
    return total + (asset.convertedBalance || 0)
  }, 0)

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {customer.wallets?.map((wallet) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {wallet.currency?.avatar && (
                  <img
                    src={wallet.currency.avatar}
                    alt={wallet.currency.name}
                    className="size-8 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "https://via.placeholder.com/32"
                    }}
                  />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{wallet.currency?.name || "Unknown Currency"}</h4>
                  <p className="text-sm text-gray-500">{wallet.currency?.ticker || ""}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{formatCurrency(wallet.balance)}</p>
                <p className="text-sm text-gray-500">Available Balance</p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
              <p className="text-gray-600">Bonus: {formatCurrency(wallet.bonus)}</p>
              <div className="flex items-center gap-2">
                <ButtonModule onClick={() => handleOpenAddBonusModal(wallet)} variant="outline" size="sm" className="">
                  Add Bonus
                </ButtonModule>
                <ButtonModule onClick={() => handleOpenDisableWalletModal(wallet)} variant="outlineDanger" size="sm">
                  {wallet.disableWithdrawal ? "Enable" : "Disable"}
                </ButtonModule>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-6 "
      >
        {/* Customer Information Section */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex h-auto w-1/3 flex-col justify-start rounded-lg bg-[#E9F0FF] p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-2 border-b pb-3">
            <div className="flex h-auto items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-md bg-[#003F9F] text-xl font-semibold text-white">
                {customer.firstName?.charAt(0) || ""}
                {customer.lastName?.charAt(0) || ""}
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  {customer.firstName || customer.lastName
                    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
                    : customer.tag || "Customer"}
                </h2>
                <p className="text-sm text-gray-600">{customer.role === "admin" ? "Admin" : "Customer"} Account</p>
              </div>
            </div>
            <ButtonModule
              variant="black"
              size="md"
              icon={<ExportIcon />}
              iconPosition="end"
              onClick={() => setIsNotificationModalOpen(true)}
            >
              <p className="max-sm:hidden">Notify</p>
            </ButtonModule>
          </div>

          <div className="space-y-4 text-sm">
            {/* <div className="flex items-center gap-2 border-b pb-3 font-semibold">
              <h3 className=" text-gray-500">CUSTOMER ID:</h3>
              <p className="text-[#202B3C]">{customer.id}</p>
            </div> */}

            <div className="flex items-center gap-2 border-b pb-3  font-semibold">
              <h3 className=" text-gray-500">EMAIL:</h3>
              <p className="text-[#202B3C]">{customer.email || "N/A"}</p>
            </div>

            <div className="flex items-center gap-2 border-b pb-3  font-semibold">
              <h3 className="text-gray-500">PHONE NUMBER:</h3>
              <p className="text-[#202B3C]">{customer.phoneNumber || "N/A"}</p>
            </div>

            <div className="flex items-center gap-2 border-b pb-3  font-semibold">
              <h3 className="text-gray-500">TAG:</h3>
              <p className="text-[#202B3C]">{customer.tag || "N/A"}</p>
            </div>

            <div className="flex items-center justify-between gap-2 border-b pb-3 font-semibold">
              <h3 className="font-semibold text-gray-500">Account Status:</h3>
              <div
                className={`gap-2 rounded-full p-1 px-2 text-center ${
                  customer.status?.value === 4
                    ? "bg-[#d82e2e]"
                    : customer.status?.value === 1
                    ? "bg-[#589e67]"
                    : "bg-[#E6A441]"
                }`}
              >
                <span className="text-white">{customer.status?.label || "Unknown"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-b pb-3 font-semibold">
              <h3 className="font-semibold text-gray-500">2FA Verification:</h3>
              <div
                className={`gap-2 rounded-full p-1 px-2 text-center ${
                  customer.isTwoFactorEnabled ? "bg-[#589e67]" : "bg-[#d82e2e]"
                }`}
              >
                <span className="text-white">{customer.isTwoFactorEnabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-b pb-3 font-semibold">
              <h3 className=" font-semibold text-gray-500">KYC VERIFICATION:</h3>
              <div
                className={`gap-2 rounded-full p-1 px-2 text-center ${
                  customer.kyc?.status?.value === 1 ? "bg-[#d82e2e]" : "bg-[#589e67]"
                }`}
              >
                <span className=" text-white">{customer.kyc?.status?.label || "Not Verified"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-3 font-semibold">
              <h3 className="text-gray-500">COUNTRY</h3>
              <p className="text-[#202B3C]">{customer.country || "N/A"}</p>
            </div>
          </div>
        </motion.div>

        {/* Transactions and Assets Section */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex w-full items-start rounded-lg"
        >
          <CustomTabs activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === "transactions" ? (
              <>
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  setStartDate={setStartDate}
                  setEndDate={setEndDate}
                  onSearch={handleSearch}
                />

                {isLoadingTransactions || isFetchingTransactions ? (
                  <TransactionTableSkeleton />
                ) : (
                  <>
                    <div className="w-full overflow-x-auto border-l border-r bg-[#FFFFFF]">
                      <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                        <thead className="border-t">
                          <tr>
                            <th className="flex cursor-pointer items-center gap-2 whitespace-nowrap border-b p-4 text-sm">
                              <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                              Transaction ID
                            </th>
                            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                              <div className="flex items-center gap-2">
                                Date <RxCaretSort />
                              </div>
                            </th>
                            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                              <div className="flex items-center gap-2">
                                Type <RxCaretSort />
                              </div>
                            </th>
                            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                              <div className="flex items-center gap-2">
                                Amount <RxCaretSort />
                              </div>
                            </th>
                            <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                              <div className="flex items-center gap-2">
                                Status <RxCaretSort />
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-4 text-center text-gray-500">
                                No transactions found
                              </td>
                            </tr>
                          ) : (
                            transactions.map((tx) => (
                              <motion.tr
                                key={tx.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleTransactionClick(tx)}
                              >
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                                    {tx.reference}
                                  </div>
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  {formatDateTime(tx.createdAt)}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm capitalize">
                                  {tx.type?.label || "Unknown"}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  {tx.currency?.ticker || ""} {tx.amount}
                                </td>
                                <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                  <div
                                    style={getStatusStyle(tx.status)}
                                    className="flex items-center justify-center gap-1 rounded-full px-2 py-1"
                                  >
                                    <span
                                      className="size-2 rounded-full"
                                      style={{
                                        backgroundColor:
                                          tx.status?.value === 2
                                            ? "#589E67"
                                            : tx.status?.value === 1
                                            ? "#E6A441"
                                            : "#AF4B4B",
                                      }}
                                    ></span>
                                    {tx.status?.label || "Unknown"}
                                  </div>
                                </td>
                              </motion.tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {transactions.length > 0 && (
                      <div className="flex items-center justify-between border-t py-3">
                        <div className="text-sm text-gray-700">
                          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)}{" "}
                          of {totalCount} entries
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === 1
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
                            }`}
                          >
                            <MdOutlineArrowBackIosNew />
                          </button>

                          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                            let pageNum
                            if (totalPages <= 5) {
                              pageNum = index + 1
                            } else if (currentPage <= 3) {
                              pageNum = index + 1
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + index
                            } else {
                              pageNum = currentPage - 2 + index
                            }

                            return (
                              <button
                                key={index}
                                onClick={() => paginate(pageNum)}
                                className={`flex size-8 items-center justify-center rounded-md text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[#003F9F] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}

                          {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

                          {totalPages > 5 && currentPage < totalPages - 1 && (
                            <button
                              onClick={() => paginate(totalPages)}
                              className={`flex size-8 items-center justify-center rounded-md text-sm ${
                                currentPage === totalPages
                                  ? "bg-[#003F9F] text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {totalPages}
                            </button>
                          )}

                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center rounded-md p-2 ${
                              currentPage === totalPages
                                ? "cursor-not-allowed text-gray-400"
                                : "text-[#003F9F] hover:bg-gray-100"
                            }`}
                          >
                            <MdOutlineArrowForwardIos />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div>
                <div className="flex justify-between">
                  <div className=" flex items-center">
                    {/* Keep the original crypto total if you still want it */}
                    {totalCryptoValue > 0 && (
                      <div className="mb-4  flex gap-2 rounded-lg bg-blue-50">
                        <h4 className="text-md font-semibold text-blue-900">Total Crypto Value:</h4>
                        <p className="text-xl font-bold text-blue-900">{formatCurrency(totalCryptoValue)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isLoadingCrypto || isFetchingCrypto ? (
                  <CryptoAssetsSkeleton />
                ) : (
                  <div className="w-full overflow-x-auto border-l border-r bg-[#FFFFFF]">
                    <table className="w-full min-w-[800px] border-separate border-spacing-0 text-left">
                      <thead>
                        <tr>
                          <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                            <div className="flex items-center gap-2">
                              Asset <RxCaretSort />
                            </div>
                          </th>
                          <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                            <div className="flex items-center gap-2">
                              Balance <RxCaretSort />
                            </div>
                          </th>
                          <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                            <div className="flex items-center gap-2">
                              Value <RxCaretSort />
                            </div>
                          </th>
                          <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm">
                            <div className="flex items-center gap-2">
                              Networks <RxCaretSort />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cryptoAssets.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-500">
                              No crypto assets found
                            </td>
                          </tr>
                        ) : (
                          cryptoAssets.map((asset) => (
                            <motion.tr
                              key={asset.symbol}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleAssetClick(asset)}
                            >
                              <td className="whitespace-nowrap border-b px-4 py-2">
                                <div className="flex items-center">
                                  <img
                                    src={asset.logo}
                                    alt={asset.name}
                                    className="size-8 rounded-md object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "https://via.placeholder.com/32"
                                    }}
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                    <div className="text-sm text-gray-500">{asset.symbol.toUpperCase()}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                {asset.balance.toFixed(8)}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                {formatCurrency(asset.convertedBalance)}
                              </td>
                              <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                                <div className="flex flex-wrap gap-1">
                                  {asset.networks.slice(0, 3).map((network) => (
                                    <span key={network.id} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                      {network.name.split(" ")[0]}
                                    </span>
                                  ))}
                                  {asset.networks.length > 3 && (
                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                                      +{asset.networks.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </CustomTabs>
        </motion.div>

        <TransactionDetailModal isOpen={isModalOpen} transaction={selectedTransaction} onRequestClose={closeModal} />
        <AssetDetailModal isOpen={isAssetModalOpen} asset={selectedAsset} onRequestClose={closeAssetModal} />
        <NotificationModal
          isOpen={isNotificationModalOpen}
          customer={{
            email: customer.email || "",
            fullName: `${customer.firstName} ${customer.lastName}` || "Customer",
          }}
          onRequestClose={() => setIsNotificationModalOpen(false)}
          onSendNotification={handleSendNotification}
        />
        <AddBonusModal
          isOpen={isAddBonusModalOpen}
          wallet={selectedWallet}
          customerName={`${customer.firstName} ${customer.lastName}`.trim()}
          onRequestClose={handleCloseAddBonusModal}
          onAddBonus={handleAddBonus}
        />
        <DisableWalletModal
          isOpen={isDisableWalletModalOpen}
          wallet={selectedWallet}
          customerName={`${customer.firstName} ${customer.lastName}`.trim()}
          onRequestClose={handleCloseDisableWalletModal}
          onDisableWallet={handleDisableWallet}
        />
      </motion.div>
    </>
  )
}

export default CustomerInfo
