

import { ProductCard } from "@/components/public/ProductCard"
import db from "@/lib/db"

export default async function PublicProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">我們的產品</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}