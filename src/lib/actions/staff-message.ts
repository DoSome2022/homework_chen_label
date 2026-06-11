// src/lib/actions/staff-message.ts
'use server'

import { auth } from "@/lib/auth"
import { uploadToOSS } from "@/lib/oss"
import { revalidatePath } from "next/cache"
import db from "@/lib/db"
import { MessageType } from "@prisma/client" 


/**
 * 員工發送訊息（含文件附件）
 */
export async function sendStaffMessage(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE" && session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const conversationId = formData.get("conversationId") as string
  const content = formData.get("content") as string | null
  const fileUrl = formData.get("fileUrl") as string | null
  const fileName = formData.get("fileName") as string | null
  const fileType = formData.get("fileType") as string | null
  const messageType = (formData.get("messageType") as string) || "NORMAL"

  const hasContent = content && content.trim().length > 0
  const hasFile = fileUrl && fileUrl.trim().length > 0

  if (!hasContent && !hasFile) {
    throw new Error("訊息內容與附件不可同時為空")
  }

  // 驗證對話存在且有權限
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      project: { select: { assignedEmployeeId: true } },
    },
  })

  if (!conversation) throw new Error("對話不存在")

  // 檢查員工是否為此專案的負責人
  if (
    session.user.role === "EMPLOYEE" &&
    conversation.project?.assignedEmployeeId !== session.user.id
  ) {
    throw new Error("無權發送訊息至此對話")
  }

  await db.message.create({
    data: {
      conversationId,
      senderRole: session.user.role,
      content: hasContent ? content.trim() : "",
      imageUrl: hasFile && fileType?.startsWith("image/") ? fileUrl : null,
      fileName: fileName || null,
      fileSize: null, // 可選，從 formData 帶入
      fileType: fileType || null,
      messageType: (messageType as MessageType) || "NORMAL",
      userId: session.user.id,
    },
  })

  revalidatePath(`/dashboard/staff/${conversation.customerId}`)
  revalidatePath("/dashboard/client/messages")

  return { success: true }
}

/**
 * 員工在對話中建立報價單
 */
export async function sendQuoteInConversation(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE" && session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const conversationId = formData.get("conversationId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const details = formData.get("details") as string | null

  if (isNaN(amount) || amount <= 0) {
    throw new Error("金額必須大於 0")
  }

  // 找到對應的 Project
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: { project: true },
  })

  if (!conversation?.project) throw new Error("此對話未關聯任何專案")

  // 1. 建立報價單
  const quote = await db.quote.create({
    data: {
      projectId: conversation.project.id,
      amount,
      details: details || null,
    },
  })

  // 2. 發送系統訊息通知客戶
  await db.message.create({
    data: {
      conversationId,
      senderRole: "SYSTEM",
      content: [
        `📄 **新報價單已建立**`,
        ``,
        `💰 金額：HK$${amount.toLocaleString("zh-HK")}`,
        details ? `📝 說明：${details}` : "",
        ``,
        `🆔 報價單編號：${quote.id.slice(0, 8)}...`,
      ].filter(Boolean).join("\n"),
      messageType: "QUOTE",
      userId: session.user.id,
    },
  })

  revalidatePath(`/dashboard/staff/${conversation.customerId}`)
  revalidatePath("/dashboard/admin/quotes")

  return { success: true, quoteId: quote.id }
}

/**
 * 員工更新專案進度
 */
export async function updateProjectProgress(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE" && session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const projectId = formData.get("projectId") as string
  const conversationId = formData.get("conversationId") as string
  const stage = formData.get("stage") as string
  const description = formData.get("description") as string | null

  if (!stage?.trim()) throw new Error("請輸入進度階段名稱")

  // ⭐ 先查詢 conversation，拿到 customerId
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { customerId: true },
  })

  if (!conversation) throw new Error("對話不存在")

  // 1. 建立進度記錄
  await db.projectProgress.create({
    data: {
      projectId,
      stage: stage.trim(),
      description: description || null,
      updatedById: session.user.id,
    },
  })

  // 2. 發送系統訊息通知客戶
  await db.message.create({
    data: {
      conversationId,
      senderRole: "SYSTEM",
      content: [
        `🔄 **專案進度更新**`,
        ``,
        `📌 目前階段：**${stage.trim()}**`,
        description ? `📝 備註：${description}` : "",
        ``,
        `👤 更新人員：${session.user.name || "員工"}`,
      ].filter(Boolean).join("\n"),
      messageType: "PROGRESS",
      userId: session.user.id,
    },
  })

  // ✅ 現在 conversation.customerId 存在了
  revalidatePath(`/dashboard/staff/${conversation.customerId}`)
  revalidatePath("/dashboard/admin/projects")

  return { success: true }
}


/**
 * 上傳檔案（支援所有類型）
 */
export async function uploadFile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) throw new Error("請選擇檔案")

  try {
    const folder = `messages/${session.user.id}/${new Date().toISOString().split("T")[0]}`
    const url = await uploadToOSS(file, folder)

    return {
      url,
      name: file.name,
      type: file.type,
      size: file.size,
    }
  } catch (error) {
    console.error("檔案上傳失敗:", error)
    throw new Error("上傳失敗")
  }
}

/**
 * 取得專案的最新進度
 */
export async function getProjectProgress(projectId: string) {
  return await db.projectProgress.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      updatedBy: { select: { name: true } },
    },
  })
}
