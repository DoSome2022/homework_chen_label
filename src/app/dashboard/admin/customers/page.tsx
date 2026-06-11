// src/app/dashboard/admin/customers/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CustomerTable } from "@/components/admin/CustomerTable"
import { CustomerFilter } from "@/components/admin/CustomerFilter"
import { CreateCustomerDialog } from "@/components/admin/CreateCustomerDialog"  // ✅ 新增
import { TagManagementDialog } from "@/components/admin/TagManagementDialog"
import db from "@/lib/db"
import { ImportCustomersDialog } from "@/components/admin/ImportCustomersDialog"

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const params = await searchParams

  const type = params.type === "POTENTIAL" || params.type === "NORMAL"
    ? params.type as "POTENTIAL" | "NORMAL"
    : undefined

  const search = typeof params.search === "string" ? params.search.trim() : undefined

  const allTags = await db.tag.findMany({
    orderBy: { name: "asc" },
  })

  const tagIds = params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : []

  const customers = await db.user.findMany({
  where: {
    role: "CUSTOMER",
    ...(type && { customerType: type }),
    OR: search
      ? [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          // ✅ 新增：搜尋電話
          {
            phoneOtps: {
              some: {
                phone: { contains: search, mode: "insensitive" },
              },
            },
          },
        ]
      : undefined,
    ...(tagIds.length > 0 && {
      tags: {
        some: {
          tagId: { in: tagIds },
        },
      },
    }),
  },
  include: {
    projects: { select: { id: true } },
    tags: {
      include: {
        tag: true,
      },
    },
    phoneOtps: {
      take: 1,
      orderBy: { createdAt: "desc" },
      select: { phone: true },
    },
  },
  orderBy: { createdAt: "desc" },
})

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">客戶管理</h1>
        <div className="flex items-center gap-4">
          <CustomerFilter
            initialSearch={search}
            initialType={type}
            initialTags={tagIds}
            allTags={allTags}
          />
          <CreateCustomerDialog />
          <ImportCustomersDialog />
          <TagManagementDialog allTags={allTags} />
        </div>
      </div>

      <CustomerTable customers={customers} allTags={allTags} />
    </div>
  )
}
