// src/lib/schemas/client-file-schemas.ts
'use client'

import { z } from "zod"

export const imageFileSchema = z
  .instanceof(File, { message: "必須上傳有效的檔案" })
  .refine((file) => file.size > 0, { message: "檔案大小必須大於 0" })
  .refine((file) => file.size <= 5 * 1024 * 1024, { message: "圖片檔案大小不得超過 5MB" })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
    { message: "僅支援 JPG、PNG、GIF、WebP 格式" }
  )
  .optional()

// 可選：包裝完整的 client 端表單 schema
export const sendMessageClientSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().optional(),
  image: imageFileSchema,
})

export const createSalesActivityClientSchema = z.object({
  title: z.string().min(1, "活動標題為必填"),
  content: z.string().min(1, "活動內容為必填"),
  image: imageFileSchema,
})