// src/app/customers/customer-detail/[id]/LoadingSkeleton.tsx
import React from "react"
import { motion } from "framer-motion"

const LoadingSkeleton = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 p-6">
      {/* Customer Info Skeleton */}
      <div className="w-1/3 rounded-lg bg-[#E9F0FF] p-6">
        <div className="mb-6 flex items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-10 animate-pulse rounded-md bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>

        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-3">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="size-32 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions/Assets Skeleton */}
      <div className="flex w-full items-start rounded-lg">
        <div className="w-full">
          <div className="flex border-b">
            <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-10 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>

          <div className="mt-4 w-full overflow-x-auto border-l border-r bg-[#FFFFFF]">
            <div className="min-w-[800px]">
              {/* Table Header Skeleton */}
              <div className="flex border-t">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 w-full animate-pulse border-b bg-gray-100 p-4"></div>
                ))}
              </div>

              {/* Table Rows Skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex hover:bg-gray-50">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-16 w-full animate-pulse border-b p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingSkeleton
