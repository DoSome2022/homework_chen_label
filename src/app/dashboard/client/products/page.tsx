
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ApplyProductForm } from "@/components/client/ApplyProductForm"
import db from "@/lib/db"

export default async function ProductsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "CUSTOMER") redirect("/login")

  const products = await db.product.findMany()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">產品列表</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-muted-foreground mt-2">{product.description}</p>
            <p className="text-lg font-bold mt-4">${product.price}</p>

            <ApplyProductForm productId={product.id} />
          </div>
        ))}
      </div>
    </div>
  )
}