import db from "@/lib/db"
import { AssignEmployeeSelect } from "@/components/admin/AssignEmployeeSelect"

// 定義員工型別（包含負載計數）
interface Employee {
  id: string
  name: string | null
  email: string | null
  _count: {
    assignedProjects: number
  }
}

export default async function AdminTasksPage() {
  // 查詢員工 + 負載計數
  const employees: Employee[] = await db.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { assignedProjects: true },
      },
    },
  })

  // 查詢待指派項目
  const pendingProjects = await db.project.findMany({
    where: { status: "PENDING" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">任務指派中心</h1>

      {pendingProjects.length === 0 ? (
        <p className="text-muted-foreground">目前沒有待指派的申請</p>
      ) : (
        <div className="grid gap-6">
          {pendingProjects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* 左側：申請資訊 */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <p className="text-muted-foreground mt-1">
                  客戶：{project.customer.name || project.customer.email || "未知客戶"}
                </p>
                <p className="text-sm mt-2 text-muted-foreground">
                  {project.description || "無描述"}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  申請時間：{new Date(project.createdAt).toLocaleString("zh-TW")}
                </p>
              </div>

              {/* 右側：指派下拉選單 */}
              <AssignEmployeeSelect project={project} employees={employees} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}