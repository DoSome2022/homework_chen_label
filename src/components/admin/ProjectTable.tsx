// src/components/admin/ProjectTable.tsx
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AssignEmployeeSelect } from "./AssignEmployeeSelect"
import { deleteProject } from "@/lib/actions/admin-project"
import { Employee } from "../../../types/user"
import { SetDeadlineDialog } from "./SetDeadlineDialog"

interface ProgressInfo {
  id: string
  stage: string
  description: string | null
  createdAt: Date
  updatedBy: { name: string | null }
}

interface Project {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  deadline: Date | null
  customer: { name: string | null; email: string | null }
  assignedEmployee: { name: string | null } | null
  assignedEmployeeId: string | null
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
  progressMap,   // ⭐ 新增 prop
}: {
  projects: Project[]
  employees: Employee[]
  mode?: "pending" | "assigned"
  progressMap?: Record<string, ProgressInfo | null>   // ⭐ 新增
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
          {/* ⭐ 新增：進度欄（僅 assigned 模式顯示） */}
          {mode === "assigned" && <TableHead>最新進度</TableHead>}
          <TableHead>建立日期</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {projects.map((project) => {
          const latestProgress = progressMap?.[project.id] ?? null

          return (
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

              {/* ⭐ 顯示最新進度 */}
              {mode === "assigned" && (
                <TableCell>
                  {latestProgress ? (
                    <div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {latestProgress.stage}
                      </Badge>
                      {latestProgress.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {latestProgress.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(latestProgress.createdAt).toLocaleDateString("zh-TW")}
                        {latestProgress.updatedBy.name && ` · ${latestProgress.updatedBy.name}`}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">尚無進度</span>
                  )}
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
          )
        })}
      </TableBody>
    </Table>
  )
}
