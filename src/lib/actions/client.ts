
// src/lib/actions/client.ts
'use server'

import { auth } from "@/lib/auth"
import { uploadToOSS } from "@/lib/oss"
import { revalidatePath } from "next/cache"

import db from "../db"
import { applyProductSchema, uploadImageSchema } from "../schemas/client"



export async function uploadImage(formData: FormData): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized: 請先登入後再上傳圖片")
  }

  // 取得檔案
  const file = formData.get("image")

  // 1. 使用 Zod 驗證（這裡 file 會被當作 any 傳入）
  const validationResult = uploadImageSchema.safeParse({ image: file })

  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues[0].message
    throw new Error(errorMessage)
  }

  // 2. 現在 TypeScript 知道 file 是 File
  const validatedFile = validationResult.data.image as File

  try {
    const folder = `messages/${session.user.id}/${new Date().toISOString().split("T")[0]}`
    const url = await uploadToOSS(validatedFile, folder)

    revalidatePath("/dashboard/client/messages")
    return url
  } catch (error) {
    console.error("圖片上傳失敗:", error)
    throw new Error("上傳失敗，請稍後再試或聯絡系統管理員")
  }
}





export async function applyForProduct(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "CUSTOMER") throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData)
  const parsed = applyProductSchema.parse(raw)

  const userId = session.user.id

  // 建立待指派項目
  await db.project.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      customerId: userId,
      status: "PENDING",
    },
  })

  // 若原本為普通客，自動升級為潛力客
  const user = await db.user.findUnique({ where: { id: userId } })
  if (user?.customerType === "NORMAL") {
    await db.user.update({
      where: { id: userId },
      data: { customerType: "POTENTIAL" },
    })
  }

  revalidatePath("/dashboard/client/products")
  revalidatePath("/dashboard/staff/my-clients") // 通知員工有新申請
}

// 2. 潛力客發送訊息（文字 + 圖片）
// src/lib/actions/client.ts
export async function sendCustomerMessage(formData: FormData) {
  const session = await auth()

  // 修改權限檢查：允許員工或潛力客發送訊息
  const isAllowed =
    (session?.user?.role === "CUSTOMER" && session.user.customerType === "POTENTIAL") ||
    session?.user?.role === "EMPLOYEE"

  if (!isAllowed) {
    throw new Error("僅潛力客或員工可發送訊息")
  }

  const senderId = session.user.id
  const senderRole = session.user.role === "EMPLOYEE" ? "EMPLOYEE" : "CUSTOMER"

  const conversationId = formData.get("conversationId") as string
  const content = formData.get("content") as string | null
  const imageFile = formData.get("image") as File | null

  if (!content?.trim() && (!imageFile || imageFile.size === 0)) {
    throw new Error("訊息內容與圖片不可同時為空")
  }

  // 驗證此對話是否屬於自己
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { customerId: true },
  })

  if (!conversation) {
    throw new Error("對話不存在")
  }

  // 額外驗證：員工只能發給自己負責的客戶
  if (senderRole === "EMPLOYEE") {
    const project = await db.project.findFirst({
      where: {
        customerId: conversation.customerId,
        assignedEmployeeId: senderId,
      },
      select: { id: true },
    })

    if (!project) {
      throw new Error("無權發送訊息至此對話")
    }
  } else {
    // 客戶只能發給自己的對話
    if (conversation.customerId !== senderId) {
      throw new Error("無權操作此對話")
    }
  }

  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    const folder = `messages/${senderId}/${new Date().toISOString().split("T")[0]}`
    imageUrl = await uploadToOSS(imageFile, folder)
  }

  await db.message.create({
    data: {
      conversationId,
      senderRole,  // 動態決定角色
      content: content?.trim() || "",
      imageUrl,
      userId: senderId,
    },
  })

  revalidatePath("/dashboard/client/messages")
  revalidatePath(`/staff/${conversation.customerId}`)
}

// 3. 訂閱/取消廣播/廣告權限
export async function toggleBroadcastSubscription() {
  const session = await auth()
  if (session?.user?.role !== "CUSTOMER") throw new Error("Unauthorized")

  const current = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isSubscribed: true },
  })

  await db.user.update({
    where: { id: session.user.id },
    data: { isSubscribed: !current?.isSubscribed },
  })

  revalidatePath("/dashboard/client/broadcasts")
}