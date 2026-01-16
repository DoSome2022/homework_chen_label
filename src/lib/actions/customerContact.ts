// src/actions/customerContact.ts
"use server"

import { z } from "zod"
import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import { contactSchema } from "../schemas/customer"


export type ContactFormInput = z.infer<typeof contactSchema>

type ActionState = {
  success?: boolean
  error?: string
  validationErrors?: Partial<Record<keyof ContactFormInput, string>>
}

export async function upsertCustomerContact(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData)
  const parsed = contactSchema.safeParse(rawData)

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof ContactFormInput, string>> = {}
    parsed.error.issues.forEach(issue => {
      const path = issue.path[0] as keyof ContactFormInput
      fieldErrors[path] = issue.message
    })
    return { error: "表單驗證失敗", validationErrors: fieldErrors }
  }

  try {
    await db.customerContact.upsert({
      where: { customerId: parsed.data.customerId },
      update: {
        name: parsed.data.name,
        company: parsed.data.company ?? null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        contactPerson: parsed.data.contactPerson || null,
        phone: parsed.data.phone || null,
        extraInfo: parsed.data.extraInfo || null,
      },
      create: {
        customerId: parsed.data.customerId,
        name: parsed.data.name,
        company: parsed.data.company ?? null,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        contactPerson: parsed.data.contactPerson || null,
        phone: parsed.data.phone || null,
        extraInfo: parsed.data.extraInfo || null,
      },
    })

    revalidatePath(`/dashboard/admin/customers/${parsed.data.customerId}`)

    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: "儲存聯絡資訊失敗，請稍後再試" }
  }
}


export async function deleteCustomerContact(
  customerId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await db.customerContact.delete({
      where: { customerId },
    })

    revalidatePath(`/dashboard/admin/customers/${customerId}`)

    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: "刪除聯絡資訊失敗，請稍後再試" }
  }
}