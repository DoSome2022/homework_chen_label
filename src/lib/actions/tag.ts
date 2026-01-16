// src/lib/actions/tag.ts
"use server"

import { revalidatePath } from "next/cache"
import db from "@/lib/db"
import { z } from "zod"

const tagSchema = z.object({
  name: z.string().min(1).max(20),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export async function createTag(name: string, color?: string) {
  const validated = tagSchema.parse({ name, color })
  const tag = await db.tag.create({
    data: { name: validated.name, color: validated.color },
  })
  revalidatePath("/dashboard/admin/customers")
  return tag
}

export async function updateTag(id: string, name: string, color?: string) {
  const validated = tagSchema.parse({ name, color })
  await db.tag.update({
    where: { id },
    data: { name: validated.name, color: validated.color },
  })
  revalidatePath("/dashboard/admin/customers")
}

export async function deleteTag(id: string) {
  await db.tag.delete({ where: { id } })
  revalidatePath("/dashboard/admin/customers")
}

export async function addTagToCustomer(customerId: string, tagId: string) {
  await db.customerTag.upsert({
    where: { customerId_tagId: { customerId, tagId } },
    update: {},
    create: { customerId, tagId },
  })
  revalidatePath("/dashboard/admin/customers")
}

export async function removeTagFromCustomer(customerId: string, tagId: string) {
  await db.customerTag.delete({
    where: { customerId_tagId: { customerId, tagId } },
  })
  revalidatePath("/dashboard/admin/customers")
}