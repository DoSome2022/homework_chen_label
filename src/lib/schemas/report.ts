// src/lib/schemas/report.ts
import { z } from "zod";

export const reportSchema = z.object({
  type: z.enum(["SALES", "PRODUCT", "AMOUNT", "BROADCAST", "EMPLOYEE"]),
  title: z.string().min(1, { message: "報告標題為必填" }),
  content: z.string().min(1, { message: "報告內容為必填" }),
  projectId: z.string().optional().or(z.literal("")),
});