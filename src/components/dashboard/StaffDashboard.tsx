
// src/components/dashboard/StaffDashboard.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { toggleProjectCompletion } from "@/lib/actions/staff"
import { useState } from "react"
import { CustomerType, ProjectStatus } from "@prisma/client"

// 定義類型 - 更新為可空類型
interface Project {
  id: string
  title: string
  status: ProjectStatus
  isCompleted: boolean
  deadline: Date | null
  customer: {
    name: string | null
    customerType: CustomerType | null
  } | null  // 添加 null 支持
}

interface StaffDashboardProps {
  initialData: {
    projects: Project[]
    totalProjects: number
    completedProjects: number
    completionRate: number
    pendingProjectsCount: number
    myPotentialClientsCount: number
  }
}

export function StaffDashboard({ initialData }: StaffDashboardProps) {
  const [projects, setProjects] = useState<Project[]>(initialData.projects)
  const [completionRate, setCompletionRate] = useState(initialData.completionRate)
  const [completedProjects, setCompletedProjects] = useState(initialData.completedProjects)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})



function formatDeadline(date: Date | null): React.ReactNode {
  if (!date) return "未設定";

  const now = new Date();
  const deadlineDate = new Date(date);
  const formatted = deadlineDate.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (deadlineDate < now) {
    return <span className="text-red-600 font-medium">已逾期 ({formatted})</span>;
  }

  if (diffDays <= 3 && diffDays > 0) {
    return <span className="text-amber-600 font-medium">即將到期 ({formatted})</span>;
  }

  return formatted;
}
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

  // 安全獲取客戶類型
  const getCustomerType = (project: Project) => {
    return project.customer?.customerType || null
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">員工儀表板</h1>

      {/* 統計卡片 */}
      <div className="grid gap-6 md:grid-cols-3">
        <CardMetric 
          title="負責潛力客" 
          value={initialData.myPotentialClientsCount.toString()} 
        />
        <CardMetric 
          title="待處理項目" 
          value={initialData.pendingProjectsCount.toString()} 
        />
        <CardMetric 
          title="項目完成率" 
          value={`${completionRate}%`} 
        />
      </div>

      {/* 項目進度總覽（圓形進度條） */}
      <Card>
        <CardHeader>
          <CardTitle>我的項目整體進度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            {/* 圓形進度條 */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* 背景圓環 */}
                <circle
                  className="text-gray-200"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                {/* 進度圓環 */}
                <circle
                  className="text-green-500"
                  strokeWidth="12"
                  strokeDasharray={282.6}
                  strokeDashoffset={282.6 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                {completionRate}%
              </div>
            </div>

            <p className="text-lg text-muted-foreground">
              已完成 {completedProjects} / {projects.length} 個項目
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 項目管道列表（可手動切換完成/未完成） */}
      <Card>
        <CardHeader>
          <CardTitle>我的項目管道</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">目前無負責項目</p>
          ) : (
<div className="space-y-4">
  {projects.map((project) => (
    <div
      key={project.id}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{project.title}</h3>
        
        <p className="text-sm text-muted-foreground">
          客戶：{getCustomerName(project)}
        </p>
        
        {/* 新增：顯示截止日期 */}
        {project.deadline && (
          <p className="text-sm text-muted-foreground">
            截止日期：{formatDeadline(project.deadline)}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          狀態：{project.status}
          {getCustomerType(project) === "POTENTIAL" && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              潛力客
            </span>
          )}
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