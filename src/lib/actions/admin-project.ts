// src/lib/actions/admin-project.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import db from "../db"
import { Prisma } from "@prisma/client"
import { createProjectSchema, updateDeadlineSchema } from "@/lib/schemas/project"  // ← 從這裡匯入

// 建立項目（通常由客戶申請或 Admin 手動建立）
export async function createProject(formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const raw = Object.fromEntries(formData)
  const parsed = createProjectSchema.parse(raw)

  await db.project.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      customerId: parsed.customerId,
      status: "PENDING",
    },
  })

  revalidatePath("/admin/projects")
}

// 指派員工給項目（核心任務管理）
export async function assignEmployeeToProject(projectId: string, employeeId: string | null) {
  const session = await auth()
  
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  // 使用 Prisma 推薦的關聯更新方式
  const updateData: Prisma.ProjectUpdateInput = {
    assignedEmployee: employeeId 
      ? { connect: { id: employeeId } } 
      : { disconnect: true },
    
    status: employeeId ? "ASSIGNED" : "PENDING",
  }

  const project = await db.project.update({
    where: { id: projectId },
    data: updateData,
    include: { customer: true },
  })

  // 若指派成功（employeeId 不為 null）且客戶為普通客，自動升級為潛力客
  if (employeeId && project.customer.customerType === "NORMAL") {
    await db.user.update({
      where: { id: project.customerId },
      data: { customerType: "POTENTIAL" },
    })
  }

  // ★★★ 新增：自動建立 Conversation（如果客戶還沒有） ★★★
  if (employeeId) {
    // 檢查該客戶是否已有 Conversation
    const existingConv = await db.conversation.findFirst({
      where: { customerId: project.customerId },
    })

    if (!existingConv) {
      await db.conversation.create({
        data: {
          customerId: project.customerId,
          // 可選：初始訊息
          messages: {
            create: {
              senderRole: "SYSTEM",
              content: "系統訊息：員工已指派至此客戶，您現在可以開始對話。",
              userId: null, // 系統訊息無 userId
            },
          },
        },
      })
    }
  }

  revalidatePath("/admin/projects")
  revalidatePath("/admin/tasks")
  revalidatePath(`/staff/my-clients`) // 重新驗證員工客戶列表
  revalidatePath(`/staff/${project.customerId}`) // 重新驗證客戶詳細頁

  return { success: true }
}

// 更新項目基本資訊
export async function updateProject(id: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  await db.project.update({
    where: { id },
    data: {
      title,
      description: description || null,
    },
  })

  revalidatePath("/admin/projects")
}

// 刪除項目
export async function deleteProject(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")

  await db.project.delete({ where: { id } })
  revalidatePath("/admin/projects")
}

export async function updateProjectDeadline(
  projectId: string,
  deadline: Date | null
) {
  const validated = updateDeadlineSchema.parse({ projectId, deadline })

  await db.project.update({
    where: { id: validated.projectId },
    data: {
      deadline: validated.deadline,
    },
  })

  revalidatePath("/dashboard/admin/projects")
  return { success: true }
}


export async function toggleProjectCompletion(projectId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { isCompleted: true },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  await db.project.update({
    where: { id: projectId },
    data: { isCompleted: !project.isCompleted },
  })

  revalidatePath("/dashboard/admin")
}