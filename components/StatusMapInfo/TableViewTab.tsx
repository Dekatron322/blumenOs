// "use client"

// import React, { useState } from "react"
// import { motion } from "framer-motion"

// interface TableRow {
//   id: string
//   customerName: string
//   location: string
//   state: string
//   feeder: string
//   paymentStatus: "paid" | "unpaid" | "partial" | "unknown"
//   amount: string
//   lastPayment: string
// }

// const TableViewTab = () => {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [currentPage, setCurrentPage] = useState(1)
//   const pageSize = 10

//   // Mock data
//   const mockData: TableRow[] = [
//     {
//       id: "1",
//       customerName: "John Doe",
//       location: "Lagos Island",
//       state: "Lagos",
//       feeder: "Feeder 1",
//       paymentStatus: "paid",
//       amount: "₦15,000",
//       lastPayment: "2024-01-15",
//     },
//     {
//       id: "2",
//       customerName: "Jane Smith",
//       location: "Abuja Central",
//       state: "Abuja",
//       feeder: "Feeder 2",
//       paymentStatus: "unpaid",
//       amount: "₦20,000",
//       lastPayment: "2023-12-10",
//     },
//     {
//       id: "3",
//       customerName: "Mike Johnson",
//       location: "Kano North",
//       state: "Kano",
//       feeder: "Feeder 3",
//       paymentStatus: "partial",
//       amount: "₦12,500",
//       lastPayment: "2024-01-10",
//     },
//     // Add more mock data as needed
//   ]

//   const filteredData = mockData.filter((row) =>
//     Object.values(row).some((value) =>
//       value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   )

//   const totalPages = Math.ceil(filteredData.length / pageSize)
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   )

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "paid":
//         return "bg-green-100 text-green-800"
//       case "unpaid":
//         return "bg-red-100 text-red-800"
//       case "partial":
//         return "bg-orange-100 text-orange-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   return (
//     <div className="rounded-md border bg-white p-6">
//       {/* Search and Filters */}
//       <div className="mb-6 flex items-center justify-between gap-4">
//         <div className="flex-1">
//           <input
//             type="text"
//             placeholder="Search customers..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b bg-gray-50">
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 Customer Name
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 Location
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 State
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 Feeder
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 Payment Status
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 Amount
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                 Last Payment
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedData.length > 0 ? (
//               paginatedData.map((row) => (
//                 <motion.tr
//                   key={row.id}
//                   className="border-b hover:bg-gray-50"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   <td className="px-4 py-3 text-sm">{row.customerName}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{row.location}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{row.state}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{row.feeder}</td>
//                   <td className="px-4 py-3">
//                     <span
//                       className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
//                         row.paymentStatus
//                       )}`}
//                     >
//                       {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-sm font-medium">{row.amount}</td>
//                   <td className="px-4 py-3 text-sm text-gray-600">{row.lastPayment}</td>
//                 </motion.tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
//                   No data found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="mt-6 flex items-center justify-between">
//           <div className="text-sm text-gray-600">
//             Showing {(currentPage - 1) * pageSize + 1} to{" "}
//             {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{" "}
//             entries
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
//               disabled={currentPage === 1}
//               className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
//             >
//               Previous
//             </button>
//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i + 1}
//                 onClick={() => setCurrentPage(i + 1)}
//                 className={`rounded-md border px-3 py-1 text-sm ${
//                   currentPage === i + 1
//                     ? "border-blue-500 bg-blue-500 text-white"
//                     : "border-gray-300"
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             ))}
//             <button
//               onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
//               disabled={currentPage === totalPages}
//               className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default TableViewTab

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"

interface TableRow {
  id: string
  customerId: string
  name: string
  meterNo: string
  state: string
  amountDue: string
  lastPayment: string | null
  status: "paid" | "unpaid" | "partial" | "unknown"
}

const TableViewTab = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<"map" | "table" | "webhook">("table")
  const pageSize = 10

  // Mock data (update with your real API data)
  const mockData: TableRow[] = [
    {
      id: "1",
      customerId: "KA-00000001",
      name: "Hadiza Mohammed",
      meterNo: "MTR-0000000001",
      state: "Kaduna",
      amountDue: "₦15,292",
      lastPayment: null,
      status: "unpaid",
    },
    {
      id: "2",
      customerId: "KA-00000002",
      name: "Chinonso Obi",
      meterNo: "MTR-0000000002",
      state: "Kaduna",
      amountDue: "₦7,008",
      lastPayment: null,
      status: "unknown",
    },
    {
      id: "3",
      customerId: "KA-00000003",
      name: "Usman Abubakar",
      meterNo: "MTR-0000000003",
      state: "Kaduna",
      amountDue: "₦7,185",
      lastPayment: null,
      status: "unknown",
    },
    {
      id: "4",
      customerId: "KA-00000004",
      name: "Obiageli Nwachukwu",
      meterNo: "MTR-0000000004",
      state: "Kaduna",
      amountDue: "₦10,364",
      lastPayment: "30/10/2025",
      status: "paid",
    },
    // ...add more rows or replace with real data
  ]

  // filtering
  const filteredData = mockData.filter((row) =>
    [row.customerId, row.name, row.meterNo, row.state, row.amountDue, row.lastPayment ?? "N/A", row.status]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getStatusClasses = (status: TableRow["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "unpaid":
        return "bg-red-100 text-red-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // CSV export (exports currently filtered rows)
  const exportCSV = () => {
    const headers = ["Customer ID", "Name", "Meter No", "State", "Amount Due", "Last Payment", "Status"]
    const rows = filteredData.map((r) => [
      r.customerId,
      r.name,
      r.meterNo,
      r.state,
      r.amountDue,
      r.lastPayment ?? "N/A",
      r.status.toUpperCase(),
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-md border bg-white p-6">
      {/* Top controls: tabs + header + export */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Customer List <span className="text-sm font-normal text-gray-500">({mockData.length})</span>
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            title="Export CSV"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5 5 5M12 5v12"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="mb-4 block md:hidden">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="w-[14%] px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer ID</th>
              <th className="w-[22%] px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="w-[18%] px-4 py-3 text-left text-sm font-semibold text-gray-700">Meter No</th>
              <th className="w-[12%] px-4 py-3 text-left text-sm font-semibold text-gray-700">State</th>
              <th className="w-[12%] px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount Due</th>
              <th className="w-[12%] px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Payment</th>
              <th className="w-[10%] px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <motion.tr
                  key={row.id}
                  className="border-b hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">
                    <span className="font-mono text-[13px] text-slate-700">{row.customerId}</span>
                  </td>

                  <td className="px-4 py-3 text-sm text-slate-800">{row.name}</td>

                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className="font-mono text-[13px]">{row.meterNo}</span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600">{row.state}</td>

                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{row.amountDue}</td>

                  <td className="px-4 py-3 text-sm text-gray-600">{row.lastPayment ?? "N/A"}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        row.status
                      )}`}
                    >
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  currentPage === i + 1 ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableViewTab
