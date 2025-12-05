"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { RxCaretSort, RxDotsVertical } from "react-icons/rx"
import {
  MdOutlineArrowBackIosNew,
  MdOutlineArrowForwardIos,
  MdOutlineCategory,
  MdOutlineDescription,
  MdOutlineKey,
  MdOutlineAdd,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineVisibility,
  MdOutlineSearch,
  MdOutlineFilterList,
  MdOutlineSort,
  MdOutlineSubdirectoryArrowRight,
  MdOutlinePeople,
  MdOutlineFolder,
  MdOutlineRefresh,
  MdOutlineError,
} from "react-icons/md"
import { SearchModule } from "components/ui/Search/search-module"
import { ButtonModule } from "components/ui/Button/Button"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import {
  fetchCustomerCategories,
  fetchSubCategoriesByCategoryId,
  clearCategories,
  clearSubCategories,
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesSuccess,
  selectSubCategories,
  selectSubCategoriesLoading,
  selectSubCategoriesError,
  selectSubCategoriesSuccess,
  CustomerCategory,
  CustomerSubCategory,
} from "lib/redux/customersCategoriesSlice"

interface ActionDropdownProps {
  category: CustomerCategory
  onViewDetails: (category: CustomerCategory) => void
  onEdit: (category: CustomerCategory) => void
  onDelete: (category: CustomerCategory) => void
  onRefreshSubCategories: (categoryId: number) => void
}

