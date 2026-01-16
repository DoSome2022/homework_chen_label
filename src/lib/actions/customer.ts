"use server"

import { z } from "zod"
import db from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { customerSchema } from "../schemas/customer"



export async function createOrUpdateCustomer(data: z.infer<typeof customerSchema>) {
  const validated = customerSchema.parse(data)

  if (validated.id) {
    // 更新
    await db.user.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        email: validated.email,
        customerType: validated.customerType,
      },
    })
  } else {
    // 新增
    const hashedPassword = await bcrypt.hash(validated.password!, 10)
    await db.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: "CUSTOMER",
        customerType: validated.customerType,
      },
    })
  }

  revalidatePath("/dashboard/admin/customers")
  return { success: true }
}

export async function deleteCustomer(id: string) {
  await db.user.delete({ where: { id } })
  revalidatePath("/dashboard/admin/customers")
  return { success: true }
}

export async function bulkDeleteCustomers(ids: string[]) {
  await db.user.deleteMany({
    where: { id: { in: ids } },
  })
  revalidatePath("/dashboard/admin/customers")
  return { success: true }
}