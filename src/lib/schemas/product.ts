// src/lib/actions/schemas/product.ts
import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "產品名稱為必填"),
    price: z.coerce.number().min(0, "價格不能小於 0"), 
  description: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).min(1, "至少上傳一張圖片"),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})