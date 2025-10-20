"use client"

import DashboardNav from "components/Navbar/DashboardNav"
import { useState } from "react"
import AddCustomerModal from "components/ui/Modal/add-customer-modal"
import { useGetOverviewQuery } from "lib/redux/overviewSlice"
import { motion } from "framer-motion"
import LogsTable from "components/Tables/LogsTable"

// Skeleton for the table

export default function AllTransactions() {
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)

  // Use the overview API hook
  const { data: overviewData, error, isLoading } = useGetOverviewQuery()

  // Use actual data from API instead of mock data
  const totalCustomers = overviewData?.data?.totalUsers || 0
  const activeCustomers = overviewData?.data?.verifiedUsers || 0
  const frozenCustomers = overviewData?.data?.banned_Suspended_Users || 0
  const inactiveCustomers = overviewData?.data?.unverifiedUsers || 0

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleAddCustomerSuccess = async () => {
    setIsAddCustomerModalOpen(false)
  }

  return (
    <section className="size-full ">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex w-full flex-col">
          <DashboardNav />
          <div className="container mx-auto flex flex-col">
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <LogsTable />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onRequestClose={() => setIsAddCustomerModalOpen(false)}
        onSuccess={handleAddCustomerSuccess}
      />
    </section>
  )
}
