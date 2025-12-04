"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import { MdOutlineArrowBackIosNew, MdOutlineArrowForwardIos, MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { fetchRoles } from "lib/redux/roleSlice"

interface RoleEntry {
  id: number
  name: string
  slug: string
  category: string
  isSystem: boolean
  description: string
}

interface ActionDropdownProps {
  entry: RoleEntry
  onViewDetails: (entry: RoleEntry) => void
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ entry, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownDirection, setDropdownDirection] = useState<"bottom" | "top">("bottom")
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

  const calculateDropdownPosition = () => {
    if (!dropdownRef.current) return

    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    const dropdownHeight = 120

    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownDirection("top")
    } else {
      setDropdownDirection("bottom")
    }
  }

  const handleButtonClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    calculateDropdownPosition()
    setIsOpen(!isOpen)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault()
    onViewDetails(entry)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div
        className="focus::bg-gray-100 flex size-7 cursor-pointer items-center justify-center gap-2 rounded-full transition-all duration-200 ease-in-out hover:bg-gray-200"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open actions"
        role="button"
      >
        <RxDotsVertical />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            style={
              dropdownDirection === "bottom"
                ? {
                    top: dropdownRef.current
                      ? dropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 6
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
                : {
                    bottom: dropdownRef.current
                      ? window.innerHeight - dropdownRef.current.getBoundingClientRect().top + window.scrollY + 6
                      : 0,
                    right: dropdownRef.current
                      ? window.innerWidth - dropdownRef.current.getBoundingClientRect().right
                      : 0,
                  }
            }
            initial={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: dropdownDirection === "bottom" ? -6 : 6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
          >
            <div className="py-1">
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleViewDetails}
              >
                View Details
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("Flag role:", entry.id)
                  setIsOpen(false)
                }}
              >
                Flag Entry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
              {[...Array(8)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(8)].map((_, cellIndex) => (
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

const AllRoleTable: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { roles, loading, error } = useAppSelector((state) => state.roles)

  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<RoleEntry | null>(null)
  const pageSize = 10

  useEffect(() => {
    void dispatch(
      fetchRoles({
        pageNumber: 1,
        pageSize: 100,
      })
    )
  }, [dispatch])

  // In a real app you would fetch data from an API
  const isLoading = loading
  const isError = !!error

  const normalizedRoles: RoleEntry[] = roles.map((role) => ({
    id: role.id,
    name: role.name,
    slug: role.slug,
    category: role.category,
    isSystem: role.isSystem,
    description: role.description,
  }))

  const entries = normalizedRoles.filter((e) =>
    searchText
      ? [e.name, e.slug, e.category, e.description].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(searchText.toLowerCase())
        )
      : true
  )
  const totalRecords = entries.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const toggleSort = (column: string) => {
    const isAscending = sortColumn === column && sortOrder === "asc"
    setSortOrder(isAscending ? "desc" : "asc")
    setSortColumn(column)
    // For mock data we won't re-order; in real implementation you should sort the entries here.
  }

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

  if (isLoading) return <LoadingSkeleton />
  if (isError) return <div>Error loading audit trail</div>

  const startIndex = (currentPage - 1) * pageSize
  const pageItems = entries.slice(startIndex, startIndex + pageSize)

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="items-center justify-between  py-2 md:flex "
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">All Roles</p>
          <p className="text-sm text-gray-600">List of all system roles and their metadata</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search roles..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <ButtonModule variant="primary" size="sm" onClick={() => router.push("/roles/create")}>
            Create Role
          </ButtonModule>
        </div>
      </motion.div>

      <motion.div
        className="mt-4 w-full overflow-x-auto border-x bg-[#FFFFFF]"
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="whitespace-nowrap border-b p-4 text-sm">
                <div className="flex items-center gap-2">
                  <MdOutlineCheckBoxOutlineBlank className="text-lg" />
                  Role ID
                </div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-2">
                  Name <RxCaretSort />
                </div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("slug")}>
                <div className="flex items-center gap-2">
                  Slug <RxCaretSort />
                </div>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap border-b p-4 text-sm"
                onClick={() => toggleSort("category")}
              >
                <div className="flex items-center gap-2">
                  Category <RxCaretSort />
                </div>
              </th>
              <th className="cursor-pointer whitespace-nowrap border-b p-4 text-sm" onClick={() => toggleSort("type")}>
                <div className="flex items-center gap-2">
                  Type <RxCaretSort />
                </div>
              </th>
              <th className="whitespace-nowrap border-b p-4 text-sm">Description</th>
              <th className="whitespace-nowrap border-b p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {pageItems.map((entry, idx) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm font-medium">{entry.id}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.name}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.slug}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">{entry.category}</td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                    {entry.isSystem ? "System" : "Custom"}
                  </td>
                  <td className="max-w-xs truncate whitespace-nowrap border-b px-4 py-3 text-sm">
                    {entry.description}
                  </td>
                  <td className="whitespace-nowrap border-b px-4 py-3 text-sm">
                    <ButtonModule variant="outline" size="sm" onClick={() => router.push(`/roles/details/${entry.id}`)}>
                      View details
                    </ButtonModule>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <motion.div
        className="mt-3 flex items-center justify-between border-t py-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-sm text-gray-700">
          Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
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
                  currentPage === pageNum ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

      {/* Optional: Modal / details view for roles can be added here in the future */}

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedEntry(null)} />
            <motion.div
              className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg"
              initial={{ scale: 0.96, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="mb-4 text-lg font-semibold">Role Details</h3>
              <div className="space-y-2 text-sm text-gray-800">
                <p>
                  <span className="font-medium">ID:</span> {selectedEntry.id}
                </p>
                <p>
                  <span className="font-medium">Name:</span> {selectedEntry.name}
                </p>
                <p>
                  <span className="font-medium">Slug:</span> {selectedEntry.slug}
                </p>
                <p>
                  <span className="font-medium">Category:</span> {selectedEntry.category}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {selectedEntry.isSystem ? "System" : "Custom"}
                </p>
                <p>
                  <span className="font-medium">Description:</span> {selectedEntry.description || "-"}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-800 hover:bg-gray-200"
                  onClick={() => setSelectedEntry(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AllRoleTable
