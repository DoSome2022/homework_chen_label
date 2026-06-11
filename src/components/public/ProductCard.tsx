// src/components/public/ProductCard.tsx
'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"  

// 定義 Image 介面
interface ProductImage {
  id: string
  url: string
  productId: string
  createdAt: Date
  updatedAt?: Date
}

// 定義 Product 介面，加入 images
interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  images: ProductImage[]        // ← 新增這行
}

export function ProductCard({ product }: { product: Product }) {
  // 取第一張圖片 URL（如果有的話）
  const firstImage = product.images?.[0]?.url

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      {/* ✅ 新增：圖片區域 */}
      {firstImage ? (
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={firstImage}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized                                 // 外部圖片（AliOSS）
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center text-gray-400">
          無圖片
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
        <p className="text-2xl font-bold mb-6">${product.price}</p>

        <Button asChild variant="default">
          <Link href={`/apply/${product.id}`}>立即申請</Link>
        </Button>
      </div>
    </div>
  )
}
