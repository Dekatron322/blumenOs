"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { RxCaretSort } from "react-icons/rx"
import { ButtonModule } from "components/ui/Button/Button"
import { SearchModule } from "components/ui/Search/search-module"
import EmptyState from "public/empty-state"
import DeleteModal from "components/ui/Modal/delete-modal"
import Filtericon from "public/filter-icon"
import DashboardNav from "components/Navbar/DashboardNav"
import { FiEdit2, FiTrash2, FiUserPlus, FiX } from "react-icons/fi"
import { Badge } from "components/ui/Badge/badge"
import { useSelector } from "react-redux"
import { RootState } from "lib/redux/store"
import { notify } from "components/ui/Notification/Notification"
import { useEditCryptoFeeMutation, useGetCryptoFeesQuery } from "lib/redux/cryptoSlice"

type SortOrder = "asc" | "desc" | null

export interface CryptoFee {
  id: number
  name: string
  symbol: string
  logo: string
  isStablecoin: boolean
  buySpread: number
  sellSpread: number
  isSpreadBased: boolean
  buyCommissionPct: number
  buyCommissionCap: number
  sellCommissionPct: number
  sellCommissionCap: number
}

// Skeleton Loading Components
const SkeletonRow = () => (
  <tr>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
      </div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
      </div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
    </td>
    <td className="whitespace-nowrap border-b px-4 py-3">
      <div className="flex gap-2">
        <div className="h-8 w-16 animate-pulse rounded border bg-gray-200"></div>
        <div className="h-8 w-16 animate-pulse rounded border bg-gray-200"></div>
      </div>
    </td>
  </tr>
)

