// src/app/(dashboard)/admin/broadcasts/page.tsx
import { BroadcastTable } from "@/components/admin/BroadcastTable"
import { CreateBroadcastDialog } from "@/components/admin/CreateBroadcastDialog"
import { Button } from "@/components/ui/button"
import db from "@/lib/db"

export default async function AdminBroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search.trim() : undefined

  const broadcasts = await db.broadcast.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">廣告/廣播管理</h1>
        <div className="flex items-center gap-4">
          {/* 搜尋輸入框 */}
          <form className="flex items-center gap-2">
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="搜尋標題或內容..."
              className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button type="submit" size="sm">
              搜尋
            </Button>
            {search && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/dashboard/admin/broadcasts">清除</a>
              </Button>
            )}
          </form>
          <CreateBroadcastDialog />
        </div>
      </div>

      <BroadcastTable broadcasts={broadcasts} />
    </div>
  )
}