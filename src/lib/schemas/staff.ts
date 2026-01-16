// // src/lib/schemas/staff.ts
// import { z } from "zod";

// // 1. 為潛力客建立新項目
// export const createProjectSchema = z.object({
//   clientId: z.string(),
//   title: z.string().min(1, "項目標題為必填"),
//   description: z.string().optional(),
// });

// // 2. 為項目新增報價
// export const createQuoteSchema = z.object({
//   projectId: z.string(),
//   amount: z.coerce.number().positive("報價金額必須大於 0"),
//   details: z.string().optional(),
// });

// // 3. 員工發送訊息（文字 + 選填圖片）
// export const sendMessageSchema = z.object({
//   conversationId: z.string(),
//   content: z.string().optional(),
//   image: z.any()
//     .refine(
//       (val) => {
//         return (
//           val != null &&
//           typeof val === "object" &&
//           "size" in val &&
//           "type" in val &&
//           typeof val.size === "number" &&
//           typeof val.type === "string" &&
//           val.size > 0
//         );
//       },
//       { message: "必須上傳有效的圖片檔案" }
//     )
//     .refine(
//       (val) => (val as any)?.size <= 5 * 1024 * 1024,
//       "圖片檔案大小不得超過 5MB"
//     )
//     .refine(
//       (val) => {
//         const type = (val as any)?.type;
//         return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
//       },
//       "僅支援 JPG、PNG、GIF、WebP 格式"
//     )
//     .optional(),
// });

// // 4. 員工建立報告
// export const createStaffReportSchema = z.object({
//   type: z.enum(["SALES", "EMPLOYEE"]),
//   title: z.string().min(1, "報告標題為必填"),
//   content: z.string().min(1, "報告內容為必填"),
//   projectId: z.string().optional(),
// });

// // 5. 員工建立銷售活動
// export const createSalesActivitySchema = z.object({
//   title: z.string().min(1, "活動標題為必填"),
//   content: z.string().min(1, "活動內容為必填"),
//   image: z.any()
//     .refine(
//       (val) => {
//         return (
//           val != null &&
//           typeof val === "object" &&
//           "size" in val &&
//           "type" in val &&
//           typeof val.size === "number" &&
//           typeof val.type === "string" &&
//           val.size > 0
//         );
//       },
//       { message: "必須上傳有效的圖片檔案" }
//     )
//     .refine(
//       (val) => (val as any)?.size <= 5 * 1024 * 1024,
//       "圖片檔案大小不得超過 5MB"
//     )
//     .refine(
//       (val) => {
//         const type = (val as any)?.type;
//         return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
//       },
//       "僅支援 JPG、PNG、GIF、WebP 格式"
//     )
//     .optional(),
// });


// src/lib/schemas/staff.ts
import { z } from "zod";

// 輔助函式：驗證檔案是否為有效圖片
const imageFileSchema = z
  .instanceof(File, { message: "必須上傳有效的檔案" })
  .refine((file) => file.size > 0, { message: "檔案大小必須大於 0" })
  .refine((file) => file.size <= 5 * 1024 * 1024, { message: "圖片檔案大小不得超過 5MB" })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type),
    { message: "僅支援 JPG、PNG、GIF、WebP 格式" }
  )
  .optional();

// 1. 建立項目
export const createProjectSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1, "項目標題為必填"),
  description: z.string().optional(),
});

// 2. 建立報價
export const createQuoteSchema = z.object({
  projectId: z.string().min(1),
  amount: z.coerce.number().positive("報價金額必須大於 0"),
  details: z.string().optional(),
});

// 3. 發送訊息
export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().optional(),
  image: imageFileSchema,
});

// 4. 建立報告
export const createStaffReportSchema = z.object({
  type: z.enum(["SALES", "EMPLOYEE"]),
  title: z.string().min(1, "報告標題為必填"),
  content: z.string().min(1, "報告內容為必填"),
  projectId: z.string().optional(),
});

// 5. 建立銷售活動
export const createSalesActivitySchema = z.object({
  title: z.string().min(1, "活動標題為必填"),
  content: z.string().min(1, "活動內容為必填"),
  image: imageFileSchema,
});