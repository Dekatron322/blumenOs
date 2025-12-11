"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  MdOutlineAdd,
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineDelete,
  MdOutlineEdit,
  MdOutlineLock,
  MdOutlineLockOpen,
  MdOutlinePeople,
} from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import DeleteModal from "components/ui/Modal/delete-modal"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { deletePaymentType, fetchPaymentTypes, PaymentType } from "lib/redux/paymentTypeSlice"

import { notify } from "components/ui/Notification/Notification"

const PaymentTypeCard: React.FC<{
  paymentType: PaymentType
  onEdit: (paymentType: PaymentType) => void
  onDelete: (paymentType: PaymentType) => void
}> = ({ paymentType, onEdit, onDelete }) => {
  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-12 items-center justify-center rounded-lg ${
              paymentType.isActive ? "bg-green-50" : "bg-gray-100"
            }`}
          >
            {paymentType.isActive ? (
              <MdOutlineLockOpen className="size-6 text-green-600" />
            ) : (
              <MdOutlineLock className="size-6 text-gray-500" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{paymentType.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  paymentType.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {paymentType.isActive ? "Active" : "Inactive"}
              </div>
              {/* <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                ID: {paymentType.id}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {paymentType.description && (
          <div>
            <div className="mb-1 text-xs font-medium text-gray-600">Description</div>
            <p className="line-clamp-3 text-sm text-gray-700">{paymentType.description}</p>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex gap-2">
            <ButtonModule
              variant="outline"
              size="sm"
              className="flex-1 justify-center"
              onClick={() => onEdit(paymentType)}
            >
              <MdOutlineEdit className="mr-2 size-4" />
              Edit
            </ButtonModule>
            <ButtonModule
              variant="outline"
              size="sm"
              className="flex-1 justify-center border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => onDelete(paymentType)}
            >
              <MdOutlineDelete className="mr-2 size-4" />
              Delete
            </ButtonModule>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const LoadingSkeleton = () => {
  return (
    <motion.div
      className="mt-5 flex flex-1 flex-col rounded-md border bg-white p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="items-center justify-between border-b py-2 md:flex md:py-4">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="mt-3 flex gap-4 md:mt-0">
          <div className="h-10 w-48 rounded bg-gray-200" />
          <div className="h-10 w-24 rounded bg-gray-200" />
        </div>
      </div>

      <div className="w-full overflow-x-auto border-x bg-[#f9f9f9]">
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(5)].map((_, cellIndex) => (
                  <td key={cellIndex} className="whitespace-nowrap border-b px-4 py-3">
                    <div className="h-4 w-full rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t py-3">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="size-8 rounded bg-gray-200" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="size-8 rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const CardsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-20 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="size-7 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="h-8 w-full rounded bg-gray-200" />
              <div className="h-8 w-full rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const PaymentTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { paymentTypes, loading, error, deleting, deleteSuccess, deleteError } = useAppSelector(
    (state) => state.paymentTypes
  )

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "status" | "id">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const pageSize = 12

  useEffect(() => {
    if (!loading && paymentTypes.length === 0) {
      dispatch(fetchPaymentTypes())
    }
  }, [dispatch, loading, paymentTypes.length])

  // Handle delete success notification
  useEffect(() => {
    if (deleteSuccess && selectedPaymentType) {
      notify("success", `Payment type "${selectedPaymentType.name}" has been deleted successfully`)
      setDeleteModalOpen(false)
      setSelectedPaymentType(null)
      setDeleteReason("")
    }
  }, [deleteSuccess, selectedPaymentType])

  // Handle delete error notification
  useEffect(() => {
    if (deleteError) {
      notify("error", deleteError)
    }
  }, [deleteError])

  // Filter and sort payment types
  const filteredPaymentTypes = paymentTypes
    .filter((pt) => {
      const matchesSearch =
        searchText === "" ||
        pt.name.toLowerCase().includes(searchText.toLowerCase()) ||
        pt.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(pt.id).toLowerCase().includes(searchText.toLowerCase())

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && pt.isActive) ||
        (filterStatus === "inactive" && !pt.isActive)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: string | number | boolean
      let bValue: string | number | boolean

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "status":
          aValue = a.isActive
          bValue = b.isActive
          break
        case "id":
          aValue = a.id
          bValue = b.id
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalRecords = filteredPaymentTypes.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  const toggleSort = (column: "name" | "status" | "id") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleEdit = (paymentType: PaymentType) => {
    // Navigate to edit page or open modal
    router.push(`/payment-types/edit/${paymentType.id}`)
  }

  const handleDelete = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType)
    setDeleteModalOpen(true)
    setDeleteReason("")
  }

  const handleConfirmDelete = async (reason: string) => {
    if (selectedPaymentType) {
      try {
        const result = await dispatch(deletePaymentType(selectedPaymentType.id))

        if (deletePaymentType.rejected.match(result)) {
          const errorMessage = (result.payload as string) || "Failed to delete payment type"
          notify("error", errorMessage)
        }
      } catch (error: any) {
        notify("error", error.message || "Failed to delete payment type")
      }
    }
  }

  const handleCreateNew = () => {
    router.push("/payment-types/create")
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedPaymentType(null)
    setDeleteReason("")
  }

  if (loading && paymentTypes.length === 0) return <LoadingSkeleton />

  const startIndex = (currentPage - 1) * pageSize
  const pageItems = filteredPaymentTypes.slice(startIndex, startIndex + pageSize)

  // Calculate statistics
  const activeCount = paymentTypes.filter((pt) => pt.isActive).length
  const inactiveCount = paymentTypes.filter((pt) => !pt.isActive).length

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onRequestClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        businessName={selectedPaymentType?.name || ""}
        successMessage={deleteSuccess ? `Payment type "${selectedPaymentType?.name}" deleted successfully` : undefined}
        // errorMessage={deleteError}
      />

      <motion.div
        className="items-center justify-between py-2 md:flex"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Payment Types</p>
          <p className="text-sm text-gray-600">View and manage available payment types</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search payment types..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <ButtonModule variant="primary" size="sm" onClick={handleCreateNew}>
            <MdOutlineAdd className="size-4" />
            Add Payment Type
          </ButtonModule>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{paymentTypes.length}</div>
              <div className="text-sm text-gray-600">Total Payment Types</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <MdOutlinePeople className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <MdOutlineLockOpen className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{inactiveCount}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <MdOutlineLock className="size-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {paymentTypes.filter((pt) => pt.description && pt.description.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">With Description</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <svg className="size-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mt-6">
        {/* Controls Bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                List View
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Sort by:</span>
              <button
                onClick={() => toggleSort("name")}
                className={`rounded px-2 py-1 ${sortBy === "name" ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => toggleSort("status")}
                className={`rounded px-2 py-1 ${sortBy === "status" ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => toggleSort("id")}
                className={`rounded px-2 py-1 ${sortBy === "id" ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filterStatus === "all" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filterStatus === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filterStatus === "inactive"
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Payment Types Grid/List */}
        {loading && paymentTypes.length === 0 ? (
          <CardsLoadingSkeleton />
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">Failed to load payment types: {error}</p>
            <ButtonModule variant="outline" size="sm" className="mt-3" onClick={() => dispatch(fetchPaymentTypes())}>
              Retry
            </ButtonModule>
          </div>
        ) : filteredPaymentTypes.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg bg-gray-50 py-12 text-center">
            <MdOutlinePeople className="mx-auto mb-4 size-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No payment types found</h3>
            <p className="mb-6 text-gray-600">
              {searchText ? "Try adjusting your search or filters" : "Create your first payment type to get started"}
            </p>
            <ButtonModule variant="primary" onClick={handleCreateNew}>
              Create New Payment Type
            </ButtonModule>
          </div>
        ) : viewMode === "grid" ? (
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {pageItems.map((paymentType, index) => (
                <motion.div
                  key={paymentType.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <PaymentTypeCard paymentType={paymentType} onEdit={handleEdit} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((paymentType, index) => (
                    <motion.tr
                      key={paymentType.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{paymentType.name}</div>
                          {/* <div className="text-sm text-gray-500">ID: {paymentType.id}</div> */}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {paymentType.description || <span className="text-gray-400">No description</span>}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            paymentType.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {paymentType.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <ButtonModule variant="outline" size="sm" onClick={() => handleEdit(paymentType)}>
                            Edit
                          </ButtonModule>
                          <ButtonModule
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(paymentType)}
                          >
                            Delete
                          </ButtonModule>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {filteredPaymentTypes.length > 0 && (
          <motion.div
            className="mt-6 flex items-center justify-between border-t pt-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm text-gray-700">
              Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} payment types
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <MdOutlineArrowBackIosNew />
              </motion.button>

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
                  <motion.button
                    key={index}
                    onClick={() => paginate(pageNum)}
                    className={`flex size-8 items-center justify-center rounded-md text-sm ${
                      currentPage === pageNum
                        ? "bg-[#004B23] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18, delay: index * 0.03 }}
                  >
                    {pageNum}
                  </motion.button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-2">...</span>}

              {totalPages > 5 && currentPage < totalPages - 1 && (
                <motion.button
                  onClick={() => paginate(totalPages)}
                  className="flex size-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {totalPages}
                </motion.button>
              )}

              <motion.button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center justify-center rounded-md p-2 ${
                  currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
                }`}
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <MdOutlineArrowForwardIos />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default PaymentTypes
