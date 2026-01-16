// src/app/(auth)/layout.tsx
import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-lg p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
        {children}
      </div>
    </div>
  )
}