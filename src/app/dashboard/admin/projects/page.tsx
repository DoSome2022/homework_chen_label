// src/app/(dashboard)/admin/projects/page.tsx

import { ProjectTable } from "@/components/admin/ProjectTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import db from "@/lib/db"

export default async function AdminProjectsPage() {
  const [pendingProjectsData, assignedProjectsData, employeesData] = await Promise.all([
    db.project.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        deadline: true,           // 明確選擇 deadline 欄位
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedEmployeeId: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    db.project.findMany({
      where: { status: "ASSIGNED" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        deadline: true,           // 明確選擇 deadline 欄位
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedEmployee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedEmployeeId: true,
      },
      orderBy: { createdAt: "desc" },
    }),

    db.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  // 員工資料清洗
  const employees = employeesData.map((e) => ({
    ...e,
    name: e.name || "未命名員工",
    email: e.email || "",
    image: e.image || "",
  }))

  // 專案資料清洗（包含 deadline）
  const sanitizeProjects = (projects: typeof pendingProjectsData) => {
    return projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt,
      deadline: p.deadline,                    // 現在型別安全，已包含在 select 中
      customer: {
        ...p.customer,
        name: p.customer.name || "未命名客戶",
        email: p.customer.email || "",
      },
      assignedEmployee: p.assignedEmployee
        ? {
            ...p.assignedEmployee,
            name: p.assignedEmployee.name || "未命名",
            email: p.assignedEmployee.email || "",
          }
        : null,
      assignedEmployeeId: p.assignedEmployeeId,
    }))
  }

  const pendingProjects = sanitizeProjects(pendingProjectsData)
  const assignedProjects = sanitizeProjects(assignedProjectsData)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">項目管理</h1>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">待指派 ({pendingProjects.length})</TabsTrigger>
          <TabsTrigger value="assigned">已指派 ({assignedProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <ProjectTable 
            projects={pendingProjects} 
            mode="pending" 
            employees={employees} 
          />
        </TabsContent>

        <TabsContent value="assigned">
          <ProjectTable 
            projects={assignedProjects} 
            mode="assigned" 
            employees={employees} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}