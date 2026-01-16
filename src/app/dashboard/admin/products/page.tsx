// // src/app/(dashboard)/admin/products/page.tsx
// import db from "@/lib/db"
// import { ProductTable } from "@/components/admin/ProductTable"
// import { ProductManagement } from "@/components/admin/ProductManagement"

// export const dynamic = "force-dynamic"

// export default async function AdminProductsPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>
// }) {
//   const params = await searchParams

//   // 解析排序參數
//   const sort = typeof params.sort === "string" ? params.sort : "createdAt"
//   const order = typeof params.order === "string" && params.order === "asc" ? "asc" : "desc"

//   // 定义允许的排序字段类型
//   const validSortFields = ["name", "price", "createdAt"] as const
//   type ValidSortField = typeof validSortFields[number]
  
//   // 将safeSort转换为正确的类型
//   const safeSort: ValidSortField = validSortFields.includes(sort as any) 
//     ? (sort as ValidSortField) 
//     : "createdAt"

//   // 查詢產品（選取所有必要欄位，確保型別完整）
//   const products = await db.product.findMany({
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       price: true,
//       createdAt: true,
//       updatedAt: true,
//       categoryId: true,
//       colorId: true,
//       sizeId: true,
//       isFeatured: true,
//       isArchived: true,
//       // 若未來需要圖片或其他關聯，可在此 include
//       // images: { select: { url: true } },
//     },
//     orderBy: {
//       [safeSort]: order,
//     },
//   })

//   return (
//     <div className="container mx-auto p-8">
//       <ProductManagement />
//       <div className="mt-10">
//         <ProductTable 
//           products={products} 
//           currentSort={safeSort}
//           currentOrder={order}
//         />
//       </div>
//     </div>
//   )
// }

import db from "@/lib/db"
import { ProductTable } from "@/components/admin/ProductTable"
import { ProductManagement } from "@/components/admin/ProductManagement"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams

  // 解析排序參數
  const sort = typeof params.sort === "string" ? params.sort : "createdAt"
  const order = typeof params.order === "string" && params.order === "asc" ? "asc" : "desc"

  // 定義允許的排序欄位
  const validSortFields = ["name", "price", "createdAt"] as const
  
  // 從陣列中提取類型: "name" | "price" | "createdAt"
  type ValidSortField = typeof validSortFields[number]
  
  // ✅ 解決方案：使用類型斷言 (Type Assertion) 而不是 'as any'
  // 我們檢查 sort 是否包含在 validSortFields 陣列中
  // (validSortFields as readonly string[]) 告訴 TS 把這個 readonly tuple 當作普通 string 陣列來檢查 includes
  const safeSort: ValidSortField = (validSortFields as readonly string[]).includes(sort)
    ? (sort as ValidSortField) 
    : "createdAt"

  // 查詢產品
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      // 注意：根據你的 schema，colorId 和 sizeId 可能不存在於 Product 表 (它們通常在 Variant 中)，
      // 如果報錯請檢查 schema。假設這裡你確認它們存在：
      colorId: true, 
      sizeId: true,
      isFeatured: true,
      isArchived: true,
    },
    orderBy: {
      [safeSort]: order,
    },
  })

  // *注意：如果你的 ProductTable 預期 products 包含 colorId/sizeId，請確保上方 select 有選取，
  // 並且 schema.prisma 的 Product 模型真的有這些欄位。
  
  return (
    <div className="container mx-auto p-8">
      <ProductManagement />
      <div className="mt-10">
        <ProductTable 
          products={products} 
          currentSort={safeSort}
          currentOrder={order}
        />
      </div>
    </div>
  )
}
