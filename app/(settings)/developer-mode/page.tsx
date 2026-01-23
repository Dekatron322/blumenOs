"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DevModePage() {
  const [isDevMode, setIsDevMode] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const devModeEnabled = localStorage.getItem("devModeEnabled") === "true"
    setIsDevMode(devModeEnabled)
  }, [])

  const toggleDevMode = async () => {
    setIsLoading(true)

    if (isDevMode) {
      localStorage.removeItem("devModeEnabled")
      setIsDevMode(false)
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } else {
      const correctPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD || "devMode123@!"
      console.log("Password from env:", process.env.NEXT_PUBLIC_DEV_PASSWORD)
      console.log("Using password:", correctPassword)
      if (password === correctPassword) {
        localStorage.setItem("devModeEnabled", "true")
        setIsDevMode(true)
        setError("")
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        setError("Incorrect password")
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-gray-800/50 p-3">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">Developer Mode</h1>
            <p className="text-gray-400">Toggle advanced debugging features</p>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-gray-700/50 bg-black/60 p-8 shadow-2xl backdrop-blur-xl">
            {/* Status Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between rounded-xl border border-gray-700/30 bg-gray-800/30 p-4">
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${isDevMode ? "animate-pulse bg-green-500" : "bg-red-500"}`} />
                  <span className="font-medium text-white">Dev Mode Status</span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isDevMode
                      ? "border border-green-500/30 bg-green-500/20 text-green-400"
                      : "border border-red-500/30 bg-red-500/20 text-red-400"
                  }`}
                >
                  {isDevMode ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>

            {/* Password Input */}
            {!isDevMode && (
              <div className="mb-6">
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                  Authentication Required
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter developer password"
                    className="w-full rounded-lg border border-gray-700/50 bg-gray-800/30 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-600"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                {error && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-red-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={toggleDevMode}
              disabled={isLoading || (!isDevMode && !password)}
              className={`relative w-full overflow-hidden rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
                isDevMode
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700"
              } ${
                isLoading || (!isDevMode && !password)
                  ? "cursor-not-allowed opacity-50"
                  : "transform hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {isDevMode ? (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      <span>Disable Dev Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Enable Dev Mode</span>
                    </>
                  )}
                </div>
              )}
            </button>

            {/* Success Message */}
            {isDevMode && (
              <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <div className="flex items-start space-x-3">
                  <svg className="mt-0.5 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="mb-1 font-medium text-green-400">Developer tools unlocked!</p>
                    <p className="text-sm text-green-300/70">
                      You can now inspect the code and access advanced debugging features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Features List */}
            <div className="mt-6 border-t border-gray-700/50 pt-6">
              <h3 className="mb-3 font-medium text-white">Available Features:</h3>
              <div className="space-y-2">
                {[
                  "Console debugging access",
                  "Component inspection tools",
                  "Performance monitoring",
                  "Network request logging",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                    <svg
                      className={`h-4 w-4 ${isDevMode ? "text-green-400" : "text-gray-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center space-x-2 text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
