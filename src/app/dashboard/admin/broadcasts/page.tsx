// // src/app/(dashboard)/admin/broadcasts/page.tsx

// import { BroadcastTable } from "@/components/admin/BroadcastTable"
// import { CreateBroadcastDialog } from "@/components/admin/CreateBroadcastDialog"
// import { DailyPromotionSection } from "@/components/admin/DailyPromotionPreview"

// import { Button } from "@/components/ui/button"
// import db from "@/lib/db"

// export default async function AdminBroadcastsPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>
// }) {
//   const params = await searchParams
//   const search = typeof params.search === "string" ? params.search.trim() : undefined

//   const broadcasts = await db.broadcast.findMany({
//     where: search
//       ? {
//           OR: [
//             { title: { contains: search, mode: "insensitive" } },
//             { content: { contains: search, mode: "insensitive" } },
//           ],
//         }
//       : undefined,
//     include: { author: { select: { name: true } } },
//     orderBy: { createdAt: "desc" },
//   })

//   return (
//     <div className="p-8 space-y-8">
//       {/* ── 上方操作列 ── */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold">廣告/廣播管理</h1>
//         <div className="flex items-center gap-4">
//           {/* 搜尋輸入框 */}
//           <form className="flex items-center gap-2">
//             <input
//               type="search"
//               name="search"
//               defaultValue={search}
//               placeholder="搜尋標題或內容..."
//               className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//             />
//             <Button type="submit" size="sm">
//               搜尋
//             </Button>
//             {search && (
//               <Button variant="ghost" size="sm" asChild>
//                 <a href="/dashboard/admin/broadcasts">清除</a>
//               </Button>
//             )}
//           </form>
//           <CreateBroadcastDialog />
//         </div>
//       </div>

//       {/* ── 廣播表格 ── */}
//       <BroadcastTable broadcasts={broadcasts} />

//       {/* ── 每日推廣區塊（預覽 + 一鍵產生） ── */}
//       <DailyPromotionSection />
//     </div>
//   )
// }
// src/app/(dashboard)/admin/broadcasts/page.tsx

import { BroadcastTable } from "@/components/admin/BroadcastTable"
import { CreateBroadcastDialog } from "@/components/admin/CreateBroadcastDialog"
import { previewDailyPromotion } from "@/lib/actions/daily-promotion"
import { Button } from "@/components/ui/button"
import db from "@/lib/db"

import { Prisma } from "@prisma/client"
import { DailyPromotionSection } from "@/components/admin/DailyPromotionPreview"

// ✅ 定義型別（與 previewDailyPromotion 一致）
type PreviewData = {
  date: string
  todayTitle: string
  holidays: string[]
  selectedProducts: {
    id: string
    name: string
    price: number
  }[]
}

// ✅ 使用 Prisma 自動推導型別
type BroadcastWithAuthor = Prisma.BroadcastGetPayload<{
  include: {
    author: { select: { name: true } }
  }
}>

export default async function AdminBroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search.trim() : undefined

  // ✅ 獲取廣播列表（加入錯誤處理）
  let broadcasts: BroadcastWithAuthor[] = []
  let broadcastError: string | null = null

  try {
    const result = await db.broadcast.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { content: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { 
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    broadcasts = result
  } catch (error) {
    console.error("[AdminBroadcastsPage] 廣播列表載入失敗:", error)
    broadcastError = error instanceof Error ? error.message : "資料庫查詢失敗"
  }

  // ✅ 獲取每日推廣預覽（加入錯誤處理）
  let initialPreview: PreviewData = {
    date: new Date().toISOString(),
    todayTitle: "載入中...",
    holidays: [],
    selectedProducts: [],
  }
  
  try {
    const preview = await previewDailyPromotion()
    initialPreview = preview
  } catch (error) {
    console.error("[AdminBroadcastsPage] 預覽載入失敗:", error)
    initialPreview = {
      date: new Date().toISOString(),
      todayTitle: "無法載入",
      holidays: [],
      selectedProducts: [],
    }
  }

  // ✅ 如果有嚴重錯誤，顯示錯誤 UI
  if (broadcastError) {
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
                  載入失敗
                </h2>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {broadcastError}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/50"
                onClick={() => window.location.reload()}
              >
                重新載入
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">廣告/廣播管理</h1>
        <div className="flex items-center gap-4">
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

      <DailyPromotionSection initialPreview={initialPreview} />
    </div>
  )
}