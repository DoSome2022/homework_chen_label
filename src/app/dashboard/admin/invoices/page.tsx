// src/app/admin/invoices/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import db from "@/lib/db"
import { InvoicesClientPage } from "@/components/admin/invoices/InvoicesClientPage"
import { Prisma ,InvoiceStatus} from "@prisma/client"

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const params = await searchParams
  const statusFilter = params.status as string | undefined
  const search = params.search?.trim()

  // 建立過濾條件
  const where: Prisma.InvoiceWhereInput = {}

  if (statusFilter && ["PENDING", "PAID", "OVERDUE", "CANCELLED"].includes(statusFilter)) {
    where.status = statusFilter as InvoiceStatus
  }

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { quote: { project: { title: { contains: search, mode: "insensitive" } } } },
      { quote: { project: { customer: { name: { contains: search, mode: "insensitive" } } } } },
    ]
  }

  const invoices = await db.invoice.findMany({
    where,
    include: {
      quote: {
        include: {
          project: {
            include: {
              customer: {
                select: { name: true, email: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // 統計資料
  const stats = {
    total: await db.invoice.count(),
    pending: await db.invoice.count({ where: { status: "PENDING" } }),
    paid: await db.invoice.count({ where: { status: "PAID" } }),
    overdue: await db.invoice.count({ where: { status: "OVERDUE" } }),
    cancelled: await db.invoice.count({ where: { status: "CANCELLED" } }),
  }

  return (
    <div className="p-8 space-y-6">
      <InvoicesClientPage
        invoices={invoices}
        stats={stats}
        currentStatus={statusFilter}
        currentSearch={search}
      />
    </div>
  )
}
