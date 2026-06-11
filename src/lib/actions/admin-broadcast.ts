// src/lib/actions/admin-broadcast.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { uploadToOSS } from "@/lib/oss"
import db from "@/lib/db"
import { broadcastSchema } from "@/lib/schemas/broadcast"
import z from "zod"
import { sendBroadcastToAllCustomers } from "@/lib/notifications/broadcast"
import { Prisma } from "@prisma/client"  

// ───────── 建立廣播（加入 status） ─────────
export async function createBroadcast(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("未授權");

  const title       = formData.get("title")       as string;
  const content     = formData.get("content")     as string;
  const videoUrl    = formData.get("videoUrl")    as string;
  const scheduledAt = formData.get("scheduledAt") as string | null;
  const imageFile   = formData.get("image")       as File | null;
  const status      = formData.get("status")      as string;  // ✅ 新增

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
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",  // ✅ 新增
      ...(status === "PUBLISHED" && { publishedAt: new Date() }), // ✅ 記錄發布時間
    },
  });

    // ✅ 如果是立即發布，觸發發送
  if (status === "PUBLISHED") {
    sendBroadcastToAllCustomers(broadcast.id).catch((err) => {
      console.error("[BroadcastNotify] 背景發送失敗:", err)
    })
  }

  console.log("[createBroadcast] 建立完成，返回資料：", {
    id: broadcast.id,
    imageUrl: broadcast.imageUrl,
    status: broadcast.status,
  });

  revalidatePath("/dashboard/admin/broadcasts");
  revalidatePath("/dashboard");

  return broadcast;
}

// ───────── 更新廣播（加入 status） ─────────
export async function updateBroadcast(id: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const title       = formData.get("title")       as string
  const content     = formData.get("content")     as string
  const videoUrl    = formData.get("videoUrl")    as string
  const scheduledAtStr = formData.get("scheduledAt") as string
  const imageFile   = formData.get("image")       as File | null
  const status      = formData.get("status")       as string  // ✅ 新增

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
    // ✅ 準備更新資料
    const updateData: Prisma.BroadcastUpdateInput = {
      title: parsed.title,
      content: parsed.content,
      videoUrl: parsed.videoUrl || null,
      scheduledAt,
      ...(imageUrl && { imageUrl }),
    }

    // ✅ 如果有傳入 status 且原本是草稿改為發布，記錄發布時間
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

    revalidatePath("/dashboard/admin/broadcasts")
    revalidatePath("/dashboard")
  } catch (error) {
    console.error("更新廣播失敗:", error)
    throw new Error("更新失敗，請稍後再試")
  }
}

// ───────── 刪除廣播 ─────────
export async function deleteBroadcast(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  await db.broadcast.delete({ where: { id } })
  revalidatePath("/admin/broadcasts")
}

// ═══════════════════════════════════════════
// ✅ 新增：狀態操作函式
// ═══════════════════════════════════════════

// 發布廣播（草稿 → 已發布）
export async function publishBroadcast(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")
  // 更新狀態
  await db.broadcast.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  })
  // ✅ 在背景發送通知（不 await，讓前端快速回應）
  sendBroadcastToAllCustomers(id).catch((err) => {
    console.error("[BroadcastNotify] 背景發送失敗:", err)
  })
  revalidatePath("/dashboard/admin/broadcasts")
  return { success: true }
}


// 暫停廣播（已發布 → 已暫停）
export async function pauseBroadcast(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: { status: "PAUSED" },
  })

  revalidatePath("/dashboard/admin/broadcasts")
  return { success: true }
}

// 恢復廣播（已暫停 → 已發布）
export async function resumeBroadcast(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: { status: "PUBLISHED" },
  })

  revalidatePath("/dashboard/admin/broadcasts")
  return { success: true }
}

// 封存廣播
export async function archiveBroadcast(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("未授權")

  await db.broadcast.update({
    where: { id },
    data: { status: "ARCHIVED" },
  })

  revalidatePath("/dashboard/admin/broadcasts")
  return { success: true }
}
