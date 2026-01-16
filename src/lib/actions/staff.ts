// src/lib/actions/staff.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import db from "../db"
import { uploadToOSS } from "@/lib/oss"
import {
  createProjectSchema,
  createQuoteSchema,
  createStaffReportSchema,
  // 移除未使用的：sendMessageSchema, createSalesActivitySchema, z
} from "@/lib/schemas/staff"

// 共用驗證函式（不變）
async function validateEmployeeAccess(clientId: string) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE") {
    throw new Error("Unauthorized: 僅員工可執行此操作")
  }

  const employeeId = session.user.id

  const client = await db.user.findUnique({
    where: { id: clientId },
    select: {
      role: true,
      customerType: true,
      projects: {
        where: { assignedEmployeeId: employeeId },
        select: { id: true },
        take: 1,
      },
    },
  })

  if (!client || client.role !== "CUSTOMER" || client.customerType !== "POTENTIAL" || client.projects.length === 0) {
    throw new Error("Forbidden: 您無權操作此客戶")
  }

  return { employeeId, client }
}

export async function createProjectForClient(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = createProjectSchema.parse(raw)

  await validateEmployeeAccess(parsed.clientId)

  await db.project.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      customerId: parsed.clientId,
      status: "ASSIGNED",
      assignedEmployeeId: (await auth())!.user!.id,
    },
  })

  revalidatePath(`/staff/${parsed.clientId}`)
  revalidatePath("/staff/my-clients")
}

export async function createQuoteForProject(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = createQuoteSchema.parse(raw)

  const project = await db.project.findUnique({
    where: { id: parsed.projectId },
    select: { customerId: true, assignedEmployeeId: true },
  })

  if (!project) throw new Error("項目不存在")

  await validateEmployeeAccess(project.customerId)

  await db.quote.create({
    data: {
      projectId: parsed.projectId,
      amount: parsed.amount,
      details: parsed.details || null,
    },
  })

  revalidatePath(`/staff/${project.customerId}`)
}

export async function sendMessage(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Unauthorized")

  const employeeId = session.user.id

  const conversationId = formData.get("conversationId") as string
  const content = formData.get("content") as string | null
  const imageFile = formData.get("image") // 型別為 FormDataEntryValue | null

  // 改用型別守衛取代 any
  const hasContent = content?.trim();
  const hasValidImage = imageFile instanceof File && imageFile.size > 0;

  if (!hasContent && !hasValidImage) {
    throw new Error("訊息內容與圖片不可同時為空")
  }

  // 驗證對話權限（不變）
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      customer: {
        select: {
          projects: {
            where: { assignedEmployeeId: employeeId },
            take: 1,
          },
        },
      },
    },
  })

  if (!conversation || conversation.customer.projects.length === 0) {
    throw new Error("無權發送訊息至此對話")
  }

  let imageUrl: string | null = null
  if (hasValidImage) {
    imageUrl = await uploadToOSS(imageFile as File, `messages/${employeeId}`)
  }

  await db.message.create({
    data: {
      conversationId,
      senderRole: "EMPLOYEE",
      content: content?.trim() || "",
      imageUrl,
      userId: employeeId,
    },
  })

  // 注意：這裡的 customerId 應從 conversation 取得
  revalidatePath(`/staff/${conversation.customerId}`)
}

export async function createStaffReport(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData)
  const parsed = createStaffReportSchema.parse(raw)

  if (parsed.projectId) {
    const project = await db.project.findUnique({
      where: { id: parsed.projectId },
      select: { assignedEmployeeId: true },
    })
    if (project?.assignedEmployeeId !== session.user.id) {
      throw new Error("不可關聯非自己負責的項目")
    }
  }

  await db.report.create({
    data: {
      type: parsed.type,
      title: parsed.title,
      content: parsed.content,
      authorId: session.user.id,
      projectId: parsed.projectId || null,
    },
  })

  revalidatePath("/staff/workspace")
}

export async function createSalesActivity(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const imageFile = formData.get("image")

  // 同樣使用型別守衛取代 any
  const hasValidImage = imageFile instanceof File && imageFile.size > 0;

  let imageUrl: string | null = null
  if (hasValidImage) {
    imageUrl = await uploadToOSS(imageFile as File, "sales-activities")
  }

  await db.salesActivity.create({
    data: {
      title,
      content,
      imageUrl,
      authorId: session.user.id,
    },
  })

  revalidatePath("/staff/workspace")
}

// 員工刪除自己的報告或銷售活動
export async function deleteStaffItem(id: string, type: "REPORT" | "SALES_ACTIVITY") {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE") throw new Error("Unauthorized")

  if (type === "REPORT") {
    const report = await db.report.findUnique({
      where: { id },
      select: { authorId: true },
    })
    if (report?.authorId !== session.user.id) throw new Error("無權刪除")
    await db.report.delete({ where: { id } })
  } else if (type === "SALES_ACTIVITY") {
    const activity = await db.salesActivity.findUnique({
      where: { id },
      select: { authorId: true },
    })
    if (activity?.authorId !== session.user.id) throw new Error("無權刪除")
    await db.salesActivity.delete({ where: { id } })
  }

  revalidatePath("/staff/workspace")
}



export async function getClientDetail(clientId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYEE") {
    throw new Error("Unauthorized");
  }

  const employeeId = session.user.id;

  const client = await db.user.findUnique({
    where: {
      id: clientId,
      role: "CUSTOMER",
      customerType: "POTENTIAL",
      projects: {
        some: { assignedEmployeeId: employeeId },
      },
    },
    include: {
      projects: {
        where: { assignedEmployeeId: employeeId },
        include: { quotes: true },
      },
      conversations: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!client) {
    throw new Error("客戶不存在或無權限");
  }

  return { client, projects: client.projects };
}



export async function toggleProjectCompletion(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("未登入")
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      isCompleted: true,
      assignedEmployeeId: true,
    },
  })

  if (!project) {
    throw new Error("項目不存在")
  }

  if (project.assignedEmployeeId !== session.user.id) {
    throw new Error("無權限操作此項目")
  }

  await db.project.update({
    where: { id: projectId },
    data: { isCompleted: !project.isCompleted },
  })

  revalidatePath("/dashboard/staff")
}