"use client"
import React, { useEffect, useState } from "react"
import Modal from "react-modal"
import CloseIcon from "public/close-icon"
import { ButtonModule } from "components/ui/Button/Button"
import { Permission } from "lib/redux/adminSlice"
import { useUpdateAdminPermissionMutation } from "lib/redux/adminSlice"
import { notify } from "components/ui/Notification/Notification"

interface PermissionModalProps {
  isOpen: boolean
  onRequestClose: () => void
  admin: {
    id: number
    name: string
    currentPermissions: Permission | null
  }
  onSuccess?: () => void
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onRequestClose, admin, onSuccess }) => {
  const [updatePermission, { isLoading }] = useUpdateAdminPermissionMutation()
  const [permissions, setPermissions] = useState<Permission>({
    canViewUsers: false,
    canManageUsers: false,
    canManageAdmin: false,
    canViewDashboard: false,
    canViewTransactions: false,
    canManageSystemSettings: false,
  })

  useEffect(() => {
    if (admin.currentPermissions) {
      setPermissions(admin.currentPermissions)
    }
  }, [admin.currentPermissions])

  const handleTogglePermission = (permissionKey: keyof Permission) => {
    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updatePermission({
        id: admin.id,
        permission: permissions,
      }).unwrap()

      // Show success notification
      notify("success", "Permissions Updated!", {
        description: `Permissions for ${admin.name} have been updated successfully.`,
        duration: 3000,
      })

      if (onSuccess) onSuccess()
      onRequestClose()
    } catch (error) {
      console.error("Failed to update permissions:", error)

      // Show error notification
      notify("error", "Update Failed", {
        description: "There was an error updating the permissions. Please try again.",
        duration: 5000,
      })
    }
  }

  const PermissionToggle = ({
    label,
    description,
    permissionKey,
  }: {
    label: string
    description: string
    permissionKey: keyof Permission
  }) => (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={permissions[permissionKey]}
          onChange={() => handleTogglePermission(permissionKey)}
          className="peer sr-only"
        />
        <div
          className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute 
          after:left-[2px] after:top-[2px] 
          after:h-5 after:w-5 after:rounded-full after:border 
          after:border-gray-300 after:bg-white after:transition-all after:content-[''] 
          peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"
        ></div>
      </label>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="mt-20 w-[90%] max-w-2xl overflow-hidden rounded-md bg-white shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center p-4"
    >
      <div className="flex w-full items-center justify-between bg-[#F5F8FA] p-4">
        <h2 className="text-lg font-bold">Edit Permissions for {admin.name}</h2>
        <div onClick={onRequestClose} className="cursor-pointer">
          <CloseIcon />
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
        <form onSubmit={handleSubmit}>
          <div className="my-6 space-y-2">
            <PermissionToggle
              label="View Users"
              description="Allow viewing user accounts and details"
              permissionKey="canViewUsers"
            />

            <PermissionToggle
              label="Manage Users"
              description="Allow creating, editing, and deleting users"
              permissionKey="canManageUsers"
            />

            <PermissionToggle
              label="Manage Admins"
              description="Allow managing other admin accounts"
              permissionKey="canManageAdmin"
            />

            <PermissionToggle
              label="View Dashboard"
              description="Allow access to the admin dashboard"
              permissionKey="canViewDashboard"
            />

            <PermissionToggle
              label="View Transactions"
              description="Allow viewing transaction history"
              permissionKey="canViewTransactions"
            />

            <PermissionToggle
              label="Manage System Settings"
              description="Allow modifying system configuration"
              permissionKey="canManageSystemSettings"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <ButtonModule type="button" variant="outline" onClick={onRequestClose} disabled={isLoading}>
              Cancel
            </ButtonModule>

            <ButtonModule type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                "Save Permissions"
              )}
            </ButtonModule>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default PermissionModal
