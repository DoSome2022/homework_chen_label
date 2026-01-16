// // src/components/dashboard/AdminDashboard.tsx
// import db from "@/lib/db"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { CheckCircle2, XCircle } from "lucide-react"
// import { toggleProjectCompletion } from "@/lib/actions/admin-project"

// export async function AdminDashboard() {
//   // 查詢所有項目（包含完成狀態）
//   const projects = await db.project.findMany({
//     select: {
//       id: true,
//       title: true,
//       status: true,
//       isCompleted: true,
//       customer: { select: { name: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   })

//   // 計算統計
//   const totalProjects = projects.length
//   const completedProjects = projects.filter((p) => p.isCompleted).length
//   const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

//   const pendingProjectsCount = projects.filter((p) => p.status === "PENDING").length
//   const potentialClientsCount = await db.user.count({
//     where: { role: "CUSTOMER", customerType: "POTENTIAL" },
//   })

//   // 本月銷售額（假設 Quote 代表銷售額）
//   const monthlySales = await db.quote.aggregate({
//     where: {
//       createdAt: {
//         gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
//       },
//     },
//     _sum: { amount: true },
//   })

//   return (
//     <div className="p-8 space-y-8">
//       <h1 className="text-3xl font-bold mb-8">管理員儀表板</h1>

//       {/* 統計卡片 */}
//       <div className="grid gap-6 md:grid-cols-3">
//         <CardMetric title="待指派申請" value={pendingProjectsCount.toString()} />
//         <CardMetric title="活躍潛力客" value={potentialClientsCount.toString()} />
//         <CardMetric
//           title="本月銷售額"
//           value={`$${monthlySales._sum.amount?.toLocaleString() ?? "0"}`}
//         />
//       </div>

//       {/* 項目進度總覽 */}
//       <Card>
//         <CardHeader>
//           <CardTitle>項目整體進度</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col items-center gap-4">
//             {/* 圓形進度條 */}
//             <div className="relative w-32 h-32">
//               <svg className="w-full h-full" viewBox="0 0 100 100">
//                 {/* 背景圓環 */}
//                 <circle
//                   className="text-gray-200"
//                   strokeWidth="10"
//                   stroke="currentColor"
//                   fill="transparent"
//                   r="45"
//                   cx="50"
//                   cy="50"
//                 />
//                 {/* 進度圓環 */}
//                 <circle
//                   className="text-green-500"
//                   strokeWidth="10"
//                   strokeDasharray={282.6}
//                   strokeDashoffset={282.6 * (1 - completionRate / 100)}
//                   strokeLinecap="round"
//                   fill="transparent"
//                   r="45"
//                   cx="50"
//                   cy="50"
//                 />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
//                 {completionRate}%
//               </div>
//             </div>

//             <p className="text-lg text-muted-foreground">
//               已完成 {completedProjects} / {totalProjects} 個項目
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       {/* 項目管道列表（可手動切換完成狀態） */}
//       <Card>
//         <CardHeader>
//           <CardTitle>項目管道（可手動切換完成狀態）</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {projects.length === 0 ? (
//             <p className="text-muted-foreground text-center py-8">目前無項目</p>
//           ) : (
//             <div className="space-y-4">
//               {projects.map((project) => (
//                 <div
//                   key={project.id}
//                   className="flex items-center justify-between p-4 border rounded-lg"
//                 >
//                   <div>
//                     <h3 className="font-medium">{project.title}</h3>
//                     <p className="text-sm text-muted-foreground">
//                       客戶：{project.customer?.name || "未知"}
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                       狀態：{project.status}
//                     </p>
//                   </div>

