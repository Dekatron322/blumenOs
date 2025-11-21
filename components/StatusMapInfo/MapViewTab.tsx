"use client"

import React, { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"

const MapViewTab = () => {
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [feederDropdownOpen, setFeederDropdownOpen] = useState(false)
  const [paymentStatusDropdownOpen, setPaymentStatusDropdownOpen] = useState(false)
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedFeeder, setSelectedFeeder] = useState("All Feeders")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All Status")
  const [customersLayerEnabled, setCustomersLayerEnabled] = useState(true)
  const [assetsLayerEnabled, setAssetsLayerEnabled] = useState(true)

  const paymentStatusOptions = ["All Status", "Paid", "Unpaid", "Partial", "Unknown"]

  type Customer = {
    id: number
    position: [number, number]
    state: string
    feeder: string
    status: "Paid" | "Unpaid" | "Partial" | "Unknown"
  }

  type Asset = {
    id: number
    position: [number, number]
    type: "feeder" | "substation" | "transformer" | "service"
  }

  const nigeriaCenter: [number, number] = [9.082, 8.6753]

  const customers: Customer[] = [
    { id: 1, position: [10.52, 7.44], state: "Kaduna", feeder: "Feeder 1", status: "Paid" },
    { id: 2, position: [10.54, 7.46], state: "Kaduna", feeder: "Feeder 2", status: "Unpaid" },
    { id: 3, position: [10.5, 7.42], state: "Kaduna", feeder: "Feeder 3", status: "Partial" },
    { id: 4, position: [12.0, 8.52], state: "Kano", feeder: "Feeder 1", status: "Unknown" },
    { id: 5, position: [12.03, 8.55], state: "Kano", feeder: "Feeder 2", status: "Paid" },
    { id: 6, position: [12.02, 8.5], state: "Kano", feeder: "Feeder 3", status: "Unpaid" },
    { id: 7, position: [9.07, 7.49], state: "Abuja", feeder: "Feeder 1", status: "Partial" },
    { id: 8, position: [9.05, 7.52], state: "Abuja", feeder: "Feeder 2", status: "Paid" },
  ]

  const assets: Asset[] = [
    { id: 1, position: [10.52, 7.44], type: "feeder" },
    { id: 2, position: [10.54, 7.46], type: "feeder" },
    { id: 3, position: [10.5, 7.42], type: "feeder" },
    { id: 4, position: [12.0, 8.52], type: "feeder" },
    { id: 5, position: [12.03, 8.55], type: "feeder" },
    { id: 6, position: [9.07, 7.49], type: "feeder" },
    { id: 7, position: [9.05, 7.52], type: "feeder" },

    { id: 8, position: [10.55, 7.4], type: "transformer" },
    { id: 9, position: [10.48, 7.45], type: "transformer" },
    { id: 10, position: [12.02, 8.5], type: "transformer" },
    { id: 11, position: [12.01, 8.56], type: "transformer" },
    { id: 12, position: [9.06, 7.47], type: "transformer" },

    { id: 13, position: [10.56, 7.47], type: "substation" },
    { id: 14, position: [10.51, 7.38], type: "substation" },
    { id: 15, position: [11.98, 8.48], type: "substation" },
    { id: 16, position: [12.04, 8.53], type: "substation" },
    { id: 17, position: [9.08, 7.52], type: "substation" },

    { id: 18, position: [10.53, 7.43], type: "service" },
    { id: 19, position: [12.05, 8.55], type: "service" },
    { id: 20, position: [9.09, 7.51], type: "service" },
    { id: 21, position: [9.1, 7.53], type: "service" },
  ]

  const getAssetIcon = (type: Asset["type"]) => {
    switch (type) {
      case "feeder":
        return assetIcon(
          '<span style="display:inline-flex;width:60px;height:60px;align-items:center;justify-content:center;color:#facc15">⚡</span>'
        )
      case "substation":
        return assetIcon(
          '<span style="display:inline-flex;width:60px;height:60px;align-items:center;justify-content:center">🏭</span>'
        )
      case "transformer":
        return assetIcon(
          '<span style="display:inline-flex;width:60px;height:60px;align-items:center;justify-content:center">🔌</span>'
        )
      case "service":
        return assetIcon(
          '<span style="display:inline-flex;width:60px;height:60px;align-items:center;justify-content:center">🏢</span>'
        )
    }
  }

  const stateOptions = ["All States", ...Array.from(new Set(customers.map((c) => c.state))).sort()]
  const feederOptions = ["All Feeders", ...Array.from(new Set(customers.map((c) => c.feeder))).sort()]

  const dot = (color: string) =>
    LRef.current!.divIcon({
      html: `<span style="background:${color};width:16px;height:16px;border-radius:50%;display:block;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,.4)"></span>`,
      className: "",
      iconSize: [16, 16],
    })

  const getCustomerIcon = (status: "Paid" | "Unpaid" | "Partial" | "Unknown") => {
    const colorMap: Record<"Paid" | "Unpaid" | "Partial" | "Unknown", string> = {
      Paid: "#22c55e",
      Unpaid: "#ef4444",
      Partial: "#f59e0b",
      Unknown: "#6b7280",
    }
    return dot(colorMap[status])
  }

  const assetIcon = (html: string) => LRef.current?.divIcon({ html, className: "", iconSize: [60, 60] })

  const mapDivRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const customersGroupRef = useRef<any>(null)
  const assetsGroupRef = useRef<any>(null)
  const LRef = useRef<any>(null)

  const renderLayers = () => {
    if (!LRef.current || !mapRef.current) return
    customersGroupRef.current?.clearLayers()
    assetsGroupRef.current?.clearLayers()

    if (customersLayerEnabled) {
      const filtered = customers.filter((cust) => {
        const stateOk = selectedState === "All States" || cust.state === selectedState
        const feederOk = selectedFeeder === "All Feeders" || cust.feeder === selectedFeeder
        const statusOk = selectedPaymentStatus === "All Status" || cust.status === selectedPaymentStatus
        return stateOk && feederOk && statusOk
      })

      filtered.forEach((c) => {
        const icon = getCustomerIcon(c.status)
        LRef.current
          .marker(c.position, { icon })
          .bindPopup(
            `<div class="space-y-1"><div class="font-semibold">${c.state}</div><div class="text-xs">${c.feeder}</div><div class="text-xs">Status: ${c.status}</div></div>`
          )
          .addTo(customersGroupRef.current!)
      })
    }

    if (assetsLayerEnabled) {
      assets.forEach((a) => {
        const icon = getAssetIcon(a.type)
        LRef.current
          .marker(a.position, { icon })
          .bindPopup(
            `<div class="space-y-1"><div class="font-semibold capitalize">${
              a.type
            }</div><div class="text-xs">Lat: ${a.position[0].toFixed(2)}, Lng: ${a.position[1].toFixed(2)}</div></div>`
          )
          .addTo(assetsGroupRef.current!)
      })
    }
  }

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (!mapRef.current && mapDivRef.current) {
        const Leaflet = await import("leaflet")
        const L = Leaflet.default ?? Leaflet
        if (!mounted) return
        LRef.current = L
        const map = L.map(mapDivRef.current, { zoomControl: true }).setView(nigeriaCenter, 6)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map)
        mapRef.current = map
        customersGroupRef.current = L.layerGroup().addTo(map)
        assetsGroupRef.current = L.layerGroup().addTo(map)
        renderLayers()
      }
    }
    init()
    return () => {
      mounted = false
      mapRef.current?.remove()
      mapRef.current = null
      customersGroupRef.current = null
      assetsGroupRef.current = null
      LRef.current = null
    }
  }, [])

  useEffect(() => {
    renderLayers()
  }, [selectedState, selectedFeeder, selectedPaymentStatus, customersLayerEnabled, assetsLayerEnabled])

  const handleReset = () => {
    setSelectedState("All States")
    setSelectedFeeder("All Feeders")
    setSelectedPaymentStatus("All Status")
  }

  return (
    <div className="flex gap-6">
      {/* Left Control Panel */}
      <div className="w-80 shrink-0 space-y-6">
        {/* Filters Section */}
        <div className="rounded-md border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button onClick={handleReset} className="text-sm text-blue-600 hover:text-blue-800">
              Reset
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">State</label>
              <div className="mt-3">
                <div
                  className="modal-style relative h-[46px] w-full cursor-pointer rounded-lg border px-3 focus-within:border-[#1B5EED4D] focus-within:bg-[#FBFAFC] max-sm:mb-2"
                  onClick={() => {
                    setStateDropdownOpen(!stateDropdownOpen)
                    setFeederDropdownOpen(false)
                    setPaymentStatusDropdownOpen(false)
                  }}
                >
                  <div className="flex h-[46px] items-center justify-between">
                    <span className="text-sm">{selectedState}</span>
                    <svg
                      className={`size-4 transition-transform ${stateDropdownOpen ? "rotate-180" : ""} text-black`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12a1 1 0 01-.707-.293l-6-6a1 1 0 011.414-1.414L10 9.586l5.293-5.293A1 1 0 0117.707 5.293l-6 6A1 1 0 0110 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {stateDropdownOpen && (
                    <div className="modal-style absolute left-0 top-[50px] z-10 w-full rounded-lg border border-[#FFFFFF1A] shadow-lg">
                      {stateOptions.map((option) => (
                        <div
                          key={option}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-[#1B5EED4D] ${
                            selectedState === option ? "bg-[#1B5EED4D]" : ""
                          }`}
                          onClick={() => {
                            setSelectedState(option)
                            setStateDropdownOpen(false)
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Feeder</label>
              <div className="mt-3">
                <div
                  className="modal-style relative h-[46px] w-full cursor-pointer rounded-lg border px-3 focus-within:border-[#1B5EED4D] focus-within:bg-[#FBFAFC] max-sm:mb-2"
                  onClick={() => {
                    setFeederDropdownOpen(!feederDropdownOpen)
                    setStateDropdownOpen(false)
                    setPaymentStatusDropdownOpen(false)
                  }}
                >
                  <div className="flex h-[46px] items-center justify-between">
                    <span className="text-sm">{selectedFeeder}</span>
                    <svg
                      className={`size-4 transition-transform ${feederDropdownOpen ? "rotate-180" : ""} text-black`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12a1 1 0 01-.707-.293l-6-6a1 1 0 011.414-1.414L10 9.586l5.293-5.293A1 1 0 0117.707 5.293l-6 6A1 1 0 0110 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {feederDropdownOpen && (
                    <div className="modal-style absolute left-0 top-[50px] z-10 w-full rounded-lg border border-[#FFFFFF1A] shadow-lg">
                      {feederOptions.map((option) => (
                        <div
                          key={option}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-[#1B5EED4D] ${
                            selectedFeeder === option ? "bg-[#1B5EED4D]" : ""
                          }`}
                          onClick={() => {
                            setSelectedFeeder(option)
                            setFeederDropdownOpen(false)
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Payment Status</label>
              <div className="mt-3">
                <div
                  className="modal-style relative h-[46px] w-full cursor-pointer rounded-lg border px-3 focus-within:border-[#1B5EED4D] focus-within:bg-[#FBFAFC] max-sm:mb-2"
                  onClick={() => {
                    setPaymentStatusDropdownOpen(!paymentStatusDropdownOpen)
                    setStateDropdownOpen(false)
                    setFeederDropdownOpen(false)
                  }}
                >
                  <div className="flex h-[46px] items-center justify-between">
                    <span className="text-sm">{selectedPaymentStatus}</span>
                    <svg
                      className={`size-4 transition-transform ${
                        paymentStatusDropdownOpen ? "rotate-180" : ""
                      } text-black`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12a1 1 0 01-.707-.293l-6-6a1 1 0 011.414-1.414L10 9.586l5.293-5.293A1 1 0 0117.707 5.293l-6 6A1 1 0 0110 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {paymentStatusDropdownOpen && (
                    <div className="modal-style absolute left-0 top-[50px] z-10 w-full rounded-lg border border-[#FFFFFF1A] shadow-lg">
                      {paymentStatusOptions.map((option) => (
                        <div
                          key={option}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-[#1B5EED4D] ${
                            selectedPaymentStatus === option ? "bg-[#1B5EED4D]" : ""
                          }`}
                          onClick={() => {
                            setSelectedPaymentStatus(option)
                            setPaymentStatusDropdownOpen(false)
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Layers Section */}
        <div className="rounded-md border bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold">Map Layers</h3>

          <div className="space-y-4">
            {/* Customers Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Customers</label>
              <button
                onClick={() => setCustomersLayerEnabled(!customersLayerEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  customersLayerEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${
                    customersLayerEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Assets Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Assets</label>
              <button
                onClick={() => setAssetsLayerEnabled(!assetsLayerEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  assetsLayerEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform ${
                    assetsLayerEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Map Area */}
      <div className="relative flex-1 rounded-md border bg-white">
        {/* Map Display */}
        <div className="relative h-[600px] w-full overflow-hidden rounded-md bg-gray-100">
          {/* Map Placeholder - In a real app, this would be a map component */}
          <div ref={mapDivRef} className="h-[600px] w-full rounded-md" />

          {/* Map Controls */}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] rounded-md border bg-white p-4 shadow-lg">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Legend</h3>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Customers</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-3 rounded-full bg-green-500"></span>
                    <span>Paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-3 rounded-full bg-red-500"></span>
                    <span>Unpaid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-3 rounded-full bg-amber-500"></span>
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block size-3 rounded-full bg-gray-500"></span>
                    <span>Unknown</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Assets</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center text-yellow-400">⚡</span>
                    <span>Feeder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center">🏭</span>
                    <span>Substation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center">🔌</span>
                    <span>Transformer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 items-center justify-center">🏢</span>
                    <span>Service Center</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapViewTab
