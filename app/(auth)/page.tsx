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

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, user, loading: authLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user && !authLoading) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, authLoading, router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Mock successful login
      await new Promise((resolve) => setTimeout(resolve, 1000))

      notify("success", "Login successful!", {
        description: "Redirecting to dashboard...",
        duration: 3000,
      })

      setTimeout(() => router.push("/dashboard"), 1000)
    } catch (error: any) {
      const errorMessage = "Login failed. Please try again."
      setError(errorMessage)
      notify("error", "Login failed", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value)
  }

  const isButtonDisabled = loading || username.trim() === "" || password.trim() === ""

  return (
    <div className="relative flex min-h-screen grid-cols-1 bg-gradient-to-br from-[#ffffff]">
      {/* Form Container */}
      <div className="container flex flex-col items-center justify-center border-r-2 border-[#ffffff80] py-8 max-sm:px-5 md:w-[40%]">
        <motion.main
          className="flex w-full flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h5 className="font-bold text-[#0a0a0a]">BlumenOS</h5>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl rounded-2xl md:p-8 "
          >
            <div className="mx-4 mb-8 border-b pb-6 text-center">
              <h1 className="text-3xl font-bold text-[#0a0a0a]">Welcome back</h1>
              <p className="mt-2 text-gray-500">Enter your details to jump right into your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <FormInputModule
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <PasswordInputModule
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
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
                    className="size-4 rounded border-gray-300  text-[#0a0a0a] focus:ring-[#0a0a0a]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link href="#" className="text-sm font-medium text-[#0a0a0a] hover:text-[#0a0a0a]">
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

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
                <ButtonModule
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isButtonDisabled}
                  className="w-full transform rounded-xl py-3 font-medium transition-all hover:scale-[1.01]"
                  whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
                >
                  {loading ? (
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
      <div className="relative w-[60%] bg-[#0A0A0A] ">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="absolute right-0 top-[-25%] z-0 flex h-full"
        >
          <img src="/auth-background.svg" alt="auth-background" className="w-full" />
        </motion.div>

        {/* Text positioned at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-32">
          <motion.h1
            className="max-w-[60%] text-center text-3xl font-semibold text-[#FFFFFFCC]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span className="text-[#FFFFFF80]">No</span> Complexity.{" "}
            <span className="text-[#FFFFFF80]">Just robust</span> power management infrastructure{" "}
            <span className="text-[#FFFFFF80]">for Utilities</span>
          </motion.h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-10 ">
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
