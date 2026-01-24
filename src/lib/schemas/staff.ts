// src/lib/schemas/staff.ts


import { z } from "zod"

export const createProjectSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1, "項目標題為必填"),
  description: z.string().optional(),
})

export const createQuoteSchema = z.object({
  projectId: z.string().min(1),
  amount: z.coerce.number().positive("報價金額必須大於 0"),
  details: z.string().optional(),
})

// 發送訊息 – 移除 image 驗證
export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().optional(),
  // image 不在這裡驗證
})

// 建立報告
export const createStaffReportSchema = z.object({
  type: z.enum(["SALES", "EMPLOYEE"]),
  title: z.string().min(1, "報告標題為必填"),
  content: z.string().min(1, "報告內容為必填"),
  projectId: z.string().optional(),
})

// 建立銷售活動 – 移除 image 驗證
export const createSalesActivitySchema = z.object({
  title: z.string().min(1, "活動標題為必填"),
  content: z.string().min(1, "活動內容為必填"),
  // image 不在這裡驗證
})


export const activitySchema = z.object({
  // 因為 DB 需要 title，我們這裡假設表單有一個 title 欄位，或者我們稍後用程式產生
  title: z.string().min(1, "請輸入標題"), 
  content: z.string().min(1, "請輸入內容"),
  // customerId, date, time 這些在 DB 沒欄位存，所以這裡先拿掉，除非你要存進 content 裡
})