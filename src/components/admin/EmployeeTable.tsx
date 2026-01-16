'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { deleteEmployee } from "@/lib/actions/admin-employee"
import { Trash2 } from "lucide-react"
import { EditEmployeeDialog } from "./EditEmployeeDialog"

interface Employee {
  id: string
  name: string | null
  email: string | null
  createdAt: Date
}

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>名稱</TableHead>
          <TableHead>電子郵件</TableHead>
          <TableHead>建立日期</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell>{new Date(employee.createdAt).toLocaleDateString("zh-TW")}</TableCell>
            <TableCell className="text-right space-x-2">
              <EditEmployeeDialog employee={employee} />
              <form
                action={ deleteEmployee.bind(null,employee.id)
                }
                className="inline"
              >
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}