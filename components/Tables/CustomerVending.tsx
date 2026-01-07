import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useAppDispatch } from "lib/hooks/useRedux"
import { AnimatePresence, motion } from "framer-motion"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos } from "react-icons/md"
import {
  getCustomerMeters,
  selectCustomerMetersError,
  selectCustomerMetersList,
  selectCustomerMetersLoading,
  selectCustomerMetersPagination,
  selectCustomerMetersSuccess,
} from "lib/redux/customersDashboardSlice"

// Component Props
interface CustomerVendingProps {
  customerId?: string
  customerName?: string
  accountNumber?: string
  meterNumber?: string
}

const CustomerVending: React.FC<CustomerVendingProps> = ({
  customerId = "CUST001",
  customerName = "John Smith",
  accountNumber = "ACC00123456",
  meterNumber = "04123456789",
}) => {
  const dispatch = useAppDispatch()

  // Redux state for customer meters
  const metersList = useSelector(selectCustomerMetersList)
  const metersPagination = useSelector(selectCustomerMetersPagination)
  const metersLoading = useSelector(selectCustomerMetersLoading)
  const metersError = useSelector(selectCustomerMetersError)
  const metersSuccess = useSelector(selectCustomerMetersSuccess)

  // Local state
  const [metersPage, setMetersPage] = useState(1)
  const [metersPageSize] = useState(10)

  // Fetch customer meters on component mount and when page changes
  useEffect(() => {
    const customerIdNum = parseInt(customerId.replace(/[^0-9]/g, "")) || 1

    dispatch(
      getCustomerMeters({
        pageNumber: metersPage,
        pageSize: metersPageSize,
        customerId: customerIdNum,
      })
    )
  }, [metersPage, metersPageSize, customerId, dispatch])

  const getMeterStatusStyle = (status: number) => {
    switch (status) {
      case 1:
        return {
          backgroundColor: "#EEF5F0",
          color: "#589E67",
          label: "Active",
        }
      case 2:
        return {
          backgroundColor: "#F7EDED",
          color: "#AF4B4B",
          label: "Inactive",
        }
      case 3:
        return {
          backgroundColor: "#FEF6E6",
          color: "#D97706",
          label: "Maintenance",
        }
      case 4:
        return {
          backgroundColor: "#EFF6FF",
          color: "#3B82F6",
          label: "Suspended",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          label: "Unknown",
        }
    }
  }

  const getMeterTypeStyle = (meterType: number) => {
    switch (meterType) {
      case 1:
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
          label: "Prepaid",
        }
      case 2:
        return {
          backgroundColor: "#FEF3C7",
          color: "#D97706",
          label: "Postpaid",
        }
      default:
        return {
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          label: "Unknown",
        }
    }
  }

  const paginateMeters = (pageNumber: number) => {
    setMetersPage(pageNumber)
  }

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Customer Information Header */}

      <motion.div
        className="items-center justify-between border-b py-2 md:flex md:py-4"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">My Meters</p>
          <p className="text-sm text-gray-600">Manage your electricity meters</p>
        </div>
      </motion.div>

      {/* Meters Header */}
      <motion.div
        className="my-4 rounded-lg bg-gray-50 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">Total Meters</p>
            <p className="text-lg font-semibold text-gray-900">{metersPagination?.totalCount || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Meters</p>
            <p className="text-lg font-semibold text-green-600">
              {metersList?.filter((m) => m.isMeterActive).length || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prepaid Meters</p>
            <p className="text-lg font-semibold text-blue-600">
              {metersList?.filter((m) => m.meterType === 1).length || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Postpaid Meters</p>
            <p className="text-lg font-semibold text-orange-600">
              {metersList?.filter((m) => m.meterType === 2).length || 0}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Meters Table */}
      <motion.div
        className="w-full overflow-x-auto border-x bg-[#f9f9f9]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <table className="w-full min-w-[1000px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b p-4 font-medium">Serial Number</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">DRN</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">Meter Type</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">Status</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">Tariff</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">Installation Date</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">Address</th>
              <th className="whitespace-nowrap border-b p-4 font-medium">Tenant</th>
            </tr>
          </thead>
          <tbody>
            {metersLoading ? (
              <tr>
                <td colSpan={8} className="border-b px-4 py-8 text-center text-gray-500">
                  Loading meters...
                </td>
              </tr>
            ) : metersError ? (
              <tr>
                <td colSpan={8} className="border-b px-4 py-8 text-center text-red-500">
                  {metersError}
                </td>
              </tr>
            ) : metersList && metersList.length > 0 ? (
              metersList.map((meter, index) => {
                const statusStyle = getMeterStatusStyle(meter.status)
                const typeStyle = getMeterTypeStyle(meter.meterType)

                return (
                  <motion.tr
                    key={meter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap border-b px-4 py-3 font-medium">{meter.serialNumber}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3">{meter.drn}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: typeStyle.backgroundColor,
                          color: typeStyle.color,
                        }}
                      >
                        {typeStyle.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3">
                      <span
                        className="rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3">{meter.tariff?.name || "N/A"}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3">
                      {new Date(meter.installationDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap border-b px-4 py-3">{meter.address || "N/A"}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3">
                      <div>
                        <p className="text-sm">{meter.tenantFullName || "N/A"}</p>
                        {meter.tenantPhoneNumber && <p className="text-xs text-gray-500">{meter.tenantPhoneNumber}</p>}
                      </div>
                    </td>
                  </motion.tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={8} className="border-b px-4 py-8 text-center text-gray-500">
                  No meters found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Meters Pagination */}
      {metersPagination && metersPagination.totalPages > 1 && (
        <motion.div
          className="mt-4 flex items-center justify-between border-t py-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="text-sm text-gray-600">
            Showing {(metersPage - 1) * metersPageSize + 1} to{" "}
            {Math.min(metersPage * metersPageSize, metersPagination.totalCount)} of {metersPagination.totalCount} meters
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => paginateMeters(metersPage - 1)}
              disabled={metersPage === 1}
              className={`flex items-center justify-center rounded-md p-2 ${
                metersPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#003F9F] hover:bg-gray-100"
              }`}
              whileHover={{ scale: metersPage === 1 ? 1 : 1.1 }}
              whileTap={{ scale: metersPage === 1 ? 1 : 0.95 }}
            >
              <MdOutlineArrowBackIosNew />
            </motion.button>

            {Array.from({ length: Math.min(5, metersPagination.totalPages) }, (_, index) => {
              let pageNum = index + 1
              if (metersPagination.totalPages > 5) {
                if (metersPage <= 3) {
                  pageNum = index + 1
                } else if (metersPage >= metersPagination.totalPages - 2) {
                  pageNum = metersPagination.totalPages - 4 + index
                } else {
                  pageNum = metersPage - 2 + index
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => paginateMeters(pageNum)}
                  className={`flex size-8 items-center justify-center rounded-md text-sm ${
                    metersPage === pageNum ? "bg-[#004B23] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {pageNum}
                </motion.button>
              )
            })}

            {metersPagination.totalPages > 5 && metersPage < metersPagination.totalPages - 2 && (
              <span className="px-2">...</span>
            )}

            {metersPagination.totalPages > 5 && metersPage < metersPagination.totalPages - 1 && (
              <motion.button
                onClick={() => paginateMeters(metersPagination.totalPages)}
                className={`flex size-8 items-center justify-center rounded-md text-sm ${
                  metersPage === metersPagination.totalPages
                    ? "bg-[#004B23] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {metersPagination.totalPages}
              </motion.button>
            )}

            <motion.button
              onClick={() => paginateMeters(metersPage + 1)}
              disabled={metersPage === metersPagination.totalPages}
              className={`flex items-center justify-center rounded-md p-2 ${
                metersPage === metersPagination.totalPages
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#003F9F] hover:bg-gray-100"
              }`}
              whileHover={{ scale: metersPage === metersPagination.totalPages ? 1 : 1.1 }}
              whileTap={{ scale: metersPage === metersPagination.totalPages ? 1 : 0.95 }}
            >
              <MdOutlineArrowForwardIos />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CustomerVending
