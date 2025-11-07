// "use client"

// import React, { useState } from "react"
// import { motion } from "framer-motion"

// const WebhookTestTab = () => {
//   const [webhookUrl, setWebhookUrl] = useState("")
//   const [payload, setPayload] = useState("")
//   const [response, setResponse] = useState("")
//   const [isLoading, setIsLoading] = useState(false)

//   const handleTest = async () => {
//     setIsLoading(true)
//     setResponse("")

//     // Simulate API call
//     setTimeout(() => {
//       setResponse(
//         JSON.stringify(
//           {
//             status: "success",
//             message: "Webhook test successful",
//             timestamp: new Date().toISOString(),
//             responseTime: "250ms",
//           },
//           null,
//           2
//         )
//       )
//       setIsLoading(false)
//     }, 1000)
//   }

//   const samplePayload = {
//     event: "payment.received",
//     data: {
//       customerId: "12345",
//       amount: "₦15,000",
//       status: "paid",
//       timestamp: new Date().toISOString(),
//     },
//   }

//   const handleLoadSample = () => {
//     setPayload(JSON.stringify(samplePayload, null, 2))
//   }

//   return (
//     <div className="rounded-md border bg-white p-6">
//       <h3 className="mb-6 text-xl font-semibold">Webhook Test</h3>

//       <div className="space-y-6">
//         {/* Webhook URL Input */}
//         <div>
//           <label className="mb-2 block text-sm font-medium">Webhook URL</label>
//           <input
//             type="url"
//             value={webhookUrl}
//             onChange={(e) => setWebhookUrl(e.target.value)}
//             placeholder="https://example.com/webhook"
//             className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
//         </div>

//         {/* Payload Input */}
//         <div>
//           <div className="mb-2 flex items-center justify-between">
//             <label className="block text-sm font-medium">Payload (JSON)</label>
//             <button
//               onClick={handleLoadSample}
//               className="text-sm text-blue-600 hover:text-blue-800"
//             >
//               Load Sample
//             </button>
//           </div>
//           <textarea
//             value={payload}
//             onChange={(e) => setPayload(e.target.value)}
//             placeholder='{"event": "payment.received", "data": {...}}'
//             rows={10}
//             className="w-full rounded-md border border-gray-300 px-4 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           />
//         </div>

//         {/* Test Button */}
//         <div>
//           <button
//             onClick={handleTest}
//             disabled={!webhookUrl || isLoading}
//             className="rounded-md bg-[#0a0a0a] px-6 py-2 text-white hover:bg-[#000000] disabled:opacity-50"
//           >
//             {isLoading ? "Testing..." : "Test Webhook"}
//           </button>
//         </div>

//         {/* Response */}
//         {response && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="rounded-md border border-gray-300 bg-gray-50 p-4"
//           >
//             <h4 className="mb-2 text-sm font-semibold">Response</h4>
//             <pre className="overflow-auto rounded-md bg-white p-4 text-xs">
//               {response}
//             </pre>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default WebhookTestTab



"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"

const WebhookTestTab = () => {
  const [customerId, setCustomerId] = useState("")
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<"Success" | "Failed" | "Pending">("Success")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resetMessages = () => {
    setResponse(null)
    setError(null)
  }

  const handleSubmit = async () => {
    resetMessages()

    // Basic validation
    if (!customerId.trim()) {
      setError("Customer ID is required.")
      return
    }
    if (!amount || isNaN(Number(amount))) {
      setError("Enter a valid numeric amount.")
      return
    }

    setIsLoading(true)

    // Build simulated webhook payload
    const payload = {
      event: "payment.received",
      data: {
        customerId: customerId.trim(),
        amount: `₦${Number(amount).toLocaleString()}`,
        status: result.toLowerCase(),
        timestamp: new Date().toISOString(),
      },
    }

    // Simulate network delay & response
    setTimeout(() => {
      const simulatedResponse = {
        status: result === "Success" ? "success" : result === "Failed" ? "failed" : "pending",
        message:
          result === "Success"
            ? "Payment processed and webhook delivered"
            : result === "Failed"
            ? "Payment failed — webhook accepted but flagged"
            : "Payment pending — webhook delivered with pending status",
        payload,
        deliveredAt: new Date().toISOString(),
      }

      setResponse(JSON.stringify(simulatedResponse, null, 2))
      setIsLoading(false)
    }, 700)
  }

  const handleFillExample = () => {
    resetMessages()
    setCustomerId("KD-00000001")
    setAmount("12000")
    setResult("Success")
  }

  return (
    <div className="rounded-md border bg-white p-6 w-full max-w-md">
    

      <h3 className="mb-4 text-lg font-semibold">Simulate Payment Webhook</h3>

      <div className="space-y-4">
        {/* Customer ID */}
        <div>
          <label className="mb-2 block text-sm font-medium">Customer ID</label>
          <input
            type="text"
            placeholder="e.g., KD-00000001"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-medium">Amount (₦)</label>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="12000"
            className="w-full bg-white rounded-md border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Result select */}
        <div>
          <label className="mb-2 block text-sm font-medium">Result</label>
          <div className="relative">
            <select
              value={result}
              onChange={(e) => setResult(e.target.value as any)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>Success</option>
              <option>Failed</option>
              <option>Pending</option>
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.02 1.1l-4.2 3.94a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isLoading ? "Submitting..." : "Submit Payment"}
          </button>

          <button
            onClick={handleFillExample}
            type="button"
            className="w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Load Example
          </button>
        </div>

        {/* Response */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-gray-200 bg-gray-50 p-3"
          >
            <h4 className="mb-2 text-sm font-semibold">Response</h4>
            <pre className="max-h-48 overflow-auto rounded bg-white p-3 text-xs font-mono text-gray-800">
              {response}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default WebhookTestTab
