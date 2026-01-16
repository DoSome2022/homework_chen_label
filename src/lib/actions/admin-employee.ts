'use server'

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import db from "../db"
import { Prisma } from "@prisma/client" // 1. 新增這個引入，用來定義資料庫操作的型別
import { employeeSchema } from "../schemas/employee"

// 2. 定義一個簡易的介面來解決 session.user 沒有 role 的問題
interface SessionUser {
  role?: string;
  // name, email, image 原本就有，不一定要寫
}



// 建立員工
export async function createEmployee(formData: FormData) {
  const session = await auth()
  
  // 3. 修改這裡：使用 SessionUser 取代 any
  const user = session?.user as SessionUser | undefined
  if (user?.role !== "ADMIN") throw new Error("Unauthorized")

  const rawData = Object.fromEntries(formData)
  const parsed = employeeSchema.parse(rawData)

  if (!parsed.password || parsed.password.length < 6) {
      throw new Error("建立員工時，密碼至少需要 6 個字元");
  }

  const hashedPassword = await bcrypt.hash(parsed.password, 10)

  await db.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      password: hashedPassword,
      role: "EMPLOYEE",
    },
  })

  revalidatePath("/admin/employees")
}

// 更新員工
export async function updateEmployee(id: string, formData: FormData) {
  const session = await auth()
  
  // 4. 修改這裡：使用 SessionUser 取代 any
  const user = session?.user as SessionUser | undefined
  if (user?.role !== "ADMIN") throw new Error("Unauthorized")

  const rawData = Object.fromEntries(formData)
  const parsed = employeeSchema.partial().parse(rawData) 

  // 5. 修改這裡：將 :any 改為 Prisma 原生的 UpdateInput 型別
  const data: Prisma.UserUpdateInput = {
    name: parsed.name,
    email: parsed.email,
  }

  // 這樣寫完全安全，因為 Prisma 允許 string
  if (parsed.password && parsed.password.length > 0) {
    data.password = await bcrypt.hash(parsed.password, 10)
  }

  await db.user.update({
    where: { id },
    data,
  })

  revalidatePath("/admin/employees")
}

// 刪除員工
export async function deleteEmployee(id: string) {
  const session = await auth()
  
  // 6. 修改這裡：使用 SessionUser 取代 any
  const user = session?.user as SessionUser | undefined
  if (user?.role !== "ADMIN") throw new Error("Unauthorized")

  await db.user.delete({
    where: { id },
  })

  revalidatePath("/admin/employees")
}
