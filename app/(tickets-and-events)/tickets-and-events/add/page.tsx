"use client"
import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { FiArrowLeft, FiCalendar, FiDollarSign, FiTag, FiUsers } from "react-icons/fi"
import { ButtonModule } from "components/ui/Button/Button"
import { notify } from "components/ui/Notification/Notification"
import DashboardNav from "components/Navbar/DashboardNav"

interface Event {
  id: string
  title: string
  date: string
  location: string
}

const AddNewTicket: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketName, setTicketName] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isValidPrice, setIsValidPrice] = useState(true)
  const [isValidQuantity, setIsValidQuantity] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [activeField, setActiveField] = useState<"name" | "price" | "quantity" | null>(null)
  const [description, setDescription] = useState("")

  const router = useRouter()
  // const searchParams = useSearchParams()

  // useEffect(() => {
  //   const eventParam = searchParams.get("event")
  //   if (eventParam) {
  //     try {
  //       const parsedEvent = JSON.parse(decodeURIComponent(eventParam)) as Event
  //       setSelectedEvent(parsedEvent)
  //     } catch (e) {
  //       console.error("Failed to parse event from URL", e)
  //     }
  //   }
  // }, [searchParams])

  const handleGoBack = () => {
    router.back()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedEvent) {
      // notify({
      //   type: "error",
      //   title: "No Event Selected",
      //   message: "Please select an event for this ticket",
      // })
      return
    }

    if (!ticketName) {
      // notify({
      //   type: "error",
      //   title: "Ticket Name Required",
      //   message: "Please enter a name for the ticket",
      // })
      return
    }

    if (!price) {
      // notify({
      //   type: "error",
      //   title: "Price Required",
      //   message: "Please enter a price for the ticket",
      // })
      return
    }

    if (!isValidPrice) {
      // notify({
      //   type: "error",
      //   title: "Invalid Price",
      //   message: "Please enter a valid price amount",
      // })
      return
    }

    if (!quantity) {
      // notify({
      //   type: "error",
      //   title: "Quantity Required",
      //   message: "Please enter the quantity available",
      // })
      return
    }

    if (!isValidQuantity) {
      // notify({
      //   type: "error",
      //   title: "Invalid Quantity",
      //   message: "Please enter a valid quantity",
      // })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newTicket = {
        eventId: selectedEvent.id,
        name: ticketName,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        description,
      }

      // notify({
      //   type: "success",
      //   title: "Ticket Created!",
      //   message: `${ticketName} ticket for ${selectedEvent.title}`,
      //   duration: 2000,
      // })

      setTimeout(() => router.push(`/events/${selectedEvent.id}`), 1000)
    } catch (error: any) {
      setError(error.message || "Ticket creation failed. Please try again.")
      // notify({
      //   type: "error",
      //   title: "Creation Failed",
      //   message: error.message || "Please try again",
      // })
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setPrice(value)
      setIsValidPrice(!!value && !isNaN(parseFloat(value)) && parseFloat(value) >= 0)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setQuantity(value)
      setIsValidQuantity(!!value && !isNaN(parseInt(value)) && parseInt(value) > 0)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <DashboardNav />

      <div className="container mx-auto max-w-md px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8 flex items-center">
            <button onClick={handleGoBack} className="mr-4 rounded-full p-2 hover:bg-gray-100">
              <FiArrowLeft className="size-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
              <p className="text-gray-500">Add a ticket type to your event</p>
            </div>
          </div>

          {/* Event Card */}
          {selectedEvent && (
            <motion.div
              className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedEvent.title}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <FiCalendar className="mr-2" />
                    {formatDate(selectedEvent.date)}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <FiUsers className="mr-2" />
                    {selectedEvent.location}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ticket Form */}
          <form onSubmit={handleSubmit}>
            {/* Ticket Name Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Ticket Name</label>
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "name"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("name")}
              >
                <div className="flex items-center">
                  <FiTag className={`mr-2 text-gray-400 ${activeField === "name" ? "text-blue-500" : ""}`} />
                  <input
                    type="text"
                    placeholder="General Admission, VIP, etc."
                    className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    onFocus={() => setActiveField("name")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Price</label>
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "price"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("price")}
              >
                <div className="flex items-center">
                  <FiDollarSign className={`mr-2 text-gray-400 ${activeField === "price" ? "text-blue-500" : ""}`} />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                    value={price}
                    onChange={handlePriceChange}
                    onFocus={() => setActiveField("price")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                  <div className="ml-2 text-sm text-gray-500">USD</div>
                </div>
                {!isValidPrice && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs text-red-500"
                  >
                    Please enter a valid price
                  </motion.p>
                )}
              </div>
            </div>

            {/* Quantity Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Quantity Available</label>
              <div
                className={`relative rounded-xl border p-3 transition-all ${
                  activeField === "quantity"
                    ? "border-blue-500 bg-white ring-2 ring-blue-200"
                    : "border-gray-200 bg-gray-50"
                }`}
                onClick={() => setActiveField("quantity")}
              >
                <div className="flex items-center">
                  <FiUsers className={`mr-2 text-gray-400 ${activeField === "quantity" ? "text-blue-500" : ""}`} />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="100"
                    className="flex-1 bg-transparent text-gray-800 outline-none placeholder:text-gray-400"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onFocus={() => setActiveField("quantity")}
                    onBlur={() => setActiveField(null)}
                    required
                  />
                </div>
                {!isValidQuantity && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-1 text-xs text-red-500"
                  >
                    Please enter a valid quantity (minimum 1)
                  </motion.p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
                placeholder="What's included with this ticket?"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <ButtonModule
                type="submit"
                variant="primary"
                size="lg"
                disabled={
                  loading || !ticketName || !price || !quantity || !isValidPrice || !isValidQuantity || !selectedEvent
                }
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </div>
                ) : (
                  "Create Ticket"
                )}
              </ButtonModule>

              <ButtonModule type="button" variant="outline" size="lg" className="w-full" onClick={handleGoBack}>
                Cancel
              </ButtonModule>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default AddNewTicket
