
import { CreateEmployeeDialog } from "@/components/admin/CreateEmployeeDialog"
import { EmployeeTable } from "@/components/admin/EmployeeTable"

// import { Button } from "@/components/ui/button"
import db from "@/lib/db"

export default async function AdminEmployeesPage() {
  const employees = await db.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">員工管理</h1>
        <CreateEmployeeDialog />
      </div>

      <EmployeeTable employees={employees} />
    </div>
  )
}