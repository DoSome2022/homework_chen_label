import { CustomerTable } from "@/components/admin/CustomerTable"
// 引入剛剛建立的 Filter 元件
import { CustomerFilter } from "@/components/admin/CustomerFilter" 
import db from "@/lib/db"
import { TagManagementDialog } from "@/components/admin/TagManagementDialog"

// 1. searchParams 必須定義為 Promise
// src/app/dashboard/admin/customers/page.tsx

// ... 既有 import ...

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  const type = params.type === "POTENTIAL" || params.type === "NORMAL"
    ? params.type as "POTENTIAL" | "NORMAL"
    : undefined

  const search = typeof params.search === "string" ? params.search.trim() : undefined

  // 取得所有標籤（用於過濾選擇器）
  const allTags = await db.tag.findMany({
    orderBy: { name: "asc" },
  })

  // 取得選中的標籤 ID（支援多選）
  const tagIds = params.tags ? (Array.isArray(params.tags) ? params.tags : [params.tags]) : []

  const customers = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(type && { customerType: type }),
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
      // 若有選標籤，則只顯示擁有這些標籤的客戶
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
          tag: true, // 取得完整標籤資訊（name, color）
        },
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
          {/* 新增標籤管理按鈕 */}
          <TagManagementDialog />
        </div>
      </div>

      <CustomerTable customers={customers} allTags={allTags} />
    </div>
  )
}