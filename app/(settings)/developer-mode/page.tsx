"use client"

import { useRouter } from "next/navigation"

export default function DevModePage() {
  const router = useRouter()

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
            <p className="text-gray-400">Developer features are permanently enabled</p>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-gray-700/50 bg-black/60 p-8 shadow-2xl backdrop-blur-xl">
            {/* Status Display */}
            <div className="mb-8">
              <div className="flex items-center justify-between rounded-xl border border-gray-700/30 bg-gray-800/30 p-4">
                <div className="flex items-center space-x-3">
                  <div className="size-3 animate-pulse rounded-full bg-green-500" />
                  <span className="font-medium text-white">Dev Mode Status</span>
                </div>
                <span className="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
                  PERMANENTLY ENABLED
                </span>
              </div>
            </div>

            {/* Success Message */}
            <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex items-start space-x-3">
                <svg className="mt-0.5 h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-400">All Developer Features Unlocked</h4>
                  <p className="mt-1 text-sm text-green-300">
                    Developer mode is permanently enabled. All debugging features, copy/paste functionality, and
                    developer tools are available throughout the application.
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-6 border-t border-gray-700/50 pt-6">
              <h3 className="mb-3 font-medium text-white">Available Features:</h3>
              <div className="space-y-2">
                {[
                  "Copy and paste functionality",
                  "Text selection and highlighting",
                  "Right-click context menu",
                  "Console debugging access",
                  "Component inspection tools",
                  "Performance monitoring",
                  "Network request logging",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-400">
                    <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
