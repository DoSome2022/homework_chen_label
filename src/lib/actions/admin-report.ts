// src/lib/actions/admin-report.ts
'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import db from "@/lib/db"
import { reportSchema } from "@/lib/schemas/report"  // ← 改從這裡 import

export async function createReport(formData: FormData) {
  const session = await auth()
  if (!["ADMIN", "EMPLOYEE"].includes(session?.user?.role ?? "")) {
    throw new Error("Unauthorized")
  }

  const raw = Object.fromEntries(formData)
  const parsed = reportSchema.parse(raw)

  await db.report.create({
    data: {
      type: parsed.type,
      title: parsed.title,
      content: parsed.content,
      authorId: session!.user!.id,
      projectId: parsed.projectId || null,
    },
  })

  revalidatePath("/dashboard/admin/reports")  // 注意路徑應與實際頁面一致
  return { success: true }
}

export async function updateReport(id: string, formData: FormData) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")
  const raw = Object.fromEntries(formData)
  const parsed = reportSchema.parse(raw)
  await db.report.update({
    where: { id },
    data: {
      type: parsed.type,
      title: parsed.title,
      content: parsed.content,
      projectId: parsed.projectId || null,
    },
  })
  revalidatePath("/admin/reports")
}
export async function deleteReport(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized")
  await db.report.delete({ where: { id } })
  revalidatePath("/admin/reports")
}