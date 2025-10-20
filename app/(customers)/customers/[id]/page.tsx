"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import CustomerInfo from "components/CustomerInfo/CustomerInfo"
import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import ActivateCustomerModal from "components/ui/Modal/activate-customer-modal"
// import DeactivateCustomerModal from "components/ui/Modal/freeze-account-modal"
import DeleteCustomerModal from "components/ui/Modal/delete-customer-modal"

interface Account {
  id: string
  accountNumber: string
}

interface Business {
  id: string
  name: string
}

interface CustomerType {
  customerID: string
  id: string
  firstName: string
  lastName: string
  customerStatus: boolean
}

const CustomerDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const rawId = params?.id ?? ""

  const [customer, setCustomer] = useState<CustomerType | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [business, setBusiness] = useState<Business | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedCustomer")
      if (raw) {
        const parsed = JSON.parse(raw) as CustomerType
        setCustomer(parsed)

        setAccounts([
          {
            id: "acc1",
            accountNumber: "1234567890",
          },
          {
            id: "acc2",
            accountNumber: "0987654321",
          },
        ])

        if (parsed.customerID.startsWith("BUS")) {
          setBusiness({
            id: "bus1",
            name: `${parsed.firstName}'s Business`,
          })
        }
      } else {
        const mockCustomer: CustomerType = {
          customerID: rawId || "CUST001",
          id: "cust-001",
          firstName: "John",
          lastName: "Doe",
          customerStatus: true,
        }
        setCustomer(mockCustomer)
        setAccounts([
          {
            id: "acc1",
            accountNumber: "1234567890",
          },
        ])
      }
    } catch (e) {
      console.warn("Could not parse customer data:", e)
    }
  }, [rawId])

  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleActivateSuccess = () => {
    if (customer) {
      setCustomer({ ...customer, customerStatus: true })
    }
    setIsActivateModalOpen(false)
  }

  const handleDeactivateSuccess = () => {
    if (customer) {
      setCustomer({ ...customer, customerStatus: false })
    }
    setIsDeactivateModalOpen(false)
  }

  if (!customer) {
    return <div className="p-4">Loading customer details...</div>
  }

  return (
    <section className="size-full">
      <div className="flex min-h-screen w-full">
        <div className="flex w-full flex-col">
          <DashboardNav />

          <div className="flex justify-between border-b px-16 py-4 max-sm:flex-col max-sm:px-3">
            <div className="flex cursor-pointer items-center gap-2 whitespace-nowrap" onClick={() => router.back()}>
              <img src="/DashboardImages/ArrowLeft.png" alt="Back" className="icon-style" />
              <p className="text-lg font-medium md:text-2xl">
                {customer.firstName} {customer.lastName}
              </p>
            </div>

            <div className="flex gap-4 max-sm:pt-4">
              <ButtonModule variant="outline" size="md" iconPosition="end">
                Generate Statement
              </ButtonModule>

              {customer.customerStatus ? (
                <ButtonModule
                  variant="black"
                  size="md"
                  iconPosition="end"
                  onClick={() => setIsDeactivateModalOpen(true)}
                >
                  Freeze Account
                </ButtonModule>
              ) : (
                <ButtonModule variant="black" size="md" iconPosition="end" onClick={() => setIsActivateModalOpen(true)}>
                  Activate Customer
                </ButtonModule>
              )}

              <ButtonModule variant="danger" size="md" iconPosition="end" onClick={() => setIsDeleteModalOpen(true)}>
                Delete Customer
              </ButtonModule>
            </div>
          </div>

          <div className="mt-8 flex w-full gap-6 px-16 max-md:flex-col max-md:px-0 max-sm:my-4 max-sm:px-3">
            <div className="w-full">
              <CustomerInfo />
            </div>
          </div>
        </div>
      </div>

      <ActivateCustomerModal
        isOpen={isActivateModalOpen}
        onRequestClose={() => setIsActivateModalOpen(false)}
        onSuccess={handleActivateSuccess}
        customerName={`${customer.firstName} ${customer.lastName}`}
        customerId={0}
      />

      {/* <DeactivateCustomerModal
        isOpen={isDeactivateModalOpen}
        onRequestClose={() => setIsDeactivateModalOpen(false)}
        onSuccess={handleDeactivateSuccess}
        customerId={customer.id}
        customerName={`${customer.firstName} ${customer.lastName}`}
      /> */}

      <DeleteCustomerModal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        customerId={0}
        customerName={`${customer.firstName} ${customer.lastName}`}
      />
    </section>
  )
}

export default CustomerDetailPage
