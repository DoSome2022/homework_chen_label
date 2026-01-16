// src/components/admin/AssignEmployeeSelect.tsx
'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assignEmployeeToProject } from "@/lib/actions/admin-project"
import { Employee } from "../../../types/user"


interface Project {
  id: string
  assignedEmployeeId: string | null
}

interface AssignEmployeeSelectProps {
  project: Project
  employees: Employee[]
}

export function AssignEmployeeSelect({ project, employees }: AssignEmployeeSelectProps) {
  const handleValueChange = async (value: string) => {
    // 將 "unassign" 視為取消指派（傳入 null）
    const employeeId = value === "unassign" ? null : value
    await assignEmployeeToProject(project.id, employeeId)
  }

  return (
    <Select
      defaultValue={project.assignedEmployeeId ?? "unassign"}  // 預設為 "unassign" 表示未指派
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder="選擇負責員工" />
      </SelectTrigger>
      <SelectContent>
        {/* 使用非空字串 "unassign" 作為取消指派的值 */}
        <SelectItem value="unassign">
          取消指派
        </SelectItem>

        {employees.map((emp) => (
          <SelectItem key={emp.id} value={emp.id}>
            {emp.name || emp.email || "未知員工"}
            {emp._count && (
              <span className="text-muted-foreground text-xs ml-2">
                ({emp._count.assignedProjects} 位客戶)
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}