const SubCategoryCard: React.FC<{ subCategory: CustomerSubCategory }> = ({ subCategory }) => {
  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:border-gray-300 hover:bg-white"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-50">
              <MdOutlineSubdirectoryArrowRight className="size-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{subCategory.name}</h4>
            </div>
          </div>

          {subCategory.description && (
            <div className="mt-2">
              <div className="mb-1 text-xs font-medium text-gray-600">Description</div>
              <p className="line-clamp-2 text-xs text-gray-700">{subCategory.description}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const CategoryCard: React.FC<{
  category: CustomerCategory
  onViewDetails: (category: CustomerCategory) => void
  onEdit: (category: CustomerCategory) => void
  onDelete: (category: CustomerCategory) => void
  onRefreshSubCategories: (categoryId: number) => void
}> = ({ category, onViewDetails, onEdit, onDelete, onRefreshSubCategories }) => {
  const [showSubCategories, setShowSubCategories] = useState(false)
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefreshSubCategories = async () => {
    setSubCategoriesLoading(true)
    setError(null)
    try {
      await onRefreshSubCategories(category.id)
    } catch (err) {
      setError("Failed to refresh sub-categories")
    } finally {
      setSubCategoriesLoading(false)
    }
  }

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50">
            <MdOutlineCategory className="size-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Category</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {category.description && (
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
              <MdOutlineDescription className="size-4" />
              <span className="font-medium">Description</span>
            </div>
            <p className="line-clamp-2 text-sm text-gray-700">{category.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{category.subCategories.length}</div>
            <div className="text-xs text-gray-500">Sub-Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{category.subCategories.length > 0 ? "✓" : "—"}</div>
            <div className="text-xs text-gray-500">Has Sub-Categories</div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-2">
            <div className="flex items-center gap-2 text-xs text-red-700">
              <MdOutlineError className="size-3" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {category.subCategories.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium text-gray-600">Sub-Categories</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefreshSubCategories}
                  disabled={subCategoriesLoading}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Refresh sub-categories from API"
                >
                  <MdOutlineRefresh className={`size-3 ${subCategoriesLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowSubCategories(!showSubCategories)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  {showSubCategories ? "Hide" : "Show"} All
                  <RxCaretSort className={`size-3 transition-transform ${showSubCategories ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showSubCategories && (
                <motion.div
                  className="mt-2 space-y-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {subCategoriesLoading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-md bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 w-32 rounded bg-gray-200" />
                                  <div className="h-3 w-24 rounded bg-gray-200" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {category.subCategories.slice(0, 3).map((subCategory, index) => (
                        <SubCategoryCard key={subCategory.id} subCategory={subCategory} />
                      ))}
                      {category.subCategories.length > 3 && (
                        <div className="text-center text-xs text-gray-500">
                          +{category.subCategories.length - 3} more sub-categories
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex gap-2">
            <ButtonModule
              variant="outline"
              size="sm"
              className="w-1/2 justify-center"
              onClick={() => onViewDetails(category)}
            >
              <MdOutlineVisibility className="mr-2 size-4" />
              View Details
            </ButtonModule>
            <ButtonModule variant="primary" size="sm" className="w-1/2 justify-center" onClick={() => onEdit(category)}>
              <MdOutlineEdit className="mr-2 size-4" />
              Edit
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
              {[...Array(6)].map((_, i) => (
                <th key={i} className="whitespace-nowrap border-b p-4">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(6)].map((_, cellIndex) => (
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
              <div className="h-12 w-12 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 rounded-full bg-gray-200" />
                  <div className="h-6 w-20 rounded-full bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="h-7 w-7 rounded-full bg-gray-200" />
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

const SubCategoriesLoadingSkeleton = () => {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-gray-200" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="h-3 w-16 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const AllCustomerCategoriesTable: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)
  const loading = useAppSelector(selectCategoriesLoading)
  const error = useAppSelector(selectCategoriesError)
  const success = useAppSelector(selectCategoriesSuccess)
  const subCategories = useAppSelector(selectSubCategories)
  const subCategoriesLoading = useAppSelector(selectSubCategoriesLoading)
  const subCategoriesError = useAppSelector(selectSubCategoriesError)
  const subCategoriesSuccess = useAppSelector(selectSubCategoriesSuccess)

  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<CustomerCategory | null>(null)
  const [showSubCategories, setShowSubCategories] = useState(true)
  const [subCategorySearch, setSubCategorySearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "id" | "subCategories">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterHasSubCategories, setFilterHasSubCategories] = useState<"all" | "with" | "without">("all")
  const pageSize = 12

  useEffect(() => {
    dispatch(fetchCustomerCategories())

    // Cleanup function
    return () => {
      dispatch(clearCategories())
      dispatch(clearSubCategories())
    }
  }, [dispatch])

  const handleRefreshCategories = () => {
    dispatch(fetchCustomerCategories())
  }

  const handleRefreshSubCategories = (categoryId: number) => {
    dispatch(fetchSubCategoriesByCategoryId(categoryId))
  }

  // Filter categories based on search and filters
  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch =
        searchText === "" ||
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        category.subCategories.some(
          (sub) =>
            sub.name.toLowerCase().includes(searchText.toLowerCase()) ||
            sub.description?.toLowerCase().includes(searchText.toLowerCase())
        )

      const matchesSubCategoryFilter =
        filterHasSubCategories === "all" ||
        (filterHasSubCategories === "with" && category.subCategories.length > 0) ||
        (filterHasSubCategories === "without" && category.subCategories.length === 0)

      return matchesSearch && matchesSubCategoryFilter
    })
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "id":
          aValue = a.id
          bValue = b.id
          break
        case "subCategories":
          aValue = a.subCategories.length
          bValue = b.subCategories.length
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

  // Get selected category's sub-categories (using Redux state or category's subCategories)
  const getSelectedCategorySubCategories = () => {
    if (!selectedCategory) return []

    // Use the subCategories from Redux state if they belong to the selected category
    if (subCategories.length > 0 && subCategories[0]?.customerCategoryId === selectedCategory.id) {
      return subCategories.filter(
        (subCategory) =>
          subCategorySearch === "" ||
          subCategory.name.toLowerCase().includes(subCategorySearch.toLowerCase()) ||
          subCategory.description?.toLowerCase().includes(subCategorySearch.toLowerCase())
      )
    }

    // Fall back to the category's subCategories
    return selectedCategory.subCategories.filter(
      (subCategory) =>
        subCategorySearch === "" ||
        subCategory.name.toLowerCase().includes(subCategorySearch.toLowerCase()) ||
        subCategory.description?.toLowerCase().includes(subCategorySearch.toLowerCase())
    )
  }

  const filteredSubCategories = getSelectedCategorySubCategories()

  const totalRecords = filteredCategories.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setCurrentPage(1)
  }

  const handleCancelSearch = () => {
    setSearchText("")
    setCurrentPage(1)
  }

  const handleSubCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubCategorySearch(e.target.value)
  }

  const handleCancelSubCategorySearch = () => {
    setSubCategorySearch("")
  }

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1) pageNumber = 1
    if (pageNumber > totalPages) pageNumber = totalPages
    setCurrentPage(pageNumber)
  }

  const handleViewDetails = (category: CustomerCategory) => {
    setSelectedCategory(category)
    setShowSubCategories(true)
    // Fetch sub-categories for this category
    dispatch(fetchSubCategoriesByCategoryId(category.id))
  }

  const handleEdit = (category: CustomerCategory) => {
    router.push(`/customer-categories/edit/${category.id}`)
  }

  const handleDelete = (category: CustomerCategory) => {
    if (window.confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      // TODO: Implement delete functionality
      console.log("Delete category:", category.id)
    }
  }

  const toggleSort = (column: "name" | "id" | "subCategories") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const refreshSelectedCategorySubCategories = () => {
    if (selectedCategory) {
      dispatch(fetchSubCategoriesByCategoryId(selectedCategory.id))
    }
  }

  if (loading && categories.length === 0) return <LoadingSkeleton />

  const startIndex = (currentPage - 1) * pageSize
  const pageItems = filteredCategories.slice(startIndex, startIndex + pageSize)

  // Calculate statistics
  const totalSubCategories = categories.reduce((total, category) => total + category.subCategories.length, 0)
  const categoriesWithSubCategories = categories.filter((category) => category.subCategories.length > 0).length
  const categoriesWithoutSubCategories = categories.filter((category) => category.subCategories.length === 0).length

  return (
    <motion.div className="relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <motion.div
        className="items-center justify-between py-2 md:flex"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-lg font-medium max-sm:pb-3 md:text-2xl">Customer Categories</p>
          <p className="text-sm text-gray-600">Manage customer categories and sub-categories</p>
        </div>
        <div className="flex items-center gap-4">
          <SearchModule
            value={searchText}
            onChange={handleSearch}
            onCancel={handleCancelSearch}
            placeholder="Search categories..."
            className="w-[380px]"
            bgClassName="bg-white"
          />
          <ButtonModule variant="outline" size="sm" onClick={handleRefreshCategories} disabled={loading}>
            <MdOutlineRefresh className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </ButtonModule>
          <ButtonModule variant="primary" size="sm" onClick={() => router.push("/customer-categories/add")}>
            <MdOutlineAdd className="mr-2 size-4" />
            Create Category
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
              <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <MdOutlineCategory className="size-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalSubCategories}</div>
              <div className="text-sm text-gray-600">Total Sub-Categories</div>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <MdOutlineFolder className="size-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{categoriesWithSubCategories}</div>
              <div className="text-sm text-gray-600">With Sub-Categories</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <MdOutlinePeople className="size-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{categoriesWithoutSubCategories}</div>
              <div className="text-sm text-gray-600">Without Sub-Categories</div>
            </div>
            <div className="rounded-lg bg-orange-50 p-3">
              <MdOutlineCategory className="size-6 text-orange-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-red-700">Error: {error}</div>
            <button
              onClick={handleRefreshCategories}
              className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      {subCategoriesError && selectedCategory && (
        <motion.div
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="text-red-700">Error loading sub-categories: {subCategoriesError}</div>
            <button
              onClick={() => dispatch(fetchSubCategoriesByCategoryId(selectedCategory.id))}
              className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </motion.div>
      )}

      <div className="mt-6 flex gap-6">
        {/* Main Content - Categories Cards/Grid */}
        <motion.div
          className={`${showSubCategories && selectedCategory ? "w-2/3" : "w-full"} transition-all duration-300`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
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
                  onClick={() => toggleSort("id")}
                  className={`rounded px-2 py-1 ${sortBy === "id" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => toggleSort("subCategories")}
                  className={`rounded px-2 py-1 ${sortBy === "subCategories" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Sub-Categories {sortBy === "subCategories" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterHasSubCategories("all")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterHasSubCategories === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterHasSubCategories("with")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterHasSubCategories === "with"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                With Sub-Categories
              </button>
              <button
                onClick={() => setFilterHasSubCategories("without")}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  filterHasSubCategories === "without"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Without
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          {loading && categories.length > 0 ? (
            <CardsLoadingSkeleton />
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
              <MdOutlineCategory className="mx-auto mb-4 size-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No categories found</h3>
              <p className="mb-6 text-gray-600">
                {searchText ? "Try adjusting your search or filters" : "Create your first category to get started"}
              </p>
              <ButtonModule variant="primary" onClick={() => router.push("/customer-categories/add")}>
                Create New Category
              </ButtonModule>
            </div>
          ) : viewMode === "grid" ? (
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {pageItems.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <CategoryCard
                      category={category}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onRefreshSubCategories={handleRefreshSubCategories}
                    />
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
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Category</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">ID</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Sub-Categories</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((category, index) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-md bg-blue-50">
                              <MdOutlineCategory className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-gray-700">{category.id}</td>
                        <td className="p-4">
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {category.description || "No description"}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{category.subCategories.length}</div>
                            {category.subCategories.length > 0 && (
                              <div className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">✓</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <ButtonModule variant="outline" size="sm" onClick={() => handleViewDetails(category)}>
                              View
                            </ButtonModule>
                            <ButtonModule variant="outline" size="sm" onClick={() => handleEdit(category)}>
                              Edit
                            </ButtonModule>
                            <button
                              onClick={() => handleRefreshSubCategories(category.id)}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                              title="Refresh sub-categories"
                            >
                              <MdOutlineRefresh className="size-3" />
                            </button>
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
          {filteredCategories.length > 0 && (
            <motion.div
              className="mt-6 flex items-center justify-between border-t pt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-gray-700">
                Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} categories
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
                          ? "bg-[#0a0a0a] text-white"
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
        </motion.div>

        {/* Sub-Categories Sidebar */}
        {showSubCategories && selectedCategory && (
          <motion.div
            className="w-1/3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="sticky top-4">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdOutlineFolder className="size-5 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedCategory.name}</h3>
                        <p className="text-xs text-gray-500">Sub-Categories</p>
                      </div>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600">
                        {selectedCategory.subCategories.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={refreshSelectedCategorySubCategories}
                        disabled={subCategoriesLoading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Refresh sub-categories"
                      >
                        <MdOutlineRefresh className={`size-4 ${subCategoriesLoading ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(null)
                          setShowSubCategories(false)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Close details"
                      >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <SearchModule
                      value={subCategorySearch}
                      onChange={handleSubCategorySearch}
                      onCancel={handleCancelSubCategorySearch}
                      placeholder="Search sub-categories..."
                      className="w-full"
                      bgClassName="bg-gray-50"
                    />
                  </div>

                  <div className="mt-3 text-xs text-gray-600">
                    {selectedCategory.description && (
                      <div className="mt-1">
                        <span className="font-medium">Description:</span> {selectedCategory.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                  {selectedCategory.subCategories.length === 0 ? (
                    <div className="py-8 text-center">
                      <MdOutlineFolder className="mx-auto mb-2 size-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No sub-categories found</p>
                      <p className="mt-1 text-xs text-gray-400">Add sub-categories to this category</p>
                      <button
                        onClick={refreshSelectedCategorySubCategories}
                        disabled={subCategoriesLoading}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {subCategoriesLoading ? "Loading..." : "Refresh from API"}
                      </button>
                    </div>
                  ) : subCategoriesLoading ? (
                    <SubCategoriesLoadingSkeleton />
                  ) : filteredSubCategories.length === 0 ? (
                    <div className="py-8 text-center">
                      <MdOutlineSearch className="mx-auto mb-2 size-8 text-gray-300" />
                      <p className="text-sm text-gray-500">No matching sub-categories</p>
                      {subCategorySearch && (
                        <button
                          onClick={() => setSubCategorySearch("")}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Showing {filteredSubCategories.length} of {selectedCategory.subCategories.length}{" "}
                          sub-categories
                        </span>
                        <span className="text-xs text-blue-600">API Loaded: {subCategoriesSuccess ? "Yes" : "No"}</span>
                      </div>
                      <AnimatePresence>
                        {filteredSubCategories.map((subCategory, index) => (
                          <motion.div
                            key={subCategory.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <SubCategoryCard subCategory={subCategory} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="border-t bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      <div className="font-medium">Sub-Category Source:</div>
                      <div className="mt-1">
                        {subCategories.length > 0 && subCategories[0]?.customerCategoryId === selectedCategory.id
                          ? "Loaded from API"
                          : "From Category Data"}
                      </div>
                    </div>
                    <ButtonModule
                      variant="primary"
                      size="sm"
                      onClick={() => router.push(`/customer-categories/${selectedCategory.id}/sub-categories/create`)}
                    >
                      <MdOutlineAdd className="mr-1 size-3.5" />
                      Add Sub-Category
                    </ButtonModule>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Show Sub-Categories Toggle Button (when category is selected but sidebar is hidden) */}
        {!showSubCategories && selectedCategory && (
          <motion.button
            onClick={() => setShowSubCategories(true)}
            className="fixed right-4 top-24 z-10 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-lg"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <MdOutlineFolder className="size-4 text-purple-600" />
            <div className="text-left">
              <div className="text-sm font-medium">Show Sub-Categories</div>
              <div className="text-xs text-gray-500">{selectedCategory.name}</div>
            </div>
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600">
              {selectedCategory.subCategories.length}
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default AllCustomerCategoriesTable
