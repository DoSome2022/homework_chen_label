import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/shared/Sidebar"
import { SessionProvider } from "next-auth/react";  // ← 匯入這個

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <div className="flex h-screen">
      <SessionProvider>
      <Sidebar role={session?.user?.role} />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>

      </SessionProvider>

    </div>
  )
}