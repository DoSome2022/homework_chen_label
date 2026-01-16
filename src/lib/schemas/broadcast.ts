// src/lib/schemas/broadcast.ts
import { z } from "zod"

export const broadcastSchema = z.object({
  title: z.string().min(1, { message: "標題為必填" }),
  content: z.string().min(5, { message: "內容至少需要 5 個字" }),
  videoUrl: z.string().url({ message: "請輸入有效的影片網址" }).optional().or(z.literal("")),
  scheduledAt: z.string().datetime({ message: "無效的日期格式" }).optional().or(z.literal("")), // ISO 格式日期字串
})