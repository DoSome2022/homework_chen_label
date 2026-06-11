// src/app/dashboard/layout.tsx
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/shared/Sidebar"
import db from "@/lib/db"   // ← 新增

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await auth()

  // ── 準備傳給 Sidebar 的資料 ──
  let companyName: string | undefined
  let userName: string | undefined

  if (session?.user?.role === "CUSTOMER") {
    // 客戶：從 CustomerContact 拿公司名或姓名
    const contact = await db.customerContact.findUnique({
      where: { customerId: session.user.id },
      select: { company: true, name: true },
    })
    userName = contact?.company || contact?.name || session.user.name || "客戶"
  } else if (session?.user?.role === "ADMIN" || session?.user?.role === "EMPLOYEE") {
    // 管理員/員工：顯示公司名稱（可從環境變數或 DB 設定取得）
    companyName = process.env.COMPANY_NAME || "標緻商標印刷有限公司"
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        role={session?.user?.role}
        companyName={companyName}   // ← 新增
        userName={userName}         // ← 新增
      />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
