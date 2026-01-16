// // src/lib/schemas/client.ts
// import { z } from "zod"

// // 申請產品的 schema
// export const applyProductSchema = z.object({
//   productId: z.string(),
//   title: z.string().min(1, "申請標題為必填"),
//   description: z.string().optional(),
// })

// // 如果未來有其他 client 相關 schema，也可以放在這裡

// // src/lib/schemas/client.ts（或直接放在 client.ts 內也可，但建議保持分離）

// export const uploadImageSchema = z.object({
//   image: z.any().refine(
//     (val) => {
//       // 檢查是否具備 File 物件的必要特徵（duck typing）
//       return (
//         val != null &&
//         typeof val === "object" &&
//         "size" in val &&
//         "type" in val &&
//         typeof val.size === "number" &&
//         typeof val.type === "string" &&
//         val.size > 0
//       )
//     },
//     { message: "必須上傳有效的圖片檔案" }
//   )
//   .refine(
//     (val) => (val as any)?.size > 0,
//     "檔案不能為空"
//   )
//   .refine(
//     (val) => (val as any)?.size <= 5 * 1024 * 1024,
//     "圖片檔案大小不得超過 5MB"
//   )
//   .refine(
//     (val) => {
//       const type = (val as any)?.type
//       return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type)
//     },
//     "僅支援 JPG、PNG、GIF、WebP 格式"
//   ),
// })



// src/lib/schemas/client.ts
import { z } from "zod"

// 申請產品的 schema（維持不變）
export const applyProductSchema = z.object({
  productId: z.string(),
  title: z.string().min(1, "申請標題為必填"),
  description: z.string().optional(),
})

// 圖片上傳專用 schema（server-safe 且避免 any）
export const uploadImageSchema = z.object({
  image: z
    .custom<Blob | null | undefined>(
      (val): val is Blob | null | undefined =>
        val === null ||
        val === undefined ||
        (val instanceof Blob &&
          typeof val.size === "number" &&
          typeof val.type === "string"),
      { message: "必須上傳有效的檔案" }
    )
    .refine(
      (val): val is Blob => val != null && val.size > 0,
      { message: "檔案不能為空" }
    )
    .refine((val) => val.size <= 5 * 1024 * 1024, {
      message: "圖片檔案大小不得超過 5MB",
    })
    .refine(
      (val) =>
        ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(val.type),
      { message: "僅支援 JPG、PNG、GIF、WebP 格式" }
    )
    .optional(),
})
// 如果未來有其他 client 相關 schema，也可以放在這裡