//                   <form
//                     action={async () => {
//                       "use server"
//                       await toggleProjectCompletion(project.id)
//                     }}
//                   >
//                     <Button
//                       type="submit"
//                       variant={project.isCompleted ? "default" : "outline"}
//                       size="sm"
//                       className={project.isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
//                     >
//                       {project.isCompleted ? (
//                         <>
//                           <CheckCircle2 className="mr-2 h-4 w-4" />
//                           已完成
//                         </>
//                       ) : (
//                         <>
//                           <XCircle className="mr-2 h-4 w-4" />
//                           未完成
//                         </>
//                       )}
//                     </Button>
//                   </form>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// // CardMetric 保持不變
// function CardMetric({ title, value }: { title: string; value: string }) {
//   return (
//     <Card>
//       <CardHeader className="pb-2">
//         <CardTitle className="text-sm font-medium text-muted-foreground">
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="text-3xl font-bold">{value}</div>
//       </CardContent>
//     </Card>
//   )
// }

// src/components/dashboard/AdminDashboard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { toggleProjectCompletion } from "@/lib/actions/admin-project"
import { useState } from "react"
import { ProjectStatus } from "@prisma/client"

// 定義類型 - 更新為可空類型
interface Project {
  id: string
  title: string
  status: ProjectStatus
  isCompleted: boolean
  customer: {
    name: string | null
  } | null  // 添加 null 支持
}

interface AdminDashboardProps {
  initialData: {
    projects: Project[]
    totalProjects: number
    completedProjects: number
    completionRate: number
    pendingProjectsCount: number
    potentialClientsCount: number
    monthlySales: number
  }
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialData.projects)
  const [completionRate, setCompletionRate] = useState(initialData.completionRate)
  const [completedProjects, setCompletedProjects] = useState(initialData.completedProjects)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleToggleCompletion = async (projectId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [projectId]: true }))
      
      await toggleProjectCompletion(projectId)
      
      // 更新本地狀態
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          const newIsCompleted = !p.isCompleted
          
          // 更新統計數字
          const newCompletedProjects = newIsCompleted 
            ? completedProjects + 1 
            : completedProjects - 1
          
          setCompletedProjects(newCompletedProjects)
          const newCompletionRate = Math.round((newCompletedProjects / projects.length) * 100)
          setCompletionRate(newCompletionRate)
          
          return { ...p, isCompleted: newIsCompleted }
        }
        return p
      }))
    } catch (error) {
      console.error("切換完成狀態失敗:", error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [projectId]: false }))
    }
  }

  // 安全獲取客戶名稱
  const getCustomerName = (project: Project) => {
    return project.customer?.name || "未知客戶"
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">管理員儀表板</h1>

      {/* 統計卡片 */}
      <div className="grid gap-6 md:grid-cols-3">
        <CardMetric 
          title="待指派申請" 
          value={initialData.pendingProjectsCount.toString()} 
        />
        <CardMetric 
          title="活躍潛力客" 
          value={initialData.potentialClientsCount.toString()} 
        />
        <CardMetric
          title="本月銷售額"
          value={`$${initialData.monthlySales.toLocaleString()}`}
        />
      </div>

      {/* 項目進度總覽 */}
      <Card>
        <CardHeader>
          <CardTitle>項目整體進度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* 圓形進度條 */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* 背景圓環 */}
                <circle
                  className="text-gray-200"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                {/* 進度圓環 */}
                <circle
                  className="text-green-500"
                  strokeWidth="10"
                  strokeDasharray={282.6}
                  strokeDashoffset={282.6 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                {completionRate}%
              </div>
            </div>

            <p className="text-lg text-muted-foreground">
              已完成 {completedProjects} / {projects.length} 個項目
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 項目管道列表（可手動切換完成狀態） */}
      <Card>
        <CardHeader>
          <CardTitle>項目管道（可手動切換完成狀態）</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">目前無項目</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      客戶：{getCustomerName(project)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      狀態：{project.status}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleToggleCompletion(project.id)}
                    disabled={loadingStates[project.id]}
                    variant={project.isCompleted ? "default" : "outline"}
                    size="sm"
                    className={project.isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {loadingStates[project.id] ? (
                      "處理中..."
                    ) : project.isCompleted ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        已完成
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        未完成
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// CardMetric 組件
function CardMetric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}