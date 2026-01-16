// src/lib/schemas/customer.ts
import { z } from "zod";

// 為客戶建立新項目
export const createProjectSchema = z.object({
  title: z.string().min(1, "項目標題必填"),
  description: z.string().optional(),
});

// 為項目建立報價
export const createQuoteSchema = z.object({
  projectId: z.string(),
  amount: z.coerce.number().positive("報價金額必須為正數"),
  details: z.string().optional(),
});



export const contactSchema = z.object({
  customerId: z.string().cuid(),
  name: z.string().min(1, "姓名/公司名稱必填").max(100),
  company: z.string().max(100).optional(),
  email: z.string().email("無效的電子郵件格式").optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  extraInfo: z.string().max(500).optional(),
})


export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(), // 僅新增時需要
  customerType: z.enum(["NORMAL", "POTENTIAL"]),
  // 若要加入電話等，可擴充
})