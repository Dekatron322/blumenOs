"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ButtonModule } from "components/ui/Button/Button"

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="max-w-md w-full">
        {/* 404 Illustration */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-[#004B23] opacity-10">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">🔍</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h1>
          <p className="text-gray-600 mb-2">
            Oops! The page you're looking for seems to have vanished into thin air.
          </p>
          <p className="text-gray-500 text-sm">
            Don't worry, even the best explorers get lost sometimes. Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <ButtonModule
              variant="primary"
              size="md"
              className="w-full justify-center"
            >
              Go to Dashboard
            </ButtonModule>
          </Link>
          
          <Link href="/" className="block">
            <ButtonModule
              variant="outline"
              size="md"
              className="w-full justify-center"
            >
              Back to Home
            </ButtonModule>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Still can't find what you're looking for?</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Check the URL for typos</li>
            <li>• Use the navigation menu to browse</li>
            <li>• Contact support if you believe this is an error</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-3">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link 
              href="/customers" 
              className="text-xs text-[#004B23] hover:text-[#008000] transition-colors"
            >
              Customers
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link 
              href="/billing" 
              className="text-xs text-[#004B23] hover:text-[#008000] transition-colors"
            >
              Billing
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link 
              href="/metering" 
              className="text-xs text-[#004B23] hover:text-[#008000] transition-colors"
            >
              Metering
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link 
              href="/analytics" 
              className="text-xs text-[#004B23] hover:text-[#008000] transition-colors"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
