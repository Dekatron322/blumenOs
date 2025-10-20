"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { animate, motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion"
import { FiCopy, FiEye, FiEyeOff, FiPlus, FiRefreshCw, FiShare2, FiX } from "react-icons/fi"
import { TbWaveSawTool } from "react-icons/tb"
import { RiVisaLine } from "react-icons/ri"
import { SiMastercard } from "react-icons/si"
import DashboardNav from "components/Navbar/DashboardNav"

type GradientKey = "gradient-1" | "gradient-2" | "gradient-3" | "gradient-4"

const cardGradients: Record<GradientKey, string> = {
  "gradient-1": "from-purple-500 via-pink-500 to-rose-500",
  "gradient-2": "from-emerald-500 via-teal-500 to-cyan-500",
  "gradient-3": "from-amber-500 via-orange-500 to-red-500",
  "gradient-4": "from-indigo-500 via-blue-500 to-violet-500",
}

const VirtualCardPage = () => {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  const [cardDetails, setCardDetails] = useState({
    number: "•••• •••• •••• 4242",
    fullNumber: "4242424242424242",
    cvv: "•••",
    fullCvv: "123",
    expiry: "••/••",
    fullExpiry: "12/28",
    name: "ALEX JOHNSON",
    type: "visa",
    balance: 12500.42,
    currency: "USD",
    frozen: false,
    color: "gradient-1" as GradientKey,
  })

  const [showDetails, setShowDetails] = useState(false)
  const [transactions] = useState([
    { id: 1, merchant: "Amazon", amount: -42.99, date: "2023-06-15", category: "shopping", icon: "🛍️" },
    { id: 2, merchant: "Starbucks", amount: -5.75, date: "2023-06-14", category: "food", icon: "☕" },
    { id: 3, merchant: "Spotify", amount: -9.99, date: "2023-06-10", category: "entertainment", icon: "🎵" },
    { id: 4, merchant: "Deposit", amount: 2000.0, date: "2023-06-05", category: "transfer", icon: "💸" },
    { id: 5, merchant: "Uber", amount: -23.5, date: "2023-06-03", category: "transport", icon: "🚗" },
  ])

  // 3D Tilt Effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])
  const gradientPosition = useTransform(x, [-200, 200], ["0% 100%", "100% 0%"])
  const background = useMotionTemplate`radial-gradient(circle at ${gradientPosition}, var(--tw-gradient-stops))`

  // Animated balance counter
  useEffect(() => {
    const animation = animate(0, cardDetails.balance, {
      duration: 1.5,
      onUpdate: (latest) => {
        setCardDetails((prev) => ({
          ...prev,
          balance: parseFloat(latest.toFixed(2)),
        }))
      },
    })
    return () => animation.stop()
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    animate(x, 0, { duration: 0.5 })
    animate(y, 0, { duration: 0.5 })
  }

  const toggleCardDetails = () => {
    setShowDetails(!showDetails)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const regenerateCard = () => {
    setTimeout(() => {
      setCardDetails((prev) => ({
        ...prev,
        fullNumber: "5555666677778888",
        number: "•••• •••• •••• 8888",
        fullCvv: "456",
        cvv: "•••",
        fullExpiry: "09/25",
        expiry: "••/••",
      }))
    }, 1500)
  }

  const changeCardColor = (color: GradientKey) => {
    setCardDetails({ ...cardDetails, color })
  }

  const freezeCard = () => {
    setCardDetails({ ...cardDetails, frozen: !cardDetails.frozen })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-[#ffffff]">
      <DashboardNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#003f9f]">Virtual Cards</h1>
            <p className="text-black">Manage your digital payment cards</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 transition-colors hover:bg-indigo-700">
            <FiPlus /> New Card
          </button>
        </div>

        {/* 3D Card */}
        <div className="mb-12 flex justify-center">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, background, transformPerspective: 1000 }}
            className={`h-56 w-full max-w-md rounded-2xl bg-gradient-to-br p-6 shadow-2xl ${
              cardGradients[cardDetails.color]
            } relative overflow-hidden`}
          >
            {/* Card holographic effect */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute left-0 top-0 size-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
            </div>

            {/* Card issuer logo */}
            <div className="mb-8 flex items-start justify-between">
              <div className="text-2xl font-bold">CRYPTOBANK</div>
              {cardDetails.type === "visa" ? (
                <RiVisaLine className="text-3xl" />
              ) : (
                <SiMastercard className="text-3xl" />
              )}
            </div>

            {/* Card number */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="text-xl tracking-widest">
                  {showDetails ? (
                    <span className="font-mono">{cardDetails.fullNumber.match(/.{1,4}/g)?.join(" ")}</span>
                  ) : (
                    cardDetails.number
                  )}
                </div>
                <button onClick={toggleCardDetails} className="rounded-full p-1 hover:bg-white/10">
                  {showDetails ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Card bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-1 text-xs text-white/80">Card Holder</div>
                <div className="text-sm font-medium">{cardDetails.name}</div>
              </div>
              <div className="text-right">
                <div className="mb-1 text-xs text-white/80">Expires</div>
                <div className="text-sm font-medium">{showDetails ? cardDetails.fullExpiry : cardDetails.expiry}</div>
              </div>
              <div>
                <div className="mb-1 text-xs text-white/80">CVV</div>
                <div className="text-sm font-medium">{showDetails ? cardDetails.fullCvv : cardDetails.cvv}</div>
              </div>
            </div>

            {/* Dynamic wave pattern */}
            <div className="absolute bottom-0 left-0 h-12 w-full overflow-hidden">
              <TbWaveSawTool className="absolute -bottom-4 left-0 h-12 w-full text-white/10" />
            </div>
          </motion.div>
        </div>

        {/* Card Controls */}
        <div className="mb-2 grid grid-cols-2 gap-4 md:grid-cols-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleCardDetails}
            className="flex flex-col items-center gap-2 rounded-xl bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            {showDetails ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            <span>{showDetails ? "Hide" : "Show"} Details</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={freezeCard}
            className="flex flex-col items-center gap-2 rounded-xl bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            {cardDetails.frozen ? (
              <>
                <FiRefreshCw size={20} />
                <span>Unfreeze</span>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-red-500 opacity-75 blur"></div>
                  <FiX size={20} className="relative" />
                </div>
                <span>Freeze</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={regenerateCard}
            className="flex flex-col items-center gap-2 rounded-xl bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <FiRefreshCw size={20} />
            <span>Regenerate</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => copyToClipboard(cardDetails.fullNumber)}
            className="flex flex-col items-center gap-2 rounded-xl bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <FiCopy size={20} />
            <span>Copy Number</span>
          </motion.button>
        </div>

        {/* Card Customization */}
        <div className="mb-12">
          <h2 className="mb-4 text-xl font-bold">Card Design</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.keys(cardGradients).map((gradient) => (
              <motion.div
                key={gradient}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => changeCardColor(gradient as GradientKey)}
                className={`h-24 cursor-pointer rounded-xl bg-gradient-to-br ${
                  cardGradients[gradient as GradientKey]
                } ${cardDetails.color === gradient ? "ring-4 ring-white/50" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Balance and Transactions */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Balance Card */}
          <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold">Balance</h2>
            <div className="mb-2 text-3xl font-bold">
              {cardDetails.currency} {cardDetails.balance.toLocaleString()}
            </div>
            <div className="text-sm text-green-400">+2.5% from last month</div>
            <div className="mt-6 space-y-4">
              <button className="w-full rounded-lg bg-indigo-600 py-2 transition-colors hover:bg-indigo-700">
                Add Funds
              </button>
              <button className="w-full rounded-lg bg-gray-700 py-2 transition-colors hover:bg-gray-600">
                Transfer Out
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-2xl border border-[#003f9f] bg-[#FFFFFF] p-6 backdrop-blur-sm md:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <button className="flex items-center gap-1 text-sm text-[#003f9f] hover:text-[#003f9f]">
                <FiShare2 size={16} /> Export
              </button>
            </div>
            <div className="space-y-4">
              {transactions.map((txn) => (
                <motion.div
                  key={txn.id}
                  whileHover={{ x: 5 }}
                  className="flex items-center rounded-lg p-3 transition-colors hover:bg-[#E9F0FF]"
                >
                  <div className="mr-4 flex size-10 items-center justify-center rounded-full bg-gray-700 text-xl">
                    {txn.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{txn.merchant}</div>
                    <div className="text-sm capitalize text-gray-400">{txn.category}</div>
                  </div>
                  <div className={`font-mono ${txn.amount > 0 ? "text-green-400" : "text-[#D82E2E]"}`}>
                    {txn.amount > 0 ? "+" : ""}
                    {txn.amount.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-lg border border-dashed border-gray-600 py-2 text-indigo-400 transition-colors hover:border-indigo-500 hover:text-indigo-300">
              View All Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VirtualCardPage
