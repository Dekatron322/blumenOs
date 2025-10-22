import React, { useState } from "react"
import { RxDotsVertical } from "react-icons/rx"
import { MdFormatListBulleted, MdGridView } from "react-icons/md"
import { PiNoteBold } from "react-icons/pi"
import Image from "next/image"
import { IoMdFunnel } from "react-icons/io"
import { IoFunnelOutline } from "react-icons/io5"
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi"
import { GoXCircle } from "react-icons/go"
import { WiTime3 } from "react-icons/wi"
import { VscEye } from "react-icons/vsc"
import { LiaTimesSolid } from "react-icons/lia"
import { SearchModule } from "components/ui/Search/search-module"
import { FiXCircle } from "react-icons/fi"
import { FaRegCheckCircle } from "react-icons/fa"
import Dropdown from "components/Dropdown/Dropdown"
import Link from "next/link"

type SortOrder = "asc" | "desc" | null
type Customer = {
  id: string
  name: string
  status: "active" | "inactive" | "suspended"
  region: string
  accountNumber: string
  meterNumber: string
  tariff: string
  address: string
  customerType: "prepaid" | "postpaid" | "estimated"
  lastPayment: string
  balance: number
}

type CustomerCategory = {
  name: string
  code: string
  customerCount: number
  rate: string
  type: "residential" | "commercial"
}

