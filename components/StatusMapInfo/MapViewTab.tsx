"use client"

import React, { useState } from "react"

const MapViewTab = () => {
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [feederDropdownOpen, setFeederDropdownOpen] = useState(false)
  const [paymentStatusDropdownOpen, setPaymentStatusDropdownOpen] = useState(false)
  const [selectedState, setSelectedState] = useState("All States")
  const [selectedFeeder, setSelectedFeeder] = useState("All Feeders")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All Status")
  const [customersLayerEnabled, setCustomersLayerEnabled] = useState(true)
  const [assetsLayerEnabled, setAssetsLayerEnabled] = useState(true)

  const stateOptions = ["All States", "Lagos", "Abuja", "Kano", "Rivers", "Ogun"]
  const feederOptions = ["All Feeders", "Feeder 1", "Feeder 2", "Feeder 3", "Feeder 4"]
  const paymentStatusOptions = ["All Status", "Paid", "Unpaid", "Partial", "Unknown"]

  const handleReset = () => {
    setSelectedState("All States")
    setSelectedFeeder("All Feeders")
    setSelectedPaymentStatus("All Status")
  }

  return (
    <div className="flex gap-6">
      {/* Left Control Panel */}
      <div className="w-80 flex-shrink-0 space-y-6">
        {/* Filters Section */}
        <div className="rounded-md border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">State</label>
              <div className="mt-3">
                <div
                  className="relative h-[46px] w-full cursor-pointer rounded-lg border px-3 max-sm:mb-2 modal-style border focus-within:border-[#1B5EED4D] focus-within:bg-[#FBFAFC]"
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
                  className="relative h-[46px] w-full cursor-pointer rounded-lg border px-3 max-sm:mb-2 modal-style border focus-within:border-[#1B5EED4D] focus-within:bg-[#FBFAFC]"
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
                  className="relative h-[46px] w-full cursor-pointer rounded-lg border px-3 max-sm:mb-2 modal-style border focus-within:border-[#1B5EED4D] focus-within:bg-[#FBFAFC]"
                  onClick={() => {
                    setPaymentStatusDropdownOpen(!paymentStatusDropdownOpen)
                    setStateDropdownOpen(false)
                    setFeederDropdownOpen(false)
                  }}
                >
                  <div className="flex h-[46px] items-center justify-between">
                    <span className="text-sm">{selectedPaymentStatus}</span>
                    <svg
                      className={`size-4 transition-transform ${paymentStatusDropdownOpen ? "rotate-180" : ""} text-black`}
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
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
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
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
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
          <svg
            viewBox="0 0 1000 600"
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background - Simplified world map focusing on West Africa */}
            <rect width="1000" height="600" fill="#e5e7eb" />
            
            {/* Water bodies */}
            <path
              d="M0,0 L1000,0 L1000,600 L0,600 Z M200,150 Q300,200 400,150 T600,150 L800,200 L850,350 L700,500 L400,550 L200,500 Z"
              fill="#cbd5e1"
            />
            
            {/* Land areas - Simplified West Africa */}
            <path
              d="M200,150 Q300,100 400,150 T600,150 L800,200 L850,350 L700,500 L400,550 L200,500 Z"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            
            {/* Feeder Zones - Green/Red gradients based on collection rate */}
            {customersLayerEnabled && (
              <>
                <ellipse cx="400" cy="300" rx="80" ry="60" fill="rgba(34,197,94,0.3)" />
                <ellipse cx="500" cy="280" rx="70" ry="50" fill="rgba(34,197,94,0.4)" />
                <ellipse cx="600" cy="320" rx="90" ry="70" fill="rgba(239,68,68,0.3)" />
                <ellipse cx="450" cy="400" rx="60" ry="50" fill="rgba(34,197,94,0.5)" />
              </>
            )}
            
            {/* Customer markers */}
            {customersLayerEnabled && (
              <>
                {/* Paid customers - Green dots */}
                <circle cx="380" cy="290" r="4" fill="#22c55e" />
                <circle cx="420" cy="310" r="4" fill="#22c55e" />
                <circle cx="480" cy="270" r="4" fill="#22c55e" />
                <circle cx="520" cy="290" r="4" fill="#22c55e" />
                <circle cx="440" cy="390" r="4" fill="#22c55e" />
                
                {/* Unpaid customers - Red dots */}
                <circle cx="580" cy="310" r="4" fill="#ef4444" />
                <circle cx="620" cy="330" r="4" fill="#ef4444" />
                <circle cx="590" cy="350" r="4" fill="#ef4444" />
                
                {/* Partial customers - Orange dots */}
                <circle cx="350" cy="350" r="4" fill="#f97316" />
                <circle cx="470" cy="360" r="4" fill="#f97316" />
                
                {/* Unknown customers - Grey dots */}
                <circle cx="300" cy="280" r="4" fill="#6b7280" />
              </>
            )}
            
            {/* Asset markers */}
            {assetsLayerEnabled && (
              <>
                {/* Feeder - Yellow lightning */}
                <g transform="translate(500, 250)">
                  <path
                    d="M0,-10 L5,0 L2,0 L7,10 L2,10 L-3,0 L0,0 Z"
                    fill="#eab308"
                    stroke="#ca8a04"
                    strokeWidth="1"
                  />
                </g>
                
                {/* Substation - Grey building */}
                <g transform="translate(450, 350)">
                  <rect x="-8" y="-6" width="16" height="12" fill="#6b7280" />
                  <rect x="-6" y="-4" width="4" height="3" fill="#9ca3af" />
                  <rect x="2" y="-4" width="4" height="3" fill="#9ca3af" />
                </g>
                
                {/* Transformer - Brown */}
                <g transform="translate(550, 400)">
                  <rect x="-6" y="-8" width="12" height="16" fill="#92400e" />
                  <circle cx="0" cy="0" r="3" fill="#a16207" />
                </g>
                
                {/* Service Center - Grey building with antenna */}
                <g transform="translate(600, 280)">
                  <rect x="-8" y="-6" width="16" height="12" fill="#6b7280" />
                  <line x1="0" y1="-6" x2="0" y2="-12" stroke="#6b7280" strokeWidth="2" />
                  <circle cx="0" cy="-12" r="2" fill="#6b7280" />
                </g>
              </>
            )}
          </svg>

          {/* Map Controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-2 rounded-md border bg-white p-1 shadow-lg">
            <button className="rounded p-1 hover:bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4V20M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button className="rounded p-1 hover:bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button className="rounded p-1 hover:bg-gray-100">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 19V5M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 rounded-md border bg-white p-4 shadow-lg">
            <div className="space-y-3">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Customers</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Paid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>Unpaid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span>Unknown</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Assets</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M0,-10 L5,0 L2,0 L7,10 L2,10 L-3,0 L0,0 Z"
                        fill="#eab308"
                        transform="translate(12,12)"
                      />
                    </svg>
                    <span>Feeder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gray-500"></div>
                    <span>Substation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-amber-900"></div>
                    <span>Transformer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gray-500"></div>
                    <span>Service Center</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Feeder Zones</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Red: 0%</span>
                    <span>Green: 100%</span>
                  </div>
                  <div className="text-xs text-gray-600">Collection Rate</div>
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

