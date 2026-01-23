"use client"
import React from "react"
import DashboardNav from "components/Navbar/DashboardNav"
import AllRefundTable from "components/Tables/AllRefundTable"

export default function RefundHistoryPage() {
  return (
    <section className="flex min-h-screen flex-col bg-gray-50">
      <DashboardNav />
      <main className="flex-1 p-4 md:p-6 lg:p-8 2xl:px-16">
        <AllRefundTable />
      </main>
    </section>
  )
}
