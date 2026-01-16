// src/lib/schemas/project.ts
import { z } from "zod";

// 建立項目（通常由客戶申請或 Admin 手動建立）
export const createProjectSchema = z.object({
  customerId: z.string(),
  title: z.string().min(1, "標題必填"),
  description: z.string().optional(),
});

export const updateDeadlineSchema = z.object({
  projectId: z.string(),
  deadline: z.date().nullable(), // 允許設為 null（移除截止日期）
})