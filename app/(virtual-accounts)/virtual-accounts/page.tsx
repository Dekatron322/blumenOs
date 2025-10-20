"use client"
import React from "react"
import { FiCopy, FiEye, FiEyeOff, FiRefreshCw } from "react-icons/fi"
import { RiMastercardFill, RiVisaLine } from "react-icons/ri"
import { SiApplepay } from "react-icons/si"

import DashboardNav from "components/Navbar/DashboardNav"
import { ButtonModule } from "components/ui/Button/Button"
import AddBusiness from "public/add-business"

interface VirtualCard {
  id: string
  lastFour: string
  fullNumber: string
  expiry: string
  cvv: string
  name: string
  type: "visa" | "mastercard" | "applepay"
  balance: number
  currency: string
  frozen: boolean
  color: string
}

const VirtualCardsPage = () => {
  const [showDetails, setShowDetails] = React.useState<Record<string, boolean>>({})
  const [cards, setCards] = React.useState<VirtualCard[]>([
    {
      id: "1",
      lastFour: "4242",
      fullNumber: "4242424242424242",
      expiry: "12/25",
      cvv: "123",
      name: "ALEX JOHNSON",
      type: "visa",
      balance: 12500.42,
      currency: "USD",
      frozen: false,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      id: "2",
      lastFour: "5555",
      fullNumber: "5555555555555555",
      expiry: "09/24",
      cvv: "456",
      name: "ALEX JOHNSON",
      type: "mastercard",
      balance: 850.0,
      currency: "EUR",
      frozen: true,
      color: "bg-gradient-to-br from-teal-500 to-cyan-500",
    },
    {
      id: "3",
      lastFour: "1234",
      fullNumber: "1234123412341234",
      expiry: "03/26",
      cvv: "789",
      name: "ALEX JOHNSON",
      type: "applepay",
      balance: 3200.0,
      currency: "USD",
      frozen: false,
      color: "bg-gradient-to-br from-gray-900 to-gray-700",
    },
  ])

  const toggleCardDetails = (cardId: string) => {
    setShowDetails((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }))
  }

  const toggleFreezeCard = (cardId: string) => {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, frozen: !card.frozen } : card)))
  }

  const regenerateCard = (cardId: string) => {
    // In a real app, this would call an API
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? {
              ...card,
              lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
              fullNumber: Array(16)
                .fill(0)
                .map(() => Math.floor(Math.random() * 10))
                .join(""),
              cvv: Array(3)
                .fill(0)
                .map(() => Math.floor(Math.random() * 10))
                .join(""),
              expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${
                Math.floor(Math.random() * 10) + 23
              }`,
            }
          : card
      )
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Add toast notification in real app
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return <RiVisaLine className="text-2xl" />
      case "mastercard":
        return <RiMastercardFill className="text-2xl" />
      case "applepay":
        return <SiApplepay className="text-2xl" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Virtual Cards</h1>
            <p className="text-gray-600">Manage your digital payment cards</p>
          </div>
          <ButtonModule variant="primary" size="md" icon={<AddBusiness />} iconPosition="start">
            Add New Card
          </ButtonModule>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className={`${card.color} rounded-xl p-6 text-white shadow-lg`}>
              <div className="mb-6 flex items-start justify-between">
                <div className="text-lg font-bold">CRYPTOBANK</div>
                {getCardIcon(card.type)}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-xl tracking-wider">
                    {showDetails[card.id]
                      ? card.fullNumber.replace(/(\d{4})(?=\d)/g, "$1 ")
                      : `•••• •••• •••• ${card.lastFour}`}
                  </div>
                  <button onClick={() => toggleCardDetails(card.id)} className="rounded-full p-1 hover:bg-white/10">
                    {showDetails[card.id] ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="mb-1 text-xs text-white/80">Card Holder</div>
                  <div className="text-sm font-medium">{card.name}</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-xs text-white/80">Expires</div>
                  <div className="text-sm font-medium">{showDetails[card.id] ? card.expiry : "••/••"}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-between border-t border-white/20 pt-4">
                <div>
                  <div className="mb-1 text-xs text-white/80">Balance</div>
                  <div className="font-medium">
                    {card.currency} {card.balance.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(card.fullNumber)}
                    className="rounded-full p-2 hover:bg-white/10"
                    title="Copy card number"
                  >
                    <FiCopy />
                  </button>
                  <button
                    onClick={() => toggleFreezeCard(card.id)}
                    className={`rounded-full p-2 hover:bg-white/10 ${card.frozen ? "text-red-300" : ""}`}
                    title={card.frozen ? "Unfreeze card" : "Freeze card"}
                  >
                    Freeze
                  </button>
                  <button
                    onClick={() => regenerateCard(card.id)}
                    className="rounded-full p-2 hover:bg-white/10"
                    title="Regenerate card"
                  >
                    <FiRefreshCw />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VirtualCardsPage
