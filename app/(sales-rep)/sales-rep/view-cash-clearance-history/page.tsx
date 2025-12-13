"use client"

import React from "react"
import AgentClearanceTable from "components/Tables/AgentClearanceTable"
import { useAppSelector } from "lib/hooks/useRedux"
import DashboardNav from "components/Navbar/DashboardNav"

const ViewCashClearanceHistoryPage: React.FC = () => {
  const { agent } = useAppSelector((state) => state.auth)

  // If for some reason we don't have an agent in auth state, show a friendly message
  if (!agent) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md rounded-md border bg-white p-6 text-center text-sm text-gray-700">
          <p className="font-medium">We couldn't find your agent profile.</p>
          <p className="mt-2 text-xs text-gray-500">
            Please sign in as a sales representative again or contact support if this problem continues.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="size-full">
      <DashboardNav />
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
        <div className="mx-auto flex w-full flex-col px-3 2xl:container xl:px-16">
          <div className="mt-6 w-full">
            <AgentClearanceTable agentId={agent.id} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ViewCashClearanceHistoryPage
