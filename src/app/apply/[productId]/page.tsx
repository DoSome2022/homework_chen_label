// src/app/apply/[productId]/page.tsx
import { ApplyProductForm } from "@/components/client/ApplyProductForm"
import db from "@/lib/db"

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  // 關鍵：必須 await 解析 params
  const { productId } = await params

  const product = await db.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    return <div className="text-center py-12">產品不存在</div>
  }

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">申請 {product.name}</h1>
      <ApplyProductForm productId={product.id} />
    </div>
  )
}