const SkeletonTable = () => (
  <>
    <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
      <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {[
              "ID",
              "Logo",
              "Name",
              "Symbol",
              "Stablecoin",
              "Buy Spread",
              "Sell Spread",
              "Buy Commission",
              "Sell Commission",
              "Actions",
            ].map((header) => (
              <th key={header} className="whitespace-nowrap border-b p-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                  {header}
                  <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between border-t py-3">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
      <div className="flex gap-2">
        <div className="size-7 animate-pulse rounded-md bg-gray-200"></div>
        <div className="size-7 animate-pulse rounded-md bg-gray-200"></div>
        <div className="size-7 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    </div>
  </>
)

const FilterDropdown = ({
  isOpen,
  onClose,
  onFilterChange,
  activeFilters,
  filterOptions,
}: {
  isOpen: boolean
  onClose: () => void
  onFilterChange: (filter: string) => void
  activeFilters: string[]
  filterOptions: { value: string; label: string }[]
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm font-medium text-gray-700">Filter by type</div>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            className={`flex w-full items-center px-4 py-2 text-left text-sm ${
              activeFilters.includes(option.value)
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
            onClick={() => onFilterChange(option.value)}
          >
            <span className="mr-2">
              {activeFilters.includes(option.value) ? (
                <svg className="size-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="size-4 opacity-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {option.label}
          </button>
        ))}
        <div className="border-t border-gray-100"></div>
        <button
          className="flex w-full items-center px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

interface EditFeeModalProps {
  isOpen: boolean
  onClose: () => void
  fee: CryptoFee | null
  onSave: (feeData: any) => Promise<void>
  isSaving: boolean
}

const EditFeeModal: React.FC<EditFeeModalProps> = ({ isOpen, onClose, fee, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    buySpread: 0,
    sellSpread: 0,
    isSpreadBased: false,
    buyCommissionPct: 0,
    buyCommissionCap: 0,
    sellCommissionPct: 0,
    sellCommissionCap: 0,
  })

  useEffect(() => {
    if (fee) {
      setFormData({
        buySpread: fee.buySpread,
        sellSpread: fee.sellSpread,
        isSpreadBased: fee.isSpreadBased,
        buyCommissionPct: fee.buyCommissionPct,
        buyCommissionCap: fee.buyCommissionCap,
        sellCommissionPct: fee.sellCommissionPct,
        sellCommissionCap: fee.sellCommissionCap,
      })
    }
  }, [fee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fee) return

    try {
      await onSave({
        id: fee.id,
        ...formData,
      })
      onClose()
    } catch (error) {
      console.error("Error saving fee:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseFloat(value) || 0,
    }))
  }

  if (!isOpen || !fee) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit {fee.name} Fees</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSpreadBased"
              name="isSpreadBased"
              checked={formData.isSpreadBased}
              onChange={handleInputChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="isSpreadBased" className="text-sm font-medium">
              Use Spread-Based Pricing
            </label>
          </div> */}

          {formData.isSpreadBased ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Buy Spread (%)</label>
                <input
                  type="number"
                  name="buySpread"
                  value={formData.buySpread}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sell Spread (%)</label>
                <input
                  type="number"
                  name="sellSpread"
                  value={formData.sellSpread}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Buy Commission (%)</label>
                <input
                  type="number"
                  name="buyCommissionPct"
                  value={formData.buyCommissionPct}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Buy Commission Cap ($)</label>
                <input
                  type="number"
                  name="buyCommissionCap"
                  value={formData.buyCommissionCap}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sell Commission (%)</label>
                <input
                  type="number"
                  name="sellCommissionPct"
                  value={formData.sellCommissionPct}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sell Commission Cap ($)</label>
                <input
                  type="number"
                  name="sellCommissionCap"
                  value={formData.sellCommissionCap}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <ButtonModule type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </ButtonModule>
            <ButtonModule type="submit" variant="primary" disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </ButtonModule>
          </div>
        </form>
      </div>
    </div>
  )
}

const CryptoFeesTable: React.FC<{
  cryptoFees: CryptoFee[]
  isLoading: boolean
}> = ({ cryptoFees, isLoading }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<CryptoFee | null>(null)

  const [editCryptoFee, { isLoading: isSaving }] = useEditCryptoFeeMutation()

  const stablecoinFilterOptions = [
    { value: "stablecoin", label: "Stablecoins" },
    { value: "non-stablecoin", label: "Non-Stablecoins" },
  ]

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const filteredCryptoFees = cryptoFees.filter((fee) => {
    const searchMatch = Object.values(fee).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchText.toLowerCase())
    })

    const typeMatch =
      activeFilters.length === 0 ||
      (activeFilters.includes("stablecoin") && fee.isStablecoin) ||
      (activeFilters.includes("non-stablecoin") && !fee.isStablecoin)

    return searchMatch && typeMatch
  })

  const getStablecoinBadge = (isStablecoin: boolean) => {
    return isStablecoin ? <Badge variant="destructive">Stablecoin</Badge> : <Badge variant="default">Crypto</Badge>
  }

  const toggleSort = (column: keyof CryptoFee) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const handleEditFee = (fee: CryptoFee) => {
    setSelectedFee(fee)
    setIsEditModalOpen(true)
  }

  const handleSaveFee = async (feeData: any) => {
    try {
      const result = await editCryptoFee(feeData).unwrap()

      if (result.isSuccess) {
        notify("success", "Fee Updated", {
          description: `${selectedFee?.name} fees have been updated successfully.`,
          duration: 3000,
        })
      } else {
        notify("error", "Update Failed", {
          description: result.message || "Failed to update fees. Please try again.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error updating fee:", error)
      notify("error", "Update Failed", {
        description: "There was an error updating the fees. Please try again.",
        duration: 5000,
      })
    }
  }

  const handleAddFee = () => {
    notify("info", "Add Feature", {
      description: "Add functionality will be implemented soon",
      duration: 3000,
    })
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  if (isLoading) {
    return (
      <div className="">
        <div className="items-center justify-between border-b py-2 md:flex md:py-4">
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200"></div>
          <div className="flex gap-4">
            <div className="h-10 w-64 animate-pulse rounded-md bg-gray-200"></div>
            <div className="flex gap-2">
              <div className="h-10 w-20 animate-pulse rounded-md bg-gray-200"></div>
              <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200"></div>
            </div>
          </div>
        </div>
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="">
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <p className="text-lg font-medium max-sm:pb-3 md:text-xl">Crypto Fees Management</p>
        <div className="flex gap-4">
          <SearchModule
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onCancel={handleCancelSearch}
          />
          <div className="flex gap-2">
            <div className="relative">
              <ButtonModule variant="black" size="md" icon={<Filtericon />} iconPosition="start" onClick={toggleFilter}>
                <p className="max-sm:hidden">Filter</p>
                {activeFilters.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-blue-500 px-2 py-1 text-xs font-bold leading-none text-white">
                    {activeFilters.length}
                  </span>
                )}
              </ButtonModule>
              <FilterDropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
                filterOptions={stablecoinFilterOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredCryptoFees.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 bg-[#f9f9f9]">
          <EmptyState />
          <p className="text-base font-bold text-[#202B3C]">No crypto fees found.</p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto border-l border-r bg-[#ffffff]">
            <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Logo</th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name <RxCaretSort />
                    </div>
                  </th>

                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("isStablecoin")}
                  >
                    <div className="flex items-center gap-2">
                      Type <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("buySpread")}
                  >
                    <div className="flex items-center gap-2">
                      Buy Spread <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("sellSpread")}
                  >
                    <div className="flex items-center gap-2">
                      Sell Spread <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("buyCommissionPct")}
                  >
                    <div className="flex items-center gap-2">
                      Buy Commission <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("sellCommissionPct")}
                  >
                    <div className="flex items-center gap-2">
                      Sell Commission <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("sellCommissionPct")}
                  >
                    <div className="flex items-center gap-2">
                      Buy Commission Cap <RxCaretSort />
                    </div>
                  </th>
                  <th
                    className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                    onClick={() => toggleSort("sellCommissionPct")}
                  >
                    <div className="flex items-center gap-2">
                      Sell Commission Cap <RxCaretSort />
                    </div>
                  </th>
                  <th className="whitespace-nowrap border-b p-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCryptoFees.map((fee, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      <img src={fee.logo} alt={fee.name} className="h-8 w-8 rounded-full" />
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm font-medium">
                      {fee.name}
                      <p> {fee.symbol}</p>
                    </td>

                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      {getStablecoinBadge(fee.isStablecoin)}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{formatPercentage(fee.buySpread)}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">{formatPercentage(fee.sellSpread)}</td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      {fee.buyCommissionPct > 0 ? formatPercentage(fee.buyCommissionPct) : "0"}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      {fee.sellCommissionPct > 0 ? formatPercentage(fee.sellCommissionPct) : "0"}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      {fee.buyCommissionCap > 0 ? formatPercentage(fee.buyCommissionCap) : "0"}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-2 text-sm">
                      {fee.sellCommissionCap > 0 ? formatPercentage(fee.sellCommissionCap) : "0"}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-1 text-sm">
                      <div className="flex gap-2">
                        <ButtonModule
                          variant="outline"
                          size="sm"
                          icon={<FiEdit2 />}
                          onClick={() => handleEditFee(fee)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Edit
                        </ButtonModule>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t py-3">
            <div className="text-sm text-gray-700">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCryptoFees.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredCryptoFees.length)} of {filteredCryptoFees.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${currentPage === 1 ? "cursor-not-allowed text-gray-500" : "text-[#003F9F]"}`}
              >
                <MdOutlineArrowBackIosNew />
              </button>
              <button
                className={`flex size-7 items-center justify-center rounded-md shadow-sm ${
                  currentPage === 1 ? "bg-white text-[#003F9F]" : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => paginate(1)}
              >
                1
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredCryptoFees.length / itemsPerPage)}
                className={`flex size-7 items-center justify-center rounded-full ${
                  currentPage === Math.ceil(filteredCryptoFees.length / itemsPerPage)
                    ? "cursor-not-allowed text-gray-500"
                    : "text-[#003F9F]"
                }`}
              >
                <MdOutlineArrowForwardIos />
              </button>
            </div>
          </div>
        </>
      )}

      <EditFeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFee(null)
        }}
        fee={selectedFee}
        onSave={handleSaveFee}
        isSaving={isSaving}
      />
    </div>
  )
}

const CryptoFeesPage: React.FC = () => {
  const { data, error, isLoading, refetch } = useGetCryptoFeesQuery()

  const cryptoFees = data?.data || []

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <DashboardNav />
        <div className="container mx-auto px-16 py-8">
          <h1 className="mb-6 text-2xl font-bold">Crypto Fees Management</h1>
          <div className="flex h-60 items-center justify-center">
            <div className="text-lg text-red-600">Error loading crypto fees. Please try again.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <DashboardNav />
      <div className="container mx-auto px-16 py-8">
        <h1 className="mb-6 text-2xl font-bold">Crypto Fees Management</h1>
        <div>
          <CryptoFeesTable cryptoFees={cryptoFees} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default CryptoFeesPage
