// src/lib/actions/admin-broadcast.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { uploadToOSS } from "@/lib/oss"
import db from "@/lib/db"
import { broadcastSchema } from "@/lib/schemas/broadcast"
import z from "zod"

// src/lib/actions/admin-broadcast.ts
export async function createBroadcast(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("未授權");

  const title       = formData.get("title")       as string;
  const content     = formData.get("content")     as string;
  const videoUrl    = formData.get("videoUrl")    as string;
  const scheduledAt = formData.get("scheduledAt") as string | null;
  const imageFile   = formData.get("image")       as File | null;

  console.log("[createBroadcast] 收到檔案資訊：", {
    hasImage: !!imageFile,
    fileName: imageFile?.name,
    fileSize: imageFile?.size,
    fileType: imageFile?.type,
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
      // 決定是否要阻斷整個建立流程
      // 選項A：拋錯，讓前端知道失敗（推薦）
      throw new Error(`圖片上傳失敗：${uploadError instanceof Error ? uploadError.message : '未知錯誤'}`);
      // 選項B：容錯，圖片失敗但廣播仍建立（imageUrl 保持 null）
      // imageUrl = null;
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
    },
  });

  console.log("[createBroadcast] 建立完成，返回資料：", {
    id: broadcast.id,
    imageUrl: broadcast.imageUrl,
  });

  revalidatePath("/dashboard/admin/broadcasts");
  revalidatePath("/dashboard");

  return broadcast;
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