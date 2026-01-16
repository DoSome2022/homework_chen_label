'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssignEmployeeSelect } from "./AssignEmployeeSelect"
import { deleteProject } from "@/lib/actions/admin-project"
import { Employee } from "../../../types/user"
import { SetDeadlineDialog } from "./SetDeadlineDialog"


interface Project {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  deadline: Date | null          // ← 新增
  customer: { name: string | null; email: string | null }
  assignedEmployee: { name: string | null } | null
  assignedEmployeeId: string | null // ✅ 新增這行：因為 Select 元件需要用它來顯示預設值
}


function calculateDaysLeft(deadline: Date | null): string {
  if (!deadline) return "未設定"

  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    return `剩 ${diffDays} 天`
  } else if (diffDays === 0) {
    return "今天到期"
  } else {
    return `逾期 ${Math.abs(diffDays)} 天`
  }
}

export function ProjectTable({
  projects,
  employees,
  mode = "pending",
}: {
  projects: Project[]
  employees: Employee[]
  mode?: "pending" | "assigned"
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>項目標題</TableHead>
          <TableHead>客戶</TableHead>
          <TableHead>負責員工</TableHead>
          <TableHead>狀態</TableHead>
          {mode === "assigned" && <TableHead>截止日期</TableHead>}
          <TableHead>建立日期</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell className="font-medium">{project.title}</TableCell>
            <TableCell>{project.customer.name || project.customer.email || "-"}</TableCell>
            <TableCell>
              {project.assignedEmployee ? project.assignedEmployee.name : "-"}
            </TableCell>
            <TableCell>
              <Badge variant={project.status === "ASSIGNED" ? "default" : "secondary"}>
                {project.status === "ASSIGNED" ? "已指派" : "待指派"}
              </Badge>
            </TableCell>

            {mode === "assigned" && (
              <TableCell>
                {calculateDaysLeft(project.deadline)}
              </TableCell>
            )}

            <TableCell>{new Date(project.createdAt).toLocaleDateString("zh-TW")}</TableCell>

            <TableCell className="space-x-2">
              <AssignEmployeeSelect project={project} employees={employees} />

              {mode === "assigned" && (
                <SetDeadlineDialog
                  projectId={project.id}
                  currentDeadline={project.deadline}
                />
              )}

              <form className="inline" action={deleteProject.bind(null, project.id)}>
                <Button type="submit" variant="destructive" size="sm">
                  刪除
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}