
// src/app/(dashboard)/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import db from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const userId = session.user.id;

  if (role === "ADMIN") {
    // 取得管理員所需數據
    const now = new Date();
    
    const [projects, potentialClientsCount, monthlySales] = await Promise.all([
      // 查詢所有項目
      db.project.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          isCompleted: true,
          customer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      
      // 活躍潛力客數量
      db.user.count({
        where: { role: "CUSTOMER", customerType: "POTENTIAL" },
      }),
      
      // 本月銷售額
      db.quote.aggregate({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    // 計算統計
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.isCompleted).length;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const pendingProjectsCount = projects.filter(p => p.status === "PENDING").length;
    const monthlySalesAmount = monthlySales._sum.amount || 0;

    const initialData = {
      projects,
      totalProjects,
      completedProjects,
      completionRate,
      pendingProjectsCount,
      potentialClientsCount,
      monthlySales: monthlySalesAmount,
    };

    return <AdminDashboard initialData={initialData} />;

  } else if (role === "EMPLOYEE") {
    // 取得員工所需數據
 
    
    const projects = await db.project.findMany({
      where: { assignedEmployeeId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        isCompleted: true,
        deadline: true,           // 明確選擇 deadline 欄位
        customer: { 
          select: { 
            name: true,
            customerType: true
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 計算統計
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.isCompleted).length;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const pendingProjectsCount = projects.filter(p => p.status === "PENDING").length;
    const myPotentialClientsCount = projects.filter(
      p => p.customer?.customerType === "POTENTIAL"
    ).length;

    const initialData = {
      projects,
      totalProjects,
      completedProjects,
      completionRate,
      pendingProjectsCount,
      myPotentialClientsCount,
    };

    return <StaffDashboard initialData={initialData} />;

  } else if (role === "CUSTOMER") {
    // 為客戶儀表板預先取得數據
    const now = new Date();
    
    const [myApplicationsCount, latestPublishedCount, customer] = await Promise.all([
      // 我的申請數
      db.project.count({ where: { customerId: userId } }),

      // 最新已發布廣播數
      db.broadcast.count({
        where: {
          OR: [
            { scheduledAt: null },
            { scheduledAt: { lte: now } },
          ],
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      // 客戶訂閱狀態
      db.user.findUnique({
        where: { id: userId },
        select: { isSubscribed: true },
      }),
    ]);

    const allPublishedBroadcasts = customer?.isSubscribed
      ? await db.broadcast.findMany({
          where: {
            OR: [
              { scheduledAt: null },
              { scheduledAt: { lte: now } },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        })
      : [];

    const initialData = {
      myApplicationsCount,
      latestPublishedCount,
      allPublishedBroadcasts,
      isSubscribed: customer?.isSubscribed || false,
    };

    return <CustomerDashboard initialData={initialData} />;
  }

  return <div className="p-8 text-center text-muted-foreground">無效角色，請聯絡系統管理員</div>;
}