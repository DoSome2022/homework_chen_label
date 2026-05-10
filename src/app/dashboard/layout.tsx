// src/app/dashboard/layout.tsx
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/shared/Sidebar"
// 不需要再 import SessionProvider

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <div className="flex h-screen">
      <Sidebar role={session?.user?.role} />  {/* 直接傳 role */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
