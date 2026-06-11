
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

  // 查詢產品資訊
  const product = await db.product.findUnique({
    where: { id: parsed.productId },
    select: { name: true, description: true, price: true },
  })

  if (!product) throw new Error("產品不存在")

  // ── 產品資訊字串（title 和 description 都會用到）──
  const productInfo = [
    "",
    "─── 申請產品資訊 ───",
    `📦 產品名稱：${product.name}`,
    `📝 產品說明：${product.description || "無"}`,
    `💰 產品價格：$${product.price}`,
  ].join("\n")

  // ── 組合 title ──
  const finalTitle = `${parsed.title}\n${productInfo}`

  // ── 組合 description ──
  const userDescription = parsed.description?.trim() || ""
  const finalDescription = userDescription
    ? `${userDescription}\n${productInfo}`
    : productInfo.trimStart()

  // 建立待指派項目
  const project = await db.project.create({
    data: {
      title: finalTitle,               // ✅ title 也包含產品資訊
      description: finalDescription,   // ✅ description 也包含產品資訊
      customerId: userId,
      status: "PENDING",
    },
  })

  // 自動建立該任務的對話框
  await db.conversation.create({
    data: {
      customerId: userId,
      projectId: project.id,
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
  revalidatePath("/dashboard/staff/my-clients")

  return { success: true }
}


// 2. 潛力客發送訊息（文字 + 圖片）
// src/lib/actions/client.ts


export async function sendCustomerMessage(formData: FormData) {
  const session = await auth()

  const isAllowed =
    (session?.user?.role === "CUSTOMER" && session.user.customerType === "POTENTIAL") ||
    session?.user?.role === "EMPLOYEE"

  if (!isAllowed) {
    throw new Error("僅潛力客或員工可發送訊息")
  }

  const senderId = session.user.id!
  const senderRole = session.user.role === "EMPLOYEE" ? "EMPLOYEE" : "CUSTOMER"

  const conversationId = formData.get("conversationId") as string
  const content   = formData.get("content")  as string | null
  const imageUrl  = formData.get("imageUrl") as string | null   // ← 只接收這個

  // 驗證：至少要有文字或圖片
  const hasContent = content && content.trim().length > 0
  const hasImage   = imageUrl && imageUrl.trim().length > 0

  if (!hasContent && !hasImage) {
    throw new Error("訊息內容與圖片不可同時為空")
  }

  // 驗證對話存在
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { customerId: true },
  })

  if (!conversation) {
    throw new Error("對話不存在")
  }

  // 權限檢查
  if (senderRole === "EMPLOYEE") {
    const project = await db.project.findFirst({
      where: {
        customerId: conversation.customerId,
        assignedEmployeeId: senderId,
      },
      select: { id: true },
    })
    if (!project) throw new Error("無權發送訊息至此對話")
  } else {
    if (conversation.customerId !== senderId) {
      throw new Error("無權操作此對話")
    }
  }

  // 建立訊息
  await db.message.create({
    data: {
      conversationId,
      senderRole,
      content: hasContent ? content.trim() : "",
      imageUrl: hasImage ? imageUrl : null,
      userId: senderId,
    },
  })

  revalidatePath("/dashboard/client/messages")
  revalidatePath(`/staff/${conversation.customerId}`)

  return { success: true }
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


// 增加在 src/lib/actions/client.ts 中

export async function applyForBroadcast(broadcastId: string) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "CUSTOMER") {
    throw new Error("Unauthorized: 僅限客戶申請")
  }

  const userId = session.user.id

  // 1. 查詢廣播資訊
  const broadcast = await db.broadcast.findUnique({
    where: { id: broadcastId },
    select: {
      title: true,
      content: true,
    },
  })

  if (!broadcast) throw new Error("找不到該廣播內容")

  // 2. ── 廣播資訊字串 (與產品格式一致，方便 Admin 辨識) ──
  const broadcastInfo = [
    "",
    "─── 來自廣播申請 ───",
    `📢 廣播標題：${broadcast.title}`,
    `📝 內容摘要：${broadcast.content.substring(0, 50)}...`, // 取前50字避免過長
  ].join("\n")

  // 3. ── 組合 title 與 description ──
  // Title 包含：原始標題 + 來源標記
  const finalTitle = `[廣播申請] ${broadcast.title}`
  
  // Description 包含：廣播全文 + 來源元數據
  const finalDescription = `${broadcast.content}\n${broadcastInfo}`

  // 4. 執行資料庫操作 (原子化操作)
  try {
    // 建立 Project
    const project = await db.project.create({
      data: {
        title: finalTitle,
        description: finalDescription,
        customerId: userId,
        status: "PENDING",
      },
    })

    // 自動建立該任務的對話框
    await db.conversation.create({
      data: {
        customerId: userId,
        projectId: project.id,
      },
    })

    // 5. 升級用戶為潛力客
    const user = await db.user.findUnique({ where: { id: userId } })
    if (user?.customerType === "NORMAL") {
      await db.user.update({
        where: { id: userId },
        data: { customerType: "POTENTIAL" },
      })
    }

    revalidatePath("/dashboard/client/products")
    revalidatePath("/dashboard/client/broadcasts")
    // revalidate: true // 觸發重新整理數據

    return { success: true, message: "申請成功，請等待管理員審核" }
  } catch (error) {
    console.error("廣播申請失敗:", error)
    throw new Error("申請過程發生錯誤，請稍後再試")
  }
}