const AllCustomers = () => {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showCategories, setShowCategories] = useState(true)

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index)
  }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isModalReminderOpen, setIsModalReminderOpen] = useState(false)

  const handleCancelOrder = () => {
    setIsModalOpen(true)
  }

  const handleStatusOrder = () => {
    setIsStatusModalOpen(true)
  }

  const confirmStatusChange = () => {
    console.log("Status changed")
    setIsStatusModalOpen(false)
  }

  const confirmCancellation = () => {
    console.log("Customer suspended")
    setIsModalOpen(false)
  }

  const closeReminderModal = () => {
    setIsModalReminderOpen(false)
  }

  const handleCancelReminderOrder = () => {
    setIsModalReminderOpen(true)
  }

  const confirmReminder = () => {
    console.log("Reminder Sent")
    setIsModalReminderOpen(false)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const closeStatusModal = () => {
    setIsStatusModalOpen(false)
  }

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "John Adebayo",
      status: "active",
      region: "R2",
      accountNumber: "2301456789",
      meterNumber: "MTR001234567",
      tariff: "Band A (20+ hrs)",
      address: "15 Victoria Street, Lagos Island",
      customerType: "prepaid",
      lastPayment: "2024-12-19",
      balance: 0,
    },
    {
      id: "2",
      name: "Chioma Okoro",
      status: "active",
      region: "R1",
      accountNumber: "2301456790",
      meterNumber: "MTR001234568",
      tariff: "Band B (16-20 hrs)",
      address: "42 Allen Avenue, Ikeja",
      customerType: "prepaid",
      lastPayment: "2024-12-18",
      balance: 1500,
    },
    {
      id: "3",
      name: "Emeka Nwankwo",
      status: "inactive",
      region: "R3",
      accountNumber: "2301456791",
      meterNumber: "MTR001234569",
      tariff: "Band C (12-16 hrs)",
      address: "8 Broad Street, Lagos Island",
      customerType: "postpaid",
      lastPayment: "2024-11-15",
      balance: 8500,
    },
    {
      id: "4",
      name: "Bola Ahmed",
      status: "suspended",
      region: "R2",
      accountNumber: "2301456792",
      meterNumber: "MTR001234570",
      tariff: "Band A (20+ hrs)",
      address: "23 Marina Road, CMS",
      customerType: "prepaid",
      lastPayment: "2024-10-20",
      balance: 0,
    },
    {
      id: "5",
      name: "Funke Adeleke",
      status: "active",
      region: "R1",
      accountNumber: "2301456793",
      meterNumber: "MTR001234571",
      tariff: "Band B (16-20 hrs)",
      address: "17 Awolowo Road, Ikoyi",
      customerType: "estimated",
      lastPayment: "2024-12-17",
      balance: 0,
    },
    {
      id: "6",
      name: "Tunde Johnson",
      status: "active",
      region: "R3",
      accountNumber: "2301456794",
      meterNumber: "MTR001234572",
      tariff: "Band C (12-16 hrs)",
      address: "5 Herbert Macaulay, Yaba",
      customerType: "prepaid",
      lastPayment: "2024-12-16",
      balance: 3200,
    },
    {
      id: "7",
      name: "Grace Okafor",
      status: "inactive",
      region: "R2",
      accountNumber: "2301456795",
      meterNumber: "MTR001234573",
      tariff: "Band A (20+ hrs)",
      address: "29 Nnamdi Azikiwe, Lagos Island",
      customerType: "postpaid",
      lastPayment: "2024-11-28",
      balance: 12500,
    },
    {
      id: "8",
      name: "Kunle Martins",
      status: "active",
      region: "R1",
      accountNumber: "2301456796",
      meterNumber: "MTR001234574",
      tariff: "Band B (16-20 hrs)",
      address: "14 Adeola Odeku, Victoria Island",
      customerType: "prepaid",
      lastPayment: "2024-12-15",
      balance: 0,
    },
    {
      id: "9",
      name: "Aisha Bello",
      status: "suspended",
      region: "R3",
      accountNumber: "2301456797",
      meterNumber: "MTR001234575",
      tariff: "Band C (12-16 hrs)",
      address: "36 Agege Motor Road, Mushin",
      customerType: "estimated",
      lastPayment: "2024-09-10",
      balance: 0,
    },
    {
      id: "10",
      name: "David Chukwu",
      status: "active",
      region: "R2",
      accountNumber: "2301456798",
      meterNumber: "MTR001234576",
      tariff: "Band A (20+ hrs)",
      address: "9 Catholic Mission Street, Lagos Island",
      customerType: "prepaid",
      lastPayment: "2024-12-14",
      balance: 1800,
    },
  ])

  const customerCategories: CustomerCategory[] = [
    {
      name: "Residential - R1",
      code: "R1",
      customerCount: 45200,
      rate: "₦68/kWh",
      type: "residential",
    },
    {
      name: "Residential - R2",
      code: "R2",
      customerCount: 38150,
      rate: "₦92.5/kWh",
      type: "residential",
    },
    {
      name: "Residential - R3",
      code: "R3",
      customerCount: 22800,
      rate: "₦118/kWh",
      type: "residential",
    },
    {
      name: "Commercial - C1",
      code: "C1",
      customerCount: 8400,
      rate: "₦125/kWh",
      type: "commercial",
    },
    {
      name: "Commercial - C2",
      code: "C2",
      customerCount: 4200,
      rate: "₦142.5/kWh",
      type: "commercial",
    },
    {
      name: "Commercial - C3",
      code: "C3",
      customerCount: 2800,
      rate: "₦168/kWh",
      type: "commercial",
    },
  ]

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "active":
        return { backgroundColor: "#EEF5F0", color: "#589E67" }
      case "inactive":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      case "suspended":
        return { backgroundColor: "#F7EDED", color: "#AF4B4B" }
      default:
        return {}
    }
  }

  const getCustomerTypeStyle = (type: string) => {
    switch (type) {
      case "prepaid":
        return { backgroundColor: "#EDF2FE", color: "#4976F4" }
      case "postpaid":
        return { backgroundColor: "#F4EDF7", color: "#954BAF" }
      case "estimated":
        return { backgroundColor: "#FBF4EC", color: "#D28E3D" }
      default:
        return {}
    }
  }

  const dotStyle = (status: string) => {
    switch (status) {
      case "active":
        return { backgroundColor: "#589E67" }
      case "inactive":
        return { backgroundColor: "#D28E3D" }
      case "suspended":
        return { backgroundColor: "#AF4B4B" }
      default:
        return {}
    }
  }

  const toggleSort = (column: keyof Customer) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)

    const sortedCustomers = [...customers].sort((a, b) => {
      if (a[column] < b[column]) return isAscending ? 1 : -1
      if (a[column] > b[column]) return isAscending ? -1 : 1
      return 0
    })

    setCustomers(sortedCustomers)
  }

  const handleCancelSearch = () => {
    setSearchText("")
  }

  const filteredCustomers = customers.filter((customer) =>
    Object.values(customer).some((value) => value.toString().toLowerCase().includes(searchText.toLowerCase()))
  )

  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredCustomers.slice(indexOfFirstRow, indexOfLastRow)
  const [selectedOption, setSelectedOption] = React.useState<string>("")
  const [isDropdownOpen, setDropdownOpen] = React.useState<boolean>(false)

  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage)

  const changePage = (page: number) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page)
  }

  const handleRowsChange = (event: { target: { value: any } }) => {
    setRowsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="font-semibold text-blue-600">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
            <div className="flex items-center gap-2">
              <div
                style={getStatusStyle(customer.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                {customer.status}
              </div>
              <div style={getCustomerTypeStyle(customer.customerType)} className="rounded-full px-2 py-1 text-xs">
                {customer.customerType}
              </div>
            </div>
          </div>
        </div>
        <RxDotsVertical
          onClick={() => toggleDropdown(parseInt(customer.id))}
          className="cursor-pointer text-gray-400 hover:text-gray-600"
        />
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Region:</span>
          <span className="font-medium">{customer.region}</span>
        </div>
        <div className="flex justify-between">
          <span>Account No:</span>
          <span className="font-medium">{customer.accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Meter No:</span>
          <span className="font-medium">{customer.meterNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Tariff:</span>
          <span className="font-medium">{customer.tariff}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Payment:</span>
          <span className="font-medium">{customer.lastPayment}</span>
        </div>
        {customer.balance > 0 && (
          <div className="flex justify-between">
            <span>Balance:</span>
            <span className="font-medium text-red-600">₦{customer.balance.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-gray-500">{customer.address}</p>
      </div>

      <div className="mt-3 flex gap-2 ">
        <Link href="#" className="button-oulined flex-1 justify-center text-center">
          <VscEye className="size-4" />
          View Details
        </Link>
      </div>
    </div>
  )

  const CustomerListItem = ({ customer }: { customer: Customer }) => (
    <div className="border-b bg-white p-4 transition-all hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-semibold text-blue-600">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-semibold text-gray-900">{customer.name}</h3>
              <div
                style={getStatusStyle(customer.status)}
                className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              >
                <span className="size-2 rounded-full" style={dotStyle(customer.status)}></span>
                {customer.status}
              </div>
              <div style={getCustomerTypeStyle(customer.customerType)} className="rounded-full px-2 py-1 text-xs">
                {customer.customerType}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>
                <strong>Region:</strong> {customer.region}
              </span>
              <span>
                <strong>Account:</strong> {customer.accountNumber}
              </span>
              <span>
                <strong>Meter:</strong> {customer.meterNumber}
              </span>
              <span>
                <strong>Tariff:</strong> {customer.tariff}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{customer.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900">Last Payment: {customer.lastPayment}</div>
            {customer.balance > 0 && <div className="text-red-600">Balance: ₦{customer.balance.toLocaleString()}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="#" className="button-oulined">
              <VscEye className="size-4" />
              View
            </Link>
            <div className="relative">
              <RxDotsVertical
                onClick={() => toggleDropdown(parseInt(customer.id))}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              />
              {activeDropdown === parseInt(customer.id) && (
                <div className="modal-style absolute right-0 top-full z-[100] mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg">
                  <ul className="text-sm">
                    <li className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100">
                      <VscEye />
                      Update Status
                    </li>
                    <li className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100">
                      <WiTime3 /> Send Reminder
                    </li>
                    <li className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100">
                      <GoXCircle /> Suspend Account
                    </li>
                    <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
                      <PiNoteBold />
                      Export Data
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="modal-style z-100 absolute right-5 mt-2 w-48 rounded border border-gray-300 bg-white shadow-lg">
        <ul className="text-sm">
          <li className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100">
            <VscEye />
            Update Status
          </li>
          <li className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100">
            <WiTime3 /> Send Reminder
          </li>
          <li className="flex cursor-pointer items-center gap-2 border-b px-4 py-2 hover:bg-gray-100">
            <GoXCircle /> Suspend Account
          </li>
          <li className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100">
            <PiNoteBold />
            Export Data
          </li>
        </ul>
      </div> */}
    </div>
  )

  const CategoryCard = ({ category }: { category: CustomerCategory }) => (
    <div className="rounded-lg border bg-white p-3 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900">{category.code}</h3>
          <div
            className={`rounded px-2 py-1 text-xs ${
              category.type === "residential" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
            }`}
          >
            {category.type}
          </div>
        </div>
        <div className="flex text-sm">
          <span className="font-medium">{category.rate}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Customers:</span>
          <span className="font-medium">{category.customerCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-3 relative mt-5 flex items-start gap-6">
      {/* Main Content - Customers List/Grid */}
      <div className={`rounded-md border bg-white p-5 ${showCategories ? "flex-1" : "w-full"}`}>
        <div className="flex flex-col   py-2">
          <p className="text-2xl font-medium">All Customers</p>
          <div className="mt-2 flex gap-4">
            <SearchModule
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onCancel={handleCancelSearch}
              placeholder="Search by name, account number, or meter number"
            />

            <div className="flex gap-2">
              <button
                className={`button-oulined ${viewMode === "grid" ? "bg-gray-100" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <MdGridView />
                <p>Grid</p>
              </button>
              <button
                className={`button-oulined ${viewMode === "list" ? "bg-gray-100" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <MdFormatListBulleted />
                <p>List</p>
              </button>
            </div>

            <button className="button-oulined" onClick={() => setShowCategories(!showCategories)}>
              {showCategories ? "Hide Categories" : "Show Categories"}
            </button>

            <button className="button-oulined" type="button">
              <IoMdFunnel />
              <p>Sort By</p>
            </button>
            <button className="button-oulined" type="button">
              <IoFunnelOutline />
              <p>Filter</p>
            </button>
          </div>
        </div>

        {/* Customer Display Area */}
        <div className="w-full">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentRows.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {currentRows.map((customer) => (
                <CustomerListItem key={customer.id} customer={customer} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p>Show rows</p>
            <select value={rowsPerPage} onChange={handleRowsChange} className="bg-[#F2F2F2] p-1">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`px-3 py-2 ${currentPage === 1 ? "cursor-not-allowed text-gray-400" : "text-[#000000]"}`}
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <BiSolidLeftArrow />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`flex h-[27px] w-[30px] items-center justify-center rounded-md ${
                    currentPage === index + 1 ? "bg-[#000000] text-white" : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => changePage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              className={`px-3 py-2 ${
                currentPage === totalPages ? "cursor-not-allowed text-gray-400" : "text-[#000000]"
              }`}
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <BiSolidRightArrow />
            </button>
          </div>
          <p>
            Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>

      {/* Customer Categories Sidebar */}
      {showCategories && (
        <div className="w-80 rounded-md border bg-white p-5">
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Categories</h2>
          </div>

          <div className="mt-4 space-y-3">
            {customerCategories.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 rounded-lg bg-gray-50 p-3">
            <h3 className="mb-2 font-medium text-gray-900">Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">121,550</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Residential:</span>
                <span className="font-medium">106,150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Commercial:</span>
                <span className="font-medium">15,400</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals remain the same */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-style w-80 rounded-md p-4 shadow-md">
            <div className="flex justify-between">
              <h2 className="mb-4 text-lg font-medium">Suspend Account</h2>
              <LiaTimesSolid onClick={closeModal} className="cursor-pointer" />
            </div>
            <div className="my-3 flex w-full items-center justify-center">
              <img src="/DashboardImages/WarningCircle.png" alt="" />
            </div>
            <p className="mb-4 text-center text-xl font-medium">Are you sure you want to suspend this account?</p>
            <div className="flex w-full justify-between gap-3">
              <button className="button__primary flex w-full" onClick={confirmCancellation}>
                <FaRegCheckCircle />
                <p className="text-sm">Yes, Suspend</p>
              </button>
              <button className="button__danger w-full" onClick={closeModal}>
                <FiXCircle />
                <p className="text-sm">No, Leave</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalReminderOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-style rounded-md shadow-md sm:w-[620px]">
            <div className="flex justify-between border-b px-4 pt-4">
              <h2 className="mb-4 text-lg font-medium">Send Reminder</h2>
              <LiaTimesSolid onClick={closeReminderModal} className="cursor-pointer" />
            </div>
            <div className="p-4">
              <p className="px-2 pb-1 pt-2 text-sm">Message</p>
              <div className="search-bg mb-3 items-center  justify-between  rounded-md focus:bg-[#FBFAFC] max-sm:mb-2 ">
                <textarea
                  className="h-[120px] w-full rounded-md border-0 bg-transparent  p-2 text-sm outline-none focus:outline-none"
                  placeholder="Enter Your Message Here"
                ></textarea>
              </div>
            </div>

            <div className="flex w-full justify-between gap-3 px-4 pb-4">
              <button className="button__secondary w-full" onClick={confirmReminder}>
                <p>Cancel</p>
              </button>
              <button className="button__black flex w-full" onClick={closeReminderModal}>
                <p>Send</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-style rounded-md shadow-md sm:w-[620px]">
            <div className="flex justify-between border-b px-4 pt-4">
              <h2 className="mb-4 text-lg font-medium">Update Status</h2>
              <LiaTimesSolid onClick={closeStatusModal} className="cursor-pointer" />
            </div>
            <div className="p-4">
              <Dropdown
                label=""
                options={["active", "inactive", "suspended"]}
                value={selectedOption}
                onSelect={setSelectedOption}
                isOpen={isDropdownOpen}
                toggleDropdown={() => setDropdownOpen(!isDropdownOpen)}
                disabled={false}
              />
            </div>
            <div className="flex w-full justify-between gap-3 px-4 pb-4">
              <button className="button__secondary w-full" onClick={confirmStatusChange}>
                <p>Cancel</p>
              </button>
              <button className="button__black flex w-full" onClick={closeStatusModal}>
                <p>Update</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllCustomers
