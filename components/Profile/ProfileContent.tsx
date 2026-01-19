"use client"
import { useEffect, useState } from "react"
import { useAppSelector } from "lib/hooks/useRedux"
import {
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Key,
  Mail,
  Map,
  Phone,
  Save,
  Shield,
  User,
  Webhook,
  X,
} from "lucide-react"

interface ProfileContentProps {
  activeTab: string
}

export default function ProfileContent({ activeTab }: ProfileContentProps) {
  const { agent, user } = useAppSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [showLiveKey, setShowLiveKey] = useState(false)
  const [showTestKey, setShowTestKey] = useState(false)
  const [copiedLiveKey, setCopiedLiveKey] = useState(false)
  const [copiedTestKey, setCopiedTestKey] = useState(false)

  const handleCopy = async (text: string, keyType: "live" | "test") => {
    await navigator.clipboard.writeText(text)
    if (keyType === "live") {
      setCopiedLiveKey(true)
      setTimeout(() => setCopiedLiveKey(false), 2000)
    } else {
      setCopiedTestKey(true)
      setTimeout(() => setCopiedTestKey(false), 2000)
    }
  }

  // Initialize with real user data
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    phone: "",
    company: "",
    role: "",
    department: "",
    location: "",
    timezone: "",
    language: "",
    bio: "",
  })

  const [editData, setEditData] = useState(originalData)

  // Update originalData when user/agent data is available
  useEffect(() => {
    if (user) {
      const fullName = user.fullName || ""
      const nameParts = fullName.split(" ")

      setOriginalData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        dob: "", // Not available in current data structure
        phone: user.phoneNumber || "",
        company: "", // Not available in AgentSummary
        role: agent?.agentType || "Sales Representative",
        department: "", // Not available in current data structure
        location: "", // Not available in AgentSummary
        timezone: "UTC+1 (WAT)", // Default
        language: "English", // Default
        bio: "", // Not available in current data structure
      })
      setEditData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
        dob: "",
        phone: user.phoneNumber || "",
        company: "", // Not available in AgentSummary
        role: agent?.agentType || "Sales Representative",
        department: "",
        location: "", // Not available in AgentSummary
        timezone: "UTC+1 (WAT)",
        language: "English",
        bio: "",
      })
    }
  }, [user, agent])

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    // Save logic here - would update originalData with editData
    setOriginalData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(originalData)
    setIsEditing(false)
  }

  const startEditing = () => {
    setEditData(originalData)
    setIsEditing(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusConfig = (status: string | undefined, canCollectCash: boolean) => {
    const normalized = status?.toLowerCase() || ""
    if (normalized === "active") {
      return { label: "Active", bg: "bg-green-100", text: "text-green-800" }
    }
    if (normalized === "inactive") {
      return { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
    }
    return canCollectCash
      ? { label: "Active", bg: "bg-green-100", text: "text-green-800" }
      : { label: "Inactive", bg: "bg-gray-100", text: "text-gray-800" }
  }

  const statusConfig = getStatusConfig(agent?.status, agent?.canCollectCash ?? false)

  return (
    <>
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm md:mb-8 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white md:h-24 md:w-24">
                <span className="text-2xl font-bold md:text-3xl">
                  {originalData.firstName.charAt(0)}
                  {originalData.lastName.charAt(0)}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 rounded-full border border-gray-200 bg-white p-2 shadow-lg hover:bg-gray-50">
                <Camera className="size-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                {originalData.firstName} {originalData.lastName}
              </h2>
              <p className="text-gray-600">{originalData.role}</p>
              <div className="mt-2 flex flex-col gap-2 text-sm text-gray-500 md:flex-row md:gap-4">
                <span className="flex items-center gap-1">
                  <Mail className="size-4" />
                  {originalData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="size-4" />
                  {originalData.company}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={isEditing ? handleCancel : startEditing}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isEditing ? (
              <>
                <X className="size-4" />
                <span className="hidden md:inline">Cancel</span>
                <span className="md:hidden">X</span>
              </>
            ) : (
              <>
                <Edit2 className="size-4" />
                <span className="hidden md:inline">Edit Profile</span>
                <span className="md:hidden">Edit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          {activeTab === "personal" && (
            <>
              <div className="space-y-6">
                {/* Business Information Section */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-4 grid grid-cols-1 items-center justify-between gap-6 border-b border-gray-200 pb-2 md:grid-cols-2">
                      <div className="flex gap-3">
                        <User className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business name</p>
                          <p className="text-gray-900">
                            {originalData.firstName} {originalData.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Mail className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business Email</p>
                          <p className="text-gray-900">{originalData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 items-center justify-between gap-6 border-b border-gray-200 pb-2 md:grid-cols-2">
                      <div className="flex gap-3">
                        <Shield className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business Category</p>
                          <p className="text-gray-900">{agent?.agentType || "Sales Representative"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Globe className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business Type</p>
                          <p className="text-gray-900">Financial Services</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 items-center justify-between gap-6 md:grid-cols-2">
                      <div className="flex gap-3">
                        <Map className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Nationality</p>
                          <p className="text-gray-900">Nigerian</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Building2 className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business full address</p>
                          <p className="text-gray-900">{"Not available"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-4 grid grid-cols-1 items-center justify-between gap-6 border-b border-gray-200 pb-2 md:grid-cols-2">
                      <div className="flex gap-3">
                        <User className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="text-gray-900">
                            {originalData.firstName} {originalData.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Calendar className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="text-gray-900">{originalData.dob}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 items-center justify-between gap-6 md:grid-cols-2">
                      <div className="flex gap-3">
                        <Phone className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="text-gray-900">{originalData.phone}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Globe className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Nationality</p>
                          <p className="text-gray-900">Nigerian</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agent Information Section */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Agent Information</h3>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-4 grid grid-cols-1 items-center justify-between gap-6 border-b border-gray-200 pb-2 md:grid-cols-2">
                      <div className="flex gap-3">
                        <User className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Agent ID</p>
                          <p className="font-mono text-gray-900">{agent?.id || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Shield className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="text-gray-900">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              {statusConfig.label}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 items-center justify-between gap-6 border-b border-gray-200 pb-2 md:grid-cols-2">
                      <div className="flex gap-3">
                        <Building2 className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Area Office</p>
                          <p className="text-gray-900">{"Not available"}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Map className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Service Center</p>
                          <p className="text-gray-900">{"Not available"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 items-center justify-between gap-6 md:grid-cols-2">
                      <div className="flex gap-3">
                        <Calendar className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="text-gray-900">&quot;Not available&quot;</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Phone className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Can Collect Cash</p>
                          <p className="text-gray-900">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                agent?.canCollectCash ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {agent?.canCollectCash ? "✓ Yes" : "✗ No"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Information</h3>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="grid grid-cols-1 items-center justify-between gap-6 md:grid-cols-2">
                      <div className="flex gap-3">
                        <CreditCard className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Cash at Hand</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(agent?.cashAtHand || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <CreditCard className="mt-1 size-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Collection Limit</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(agent?.cashCollectionLimit || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Key className="size-5  text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Change Password</button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="size-5  text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Enable 2FA</button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <Phone className="size-5  text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Phone Verification</h4>
                      <p className="text-sm text-gray-500">Verified: {originalData.phone || "N/A"}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Verified</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "kyb" && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              </div>

              {/* KYB Verification Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">KYB Verification Details</h3>
              </div>

              {/* Verification Status */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <CheckCircle className="size-6 text-green-600" />
                  <div>
                    <h4 className="text-lg font-semibold text-green-800">KYB Verification</h4>
                    <p className="text-green-700">Verified</p>
                  </div>
                </div>
                <div className="rounded-lg bg-green-100 p-4">
                  <p className="mb-2 font-medium text-green-800">Verification complete</p>
                  <p className="text-sm text-green-700">
                    Your business has been successfully verified. You can now accept payments and withdraw funds.
                  </p>
                </div>
              </div>

              {/* Documents Upload Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Documents upload</h4>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5  text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Proof of address</p>
                          <p className="text-sm text-gray-500">Owner, Shareholder</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View document</button>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5  text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Certificate of Incorporation / CAC</p>
                          <p className="text-sm text-gray-500">Owner, Shareholder</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View document</button>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5  text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Memorandum of Association (MOA)</p>
                          <p className="text-sm text-gray-500">Owner, Shareholder</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View document</button>
                    </div>

                    <div className="flex items-center justify-between border-b border-gray-100 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5  text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">TIN or VAT Certificate</p>
                          <p className="text-sm text-gray-500">Owner, Shareholder</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View document</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Business Information</h4>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Business Category</p>
                      <p className="font-medium text-gray-900">Sole Proprietorship</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Business Type</p>
                      <p className="font-medium text-gray-900">Technology</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UBO 1 Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">UBO 1 Details</h4>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">Benny Mulla</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium text-gray-900">12-12-2000</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">+2348123456789</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm text-gray-500">Role</p>
                      <p className="font-medium text-gray-900">CEO</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="size-5  text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">International passport.jpg</p>
                          <p className="text-sm text-gray-500">Owner, Shareholder</p>
                        </div>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View document</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bank" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="size-5  text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Primary Bank Account</h4>
                        <p className="text-sm text-gray-500">Default account for withdrawals</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Edit</button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Name:</span>
                      <span className="text-gray-900">First Bank of Nigeria</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number:</span>
                      <span className="text-gray-900">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name:</span>
                      <span className="text-gray-900">UltraPay Technologies Limited</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Type:</span>
                      <span className="text-gray-900">Corporate Current Account</span>
                    </div>
                  </div>
                </div>

                <button className="w-full rounded-lg border border-gray-300 bg-white p-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  + Add Another Bank Account
                </button>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">API Keys & Webhooks</h3>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="size-5  text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">API Keys</h4>
                        <p className="text-sm text-gray-500">Manage your API access keys</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Generate New Key</button>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <span className="text-sm font-medium text-gray-900">Live API Key</span>
                        <span className="w-fit rounded bg-green-50 px-2 py-1 text-xs text-green-600">Active</span>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <code
                          className={`text-xs ${
                            showLiveKey ? "text-gray-600" : "text-gray-400 blur-sm"
                          } flex-1 break-all`}
                        >
                          pk_live_1234567890abcdef...
                        </code>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowLiveKey(!showLiveKey)}
                            className="rounded p-1 hover:bg-gray-200"
                            title={showLiveKey ? "Hide key" : "Show key"}
                          >
                            {showLiveKey ? (
                              <EyeOff className="size-4 text-gray-600" />
                            ) : (
                              <Eye className="size-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy("pk_live_1234567890abcdef...", "live")}
                            className="rounded p-1 hover:bg-gray-200"
                            title={copiedLiveKey ? "Copied!" : "Copy key"}
                          >
                            {copiedLiveKey ? (
                              <Check className="size-4 text-green-600" />
                            ) : (
                              <Copy className="size-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <span className="text-sm font-medium text-gray-900">Test API Key</span>
                        <span className="w-fit rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">Test</span>
                      </div>
                      <div className="flex flex-col gap-2 md:flex-row md:items-center">
                        <code
                          className={`text-xs ${
                            showTestKey ? "text-gray-600" : "text-gray-400 blur-sm"
                          } flex-1 break-all`}
                        >
                          pk_test_abcdef1234567890...
                        </code>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowTestKey(!showTestKey)}
                            className="rounded p-1 hover:bg-gray-200"
                            title={showTestKey ? "Hide key" : "Show key"}
                          >
                            {showTestKey ? (
                              <EyeOff className="size-4 text-gray-600" />
                            ) : (
                              <Eye className="size-4 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy("pk_test_abcdef1234567890...", "test")}
                            className="rounded p-1 hover:bg-gray-200"
                            title={copiedTestKey ? "Copied!" : "Copy key"}
                          >
                            {copiedTestKey ? (
                              <Check className="size-4 text-green-600" />
                            ) : (
                              <Copy className="size-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="size-5  text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Webhooks</h4>
                        <p className="text-sm text-gray-500">Configure webhook endpoints</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Add Webhook</button>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <span className="text-sm font-medium text-gray-900">Payment Events</span>
                        <span className="w-fit rounded bg-green-50 px-2 py-1 text-xs text-green-600">Active</span>
                      </div>
                      <code className="break-all text-xs text-gray-600">https://your-domain.com/webhooks/payments</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
              <button
                onClick={handleCancel}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Save className="size-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
