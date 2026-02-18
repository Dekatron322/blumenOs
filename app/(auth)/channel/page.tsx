"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { ButtonModule } from "components/ui/Button/Button"
import { motion } from "framer-motion"
import { HousesOutlineIcon, UserOutlineIcon } from "components/Icons/Icons"
import Image from "next/image"
import { RootState } from "lib/redux/store"
import { allLinks, getFirstPermittedPath, hasPermission, UserPermission } from "components/Sidebar/Links"

const SelectUserType: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)

  const departments = [
    {
      id: "sales-rep",
      title: "Sales Representative dashboard",
      description: "See the dedicated dashboard for your field sales activities.",
      icon: <HousesOutlineIcon color="#004B23" size={20} />,
    },
    {
      id: "main-dashboard",
      title: "Main company dashboard",
      description: "Go to your normal dashboard based on your role (HR, ICT, Operations, etc.).",
      icon: <UserOutlineIcon color="#004B23" size={20} />,
    },
  ]

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!selectedDepartment) {
      setError("Please select a department")
      setLoading(false)
      return
    }

    // Build permissions from authenticated user to resolve the normal dashboard path
    const permissions: UserPermission | null =
      user?.roles && user?.privileges
        ? {
            roles: user.roles,
            privileges: user.privileges,
          }
        : null

    try {
      if (selectedDepartment === "sales-rep") {
        // Send user to the Sales Rep dashboard
        router.push("/sales-rep/overview")
        return
      }

      // Fallback for main/company dashboards
      let targetPath = "/dashboard"

      if (permissions) {
        const dashboardLink = allLinks.find((link) => link.href === "/dashboard")
        const canAccessDashboard = dashboardLink ? hasPermission(dashboardLink, permissions) : false

        if (!canAccessDashboard) {
          const firstPermitted = getFirstPermittedPath(permissions)
          if (firstPermitted) {
            targetPath = firstPermitted
          }
        }
      }

      router.push(targetPath)
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentSelect = (departmentId: string) => {
    setSelectedDepartment(departmentId)
    // Clear error when user selects a department
    if (error) setError(null)
  }

  const isButtonDisabled = loading || !selectedDepartment

  return (
    <div className="relative flex min-h-screen grid-cols-1 bg-gradient-to-br from-[#ffffff]">
      {/* Form Container */}
      <div className="container flex flex-col items-center justify-center border-r-2 border-[#ffffff80] py-8 max-sm:px-5 md:w-[50%]">
        <motion.main
          className="flex w-full flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image src="/kadco.svg" alt="Dashboard" width={120} height={120} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl rounded-2xl md:p-8"
          >
            <div className="mx-4 mb-8 border-b pb-6 text-center">
              <h1 className="text-3xl font-bold text-[#004B23]">Where do you want to start?</h1>
              <p className="mt-2 text-[#101836]">
                Choose whether to view your Sales Rep dashboard or your main company dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {departments.map((department, index) => (
                  <motion.div
                    key={department.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-300 hover:border-[#004B23] hover:bg-[#f8f7ff] ${
                      selectedDepartment === department.id
                        ? "border-[#004B23] bg-green-50 ring-2 ring-[#004B23] ring-opacity-50"
                        : "border-grey-500 bg-white"
                    }`}
                    onClick={() => handleDepartmentSelect(department.id)}
                  >
                    {/* Circular Check Icon - Top Right Corner */}
                    <div
                      className={`absolute -right-2 -top-2 transition-all duration-300 ${
                        selectedDepartment === department.id ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                    >
                      <div className="flex size-6 items-center justify-center rounded-full bg-[#004B23]">
                        <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-[#F0EFFB]">
                        <span className="text-2xl">{department.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#101836]">{department.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{department.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="pt-4"
              >
                <ButtonModule
                  type="submit"
                  disabled={isButtonDisabled}
                  variant="primary"
                  className="w-full transform  py-3 font-medium transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="size-5 animate-spin rounded-full border-b-2 border-white"></div>
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    "Continue to dashboard"
                  )}
                </ButtonModule>
              </motion.div>
            </form>

            {/* Demo credentials hint */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex gap-2 text-center text-sm text-gray-500"
          >
            <p>Powered by </p>
            <p className="text-[#004B23] transition-all duration-300 ease-in-out hover:underline">BlumenOS</p>
          </motion.div>
        </motion.main>
      </div>

      {/* Image Container with Text at Bottom */}
      <div className="relative hidden w-[60%] bg-[#004B23] lg:block ">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative z-0 flex items-start justify-center pt-8"
        >
          <img src="/auth-background.svg" alt="auth-background" className="w-full object-contain" />
        </motion.div>

        {/* Text positioned at the bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center px-10 pb-24">
          <motion.h1
            className="mb-4 max-w-[70%] text-center text-3xl font-semibold text-[#FFFFFFCC]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span className="text-[#FFFFFF80]">No</span> Complexity.{" "}
            <span className="text-[#FFFFFF80]">Just robust</span> power management infrastructure{" "}
            <span className="text-[#FFFFFF80]">for Utilities</span>
          </motion.h1>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center px-10 pb-10 ">
          <motion.p
            className="max-w-[80%] text-center  text-[#FFFFFF80]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            We help distribution companies leverage data-driven, scalable, and secure grid management. Unlock the power
            of real-time analytics and asset control, enabling proactive outage management and optimized energy
            distribution.
          </motion.p>
        </div>
      </div>
    </div>
  )
}

export default SelectUserType
