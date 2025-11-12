"use client"

import React from "react"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { PasswordInputModule } from "components/ui/Input/PasswordInput"
import { resetEmployeePassword } from "lib/redux/employeeSlice"
import { notify } from "components/ui/Notification/Notification"
import { useAppDispatch } from "lib/hooks/useRedux"

interface ResetPasswordModalProps {
  isOpen: boolean
  onRequestClose: () => void
  onConfirm?: () => void
  employeeId: number
  employeeName: string
  onSuccess?: () => void
  initialPassword?: string
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  employeeId,
  employeeName,
  onSuccess,
  initialPassword = "",
}) => {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = React.useState(false)
  const [newPassword, setNewPassword] = React.useState(initialPassword)
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [formError, setFormError] = React.useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = React.useState<number>(0)

  React.useEffect(() => {
    if (isOpen) {
      setNewPassword(initialPassword)
      setConfirmPassword("")
      setFormError(null)
      setPasswordStrength(0)
    }
  }, [isOpen, initialPassword])

  if (!isOpen) return null

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

  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value)
    if (formError) setFormError(null)
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

  const validateForm = (): boolean => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setFormError("Please fill in all fields")
      return false
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match")
      return false
    }

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters long")
      return false
    }

    if (passwordStrength < 3) {
      setFormError("Please choose a stronger password")
      return false
    }

    return true
  }

  const generateRandomPassword = () => {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setNewPassword(password)
    setConfirmPassword(password)
    setPasswordStrength(checkPasswordStrength(password))
    setFormError(null)
  }

  const handleConfirm = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)

      // If custom onConfirm is provided, use it
      if (onConfirm) {
        await onConfirm()
        onRequestClose()
        return
      }

      // Otherwise, use the reset password action
      const result = await dispatch(
        resetEmployeePassword({
          id: employeeId,
          passwordData: { newPassword },
        })
      )

      if (resetEmployeePassword.fulfilled.match(result)) {
        notify("success", `Password for ${employeeName} has been reset successfully`)
        onSuccess?.()
        onRequestClose()
      } else {
        throw new Error(result.payload as string)
      }
    } catch (error: any) {
      notify("error", error.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleConfirm()
    }
  }

  const isButtonDisabled = isLoading || !newPassword.trim() || !confirmPassword.trim()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onRequestClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[500px] max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between bg-[#F9F9F9] p-6">
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
          <button
            onClick={onRequestClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
            disabled={isLoading}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col px-6 pb-6 pt-6">
            {/* Icon */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                <svg className="size-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <h3 className="mb-3 text-center text-lg font-semibold text-gray-900">Reset Password</h3>
            <p className="mb-6 text-center text-gray-600">
              Set a new password for <span className="font-semibold">{employeeName}</span>
            </p>

            {/* Password Form */}
            <div className="space-y-6">
              {/* New Password Field */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <PasswordInputModule
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
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

              {/* Confirm Password Field */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                <PasswordInputModule
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword && (
                  <p className="mt-1 text-xs text-green-600">Passwords match</p>
                )}
              </motion.div>

              {/* Generate Password Button */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    disabled={isLoading}
                  >
                    Generate Strong Password
                  </button>
                </div>
              </motion.div>

              {/* Form Error */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-md bg-red-50 p-3 text-sm text-red-600"
                >
                  {formError}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <ButtonModule variant="secondary" className="flex-1" size="lg" onClick={onRequestClose} disabled={isLoading}>
            Cancel
          </ButtonModule>
          <ButtonModule
            variant="primary"
            className="flex-1"
            size="lg"
            onClick={handleConfirm}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 size-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
          </ButtonModule>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ResetPasswordModal
