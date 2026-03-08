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
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <div className="text-9xl font-bold text-[#004B23] opacity-10">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-6xl">🔍</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Page Not Found</h1>
          <p className="mb-2 text-gray-600">
            Oops! The page you&apos;re looking for seems to have vanished into thin air.
          </p>
          <p className="text-sm text-gray-500">
            Don&apos;t worry, even the best explorers get lost sometimes. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <ButtonModule variant="primary" size="md" className="w-full justify-center">
              Go to Dashboard
            </ButtonModule>
          </Link>

          <Link href="/" className="block">
            <ButtonModule variant="outline" size="md" className="w-full justify-center">
              Back to Home
            </ButtonModule>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Still can&apos;t find what you&apos;re looking for?
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Check the URL for typos</li>
            <li>• Use the navigation menu to browse</li>
            <li>• Contact support if you believe this is an error</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="mb-3 text-xs text-gray-500">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/customers" className="text-xs text-[#004B23] transition-colors hover:text-[#008000]">
              Customers
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link href="/billing" className="text-xs text-[#004B23] transition-colors hover:text-[#008000]">
              Billing
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link href="/metering" className="text-xs text-[#004B23] transition-colors hover:text-[#008000]">
              Metering
            </Link>
            <span className="text-xs text-gray-400">•</span>
            <Link href="/analytics" className="text-xs text-[#004B23] transition-colors hover:text-[#008000]">
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
