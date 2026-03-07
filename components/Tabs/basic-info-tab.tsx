"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  AtSign,
  Award,
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Cpu,
  CreditCard,
  Fingerprint,
  Gauge,
  Globe,
  HardDrive,
  Hash,
  HelpCircle,
  History,
  Home,
  Layers,
  Loader2,
  Mail,
  Map,
  MapPin,
  Package,
  Phone,
  PhoneCall,
  RefreshCw,
  Scale,
  Shield,
  Tag,
  Thermometer,
  User,
  UserCircle,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react"
import { MeteringOutlineIcon } from "components/Icons/Icons"
import { VscAdd } from "react-icons/vsc"

interface Asset {
  serialNo: number
  supplyStructureType?: string
  company: string
  feederName?: string
  transformerCapacityKva?: number
  status?: string
}

interface AccountNumberHistory {
  requestedAtUtc: string
  oldAccountNumber?: string
  oldAddress?: string
  oldAddressTwo?: string
  oldCity?: string
  oldLatitude?: string
  oldLongitude?: string
  newAccountNumber?: string
  newAddress?: string
  newAddressTwo?: string
  newCity?: string
  newLatitude?: string
  newLongitude?: string
  reason?: string
}

interface BasicInfoTabProps {
  currentCustomer: any
  assets: Asset[]
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
  formatDateTime: (dateString: string) => string
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  currentCustomer,
  assets,
  formatCurrency,
  formatDate,
  formatDateTime,
}) => {
  const currentMonthYear = new Date().toLocaleString("default", { month: "long", year: "numeric" })

  const getStatusLabel = (code: string) => {
    switch (code) {
      case "ACTIVE":
        return "Active"
      case "SUSPENDED":
        return "Suspended"
      case "INACTIVE":
        return "Inactive"
      default:
        return code || "Unknown"
    }
  }

  const getMeterStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return "Active"
      case 2:
        return "Deactivated"
      case 3:
        return "Suspended"
      case 4:
        return "Retired"
      default:
        return "Unknown"
    }
  }

  const getMeterStatusStyle = (status: number) => {
    switch (status) {
      case 1: // Active
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case 2: // Deactivated
        return "bg-amber-50 text-amber-700 border-amber-200"
      case 3: // Suspended
        return "bg-red-50 text-red-700 border-red-200"
      case 4: // Retired
        return "bg-red-50 text-red-600 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getMeterStateLabel = (state: number) => {
    switch (state) {
      case 1:
        return "Good"
      case 2:
        return "Tamper"
      case 3:
        return "Suspicious"
      case 4:
        return "Missing"
      case 5:
        return "Unknown"
      case 6:
        return "Faulty"
      case 7:
        return "Unassigned"
      default:
        return "Unknown"
    }
  }

  const getMeterStateIcon = (state: number) => {
    switch (state) {
      case 1:
        return <CheckCircle className="size-3 text-emerald-600" />
      case 2:
        return <AlertTriangle className="size-3 text-amber-600" />
      case 3:
        return <AlertCircle className="size-3 text-orange-600" />
      case 4:
        return <X className="size-3 text-red-600" />
      case 5:
        return <HelpCircle className="size-3 text-gray-600" />
      case 6:
        return <AlertTriangle className="size-3 text-red-600" />
      case 7:
        return <User className="size-3 text-blue-600" />
      default:
        return <HelpCircle className="size-3 text-gray-600" />
    }
  }

  const meters = currentCustomer?.meters ?? []
  const [expandedMeterId, setExpandedMeterId] = React.useState<number | null>(meters[0]?.id ?? null)

  React.useEffect(() => {
    setExpandedMeterId(meters[0]?.id ?? null)
  }, [meters])

  const meterStats = React.useMemo(() => {
    if (!meters.length) {
      return [
        { label: "Total Meters", value: 0, icon: HardDrive, color: "blue" },
        { label: "Active", value: 0, icon: Activity, color: "emerald" },
        { label: "Smart", value: 0, icon: Cpu, color: "indigo" },
        { label: "Prepaid", value: 0, icon: CreditCard, color: "purple" },
      ]
    }

    const activeCount = meters.filter((meter: any) => meter.status === 1).length
    const smartCount = meters.filter((meter: any) => meter.isSmart).length
    const prepaidCount = meters.filter((meter: any) => meter.meterType === 1).length

    return [
      { label: "Total Meters", value: meters.length, icon: HardDrive, color: "blue" },
      { label: "Active", value: activeCount, icon: Activity, color: "emerald" },
      { label: "Smart", value: smartCount, icon: Cpu, color: "indigo" },
      { label: "Prepaid", value: prepaidCount, icon: CreditCard, color: "purple" },
    ]
  }, [meters])

  const handleAccordionToggle = (meterId: number) => {
    setExpandedMeterId((prev) => (prev === meterId ? null : meterId))
  }

  const renderMeterDetails = (meter: any) => {
    const statusChips = [
      meter.meterCategory && {
        label: meter.meterCategory,
        icon: Tag,
        color: "blue",
      },
      {
        label: getMeterStatusLabel(meter.status),
        icon: Activity,
        color: meter.status === 1 ? "emerald" : meter.status === 2 ? "amber" : meter.status === 3 ? "red" : "gray",
      },
      {
        label: getMeterStateLabel(meter.meterState),
        icon: getMeterStateIcon,
        color: "purple",
      },
      meter.isSmart && {
        label: "Smart Meter",
        icon: Cpu,
        color: "indigo",
      },
    ].filter(Boolean) as { label: string; icon: any; color: string }[]

    const getColorClasses = (color: string) => {
      const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
        amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
        red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
        purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
        indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
        gray: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
      }
      return colorMap[color] || colorMap.gray || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    }

    const infoGroups = [
      {
        title: "Identity & Lifecycle",
        icon: Fingerprint,
        items: [
          { label: "Serial Number", value: meter.serialNumber || "N/A", icon: Hash },
          { label: "Meter Number", value: meter.drn || "N/A", icon: Fingerprint },
          { label: "Seal Number", value: meter.sealNumber || "N/A", icon: Shield },
          { label: "Pole Number", value: meter.poleNumber || "N/A", icon: MapPin },
          {
            label: "Installation Date",
            value: meter.installationDate ? formatDate(meter.installationDate) : "N/A",
            icon: Calendar,
          },
          { label: "First Reading", value: meter.firstReading ?? "N/A", icon: Gauge },
          {
            label: "Last Vending",
            value: meter.lastVendingDate ? formatDate(meter.lastVendingDate) : "N/A",
            icon: CreditCard,
          },
        ],
      },
      {
        title: "Technical Specifications",
        icon: Cpu,
        items: [
          { label: "SGC", value: meter.sgc || "N/A", icon: Hash },
          { label: "KRN", value: meter.krn || "N/A", icon: Hash },
          { label: "TI", value: meter.ti || "N/A", icon: Hash },
          { label: "EA", value: meter.ea || "N/A", icon: Hash },
          { label: "TCT", value: meter.tct || "N/A", icon: Thermometer },
          { label: "KEN", value: meter.ken || "N/A", icon: Hash },
          { label: "MFR", value: meter.mfrCode || "N/A", icon: Award },
        ],
      },
    ]

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="border-t border-gray-100 bg-gray-50/80 px-4 py-5 sm:px-6"
      >
        <div className="flex flex-wrap gap-2">
          {statusChips.map((chip) => {
            const colors = getColorClasses(chip.color)
            return (
              <span
                key={`${meter.id}-${chip.label}`}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
              >
                {typeof chip.icon === "function" ? chip.icon(meter.meterState) : <chip.icon className="size-3" />}
                {chip.label}
              </span>
            )
          })}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {infoGroups.map((group) => (
            <motion.div
              key={`${meter.id}-${group.title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-gray-100 p-1.5">
                  <group.icon className="size-4 text-gray-600" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{group.title}</p>
              </div>
              <dl className="space-y-2.5">
                {group.items.map((item) => (
                  <div
                    key={`${group.title}-${item.label}`}
                    className="flex items-center justify-between border-b border-gray-100 pb-1.5 last:border-0 last:pb-0"
                  >
                    <dt className="flex items-center gap-1.5 text-xs text-gray-500">
                      <item.icon className="size-3 text-gray-400" />
                      {item.label}
                    </dt>
                    <dd className="truncate text-right text-sm font-medium text-gray-900" title={item.value}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Customer Overview - Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm"
      >
        {/* Header with gradient */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5">
                <User className="size-5 text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Customer Overview</h2>
                <p className="text-sm text-gray-600">Basic customer identification and status</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
                ${
                  currentCustomer.statusCode === "ACTIVE"
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : currentCustomer.statusCode === "SUSPENDED"
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : currentCustomer.statusCode === "INACTIVE"
                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                    : "border border-gray-200 bg-gray-100 text-gray-700"
                }
              `}
              >
                <Activity className="size-3" />
                {getStatusLabel(currentCustomer.statusCode)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
                <Hash className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Customer Number</span>
              </div>
              <p className="mt-2 truncate text-base font-semibold text-gray-900" title={currentCustomer.customerNumber}>
                {currentCustomer.customerNumber}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
                <Fingerprint className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Account Number</span>
              </div>
              <p className="mt-2 truncate text-base font-semibold text-gray-900" title={currentCustomer.accountNumber}>
                {currentCustomer.accountNumber}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
                <Briefcase className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Customer Type</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    currentCustomer.isPPM
                      ? "border border-blue-200 bg-blue-50 text-blue-700"
                      : "border border-purple-200 bg-purple-50 text-purple-700"
                  }`}
                >
                  <CreditCard className="size-3" />
                  {currentCustomer.isPPM ? "PREPAID" : "POSTPAID"}
                </span>
                {currentCustomer.isCustomerNew && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <CheckCircle className="size-3" />
                    NEW
                  </span>
                )}
                {currentCustomer.isPostEnumerated && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <Layers className="size-3" />
                    POST ENUMERATED
                  </span>
                )}
                {currentCustomer.isMD && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
                    <Zap className="size-3" />
                    MD CUSTOMER
                  </span>
                )}
                {currentCustomer.isUrban && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <Building className="size-3" />
                    URBAN
                  </span>
                )}
                {currentCustomer.isHRB && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                    <Award className="size-3" />
                    HRB
                  </span>
                )}
              </div>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
                <UserCircle className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Customer Category</span>
              </div>
              <p className="mt-2 truncate text-base font-semibold text-gray-900" title={currentCustomer.category?.name}>
                {currentCustomer.category?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5">
              <User className="size-5 text-purple-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <p className="text-sm text-gray-600">Contact details and demographics</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-600">
                <User className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Full Name</span>
              </div>
              <p className="mt-2 truncate text-base font-semibold text-gray-900" title={currentCustomer.fullName}>
                {currentCustomer.fullName}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-600">
                <Phone className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Phone Number</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <PhoneCall className="size-4 text-gray-400" />
                <p className="truncate text-base font-semibold text-gray-900" title={currentCustomer.phoneNumber}>
                  {currentCustomer.phoneNumber}
                </p>
              </div>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-600">
                <Phone className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Office Phone</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <PhoneCall className="size-4 text-gray-400" />
                <p className="truncate text-base font-semibold text-gray-900" title={currentCustomer.phoneOffice}>
                  {currentCustomer.phoneOffice || "N/A"}
                </p>
              </div>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-600">
                <Mail className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Email</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <AtSign className="size-4 text-gray-400" />
                <p className="truncate text-base font-semibold text-gray-900" title={currentCustomer.email}>
                  {currentCustomer.email}
                </p>
              </div>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-600">
                <UserCircle className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Gender</span>
              </div>
              <p className="mt-2 truncate text-base font-semibold text-gray-900" title={currentCustomer.gender}>
                {currentCustomer.gender || "N/A"}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-600">
                <Clock className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Last Login</span>
              </div>
              <p
                className="mt-2 truncate text-base font-semibold text-gray-900"
                title={formatDateTime(currentCustomer.lastLoginAt)}
              >
                {formatDateTime(currentCustomer.lastLoginAt)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Address Information with Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <MapPin className="size-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
              <p className="text-sm text-gray-600">Location and geographic data</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Address Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Home className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Primary Address</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-gray-900" title={currentCustomer.address}>
                    {currentCustomer.address}
                  </p>
                </div>

                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Home className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Secondary Address</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-gray-900" title={currentCustomer.addressTwo}>
                    {currentCustomer.addressTwo || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Building className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">City</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-gray-900" title={currentCustomer.city}>
                    {currentCustomer.city}
                  </p>
                </div>

                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Map className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">State</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-gray-900" title={currentCustomer.provinceName}>
                    {currentCustomer.provinceName || "N/A"}
                  </p>
                </div>

                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Layers className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">LGA</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-gray-900" title={currentCustomer.lga}>
                    {currentCustomer.lga || "N/A"}
                  </p>
                </div>

                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Building className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Service Center</span>
                  </div>
                  <p
                    className="mt-2 truncate text-sm font-semibold text-gray-900"
                    title={currentCustomer.serviceCenterName}
                  >
                    {currentCustomer.serviceCenterName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Globe className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Latitude</span>
                  </div>
                  <p
                    className="mt-2 truncate font-mono text-sm font-medium text-gray-900"
                    title={currentCustomer.latitude}
                  >
                    {currentCustomer.latitude || "N/A"}
                  </p>
                </div>

                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-emerald-600">
                    <Globe className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Longitude</span>
                  </div>
                  <p
                    className="mt-2 truncate font-mono text-sm font-medium text-gray-900"
                    title={currentCustomer.longitude}
                  >
                    {currentCustomer.longitude || "N/A"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="size-4 text-gray-500" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-600">VAT Status</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      currentCustomer.isVATWaved
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  >
                    {currentCustomer.isVATWaved ? "Waived" : "Applicable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Map */}
            {currentCustomer.latitude && currentCustomer.longitude ? (
              <div className="h-full min-h-[300px] overflow-hidden rounded-lg border border-gray-200">
                <iframe
                  title="Customer location map"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${currentCustomer.latitude},${currentCustomer.longitude}&z=15&output=embed`}
                  className="h-full min-h-[300px]"
                ></iframe>
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
                <div className="text-center">
                  <MapPin className="mx-auto size-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-600">No location data available</p>
                  <p className="mt-1 text-xs text-gray-500">Customer coordinates not provided</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Distribution Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5">
              <Zap className="size-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Distribution Information</h2>
              <p className="text-sm text-gray-600">Network and infrastructure details</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-amber-600">
                <Building className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Distribution Station</span>
              </div>
              <p
                className="mt-2 truncate text-base font-semibold text-gray-900"
                title={currentCustomer.distributionSubstation?.dssCode}
              >
                {currentCustomer.distributionSubstation?.dssCode || "N/A"}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-amber-600">
                <Zap className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Feeder Name</span>
              </div>
              <p
                className="mt-2 truncate text-base font-semibold text-gray-900"
                title={currentCustomer.distributionSubstation?.feeder?.name}
              >
                {currentCustomer.distributionSubstation?.feeder?.name || "N/A"}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 group-hover:text-amber-600">
                <Building className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Area Office</span>
              </div>
              <p
                className="mt-2 truncate text-base font-semibold text-gray-900"
                title={
                  currentCustomer.distributionSubstation?.feeder?.injectionSubstation?.areaOffice?.nameOfNewOAreaffice
                }
              >
                {currentCustomer.distributionSubstation?.feeder?.injectionSubstation?.areaOffice?.nameOfNewOAreaffice ||
                  "N/A"}
              </p>
            </div>

            {currentCustomer.distributionSubstation && (
              <>
                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-amber-600">
                    <Gauge className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Transformer Capacity</span>
                  </div>
                  <p
                    className="mt-2 truncate text-base font-semibold text-gray-900"
                    title={currentCustomer.distributionSubstation?.transformerCapacityInKva}
                  >
                    {currentCustomer.distributionSubstation?.transformerCapacityInKva || "N/A"} kVA
                  </p>
                </div>

                <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-amber-600">
                    <Package className="size-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Number of Units</span>
                  </div>
                  <p
                    className="mt-2 truncate text-base font-semibold text-gray-900"
                    title={currentCustomer.distributionSubstation?.numberOfUnit}
                  >
                    {currentCustomer.distributionSubstation?.numberOfUnit || "N/A"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Meter & Billing Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2.5">
              <HardDrive className="size-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Meter & Billing Information</h2>
              <p className="text-sm text-gray-600">Meter details and consumption metrics</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Meter Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {meterStats.map((stat) => {
              const colorClasses = {
                blue: "bg-blue-50 text-blue-700 border-blue-200",
                emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
                indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
                purple: "bg-purple-50 text-purple-700 border-purple-200",
              }[stat.color]

              return (
                <div
                  key={stat.label}
                  className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-2 ${colorClasses?.split(" ")[0]}`}>
                      <stat.icon className={`size-4 ${colorClasses?.split(" ")[1]}`} />
                    </div>
                    <span className="truncate text-2xl font-bold text-gray-900" title={stat.value.toString()}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Meters List */}
          {meters.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
              <HardDrive className="mx-auto size-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-600">This customer has no registered meters yet.</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <VscAdd className="size-4" />
                Add Meter
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {meters.map((meter: any) => {
                const isExpanded = expandedMeterId === meter.id
                return (
                  <div key={meter.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-gray-50/50"
                      onClick={() => handleAccordionToggle(meter.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${meter.status === 1 ? "bg-emerald-50" : "bg-gray-100"}`}>
                            <HardDrive
                              className={`size-4 ${meter.status === 1 ? "text-emerald-600" : "text-gray-600"}`}
                            />
                          </div>
                          <div>
                            <p
                              className="truncate text-sm font-medium text-gray-900"
                              title={`Meter #${meter.serialNumber || meter.drn || meter.id}`}
                            >
                              Meter #{meter.serialNumber || meter.drn || meter.id}
                            </p>
                            <p className="truncate text-xs text-gray-500" title={`Meter Number: ${meter.drn || "N/A"}`}>
                              Meter Number: {meter.drn || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getMeterStatusStyle(
                              meter.status
                            )}`}
                          >
                            <Activity className="size-3" />
                            {getMeterStatusLabel(meter.status)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                            {getMeterStateIcon(meter.meterState)}
                            {getMeterStateLabel(meter.meterState)}
                          </span>
                          {meter.isSmart && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                              <Cpu className="size-3" />
                              Smart Meter
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown
                        className={`size-5 text-gray-500 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    <AnimatePresence>{isExpanded && renderMeterDetails(meter)}</AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tariff Information */}
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <CreditCard className="size-4 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tariff Rate</p>
                <p
                  className="truncate text-sm font-semibold text-gray-900"
                  title={formatCurrency(currentCustomer.tariffRate)}
                >
                  {formatCurrency(currentCustomer.tariffRate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Tag className="size-4 text-indigo-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tariff Class</p>
                <p className="truncate text-sm font-semibold text-gray-900" title={currentCustomer.category?.name}>
                  {currentCustomer.category?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Layers className="size-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tariff Band</p>
                <p className="truncate text-sm font-semibold text-gray-900" title={currentCustomer.subCategory?.name}>
                  {currentCustomer.subCategory?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Financial Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <BarChart3 className="size-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Financial Information</h2>
              <p className="text-sm text-gray-600">Balance and consumption metrics</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Gauge className="size-4 text-emerald-700" />
                </div>
                <span className="truncate text-xl font-bold text-gray-900" title={currentCustomer.storedAverage}>
                  {currentCustomer.storedAverage}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Stored Average (kWh)</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Calendar className="size-4 text-emerald-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-emerald-600"
                  title={formatCurrency(currentCustomer.totalMonthlyVend)}
                >
                  {formatCurrency(currentCustomer.totalMonthlyVend)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                Current Bill - {currentMonthYear}
              </p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2">
                  <AlertCircle className="size-4 text-amber-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-amber-600"
                  title={formatCurrency(currentCustomer.totalMonthlyDebt)}
                >
                  {formatCurrency(currentCustomer.totalMonthlyDebt)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Monthly Debt</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-red-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-100 p-2">
                  <AlertTriangle className="size-4 text-red-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-red-600"
                  title={formatCurrency(currentCustomer.customerOutstandingDebtBalance)}
                >
                  {formatCurrency(currentCustomer.customerOutstandingDebtBalance)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Outstanding Debt</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2">
                  <CheckCircle className="size-4 text-blue-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-blue-600"
                  title={formatCurrency(currentCustomer.customerOutstandingCreditBalance)}
                >
                  {formatCurrency(currentCustomer.customerOutstandingCreditBalance)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Outstanding Credit</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Scale className="size-4 text-purple-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-purple-600"
                  title={formatCurrency(currentCustomer.customerOutstandingBalance)}
                >
                  {formatCurrency(currentCustomer.customerOutstandingBalance)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Net Balance</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-orange-100 p-2">
                  <History className="size-4 text-orange-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-orange-600"
                  title={formatCurrency(currentCustomer.totalLifetimeDebit)}
                >
                  {formatCurrency(currentCustomer.totalLifetimeDebit)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Lifetime Debit</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-teal-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-teal-100 p-2">
                  <Award className="size-4 text-teal-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-teal-600"
                  title={formatCurrency(currentCustomer.totalLifetimeCredit)}
                >
                  {formatCurrency(currentCustomer.totalLifetimeCredit)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Lifetime Credit</p>
            </div>

            <div className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <Zap className="size-4 text-indigo-700" />
                </div>
                <span
                  className="truncate text-xl font-bold text-indigo-600"
                  title={formatCurrency(currentCustomer.tariff)}
                >
                  {formatCurrency(currentCustomer.tariff)}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-600">Tariff Rate (per kWh)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sales & Technical Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2.5">
              <Users className="size-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sales & Technical Information</h2>
              <p className="text-sm text-gray-600">Assigned personnel and support</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Sales Representative */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 p-2">
                  <UserCircle className="size-4 text-blue-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Sales Representative</h3>
              </div>
              {currentCustomer.salesRepUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                      <User className="size-5 text-blue-700" />
                    </div>
                    <div>
                      <p
                        className="truncate text-sm font-medium text-gray-900"
                        title={currentCustomer.salesRepUser.fullName}
                      >
                        {currentCustomer.salesRepUser.fullName}
                      </p>
                      <p className="truncate text-xs text-gray-500" title={`ID: ${currentCustomer.salesRepUser.id}`}>
                        ID: {currentCustomer.salesRepUser.id}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="size-4 text-gray-400" />
                      {currentCustomer.salesRepUser.email && (
                        <p className="truncate text-sm text-gray-600" title={currentCustomer.salesRepUser.email}>
                          {currentCustomer.salesRepUser.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="size-4 text-gray-400" />
                      {currentCustomer.salesRepUser.phoneNumber && (
                        <p className="truncate text-sm text-gray-600" title={currentCustomer.salesRepUser.phoneNumber}>
                          {currentCustomer.salesRepUser.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
                  <p className="text-sm text-gray-500">No sales representative assigned</p>
                </div>
              )}
            </div>

            {/* Technical Engineer */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-purple-100 p-2">
                  <Wrench className="size-4 text-purple-700" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Technical Engineer</h3>
              </div>
              {currentCustomer.technicalEngineerUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                      <User className="size-5 text-purple-700" />
                    </div>
                    <div>
                      <p
                        className="truncate text-sm font-medium text-gray-900"
                        title={currentCustomer.technicalEngineerUser.fullName}
                      >
                        {currentCustomer.technicalEngineerUser.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="size-4 text-gray-400" />
                      {currentCustomer.technicalEngineerUser.email && (
                        <p
                          className="truncate text-sm text-gray-600"
                          title={currentCustomer.technicalEngineerUser.email}
                        >
                          {currentCustomer.technicalEngineerUser.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="size-4 text-gray-400" />
                      {currentCustomer.technicalEngineerUser.phoneNumber && (
                        <p
                          className="truncate text-sm text-gray-600"
                          title={currentCustomer.technicalEngineerUser.phoneNumber}
                        >
                          {currentCustomer.technicalEngineerUser.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
                  <p className="text-sm text-gray-500">No technical engineer assigned</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* History Section */}
      {(currentCustomer.accountNumberHistory?.length > 0 || currentCustomer.meterHistory?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2.5">
                <History className="size-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">History</h2>
                <p className="text-sm text-gray-600">Account and meter change records</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6">
            {currentCustomer.accountNumberHistory?.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Account Number Changes</h3>
                <div className="space-y-3">
                  {currentCustomer.accountNumberHistory.map((history: any, index: number) => (
                    <div key={index} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Calendar className="size-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {new Date(history.requestedAtUtc).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                          <p className="mb-2 text-xs font-semibold text-red-700">Previous</p>
                          <p className="truncate font-mono text-sm" title={history.oldAccountNumber}>
                            {history.oldAccountNumber}
                          </p>
                          {history.oldAddress && <p className="mt-1 text-xs text-gray-600">{history.oldAddress}</p>}
                        </div>

                        <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                          <p className="mb-2 text-xs font-semibold text-green-700">New</p>
                          <p className="truncate font-mono text-sm" title={history.newAccountNumber}>
                            {history.newAccountNumber}
                          </p>
                          {history.newAddress && <p className="mt-1 text-xs text-gray-600">{history.newAddress}</p>}
                        </div>
                      </div>

                      {history.reason && (
                        <div className="mt-3 rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">Reason:</span> {history.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentCustomer.meterHistory?.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Meter Changes</h3>
                <div className="space-y-3">
                  {currentCustomer.meterHistory.map((history: any, index: number) => (
                    <div key={index} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Calendar className="size-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                          {new Date(history.requestedAtUtc).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                          <p className="mb-2 text-xs font-semibold text-amber-700">Old Meter</p>
                          <p className="truncate font-mono text-sm" title={history.oldMeterNumber}>
                            {history.oldMeterNumber}
                          </p>
                        </div>

                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                          <p className="mb-2 text-xs font-semibold text-emerald-700">New Meter</p>
                          <p className="truncate font-mono text-sm" title={history.newMeterNumber}>
                            {history.newMeterNumber}
                          </p>
                        </div>
                      </div>

                      {history.reason && (
                        <div className="mt-3 rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">Reason:</span> {history.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default BasicInfoTab
