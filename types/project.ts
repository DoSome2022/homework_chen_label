// src/types/project.ts （建議建立這個檔案，方便共用）
import { Project as PrismaProject } from "@prisma/client"

export type DisplayProject = Pick<
  PrismaProject,
  | "id"
  | "title"
  | "description"
  | "status"
  | "createdAt"
  | "deadline"
  | "assignedEmployeeId"
> & {
  customer: {
    id: string
    name: string | null
    email: string | null
  }
  assignedEmployee: {
    id: string
    name: string | null
    email: string | null
  } | null
}