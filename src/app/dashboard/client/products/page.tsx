// src/app/dashboard/client/products/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ApplyProductForm } from "@/components/client/ApplyProductForm"
import { SearchInput } from "@/components/client/SearchInput" // 稍後建立
import db from "@/lib/db"
import Image from "next/image"
const PAGE_SIZE = 9
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>  // ✅ 加入 q
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "CUSTOMER") redirect("/login")
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const query = params.q?.trim() || ""  // ✅ 讀取搜尋關鍵字
  // ── 建立搜尋過濾條件 ──
  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {}
  // ── 計算總數（含搜尋過濾）──
  const totalProducts = await db.product.count({ where })
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE)
  // ── 查詢產品（含搜尋過濾 + 分頁）──
  const products = await db.product.findMany({
    where,
    include: { images: true },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">產品列表</h1>
      {/* ✅ 搜尋輸入框 */}
      <SearchInput defaultValue={query} />
      {/* ✅ 顯示搜尋結果提示（可選） */}
      {query && (
        <p className="text-sm text-muted-foreground mb-4">
          搜尋「{query}」共 {totalProducts} 項結果
        </p>
      )}
      {/* 產品網格（其餘不變） */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const firstImage = product.images[0]
          return (
            <div key={product.id} className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-muted relative overflow-hidden">
                {firstImage ? (
                  <Image
                    src={firstImage.url}
                    alt={product.name}
                    fill                                  // ← 使用 fill 填滿容器
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized                           // ← 因為是 AliOSS 外部圖片
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    暫無圖片
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                  {product.description || "無說明"}
                </p>
                <p className="text-lg font-bold mt-3">${product.price}</p>
                <div className="mt-4">
                  <ApplyProductForm productId={product.id} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* 分頁（需保留 query 參數） */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <PaginationButton
            href={`?page=${currentPage - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            disabled={currentPage <= 1}
            label="上一頁"
          />
          <span className="text-sm text-muted-foreground">
            第 {currentPage} / {totalPages} 頁（共 {totalProducts} 項）
          </span>
          <PaginationButton
            href={`?page=${currentPage + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            disabled={currentPage >= totalPages}
            label="下一頁"
          />
        </div>
      )}
    </div>
  )
}


// 分頁按鈕元件
function PaginationButton({
  href,
  disabled,
  label,
}: {
  href: string
  disabled: boolean
  label: string
}) {
  if (disabled) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-md border text-muted-foreground cursor-not-allowed"
      >
        {label}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-md border hover:bg-accent transition-colors"
    >
      {label}
    </Link>
  )
}
