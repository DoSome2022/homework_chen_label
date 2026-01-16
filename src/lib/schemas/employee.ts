// src/lib/schemas/employee.ts
import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "姓名為必填"),
  email: z.string().email("無效的電子郵件格式"),
  password: z.string().min(6, "密碼至少 6 個字元").optional(),
});