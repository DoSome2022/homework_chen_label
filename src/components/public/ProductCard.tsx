// src/components/public/ProductCard.tsx
'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

// 定義 Product 介面，只包含必要欄位
interface Product {
  id: string
  name: string
  description?: string | null
  price: number
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-muted-foreground mb-4">{product.description}</p>
        <p className="text-2xl font-bold mb-6">${product.price}</p>

        <Button asChild variant="default">
          <Link href={`/apply/${product.id}`}>立即申請</Link>
        </Button>
      </div>
    </div>
  )
}