// src/lib/schemas/product.ts
import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "產品名稱為必填"),
  price: z.number().min(0, "價格不能小於 0"),
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).min(1, "至少上傳一張圖片"),
  categoryId: z.string().nullable(),
  colorId: z.string().nullable(),
  sizeId: z.string().nullable(),
  isFeatured: z.boolean(),        // ← 移除 .default(false)
  isArchived: z.boolean(),        // ← 移除 .default(false)
  costPrice: z.number().optional(),
  materialCost: z.number().optional(),
  laborCost: z.number().optional(),
  otherCost: z.number().optional(),
  supplier: z.string().optional(),
})

export type ProductFormSchemaType = z.infer<typeof productSchema>
