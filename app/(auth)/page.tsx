"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PasswordInputModule } from "components/ui/Input/PasswordInput"
import { ButtonModule } from "components/ui/Button/Button"
import { FormInputModule } from "components/ui/Input/EmailInput"
import { notify } from "components/ui/Notification/Notification"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { initializeAuth, loginUser } from "lib/redux/authSlice"
import { motion } from "framer-motion"
import Image from "next/image"

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
    mustChangePassword,
  } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      notify("success", "Login successful!", {
        description: "Redirecting to dashboard...",
        duration: 3000,
      })

      // Check if user needs to change password
      if (mustChangePassword) {
        setTimeout(() => router.push("/change-password"), 1000)
      } else {
        setTimeout(() => router.push("/dashboard"), 1000)
      }
    }
  }, [isAuthenticated, user, authLoading, mustChangePassword, router])

  useEffect(() => {
    if (authError) {
      setError(authError)
      notify("error", "Login failed", {
        description: authError,
      })
    }
  }, [authError])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    try {
      const result = await dispatch(
        loginUser({
          email: email.trim(),
          password: password.trim(),
        })
      )

      if (loginUser.rejected.match(result)) {
        const errorPayload = result.payload as string
        const errorMessage = errorPayload || "Login failed. Please check your credentials and try again."
        setError(errorMessage)
      } else if (loginUser.fulfilled.match(result)) {
        // Login successful - the useEffect will handle redirect based on mustChangePassword
        const userFullName = result.payload.data.user.fullName
        // Store user roles and privileges in localStorage for sidebar access
        const userData = {
          roles: result.payload.data.user.roles,
          privileges: result.payload.data.user.privileges,
        }
        localStorage.setItem("userPermissions", JSON.stringify(userData))
      }
    } catch (error: any) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const isButtonDisabled = loading || authLoading || email.trim() === "" || password.trim() === ""

  return (
    <div className="relative flex min-h-screen flex-col  bg-gradient-to-br from-[#ffffff] lg:flex-row">
      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center border-b-2 border-[#ffffff80] px-5 py-8 lg:w-[40%] lg:border-b-0 lg:border-r-2">
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
            className="w-full max-w-xl rounded-2xl md:p-8 "
          >
            <div className="mx-4 mb-8 border-b pb-6 text-center">
              <h1 className="text-3xl font-bold text-[#004B23]">Welcome back</h1>
              <p className="mt-2 text-gray-500">Enter your details to jump right into your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <FormInputModule
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <PasswordInputModule
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  hideToggle
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="size-4 rounded border-gray-300  text-[#004B23] focus:ring-[#004B23]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link href="#" className="text-sm font-medium text-[#004B23] hover:text-[#004B23]">
                  Forgot password?
                </Link>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              {mustChangePassword && isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-700"
                >
                  For security reasons, please change your password to continue.
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
                <ButtonModule
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isButtonDisabled}
                  className="w-full transform rounded-xl py-3 font-medium transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
                >
                  {loading || authLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="mr-2 size-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
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
            className=" text-center text-sm text-gray-500"
          >
            Powered by BlumenTech
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
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center px-10 pb-24">
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
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center px-10 pb-10 ">
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

export default SignIn
