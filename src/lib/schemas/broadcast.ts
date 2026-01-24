// src/lib/schemas/broadcast.ts
import { z } from "zod"

export const broadcastSchema = z.object({
  title: z.string().min(1, { message: "標題為必填" }),
  content: z.string().min(5, { message: "內容至少需要 5 個字" }),
  videoUrl: z.string().url({ message: "請輸入有效的影片網址" }).optional().or(z.literal("")),

  scheduledAt: z
    .union([z.string(), z.null(), z.undefined()])   // 先接受所有可能的「沒填」狀況
    .transform((val) => {
      // 各種沒填寫的狀況都轉成 null
      if (val == null) return null;
      if (typeof val !== "string") return null;
      const trimmed = val.trim();
      if (trimmed === "") return null;
      return trimmed;
    })
    .refine(
      (val): val is string | null => {
        // null 允許通過（代表不排程）
        if (val === null) return true;
        // 這裡 val 已確定是 string，檢查是否為有效日期
        return !isNaN(new Date(val).getTime());
      },
      { message: "無效的日期格式" }
    )
    .refine(
      (val) => val === null || new Date(val) > new Date(),
      { message: "排程時間必須晚於現在" }  // 可選：加強未來時間檢查
    ),
})