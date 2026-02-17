"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/Input"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import { notify } from "components/ui/Notification/Notification"
import { AddIcon } from "components/Icons/Icons"
import { AppDispatch, RootState } from "lib/redux/store"
import {
  clearCreateState,
  createDistributionSubstation,
  createSingleDistributionSubstation,
  fetchDistributionSubstations,
} from "lib/redux/distributionSubstationsSlice"
import { fetchFeeders } from "lib/redux/formDataSlice"

interface DistributionSubstationFormData {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

interface CSVDistributionSubstation {
  feederId: number
  oldDssCode: string
  dssCode: string
  nercCode: string
  transformerCapacityInKva: number
  latitude: number
  longitude: number
  numberOfUnit: number
  unitOneCode: string
  unitTwoCode: string
  unitThreeCode: string
  unitFourCode: string
  publicOrDedicated: string
  status: string
  remarks: string
}

const AddDistributionStationPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    createLoading,
    createError,
    createSuccess,
    distributionSubstations,
    loading: distributionSubstationsLoading,
    error: distributionSubstationsError,
  } = useSelector((state: RootState) => state.distributionSubstations)

  const { feeders, feedersLoading, feedersError } = useSelector((state: RootState) => state.formData)

  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVDistributionSubstation[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<DistributionSubstationFormData>({
    feederId: 0,
    oldDssCode: "",
    dssCode: "",
    nercCode: "",
    transformerCapacityInKva: 0,
    latitude: 0,
    longitude: 0,
    numberOfUnit: 0,
    unitOneCode: "",
    unitTwoCode: "",
    unitThreeCode: "",
    unitFourCode: "",
    publicOrDedicated: "",
    status: "",
    remarks: "",
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Search states for dropdowns
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({
    feeder: "",
  })

  // Search loading states
  const [searchLoading, setSearchLoading] = useState<Record<string, boolean>>({
    feeder: false,
  })

  // Debounced search handlers
  const debouncedSearchRef = React.useRef<Record<string, NodeJS.Timeout>>({})

  const handleFeederSearch = useCallback(
    (searchTerm: string) => {
      setSearchTerms((prev) => ({ ...prev, feeder: searchTerm }))

      // Clear existing timeout
      if (debouncedSearchRef.current.feeder) {
        clearTimeout(debouncedSearchRef.current.feeder)
      }

      // Set new timeout for debounced API call
      debouncedSearchRef.current.feeder = setTimeout(() => {
        if (searchTerm.trim()) {
          setSearchLoading((prev) => ({ ...prev, feeder: true }))

          // Check if search term is a pure number (ID search)
          const isNumericSearch = /^\d+$/.test(searchTerm.trim())
          const searchValue = isNumericSearch ? searchTerm.trim() : searchTerm.trim()

          dispatch(
            fetchFeeders({
              PageNumber: 1,
              PageSize: 50,
              Search: searchValue,
            })
          ).finally(() => {
            setSearchLoading((prev) => ({ ...prev, feeder: false }))
          })
        } else if (searchTerm === "") {
          // Only reload default data when search is explicitly cleared (empty string)
          dispatch(
            fetchFeeders({
              PageNumber: 1,
              PageSize: 100,
            })
          )
        }
      }, 500) // 500ms debounce delay
    },
    [dispatch]
  )

  // Fetch existing distribution substations and feeders on component mount
  useEffect(() => {
    dispatch(
      fetchDistributionSubstations({
        pageNumber: 1,
        pageSize: 100,
      })
    )
    dispatch(
      fetchFeeders({
        PageNumber: 1,
        PageSize: 100,
      })
    )
  }, [dispatch])

  // Clear search timeouts when component unmounts
  useEffect(() => {
    return () => {
      // Clear any pending search timeouts
      Object.values(debouncedSearchRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  // Feeder options from fetched data
  const feederOptions = [
    { value: 0, label: "Select feeder" },
    ...feeders.map((feeder) => ({
      value: feeder.id,
      label: `${feeder.name}`,
    })),
  ]

  // Status options
  const statusOptions = [
    { value: "", label: "Select status" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "MAINTENANCE", label: "Under Maintenance" },
    { value: "PLANNED", label: "Planned" },
  ]

  // Public or Dedicated options
  const publicOrDedicatedOptions = [
    { value: "", label: "Select type" },
    { value: "PUBLIC", label: "Public" },
    { value: "DEDICATED", label: "Dedicated" },
  ]

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: any } }
  ) => {
    const { name, value } = "target" in e ? e.target : e

    // Handle number fields - ensure proper conversion
    let processedValue = value
    if (["feederId", "transformerCapacityInKva", "latitude", "longitude", "numberOfUnit"].includes(name)) {
      processedValue = value === "" ? 0 : Number(value)
      // Handle decimal numbers for coordinates
      if (["latitude", "longitude"].includes(name)) {
        processedValue = value === "" ? 0 : parseFloat(value)
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (formData.feederId === 0) {
      errors.feederId = "Feeder is required"
    }

    if (!formData.dssCode.trim()) {
      errors.dssCode = "DSS code is required"
    }

    if (!formData.nercCode.trim()) {
      errors.nercCode = "NERC code is required"
    }

    if (formData.transformerCapacityInKva <= 0) {
      errors.transformerCapacityInKva = "Transformer capacity is required and must be greater than 0"
    }

    // Validate coordinates
    if (formData.latitude === 0) {
      errors.latitude = "Latitude is required"
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90"
    }

    if (formData.longitude === 0) {
      errors.longitude = "Longitude is required"
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180"
    }

    if (formData.numberOfUnit < 0 || formData.numberOfUnit > 4) {
      errors.numberOfUnit = "Number of units must be between 0 and 4"
    }

    if (!formData.publicOrDedicated.trim()) {
      errors.publicOrDedicated = "Public or dedicated type is required"
    }

    if (!formData.status.trim()) {
      errors.status = "Status is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitSingleDistributionSubstation()
  }

  const submitSingleDistributionSubstation = async () => {
    if (!validateForm()) {
      notify("error", "Please fix the form errors before submitting", {
        description: "Some fields are missing or contain invalid data",
        duration: 4000,
      })
      return
    }

    try {
      const result = await dispatch(createSingleDistributionSubstation(formData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Distribution Substation created successfully", {
          description: `${formData.dssCode} has been added to the system`,
          duration: 5000,
        })

        // Reset form
        setFormData({
          feederId: 0,
          oldDssCode: "",
          dssCode: "",
          nercCode: "",
          transformerCapacityInKva: 0,
          latitude: 0,
          longitude: 0,
          numberOfUnit: 0,
          unitOneCode: "",
          unitTwoCode: "",
          unitThreeCode: "",
          unitFourCode: "",
          publicOrDedicated: "",
          status: "",
          remarks: "",
        })
        setFormErrors({})

        // Refresh the distribution substations list
        dispatch(
          fetchDistributionSubstations({
            pageNumber: 1,
            pageSize: 100,
          })
        )
      }
    } catch (error: any) {
      console.error("Failed to create distribution substation:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Failed to create distribution substation", {
          description: error || "An unexpected error occurred",
          duration: 6000,
        })
      }
    }
  }

  const handleReset = () => {
    setFormData({
      feederId: 0,
      oldDssCode: "",
      dssCode: "",
      nercCode: "",
      transformerCapacityInKva: 0,
      latitude: 0,
      longitude: 0,
      numberOfUnit: 0,
      unitOneCode: "",
      unitTwoCode: "",
      unitThreeCode: "",
      unitFourCode: "",
      publicOrDedicated: "",
      status: "",
      remarks: "",
    })
    setFormErrors({})
    dispatch(clearCreateState())
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      notify("error", "Invalid file type", {
        description: "Please select a CSV file",
        duration: 4000,
      })
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      notify("error", "File too large", {
        description: "Please select a CSV file smaller than 10MB",
        duration: 4000,
      })
      return
    }

    setCsvFile(file)
    setCsvErrors([])
    setCsvData([])
    parseCSVFile(file)
  }

  const parseCSVFile = (file: File) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const lines = csvText.split("\n").filter((line) => line.trim())

        if (lines.length < 2) {
          setCsvErrors(["CSV file is empty or has no data rows"])
          return
        }

        const headers = lines[0]!.split(",").map((header) => header.trim().toLowerCase())

        // Validate headers
        const expectedHeaders = [
          "feederid",
          "olddsscode",
          "dsscode",
          "nerccode",
          "transformercapacityinkva",
          "latitude",
          "longitude",
          "numberofunit",
          "unitonecode",
          "unittwocode",
          "unitthreecode",
          "unitfourcode",
          "publicordedicated",
          "status",
          "remarks",
        ]

        const missingHeaders = expectedHeaders.filter((header) => !headers.includes(header))
        if (missingHeaders.length > 0) {
          setCsvErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
          return
        }

        const parsedData: CSVDistributionSubstation[] = []
        const errors: string[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]!.split(",").map((value) => value.trim())
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Incorrect number of columns`)
            continue
          }

          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index]
          })

          // Validate row data
          const rowErrors = validateCSVRow(row, i + 1)
          if (rowErrors.length > 0) {
            errors.push(...rowErrors)
          } else {
            parsedData.push({
              feederId: parseInt(row.feederid),
              oldDssCode: row.olddsscode,
              dssCode: row.dsscode,
              nercCode: row.nerccode,
              transformerCapacityInKva: parseFloat(row.transformercapacityinkva),
              latitude: parseFloat(row.latitude),
              longitude: parseFloat(row.longitude),
              numberOfUnit: parseInt(row.numberofunit),
              unitOneCode: row.unitonecode,
              unitTwoCode: row.unittwocode,
              unitThreeCode: row.unitthreecode,
              unitFourCode: row.unitfourcode,
              publicOrDedicated: row.publicordedicated,
              status: row.status,
              remarks: row.remarks,
            })
          }
        }

        setCsvData(parsedData)
        setCsvErrors(errors)

        if (errors.length === 0) {
          notify("success", "CSV file parsed successfully", {
            description: `Found ${parsedData.length} valid distribution substation records`,
            duration: 4000,
          })
        } else {
          notify("warning", "CSV file parsed with errors", {
            description: `Found ${parsedData.length} valid records and ${errors.length} errors`,
            duration: 5000,
          })
        }
      } catch (error) {
        console.error("Error parsing CSV:", error)
        setCsvErrors(["Failed to parse CSV file. Please check the file format."])
        notify("error", "CSV parsing failed", {
          description: "There was an error reading the CSV file",
          duration: 4000,
        })
      }
    }

    reader.onerror = () => {
      setCsvErrors(["Failed to read the file"])
      notify("error", "File reading failed", {
        description: "There was an error reading the selected file",
        duration: 4000,
      })
    }

    reader.readAsText(file)
  }

  const validateCSVRow = (row: any, rowNumber: number): string[] => {
    const errors: string[] = []

    if (!row.feederid?.trim()) {
      errors.push(`Row ${rowNumber}: Feeder ID is required`)
    } else if (isNaN(parseInt(row.feederid))) {
      errors.push(`Row ${rowNumber}: Feeder ID must be a valid number`)
    }

    if (!row.dsscode?.trim()) {
      errors.push(`Row ${rowNumber}: DSS code is required`)
    }

    if (!row.nerccode?.trim()) {
      errors.push(`Row ${rowNumber}: NERC code is required`)
    }

    if (!row.transformercapacityinkva?.trim()) {
      errors.push(`Row ${rowNumber}: Transformer capacity is required`)
    } else if (isNaN(parseFloat(row.transformercapacityinkva))) {
      errors.push(`Row ${rowNumber}: Transformer capacity must be a valid number`)
    } else if (parseFloat(row.transformercapacityinkva) <= 0) {
      errors.push(`Row ${rowNumber}: Transformer capacity must be greater than 0`)
    }

    // Validate latitude
    if (!row.latitude?.trim()) {
      errors.push(`Row ${rowNumber}: Latitude is required`)
    } else if (isNaN(parseFloat(row.latitude))) {
      errors.push(`Row ${rowNumber}: Latitude must be a valid number`)
    } else {
      const lat = parseFloat(row.latitude)
      if (lat < -90 || lat > 90) {
        errors.push(`Row ${rowNumber}: Latitude must be between -90 and 90`)
      }
    }

    // Validate longitude
    if (!row.longitude?.trim()) {
      errors.push(`Row ${rowNumber}: Longitude is required`)
    } else if (isNaN(parseFloat(row.longitude))) {
      errors.push(`Row ${rowNumber}: Longitude must be a valid number`)
    } else {
      const lng = parseFloat(row.longitude)
      if (lng < -180 || lng > 180) {
        errors.push(`Row ${rowNumber}: Longitude must be between -180 and 180`)
      }
    }

    if (!row.numberofunit?.trim()) {
      errors.push(`Row ${rowNumber}: Number of units is required`)
    } else if (isNaN(parseInt(row.numberofunit))) {
      errors.push(`Row ${rowNumber}: Number of units must be a valid number`)
    } else {
      const units = parseInt(row.numberofunit)
      if (units < 0 || units > 4) {
        errors.push(`Row ${rowNumber}: Number of units must be between 0 and 4`)
      }
    }

    if (!row.publicordedicated?.trim()) {
      errors.push(`Row ${rowNumber}: Public or dedicated type is required`)
    } else if (!["PUBLIC", "DEDICATED"].includes(row.publicordedicated.toUpperCase())) {
      errors.push(`Row ${rowNumber}: Public or dedicated must be either "PUBLIC" or "DEDICATED"`)
    }

    if (!row.status?.trim()) {
      errors.push(`Row ${rowNumber}: Status is required`)
    }

    return errors
  }

  const handleBulkSubmit = async () => {
    if (csvData.length === 0) {
      notify("error", "No valid data to upload", {
        description: "Please check your CSV file for errors",
        duration: 4000,
      })
      return
    }

    if (csvErrors.length > 0) {
      notify("error", "Please fix CSV errors before uploading", {
        description: "There are validation errors in your CSV file",
        duration: 4000,
      })
      return
    }

    try {
      // API expects a plain array payload for bulk creation
      const result = await dispatch(createDistributionSubstation(csvData)).unwrap()

      if (result.isSuccess) {
        notify("success", "Distribution Substations created successfully", {
          description: `${csvData.length} distribution substations have been added to the system`,
          duration: 6000,
        })

        // Reset form
        setCsvFile(null)
        setCsvData([])
        setCsvErrors([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Refresh the distribution substations list
        dispatch(
          fetchDistributionSubstations({
            pageNumber: 1,
            pageSize: 100,
          })
        )
      }
    } catch (error: any) {
      console.error("Failed to process bulk upload:", error)
      if (!error?.includes("Network error")) {
        notify("error", "Bulk upload processing failed", {
          description: error || "There was an error processing the bulk upload",
          duration: 6000,
        })
      }
    }
  }

  const downloadTemplate = () => {
    const headers = [
      "feederId",
      "oldDssCode",
      "dssCode",
      "nercCode",
      "transformerCapacityInKva",
      "latitude",
      "longitude",
      "numberOfUnit",
      "unitOneCode",
      "unitTwoCode",
      "unitThreeCode",
      "unitFourCode",
      "publicOrDedicated",
      "status",
      "remarks",
    ]

    const exampleData = [
      {
        feederId: "1",
        oldDssCode: "OLD_DSS_001",
        dssCode: "DSS_001",
        nercCode: "NERC_DSS_001",
        transformerCapacityInKva: "500",
        latitude: "12.3456",
        longitude: "7.8901",
        numberOfUnit: "2",
        unitOneCode: "UNIT_001_A",
        unitTwoCode: "UNIT_001_B",
        unitThreeCode: "",
        unitFourCode: "",
        publicOrDedicated: "PUBLIC",
        status: "ACTIVE",
        remarks: "Primary distribution substation",
      },
      {
        feederId: "2",
        oldDssCode: "OLD_DSS_002",
        dssCode: "DSS_002",
        nercCode: "NERC_DSS_002",
        transformerCapacityInKva: "750",
        latitude: "12.4567",
        longitude: "7.9012",
        numberOfUnit: "3",
        unitOneCode: "UNIT_002_A",
        unitTwoCode: "UNIT_002_B",
        unitThreeCode: "UNIT_002_C",
        unitFourCode: "",
        publicOrDedicated: "DEDICATED",
        status: "ACTIVE",
        remarks: "Industrial zone substation",
      },
    ]

    let csvContent = headers.join(",") + "\n"
    exampleData.forEach((row) => {
      csvContent += headers.map((header) => row[header as keyof typeof row]).join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "distribution_substation_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    notify("success", "Template downloaded", {
      description: "CSV template has been downloaded successfully",
      duration: 3000,
    })
  }

  const isFormValid = (): boolean => {
    return (
      formData.feederId !== 0 &&
      formData.dssCode.trim() !== "" &&
      formData.nercCode.trim() !== "" &&
      formData.transformerCapacityInKva > 0 &&
      formData.latitude !== 0 &&
      formData.longitude !== 0 &&
      formData.numberOfUnit >= 0 &&
      formData.numberOfUnit <= 4 &&
      formData.publicOrDedicated.trim() !== "" &&
      formData.status.trim() !== ""
    )
  }

  // Debug function to check form state
  const debugFormState = () => {
    console.log("Form Data:", formData)
    console.log("isFormValid:", isFormValid())
    console.log("Required fields check:")
    console.log("feederId:", formData.feederId, "valid:", formData.feederId !== 0)
    console.log("dssCode:", formData.dssCode, "valid:", formData.dssCode.trim() !== "")
    console.log("nercCode:", formData.nercCode, "valid:", formData.nercCode.trim() !== "")
    console.log(
      "transformerCapacityInKva:",
      formData.transformerCapacityInKva,
      "valid:",
      formData.transformerCapacityInKva > 0
    )
    console.log("latitude:", formData.latitude, "valid:", formData.latitude !== 0)
    console.log("longitude:", formData.longitude, "valid:", formData.longitude !== 0)
    console.log(
      "numberOfUnit:",
      formData.numberOfUnit,
      "valid:",
      formData.numberOfUnit >= 0 && formData.numberOfUnit <= 4
    )
    console.log("publicOrDedicated:", formData.publicOrDedicated, "valid:", formData.publicOrDedicated.trim() !== "")
    console.log("status:", formData.status, "valid:", formData.status.trim() !== "")
  }

  // Clear success/error states when switching tabs
  React.useEffect(() => {
    if (createSuccess || createError) {
      dispatch(clearCreateState())
    }
  }, [activeTab, dispatch])

  return (
    <section className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 pb-20">
      <div className="flex w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="container mx-auto flex flex-col">
            {/* Page Header */}
            <div className="flex w-full justify-between gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3 md:my-8">
              <div>
                <h4 className="text-2xl font-semibold">Add New Distribution Substation</h4>
                <p className="text-gray-600">Add a new distribution substation to the system</p>
              </div>

              <motion.div
                className="flex items-center justify-end gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ButtonModule
                  variant="outline"
                  size="md"
                  onClick={
                    activeTab === "single"
                      ? handleReset
                      : () => {
                          setCsvFile(null)
                          setCsvData([])
                          setCsvErrors([])
                          if (fileInputRef.current) fileInputRef.current.value = ""
                        }
                  }
                  disabled={createLoading}
                >
                  {activeTab === "single" ? "Reset Form" : "Clear CSV"}
                </ButtonModule>

                {/* Debug button - remove in production */}
                <ButtonModule variant="outline" size="md" onClick={debugFormState} type="button">
                  Debug Form
                </ButtonModule>

                <ButtonModule
                  variant="primary"
                  size="md"
                  onClick={
                    activeTab === "single"
                      ? () => {
                          void submitSingleDistributionSubstation()
                        }
                      : () => {
                          void handleBulkSubmit()
                        }
                  }
                  disabled={
                    activeTab === "single"
                      ? !isFormValid() || createLoading
                      : csvData.length === 0 || csvErrors.length > 0 || createLoading
                  }
                  icon={<AddIcon />}
                  iconPosition="start"
                >
                  {activeTab === "single"
                    ? createLoading
                      ? "Creating Distribution Substation..."
                      : "Create Distribution Substation"
                    : createLoading
                    ? "Processing..."
                    : `Create ${csvData.length} Distribution Substations`}
                </ButtonModule>
              </motion.div>
            </div>

            {/* Tab Navigation */}

            {/* Main Content Area */}
            <div className="flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
              <div className="w-full">
                {activeTab === "single" ? (
                  /* Single Entry Form */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-lg bg-white p-6 shadow-sm"
                  >
                    {/* Form Header */}
                    <div className="mb-6 border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Distribution Station Information</h3>
                      <p className="text-sm text-gray-600">
                        Fill in all required fields to add a new distribution substation
                      </p>
                    </div>

                    {/* Distribution Substation Form */}
                    <form onSubmit={handleSingleSubmit} className="space-y-8">
                      {/* Section 1: Associated Assets */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Associated Assets</h4>
                          <p className="text-sm text-gray-600">
                            Select the feeder this distribution substation belongs to
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <FormSelectModule
                            label="Feeder"
                            name="feederId"
                            value={formData.feederId}
                            onChange={handleInputChange}
                            options={feederOptions}
                            error={formErrors.feederId}
                            required
                            disabled={feedersLoading || searchLoading.feeder}
                            searchable
                            onSearchChange={handleFeederSearch}
                            searchTerm={searchTerms.feeder}
                          />
                        </div>
                        {feedersLoading && <p className="text-sm text-gray-500">Loading feeders...</p>}
                      </div>

                      {/* Section 2: Basic Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the distribution substation identification and coding information
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormInputModule
                            label="Old DSS Code"
                            name="oldDssCode"
                            type="text"
                            placeholder="Enter old DSS code"
                            value={formData.oldDssCode}
                            onChange={handleInputChange}
                            error={formErrors.oldDssCode}
                          />

                          <FormInputModule
                            label="DSS Code"
                            name="dssCode"
                            type="text"
                            placeholder="Enter DSS code"
                            value={formData.dssCode}
                            onChange={handleInputChange}
                            error={formErrors.dssCode}
                            required
                          />

                          <FormInputModule
                            label="NERC Code"
                            name="nercCode"
                            type="text"
                            placeholder="Enter NERC code"
                            value={formData.nercCode}
                            onChange={handleInputChange}
                            error={formErrors.nercCode}
                            required
                          />

                          <FormInputModule
                            label="Transformer Capacity (kVA)"
                            name="transformerCapacityInKva"
                            type="number"
                            placeholder="Enter transformer capacity"
                            value={formData.transformerCapacityInKva}
                            onChange={handleInputChange}
                            error={formErrors.transformerCapacityInKva}
                            required
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Section 3: Geographical Information */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Geographical Information</h4>
                          <p className="text-sm text-gray-600">
                            Enter the geographical coordinates of the distribution substation
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormInputModule
                            label="Latitude"
                            name="latitude"
                            type="number"
                            placeholder="Enter latitude (e.g., 12.3456)"
                            value={formData.latitude}
                            onChange={handleInputChange}
                            error={formErrors.latitude}
                            required
                          />

                          <FormInputModule
                            label="Longitude"
                            name="longitude"
                            type="number"
                            placeholder="Enter longitude (e.g., 7.8901)"
                            value={formData.longitude}
                            onChange={handleInputChange}
                            error={formErrors.longitude}
                            required
                          />
                        </div>
                      </div>

                      {/* Section 4: Technical Details */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Technical Details</h4>
                          <p className="text-sm text-gray-600">
                            Enter the technical specifications of the distribution substation
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormInputModule
                            label="Number of Units"
                            name="numberOfUnit"
                            type="number"
                            placeholder="Enter number of units (0-4)"
                            value={formData.numberOfUnit}
                            onChange={handleInputChange}
                            error={formErrors.numberOfUnit}
                            required
                            min="0"
                            max="4"
                          />

                          <FormSelectModule
                            label="Public or Dedicated"
                            name="publicOrDedicated"
                            value={formData.publicOrDedicated}
                            onChange={handleInputChange}
                            options={publicOrDedicatedOptions}
                            error={formErrors.publicOrDedicated}
                            required
                          />

                          <FormSelectModule
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            options={statusOptions}
                            error={formErrors.status}
                            required
                          />

                          <FormInputModule
                            label="Remarks"
                            name="remarks"
                            type="text"
                            placeholder="Enter any remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            error={formErrors.remarks}
                          />
                        </div>
                      </div>

                      {/* Section 5: Unit Codes */}
                      <div className="space-y-6 rounded-lg bg-[#f9f9f9] p-6">
                        <div className="border-b pb-4">
                          <h4 className="text-lg font-medium text-gray-900">Unit Codes</h4>
                          <p className="text-sm text-gray-600">
                            Enter unit codes based on the number of units specified
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormInputModule
                            label="Unit One Code"
                            name="unitOneCode"
                            type="text"
                            placeholder="Enter unit one code"
                            value={formData.unitOneCode}
                            onChange={handleInputChange}
                            error={formErrors.unitOneCode}
                            disabled={formData.numberOfUnit < 1}
                          />

                          <FormInputModule
                            label="Unit Two Code"
                            name="unitTwoCode"
                            type="text"
                            placeholder="Enter unit two code"
                            value={formData.unitTwoCode}
                            onChange={handleInputChange}
                            error={formErrors.unitTwoCode}
                            disabled={formData.numberOfUnit < 2}
                          />

                          <FormInputModule
                            label="Unit Three Code"
                            name="unitThreeCode"
                            type="text"
                            placeholder="Enter unit three code"
                            value={formData.unitThreeCode}
                            onChange={handleInputChange}
                            error={formErrors.unitThreeCode}
                            disabled={formData.numberOfUnit < 3}
                          />

                          <FormInputModule
                            label="Unit Four Code"
                            name="unitFourCode"
                            type="text"
                            placeholder="Enter unit four code"
                            value={formData.unitFourCode}
                            onChange={handleInputChange}
                            error={formErrors.unitFourCode}
                            disabled={formData.numberOfUnit < 4}
                          />
                        </div>
                      </div>

                      {/* Error Summary */}
                      {Object.keys(formErrors).length > 0 && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                          <div className="flex">
                            <div className="shrink-0">
                              <svg className="size-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-amber-800">Form validation errors</h3>
                              <div className="mt-2 text-sm text-amber-700">
                                <ul className="list-disc space-y-1 pl-5">
                                  {Object.values(formErrors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex justify-end gap-4 border-t pt-6">
                        <ButtonModule
                          variant="dangerSecondary"
                          size="lg"
                          onClick={handleReset}
                          disabled={createLoading}
                          type="button"
                        >
                          Reset
                        </ButtonModule>
                        <ButtonModule
                          variant="primary"
                          size="lg"
                          type="submit"
                          disabled={!isFormValid() || createLoading}
                        >
                          {createLoading ? "Creating Distribution Substation..." : "Create Distribution Substation"}
                        </ButtonModule>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  /* Bulk Upload Section */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-b-lg rounded-tl-lg bg-white p-6 shadow-sm"
                  >
                    {/* Template Download */}
                    <div className="mb-6 rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Need a template?</h3>
                          <p className="text-sm text-blue-600">Download our CSV template to ensure proper formatting</p>
                        </div>
                        <ButtonModule variant="primary" size="sm" onClick={downloadTemplate}>
                          Download Template
                        </ButtonModule>
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-[#f9f9f9] p-8 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".csv"
                        className="hidden"
                      />

                      {!csvFile ? (
                        <div>
                          <svg
                            className="mx-auto size-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <div className="mt-4 flex w-full flex-col items-center justify-center">
                            <ButtonModule variant="primary" onClick={() => fileInputRef.current?.click()}>
                              Choose CSV File
                            </ButtonModule>
                            <p className="mt-2 text-sm text-gray-600">or drag and drop your file here</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">CSV files only (max 10MB)</p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="mx-auto size-12 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="mt-2 text-sm font-medium text-gray-900">{csvFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {csvData.length} valid records found
                            {csvErrors.length > 0 && `, ${csvErrors.length} errors`}
                          </p>
                          <div className="mt-4 flex justify-center gap-3">
                            <ButtonModule
                              variant="secondary"
                              onClick={() => {
                                setCsvFile(null)
                                setCsvData([])
                                setCsvErrors([])
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = ""
                                }
                              }}
                            >
                              Choose Different File
                            </ButtonModule>
                            {csvErrors.length === 0 && csvData.length > 0 && (
                              <ButtonModule variant="primary" onClick={handleBulkSubmit} disabled={createLoading}>
                                {createLoading ? "Processing..." : `Create ${csvData.length} Distribution Substations`}
                              </ButtonModule>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CSV Errors Display */}
                    {csvErrors.length > 0 && (
                      <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                        <div className="flex">
                          <div className="shrink-0">
                            <svg className="size-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800">
                              CSV Validation Errors ({csvErrors.length})
                            </h3>
                            <div className="mt-2 text-sm text-red-700">
                              <ul className="max-h-32 space-y-1 overflow-y-auto">
                                {csvErrors.map((error, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview of Valid Data */}
                    {csvData.length > 0 && (
                      <div className="rounded-md border border-gray-200">
                        <div className="bg-gray-50 px-4 py-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            Preview ({csvData.length} valid records)
                          </h3>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Feeder ID
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  DSS Code
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  NERC Code
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Capacity
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Type
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {csvData.slice(0, 5).map((substation, index) => (
                                <tr key={index}>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {substation.feederId}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {substation.dssCode}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {substation.nercCode}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {substation.transformerCapacityInKva}kVA
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {substation.publicOrDedicated}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                                    {substation.status}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {csvData.length > 5 && (
                            <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-500">
                              ... and {csvData.length - 5} more records
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddDistributionStationPage
