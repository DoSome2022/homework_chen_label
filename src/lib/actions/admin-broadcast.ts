// // src/lib/actions/admin-broadcast.ts

// import { auth } from "@/lib/auth"
// import { revalidatePath } from "next/cache"
// import { uploadToOSS } from "@/lib/oss"
// import db from "@/lib/db"
// import { broadcastSchema } from "@/lib/schemas/broadcast"
// import z from "zod"
// import { sendBroadcastToAllCustomers } from "@/lib/notifications/broadcast"
// import { Prisma } from "@prisma/client"  

// // ───────── 建立廣播（加入 status） ─────────
// export async function createBroadcast(formData: FormData) {
//   const session = await auth();
//   if (session?.user?.role !== "ADMIN") throw new Error("未授權");

//   const title       = formData.get("title")       as string;
//   const content     = formData.get("content")     as string;
//   const videoUrl    = formData.get("videoUrl")    as string;
//   const scheduledAt = formData.get("scheduledAt") as string | null;
//   const imageFile   = formData.get("image")       as File | null;
//   const status      = formData.get("status")      as string;

//   console.log("[createBroadcast] 收到檔案資訊：", {
//     hasImage: !!imageFile,
//     fileName: imageFile?.name,
//     fileSize: imageFile?.size,
//     fileType: imageFile?.type,
//     status,
//   });

//   const parsed = broadcastSchema.parse({
//     title,
//     content,
//     videoUrl,
//     scheduledAt,
//   });

//   let imageUrl: string | null = null;

//   if (imageFile && imageFile.size > 0) {
//     try {
//       console.log("[createBroadcast] 開始上傳到 OSS，檔案大小：", imageFile.size);
//       imageUrl = await uploadToOSS(imageFile);
//       console.log("[createBroadcast] OSS 上傳成功，返回 URL：", imageUrl);
//     } catch (uploadError) {
//       console.error("[createBroadcast] OSS 上傳失敗：", uploadError);
//       throw new Error(`圖片上傳失敗：${uploadError instanceof Error ? uploadError.message : '未知錯誤'}`);
//     }
//   } else {
//     console.log("[createBroadcast] 沒有收到有效圖片檔案");
//   }

//   const broadcast = await db.broadcast.create({
//     data: {
//       title: parsed.title,
//       content: parsed.content,
//       videoUrl: parsed.videoUrl || null,
//       imageUrl,
//       scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : null,
//       authorId: session.user.id!,
//       status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
//       ...(status === "PUBLISHED" && { publishedAt: new Date() }),
//     },
//   });

//   // ✅ 修復：如果是立即發布，觸發發送（使用 void 明確表示不等待）
//   if (status === "PUBLISHED") {
//     // ✅ 使用 void 明確忽略 Promise，但確保錯誤被記錄
//     void sendBroadcastToAllCustomers(broadcast.id).catch((err) => {
//       console.error("[BroadcastNotify] 背景發送失敗:", {
//         broadcastId: broadcast.id,
//         error: err instanceof Error ? err.message : String(err),
//         stack: err instanceof Error ? err.stack : undefined,
//         timestamp: new Date().toISOString()
//       });
      
//       // ✅ 可以將錯誤記錄到資料庫（可選）
//       // await db.broadcastLog.create({
//       //   data: {
//       //     broadcastId: broadcast.id,
//       //     customerId: "system", // 或使用系統用戶
//       //     channel: "SYSTEM",
//       //     status: "FAILED",
//       //     errorMessage: err instanceof Error ? err.message : String(err),
//       //   }
//       // }).catch(console.error);
//     });
//   }

//   console.log("[createBroadcast] 建立完成，返回資料：", {
//     id: broadcast.id,
//     imageUrl: broadcast.imageUrl,
//     status: broadcast.status,
//   });

//   // ✅ 修復：安全執行 revalidatePath（只在請求上下文中）
//   try {
//     revalidatePath("/dashboard/admin/broadcasts");
//     revalidatePath("/dashboard");
//   } catch (error) {
//     console.warn("[createBroadcast] revalidatePath 跳過（可能不在請求上下文中）:", 
//       error instanceof Error ? error.message : String(error)
//     );
//   }

//   return broadcast;
// }

// // ───────── 更新廣播（加入 status） ─────────
// export async function updateBroadcast(id: string, formData: FormData) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") {
//     throw new Error("Unauthorized")
//   }

//   const title       = formData.get("title")       as string
//   const content     = formData.get("content")     as string
//   const videoUrl    = formData.get("videoUrl")    as string
//   const scheduledAtStr = formData.get("scheduledAt") as string
//   const imageFile   = formData.get("image")       as File | null
//   const status      = formData.get("status")       as string  // ✅ 新增

//   let parsed: z.infer<typeof broadcastSchema>
//   try {
//     parsed = broadcastSchema.parse({
//       title,
//       content,
//       videoUrl,
//       scheduledAt: scheduledAtStr || undefined,
//     })
//   } catch (error) {
//     console.error("表單驗證失敗:", error)
//     throw new Error("表單資料無效")
//   }

//   let imageUrl: string | null = null
//   if (imageFile && imageFile.size > 0) {
//     try {
//       imageUrl = await uploadToOSS(imageFile)
//     } catch (error) {
//       console.error("圖片上傳失敗:", error)
//       throw new Error("圖片上傳失敗")
//     }
//   }

//   const scheduledAt = parsed.scheduledAt
//     ? new Date(parsed.scheduledAt)
//     : null

//   if (scheduledAt && scheduledAt <= new Date()) {
//     throw new Error("排程時間必須是未來時間")
//   }

//   try {
//     // ✅ 準備更新資料
//     const updateData: Prisma.BroadcastUpdateInput = {
//       title: parsed.title,
//       content: parsed.content,
//       videoUrl: parsed.videoUrl || null,
//       scheduledAt,
//       ...(imageUrl && { imageUrl }),
//     }

//     // ✅ 如果有傳入 status 且原本是草稿改為發布，記錄發布時間
//     if (status === "PUBLISHED") {
//       updateData.status = "PUBLISHED"
//       updateData.publishedAt = new Date()
//     } else if (status === "DRAFT") {
//       updateData.status = "DRAFT"
//     }

//     await db.broadcast.update({
//       where: { id },
//       data: updateData,
//     })

//     revalidatePath("/dashboard/admin/broadcasts")
//     revalidatePath("/dashboard")
//   } catch (error) {
//     console.error("更新廣播失敗:", error)
//     throw new Error("更新失敗，請稍後再試")
//   }
// }

// // ───────── 刪除廣播 ─────────
// export async function deleteBroadcast(id: string) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

//   await db.broadcast.delete({ where: { id } })
//   revalidatePath("/admin/broadcasts")
// }

// // ═══════════════════════════════════════════
// // ✅ 新增：狀態操作函式
// // ═══════════════════════════════════════════

// // 發布廣播（草稿 → 已發布）
// export async function publishBroadcast(id: string) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") throw new Error("未授權")
//   // 更新狀態
//   await db.broadcast.update({
//     where: { id },
//     data: {
//       status: "PUBLISHED",
//       publishedAt: new Date(),
//     },
//   })
//   // ✅ 在背景發送通知（不 await，讓前端快速回應）
//   sendBroadcastToAllCustomers(id).catch((err) => {
//     console.error("[BroadcastNotify] 背景發送失敗:", err)
//   })
//   revalidatePath("/dashboard/admin/broadcasts")
//   return { success: true }
// }


// // 暫停廣播（已發布 → 已暫停）
// export async function pauseBroadcast(id: string) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") throw new Error("未授權")

//   await db.broadcast.update({
//     where: { id },
//     data: { status: "PAUSED" },
//   })

//   revalidatePath("/dashboard/admin/broadcasts")
//   return { success: true }
// }

// // 恢復廣播（已暫停 → 已發布）
// export async function resumeBroadcast(id: string) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") throw new Error("未授權")

//   await db.broadcast.update({
//     where: { id },
//     data: { status: "PUBLISHED" },
//   })

//   revalidatePath("/dashboard/admin/broadcasts")
//   return { success: true }
// }

// // 封存廣播
// export async function archiveBroadcast(id: string) {
//   const session = await auth()
//   if (session?.user?.role !== "ADMIN") throw new Error("未授權")

//   await db.broadcast.update({
//     where: { id },
//     data: { status: "ARCHIVED" },
//   })

//   revalidatePath("/dashboard/admin/broadcasts")
//   return { success: true }
// }

// export async function togglePinBroadcast(id: string) {
//   const session = await auth()
//   if (!session || session.user?.role !== "ADMIN") {
//     throw new Error("未授權")
//   }

//   const broadcast = await db.broadcast.findUnique({ where: { id } })
//   if (!broadcast) throw new Error("廣播不存在")

//   await db.broadcast.update({
//     where: { id },
//     data: { isPinned: !broadcast.isPinned },
//   })

//   revalidatePath("/dashboard/admin/broadcasts")
//   revalidatePath("/dashboard") // 客戶端也要重整

//   return { success: true }
// }


// /**
//  * 檢查並發布到期的排程廣播（給 Cron 使用）
//  * 不含 revalidatePath，避免在 Cron 中報錯
//  */
// export async function checkScheduledBroadcastsCron() {
//   console.log("[Cron] 開始檢查排程廣播...")
  
//   try {
//     const now = new Date()
    
//     // 找出所有已到期的排程廣播
//     const scheduledBroadcasts = await db.broadcast.findMany({
//       where: {
//         status: "DRAFT",
//         scheduledAt: {
//           lte: now, // 小於等於現在時間
//         },
//         isDailyPromotion: false, // 排除每日推廣（由另一個 Cron 處理）
//       },
//     })

//     if (scheduledBroadcasts.length === 0) {
//       console.log("[Cron] 沒有到期的排程廣播")
//       return { success: true, published: 0 }
//     }

//     console.log(`[Cron] 找到 ${scheduledBroadcasts.length} 筆到期排程廣播`)

//     // 逐一發布
//     let publishedCount = 0
//     for (const broadcast of scheduledBroadcasts) {
//       try {
//         await db.broadcast.update({
//           where: { id: broadcast.id },
//           data: {
//             status: "PUBLISHED",
//             publishedAt: new Date(),
//           },
//         })
        
//         console.log(`[Cron] 已發布: ${broadcast.title}`)
        
//         // ✅ 在背景發送通知（不阻塞 Cron）
//         sendBroadcastToAllCustomers(broadcast.id).catch((err) => {
//           console.error(`[Cron] 廣播 ${broadcast.id} 發送失敗:`, err)
//         })
        
//         publishedCount++
//       } catch (error) {
//         console.error(`[Cron] 發布廣播 ${broadcast.id} 失敗:`, error)
//       }
//     }

//     console.log(`[Cron] 排程廣播檢查完成，發布了 ${publishedCount} 筆`)
    
//     return { success: true, published: publishedCount }
//   } catch (error) {
//     console.error("[Cron] 檢查排程廣播失敗:", error)
//     throw error
//   }
// }

// /**
//  * 檢查並發布到期的排程廣播（給使用者使用）
//  * 包含 revalidatePath
//  */
// export async function checkScheduledBroadcasts() {
//   const result = await checkScheduledBroadcastsCron()
  
//   // ✅ 在請求上下文中執行 revalidatePath
//   try {
//     revalidatePath("/dashboard/admin/broadcasts")
//     revalidatePath("/dashboard")
//   } catch (error) {
//     console.warn("[checkScheduledBroadcasts] revalidatePath 跳過")
//   }
  
//   return result
// }

// src/lib/actions/admin-broadcast.ts
"use server"   // ← 加在第一行


import { auth } from "@/lib/auth"
// ❌ 移除頂層匯入
// import { revalidateTag, revalidatePath } from "next/cache"
import { uploadToOSS } from "@/lib/oss"
import db from "@/lib/db"
import { broadcastSchema } from "@/lib/schemas/broadcast"
import z from "zod"
import { sendBroadcastToAllCustomers } from "@/lib/notifications/broadcast"
import { Prisma } from "@prisma/client"  
import { CACHE_TAGS, safeRevalidate } from "./admin-broadcast-utils"


// ✅ 定義標籤常數（純字串，不依賴 next/cache）
// export const CACHE_TAGS = {
//   BROADCASTS: 'broadcasts',
//   DASHBOARD: 'dashboard',
// } as const

// ✅ 輔助函數：安全執行 revalidate（動態導入）
// async function safeRevalidate(tags: string[], paths: string[] = []) {
//   try {
//     // ✅ 動態導入 next/cache，只在服務器環境中使用
//     const { revalidateTag, revalidatePath } = await import('next/cache')
    
//     for (const tag of tags) {
//       revalidateTag(tag)
//     }
//     for (const path of paths) {
//       revalidatePath(path)
//     }
//   } catch (error) {
//     // 如果不在服務器環境中，靜默跳過
//     console.warn('[safeRevalidate] 跳過重新驗證:', {
//       tags,
//       paths,
//       error: error instanceof Error ? error.message : String(error),
//     })
//   }
// }

// ───────── 建立廣播 ─────────
export async function createBroadcast(formData: FormData) {
  "use server" 
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("未授權");

  const title       = formData.get("title")       as string;
  const content     = formData.get("content")     as string;
  const videoUrl    = formData.get("videoUrl")    as string;
  const scheduledAt = formData.get("scheduledAt") as string | null;
  const imageFile   = formData.get("image")       as File | null;
  const status      = formData.get("status")      as string;

  console.log("[createBroadcast] 收到檔案資訊：", {
    hasImage: !!imageFile,
    fileName: imageFile?.name,
    fileSize: imageFile?.size,
    fileType: imageFile?.type,
    status,
  });

  const parsed = broadcastSchema.parse({
    title,
    content,
    videoUrl,
    scheduledAt,
  });

  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    try {
      console.log("[createBroadcast] 開始上傳到 OSS，檔案大小：", imageFile.size);
      imageUrl = await uploadToOSS(imageFile);
      console.log("[createBroadcast] OSS 上傳成功，返回 URL：", imageUrl);
    } catch (uploadError) {
      console.error("[createBroadcast] OSS 上傳失敗：", uploadError);
      throw new Error(`圖片上傳失敗：${uploadError instanceof Error ? uploadError.message : '未知錯誤'}`);
    }
  } else {
    console.log("[createBroadcast] 沒有收到有效圖片檔案");
  }

  const broadcast = await db.broadcast.create({
    data: {
      title: parsed.title,
      content: parsed.content,
      videoUrl: parsed.videoUrl || null,
      imageUrl,
      scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : null,
      authorId: session.user.id!,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      ...(status === "PUBLISHED" && { publishedAt: new Date() }),
    },
  });

  // 如果是立即發布，觸發發送
  if (status === "PUBLISHED") {
    void sendBroadcastToAllCustomers(broadcast.id).catch((err) => {
      console.error("[BroadcastNotify] 背景發送失敗:", {
        broadcastId: broadcast.id,
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString()
      });
    });
  }

  console.log("[createBroadcast] 建立完成，返回資料：", {
    id: broadcast.id,
    imageUrl: broadcast.imageUrl,
    status: broadcast.status,
  });

  // ✅ 使用 revalidateTag 替代 revalidatePath
  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])

  return broadcast;
}

// ───────── 更新廣播 ─────────
export async function updateBroadcast(id: string, formData: FormData) {
  "use server" 
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const title       = formData.get("title")       as string
  const content     = formData.get("content")     as string
  const videoUrl    = formData.get("videoUrl")    as string
  const scheduledAtStr = formData.get("scheduledAt") as string
  const imageFile   = formData.get("image")       as File | null
  const status      = formData.get("status")       as string

  let parsed: z.infer<typeof broadcastSchema>
  try {
    parsed = broadcastSchema.parse({
      title,
      content,
      videoUrl,
      scheduledAt: scheduledAtStr || undefined,
    })
  } catch (error) {
    console.error("表單驗證失敗:", error)
    throw new Error("表單資料無效")
  }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadToOSS(imageFile)
    } catch (error) {
      console.error("圖片上傳失敗:", error)
      throw new Error("圖片上傳失敗")
    }
  }

  const scheduledAt = parsed.scheduledAt
    ? new Date(parsed.scheduledAt)
    : null

  if (scheduledAt && scheduledAt <= new Date()) {
    throw new Error("排程時間必須是未來時間")
  }

  try {
    const updateData: Prisma.BroadcastUpdateInput = {
      title: parsed.title,
      content: parsed.content,
      videoUrl: parsed.videoUrl || null,
      scheduledAt,
      ...(imageUrl && { imageUrl }),
    }

    if (status === "PUBLISHED") {
      updateData.status = "PUBLISHED"
      updateData.publishedAt = new Date()
    } else if (status === "DRAFT") {
      updateData.status = "DRAFT"
    }

    await db.broadcast.update({
      where: { id },
      data: updateData,
    })

    // ✅ 使用 revalidateTag 替代 revalidatePath
    await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])
  } catch (error) {
    console.error("更新廣播失敗:", error)
    throw new Error("更新失敗，請稍後再試")
  }
}

// ───────── 刪除廣播 ─────────
export async function deleteBroadcast(id: string) {
  "use server" 
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  await db.broadcast.delete({ where: { id } })
  
  // ✅ 使用 revalidateTag 替代 revalidatePath
  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])
}

// ═══════════════════════════════════════════
// 狀態操作函式
// ═══════════════════════════════════════════

// 發布廣播
export async function publishBroadcast(id: string) {
  "use server" 
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })

  void sendBroadcastToAllCustomers(id).catch((err) => {
    console.error("[BroadcastNotify] 背景發送失敗:", {
      broadcastId: id,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  })

  // ✅ 使用 revalidateTag 替代 revalidatePath
  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])

  return { success: true }
}

// 暫停廣播
export async function pauseBroadcast(id: string) {
  "use server" 
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: { status: "PAUSED" },
  })

  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])

  return { success: true }
}

// 恢復廣播
export async function resumeBroadcast(id: string) {
  "use server" 
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])

  return { success: true }
}

// 封存廣播
export async function archiveBroadcast(id: string) {
  "use server" 
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: { status: "ARCHIVED" },
  })

  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])

  return { success: true }
}

// 切換置頂
export async function togglePinBroadcast(id: string) {
  "use server" 
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("未授權")
  }

  const broadcast = await db.broadcast.findUnique({ where: { id } })
  if (!broadcast) throw new Error("廣播不存在")

  await db.broadcast.update({
    where: { id },
    data: { isPinned: !broadcast.isPinned },
  })

  await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])

  return { success: true }
}

// ═══════════════════════════════════════════
// Cron 任務專用函數
// ═══════════════════════════════════════════

// export async function checkScheduledBroadcastsCron() {
//   console.log("[Cron] 開始檢查排程廣播...")
  
//   try {
//     const now = new Date()
    
//     const scheduledBroadcasts = await db.broadcast.findMany({
//       where: {
//         status: "DRAFT",
//         scheduledAt: {
//           lte: now,
//         },
//         isDailyPromotion: false,
//       },
//     })

//     if (scheduledBroadcasts.length === 0) {
//       console.log("[Cron] 沒有到期的排程廣播")
//       return { success: true, published: 0 }
//     }

//     console.log(`[Cron] 找到 ${scheduledBroadcasts.length} 筆到期排程廣播`)

//     let publishedCount = 0
//     for (const broadcast of scheduledBroadcasts) {
//       try {
//         await db.broadcast.update({
//           where: { id: broadcast.id },
//           data: {
//             status: "PUBLISHED",
//             publishedAt: new Date(),
//           },
//         })
        
//         console.log(`[Cron] 已發布: ${broadcast.title}`)
        
//         void sendBroadcastToAllCustomers(broadcast.id).catch((err) => {
//           console.error(`[Cron] 廣播 ${broadcast.id} 發送失敗:`, {
//             error: err instanceof Error ? err.message : String(err),
//             timestamp: new Date().toISOString()
//           });
//         })
        
//         publishedCount++
//       } catch (error) {
//         console.error(`[Cron] 發布廣播 ${broadcast.id} 失敗:`, error)
//       }
//     }

//     console.log(`[Cron] 排程廣播檢查完成，發布了 ${publishedCount} 筆`)
    
//     return { success: true, published: publishedCount }
//   } catch (error) {
//     console.error("[Cron] 檢查排程廣播失敗:", error)
//     throw error
//   }
// }

// // 給使用者使用的（包含 revalidate）
// export async function checkScheduledBroadcasts() {
//   const result = await checkScheduledBroadcastsCron()
  
//   await safeRevalidate([CACHE_TAGS.BROADCASTS, CACHE_TAGS.DASHBOARD])
  
//   return result
// }