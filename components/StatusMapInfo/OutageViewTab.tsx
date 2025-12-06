"use client"

import React, { useEffect, useRef, useState } from "react"
import "leaflet/dist/leaflet.css"
import { motion } from "framer-motion"
import CloseIcon from "public/close-icon"
import { useAppDispatch, useAppSelector } from "lib/hooks/useRedux"
import { FormSelectModule } from "components/ui/Input/FormSelectModule"
import {
  fetchStatusMapAssets,
  fetchStatusMapCustomers,
  StatusMapAsset,
  StatusMapCustomer,
} from "lib/redux/statusMapSlice"

const OutageViewTabe = () => {
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedFeeder, setSelectedFeeder] = useState("All Feeders")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All Status")
  const [customersLayerEnabled, setCustomersLayerEnabled] = useState(true)
  const [assetsLayerEnabled, setAssetsLayerEnabled] = useState(true)
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<StatusMapCustomer | null>(null)
  const [selectedAssetDetails, setSelectedAssetDetails] = useState<StatusMapAsset | null>(null)

  const paymentStatusOptions = ["All Status", "Paid", "Unpaid", "Partial"]

  type Customer = {
    id: number
    position: [number, number]
    state: string
    feeder: string
    status: "Paid" | "Unpaid" | "Partial"
  }

  type Asset = {
    id: number
    position: [number, number]
    type: string
    name: string
  }

  const nigeriaCenter: [number, number] = [9.082, 8.6753]

  const dispatch = useAppDispatch()
  const {
    customers: statusMapCustomers,
    assets: statusMapAssets,
    hasNext,
    currentPage,
    assetsHasNext,
    assetsCurrentPage,
  } = useAppSelector((state) => state.statusMap)

  const assets: Asset[] = statusMapAssets
    .filter(
      (asset: StatusMapAsset) =>
        typeof asset.latitude === "number" &&
        typeof asset.longitude === "number" &&
        !Number.isNaN(asset.latitude) &&
        !Number.isNaN(asset.longitude)
    )
    .map((asset: StatusMapAsset) => ({
      id: asset.id,
      position: [asset.latitude, asset.longitude],
      type: asset.type,
      name: asset.name,
    }))

  const getAssetIcon = (type: Asset["type"]) => {
    const normalizedType = type.toLowerCase()
    const effectiveType = normalizedType === "substation" ? "transformer" : normalizedType

    switch (effectiveType) {
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
      default:
        return assetIcon(
          '<span style="display:inline-flex;width:60px;height:60px;align-items:center;justify-content:center">🏢</span>'
        )
    }
  }

  const stateOptions = [
    "All States",
    ...Array.from(new Set(statusMapCustomers.map((c: StatusMapCustomer) => c.state))).sort(),
  ]

  const feederOptions = [
    "All Feeders",
    ...Array.from(new Set(statusMapCustomers.map((c: StatusMapCustomer) => c.feederName))).sort(),
  ]

  const dot = (color: string) =>
    LRef.current!.divIcon({
      html: `<span style="background:${color};width:16px;height:16px;border-radius:50%;display:block;border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,.4)"></span>`,
      className: "",
      iconSize: [16, 16],
    })

  const getCustomerIcon = (status: "Paid" | "Unpaid" | "Partial") => {
    const colorMap: Record<"Paid" | "Unpaid" | "Partial", string> = {
      Paid: "#22c55e",
      Unpaid: "#ef4444",
      Partial: "#f59e0b",
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
      const transformedCustomers: Customer[] = statusMapCustomers
        .filter(
          (cust: StatusMapCustomer) =>
            typeof cust.latitude === "number" &&
            typeof cust.longitude === "number" &&
            !Number.isNaN(cust.latitude) &&
            !Number.isNaN(cust.longitude)
        )
        .map((cust: StatusMapCustomer) => {
          let status: Customer["status"] = "Paid"

          // Map numeric status enum to string used by markers/filters
          // { Unknown = 0, Paid = 1, Unpaid = 2, Partial = 3 }
          if (cust.status === 2) status = "Unpaid"
          else if (cust.status === 3) status = "Partial"
          else if (cust.status === 1) status = "Paid"

          return {
            id: cust.id,
            position: [cust.latitude, cust.longitude],
            state: cust.state,
            feeder: cust.feederName,
            status,
          }
        })

      const filtered = transformedCustomers.filter((cust) => {
        const stateOk = selectedState === "All States" || cust.state === selectedState
        const feederOk = selectedFeeder === "All Feeders" || cust.feeder === selectedFeeder
        const statusOk = selectedPaymentStatus === "All Status" || cust.status === selectedPaymentStatus
        return stateOk && feederOk && statusOk
      })

      filtered.forEach((c) => {
        const icon = getCustomerIcon(c.status)
        const marker = LRef.current
          .marker(c.position, { icon })
          .bindPopup(
            `<div class="space-y-1"><div class="font-semibold">${c.state}</div><div class="text-xs">${c.feeder}</div><div class="text-xs">Status: ${c.status}</div></div>`
          )
          .addTo(customersGroupRef.current!)

        marker.on("click", () => {
          const fullDetails = statusMapCustomers.find((cust: StatusMapCustomer) => cust.id === c.id) || null
          setSelectedCustomerDetails(fullDetails)
        })
      })
    }

    if (assetsLayerEnabled) {
      assets.forEach((a) => {
        const icon = getAssetIcon(a.type)
        const marker = LRef.current
          .marker(a.position, { icon })
          .bindPopup(
            `<div class="space-y-1"><div class="font-semibold capitalize">${
              a.name || a.type
            }</div><div class="text-xs">Lat: ${a.position[0].toFixed(2)}, Lng: ${a.position[1].toFixed(2)}</div></div>`
          )
          .addTo(assetsGroupRef.current!)

        marker.on("click", () => {
          const fullDetails = statusMapAssets.find((asset: StatusMapAsset) => asset.id === a.id) || null
          setSelectedAssetDetails(fullDetails)
        })
      })
    }
  }

  useEffect(() => {
    dispatch(
      fetchStatusMapCustomers({
        query: {
          pageNumber: 1,
          pageSize: 100,
        },
        body: {
          state: "",
          feederId: 0,
          paymentStatus: 0,
          salesRepUserId: 0,
        },
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!hasNext) return

    const intervalId = setInterval(() => {
      dispatch(
        fetchStatusMapCustomers({
          query: {
            pageNumber: currentPage + 1,
            pageSize: 100,
          },
          body: {
            state: "",
            feederId: 0,
            paymentStatus: 0,
            salesRepUserId: 0,
          },
        })
      )
    }, 5000)

    return () => clearInterval(intervalId)
  }, [dispatch, hasNext, currentPage])

  useEffect(() => {
    dispatch(
      fetchStatusMapAssets({
        query: {
          nameDescription: "",
          pageNumber: 1,
          pageSize: 100,
        },
        body: {
          feederId: 0,
          areaOfficeId: 0,
        },
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (!assetsHasNext) return

    const intervalId = setInterval(() => {
      dispatch(
        fetchStatusMapAssets({
          query: {
            nameDescription: "",
            pageNumber: assetsCurrentPage + 1,
            pageSize: 100,
          },
          body: {
            feederId: 0,
            areaOfficeId: 0,
          },
        })
      )
    }, 5000)

    return () => clearInterval(intervalId)
  }, [dispatch, assetsHasNext, assetsCurrentPage])

  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (!mapRef.current && mapDivRef.current) {
        const Leaflet = await import("leaflet")
        const L = Leaflet.default ?? Leaflet
        if (!mounted) return
        LRef.current = L
        const map = L.map(mapDivRef.current, { zoomControl: true }).setView(nigeriaCenter, 7)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map)

        if (map.getPanes && map.getPanes().tilePane) {
          map.getPanes().tilePane.style.filter = "grayscale(100%)"
        }
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
  }, [
    selectedState,
    selectedFeeder,
    selectedPaymentStatus,
    customersLayerEnabled,
    assetsLayerEnabled,
    statusMapCustomers,
    statusMapAssets,
  ])

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
              <FormSelectModule
                label="State"
                name="state"
                value={selectedState}
                onChange={(e) => setSelectedState(String(e.target.value))}
                options={stateOptions.map((option) => ({ value: option, label: option }))}
              />
            </div>

            <div>
              <FormSelectModule
                label="Feeder"
                name="feeder"
                value={selectedFeeder}
                onChange={(e) => setSelectedFeeder(String(e.target.value))}
                options={feederOptions.map((option) => ({ value: option, label: option }))}
              />
            </div>

            <div>
              <FormSelectModule
                label="Payment Status"
                name="paymentStatus"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(String(e.target.value))}
                options={paymentStatusOptions.map((option) => ({ value: option, label: option }))}
              />
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
                    <span className="inline-block size-3 rounded-full bg-gray-500"></span>
                    <span>Unknown</span>
                  </div>
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
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Assets</h4>
                <div className="space-y-1 text-xs">
                  {/* <div className="flex items-center gap-2">
                    <span className="inline-flex size-4 items-center justify-center text-yellow-400">⚡</span>
                    <span>Feeder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-4 items-center justify-center">🏭</span>
                    <span>Substation</span>
                  </div> */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-4 items-center justify-center">🔌</span>
                    <span>Transformer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-4 items-center justify-center">🏢</span>
                    <span>Service Center</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedCustomerDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex justify-end bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedCustomerDetails(null)}
        >
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden rounded-l-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b bg-[#F9F9F9] p-4">
              <h2 className="text-base font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setSelectedCustomerDetails(null)}
                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs">
              <div className="mb-4 space-y-1">
                <div className="text-sm font-semibold">{selectedCustomerDetails.fullName}</div>
                <div className="text-gray-500">{selectedCustomerDetails.accountNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div
                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      selectedCustomerDetails.status === 1
                        ? "bg-green-100 text-green-700"
                        : selectedCustomerDetails.status === 2
                        ? "bg-red-100 text-red-700"
                        : selectedCustomerDetails.status === 3
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedCustomerDetails.status === 0
                      ? "Unknown"
                      : selectedCustomerDetails.status === 1
                      ? "Paid"
                      : selectedCustomerDetails.status === 2
                      ? "Unpaid"
                      : selectedCustomerDetails.status === 3
                      ? "Partial"
                      : "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Outstanding</div>
                  <div className="">{selectedCustomerDetails.outstanding}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">State</div>
                  <div className="">{selectedCustomerDetails.state}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">City / LGA</div>
                  <div className="">
                    {selectedCustomerDetails.city}, {selectedCustomerDetails.lga}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Feeder</div>
                  <div className="">{selectedCustomerDetails.feederName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Substation</div>
                  <div className="">{selectedCustomerDetails.distributionSubstationCode}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Service Center</div>
                  <div className="">{selectedCustomerDetails.serviceCenterName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Sales Rep</div>
                  <div className="">{selectedCustomerDetails.salesRepName}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {selectedAssetDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex justify-end bg-black/30 backdrop-blur-sm"
          onClick={() => setSelectedAssetDetails(null)}
        >
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative flex h-full w-full max-w-md flex-col overflow-hidden rounded-l-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b bg-[#F9F9F9] p-4">
              <h2 className="text-base font-bold text-gray-900">Asset Details</h2>
              <button
                onClick={() => setSelectedAssetDetails(null)}
                className="flex size-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs">
              <div className="mb-4 space-y-1">
                <div className="text-sm font-semibold">{selectedAssetDetails.name}</div>
                <div className="capitalize text-gray-500">
                  {selectedAssetDetails.type.toLowerCase() === "substation" ? "Transformer" : selectedAssetDetails.type}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Feeder</div>
                  <div className="">{selectedAssetDetails.feederName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Area Office</div>
                  <div className="">{selectedAssetDetails.areaOfficeName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Latitude</div>
                  <div className="">{selectedAssetDetails.latitude}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Longitude</div>
                  <div className="">{selectedAssetDetails.longitude}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default OutageViewTabe
