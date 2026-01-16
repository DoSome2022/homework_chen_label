// src/lib/actions/admin-broadcast.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { uploadToOSS } from "@/lib/oss"
import db from "@/lib/db"
import { broadcastSchema } from "@/lib/schemas/broadcast"
import z from "zod"

export async function createBroadcast(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const videoUrl = formData.get("videoUrl") as string
  const scheduledAtStr = formData.get("scheduledAt") as string
  const imageFile = formData.get("image") as File | null

  const parsed = broadcastSchema.parse({
    title,
    content,
    videoUrl,
    scheduledAt: scheduledAtStr,
  })

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadToOSS(imageFile)
  }

  const scheduledAt = parsed.scheduledAt ? new Date(parsed.scheduledAt) : null

  await db.broadcast.create({
    data: {
      title: parsed.title,
      content: parsed.content,
      videoUrl: parsed.videoUrl || null,
      imageUrl,
      scheduledAt,  // ← 新增
      authorId: session.user.id,
    },
  })

  revalidatePath("/dashboard/admin/broadcasts")
  revalidatePath("/dashboard") // 客戶端儀表板也要重新驗證
}

export async function updateBroadcast(id: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  // 取得表單資料
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const videoUrl = formData.get("videoUrl") as string
  const scheduledAtStr = formData.get("scheduledAt") as string
  const imageFile = formData.get("image") as File | null

  // 驗證表單資料
  let parsed: z.infer<typeof broadcastSchema>
  try {
    parsed = broadcastSchema.parse({
      title,
      content,
      videoUrl,
      scheduledAt: scheduledAtStr || undefined, // 空字串轉為 undefined
    })
  } catch (error) {
    console.error("表單驗證失敗:", error)
    throw new Error("表單資料無效")
  }

  // 處理圖片上傳（只有新檔案才更新）
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadToOSS(imageFile)
    } catch (error) {
      console.error("圖片上傳失敗:", error)
      throw new Error("圖片上傳失敗")
    }
  }

  // 處理排程時間
  const scheduledAt = parsed.scheduledAt
    ? new Date(parsed.scheduledAt) // ISO 字串轉 Date
    : null

  // 如果 scheduledAtStr 是未來時間，確認有效性
  if (scheduledAt && scheduledAt <= new Date()) {
    throw new Error("排程時間必須是未來時間")
  }

  // 更新資料庫
  try {
    await db.broadcast.update({
      where: { id },
      data: {
        title: parsed.title,
        content: parsed.content,
        videoUrl: parsed.videoUrl || null,
        scheduledAt,
        ...(imageUrl && { imageUrl }), // 只在有新圖片時更新
      },
    })

    revalidatePath("/dashboard/admin/broadcasts")
    revalidatePath("/dashboard") // 客戶端儀表板也要重新驗證
  } catch (error) {
    console.error("更新廣播失敗:", error)
    throw new Error("更新失敗，請稍後再試")
  }
}

// deleteBroadcast 保持不變
// 刪除廣播
export async function deleteBroadcast(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  await db.broadcast.delete({ where: { id } })
  revalidatePath("/admin/broadcasts")
}