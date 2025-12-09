"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PasswordInputModule } from "components/ui/Input/PasswordInput"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "lib/redux/store"
import { changePassword, clearChangePasswordStatus, initializeAuth, resetMustChangePassword } from "lib/redux/authSlice"
import { motion } from "framer-motion"

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
    mustChangePassword,
    isChangingPassword,
    changePasswordError,
    changePasswordSuccess,
  } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Redirect if not authenticated or if password change is not required
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        notify("error", "Authentication required", {
          description: "Please log in to access this page",
          duration: 3000,
        })
        router.push("/")
        return
      }

      if (!mustChangePassword) {
        notify("info", "Redirecting to dashboard", {
          description: "Password change is not required",
          duration: 3000,
        })
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, authLoading, mustChangePassword, router])

  // Handle change password success
  useEffect(() => {
    if (changePasswordSuccess) {
      notify("success", "Password changed successfully!", {
        description: "Redirecting to dashboard...",
        duration: 3000,
      })

      // Reset the mustChangePassword flag and redirect
      dispatch(resetMustChangePassword())
      setTimeout(() => router.push("/dashboard"), 2000)
    }
  }, [changePasswordSuccess, router, dispatch])

  // Handle change password errors
  useEffect(() => {
    if (changePasswordError) {
      setFormError(changePasswordError)
      notify("error", "Password change failed", {
        description: changePasswordError,
      })
    }
  }, [changePasswordError])

  // Clear errors when component unmounts or form changes
  useEffect(() => {
    return () => {
      dispatch(clearChangePasswordStatus())
    }
  }, [dispatch])

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setNewPassword(value)
    setPasswordStrength(checkPasswordStrength(value))

    // Clear form errors when user starts typing
    if (formError) setFormError(null)
  }

  const handleCurrentPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(event.target.value)
    if (formError) setFormError(null)
  }

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value)
    if (formError) setFormError(null)
  }

  const validateForm = (): boolean => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setFormError("Please fill in all fields")
      return false
    }

    if (newPassword !== confirmPassword) {
      setFormError("New passwords do not match")
      return false
    }

    if (newPassword.length < 8) {
      setFormError("New password must be at least 8 characters long")
      return false
    }

    if (passwordStrength < 3) {
      setFormError("Please choose a stronger password")
      return false
    }

    if (currentPassword === newPassword) {
      setFormError("New password must be different from current password")
      return false
    }

    return true
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200"
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return ""
    if (passwordStrength <= 2) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(
        changePassword({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        })
      )

      if (changePassword.rejected.match(result)) {
        const errorPayload = result.payload as string
        const errorMessage = errorPayload || "Password change failed. Please try again."
        setFormError(errorMessage)
      }
    } catch (error: any) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setFormError(errorMessage)
    }
  }

  const isButtonDisabled =
    isChangingPassword || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-[#ffffff] lg:flex-row">
      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center border-b-2 border-[#ffffff80] py-8 max-sm:px-5 lg:w-[40%] lg:border-b-0 lg:border-r-2">
        <motion.main
          className="flex w-full flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h5 className="font-bold text-[#004B23]">BlumenOS</h5>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-xl rounded-2xl md:p-8"
          >
            <div className="mx-4 mb-8 border-b pb-6 text-center">
              <h1 className="text-3xl font-bold text-[#004B23]">Change Your Password</h1>
              <p className="mt-2 text-gray-500">
                {mustChangePassword
                  ? "For security reasons, please change your password to continue."
                  : "Update your password to keep your account secure."}
              </p>
              {user && (
                <p className="mt-1 text-sm text-gray-600">
                  Signed in as <span className="font-medium">{user.email}</span>
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <PasswordInputModule
                  label="Current Password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                <PasswordInputModule
                  label="New Password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                />

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs text-gray-600">
                      <span>Password strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength <= 2
                            ? "text-red-600"
                            : passwordStrength <= 3
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                      <li className={newPassword.length >= 8 ? "text-green-600" : ""}>• At least 8 characters</li>
                      <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>• One uppercase letter</li>
                      <li className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>• One lowercase letter</li>
                      <li className={/[0-9]/.test(newPassword) ? "text-green-600" : ""}>• One number</li>
                      <li className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600" : ""}>
                        • One special character
                      </li>
                    </ul>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
                <PasswordInputModule
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword && (
                  <p className="mt-1 text-xs text-green-600">Passwords match</p>
                )}
              </motion.div>

              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-red-50 p-3 text-sm text-red-600"
                >
                  {formError}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex flex-col space-y-4"
              >
                <ButtonModule
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isButtonDisabled}
                  className="w-full transform rounded-xl py-3 font-medium transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={!isButtonDisabled ? { scale: 1.01 } : {}}
                  whileTap={!isButtonDisabled ? { scale: 0.99 } : {}}
                >
                  {isChangingPassword ? (
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
                      Changing Password...
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </ButtonModule>

                {!mustChangePassword && (
                  <Link href="/dashboard">
                    <ButtonModule
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full rounded-xl py-3 font-medium"
                    >
                      Back to Dashboard
                    </ButtonModule>
                  </Link>
                )}
              </motion.div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center text-sm text-gray-500"
          >
            Powered by BlumenTech
          </motion.div>
        </motion.main>
      </div>

      {/* Image Container with Text at Bottom */}
      <div className="relative hidden w-[60%] bg-[#004B23] lg:block">
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
            <span className="text-[#FFFFFF80]">Secure</span> Your Account.{" "}
            <span className="text-[#FFFFFF80]">Protect your</span> data and maintain{" "}
            <span className="text-[#FFFFFF80]">system integrity</span>
          </motion.h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center p-10">
          <motion.p
            className="max-w-[80%] text-center text-[#FFFFFF80]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            Regular password updates enhance security and prevent unauthorized access. Choose a strong, unique password
            to safeguard your account and the sensitive data within our power management infrastructure.
          </motion.p>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
