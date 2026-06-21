// src/app/(dashboard)/admin/broadcasts/error.tsx

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminBroadcastsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // ✅ 將錯誤記錄到控制台或錯誤追蹤服務
    console.error('[AdminBroadcastsError] 頁面錯誤:', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    })
  }, [error])

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                發生錯誤
              </h2>
              <p className="text-sm text-red-600 dark:text-red-300">
                {error.message || '頁面載入時發生錯誤'}
              </p>
              {error.digest && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  錯誤 ID: {error.digest}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={reset}
              variant="default"
            >
              重新嘗試
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
              onClick={() => window.location.href = '/dashboard/admin/broadcasts'}
            >
              回到頁面
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}