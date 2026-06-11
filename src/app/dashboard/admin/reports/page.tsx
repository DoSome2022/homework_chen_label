// import db from "@/lib/db"
// import { CreateReportDialog } from "@/components/admin/CreateReportDialog"
// import { ReportTable } from "@/components/admin/ReportTable"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// // 定義有效報告類型
// const validReportTypes = ["SALES", "PRODUCT", "AMOUNT", "BROADCAST", "EMPLOYEE"] as const

// type ValidReportType = (typeof validReportTypes)[number]

// export default async function AdminReportsPage({
//   searchParams,
// }: {
//   // 1. 修改定義：這裡必須是 Promise
//   searchParams: Promise<{ type?: string }>
// }) {
//   // 2. 必須先 await 解析參數
//   const { type } = await searchParams

//   // 3. 使用解析出來的 `type` 變數來進行判斷
//   const typeFilter: ValidReportType | undefined = 
//     type && validReportTypes.includes(type as ValidReportType)
//       ? (type as ValidReportType)
//       : undefined

//   // 查詢報告（當有篩選時才套用 where）
//   const reports = await db.report.findMany({
//     where: typeFilter ? { type: typeFilter } : undefined,
//     include: {
//       author: { select: { name: true, role: true } },
//       project: { select: { title: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   })

//   // 計算各類型報告數量
//   const reportsByType = await Promise.all(
//     validReportTypes.map(async (t) => ({
//       type: t,
//       count: await db.report.count({ where: { type: t } }),
//     }))
//   )

//   return (
//     <div className="p-8">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="text-3xl font-bold">報告管理</h1>
//         <CreateReportDialog />
//       </div>

//       <Tabs defaultValue="ALL" className="w-full">
//         <TabsList className="grid w-full grid-cols-6 max-w-4xl">
//           <TabsTrigger value="ALL">全部</TabsTrigger>
//           {reportsByType.map(({ type: t, count }) => (
//             <TabsTrigger key={t} value={t}>
//               {t === "SALES" && "銷售"}
//               {t === "PRODUCT" && "產品"}
//               {t === "AMOUNT" && "金額"}
//               {t === "BROADCAST" && "廣播/廣告"}
//               {t === "EMPLOYEE" && "員工"}
//               {" "}({count})
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         <TabsContent value="ALL">
//           <ReportTable reports={reports} />
//         </TabsContent>

//         {validReportTypes.map((t) => (
//           <TabsContent key={t} value={t}>
//             <ReportTable reports={reports.filter((r) => r.type === t)} />
//           </TabsContent>
//         ))}
//       </Tabs>
//     </div>
//   )
// }

import db from "@/lib/db"
import { CreateReportDialog } from "@/components/admin/CreateReportDialog"
import { ReportsTabs } from "@/components/admin/ReportsTabs"
import type { Report } from "@prisma/client"

// ─── 型別定義 ───
const validReportTypes = ["SALES", "PRODUCT", "AMOUNT", "BROADCAST", "EMPLOYEE"] as const
type ValidReportType = (typeof validReportTypes)[number]

export interface ReportWithRelations extends Report {
  author: { name: string | null; role: string }
  project: { title: string | null } | null
}

// 各報表資料型別
export interface SalesEmployeeData {
  id: string
  name: string
  quoteCount: number
  totalAmount: number
  avgQuote: number
}

export interface ProductReportData {
  id: string
  sku: string
  name: string
  description: string | null
  price: number
  isFeatured: boolean
  isArchived: boolean
  imageUrl: string | null
}

export interface AmountOrderData {
  id: string
  orderNo: string
  customerName: string
  phone: string
  date: string
  customerType: string
  company: string
  amount: number
}

export interface BroadcastCampaignData {
  id: string
  name: string
  applications: number
}

export interface EmployeeStaffData {
  id: string
  staffId: string
  name: string
  followUps: number
  quoted: number
  completed: number
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams

  const typeFilter: ValidReportType | undefined =
    type && validReportTypes.includes(type as ValidReportType)
      ? (type as ValidReportType)
      : undefined

  // ── 1. 查詢 Report 記錄（給「全部」Tab） ──
  const reports = await db.report.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    include: {
      author: { select: { name: true, role: true } },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const reportsByType = await Promise.all(
    validReportTypes.map(async (t) => ({
      type: t,
      count: await db.report.count({ where: { type: t } }),
    }))
  )

  // ── 2. SALES 銷售報告資料 ──
  const employees = await db.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      assignedProjects: {
        select: {
          quotes: {
            select: { amount: true },
          },
        },
      },
    },
  })

  const salesData: SalesEmployeeData[] = employees.map((emp) => {
    const allQuotes = emp.assignedProjects.flatMap((p) => p.quotes)
    const quoteCount = allQuotes.length
    const totalAmount = allQuotes.reduce((sum, q) => sum + q.amount, 0)
    const avgQuote = quoteCount > 0 ? Math.round(totalAmount / quoteCount) : 0
    return {
      id: emp.id,
      name: emp.name ?? "未知",
      quoteCount,
      totalAmount,
      avgQuote,
    }
  })

  const salesSummary = {
    totalSales: salesData.reduce((sum, e) => sum + e.totalAmount, 0),
    totalQuotes: salesData.reduce((sum, e) => sum + e.quoteCount, 0),
    totalEmployees: salesData.length,
  }

  // ── 3. PRODUCT 產品報告資料 ──
const products = await db.product.findMany({
  select: {
    id: true,
    name: true,
    description: true,
    price: true,
    isFeatured: true,
    isArchived: true,
    images: {
      select: { url: true },
      take: 1,
    },
  },
  orderBy: { createdAt: "desc" },
})



const productData: ProductReportData[] = products.map((p) => ({
  id: p.id,
  sku: p.id.slice(0, 12).toUpperCase(),
  name: p.name,
  description: p.description,
  price: p.price,
  isFeatured: p.isFeatured,
  isArchived: p.isArchived,
  imageUrl: p.images[0]?.url ?? null,
}))

  // ── 4. AMOUNT 金額報告資料 ──
  // 將 Quote 視為「訂單」，關聯到 Project → Customer → CustomerContact
  const quotes = await db.quote.findMany({
    select: {
      id: true,
      amount: true,
      createdAt: true,
      project: {
        select: {
          title: true,
          customer: {
            select: {
              name: true,
              customerType: true,
              customerContacts: {
                select: { company: true, phone: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const amountData: AmountOrderData[] = quotes.map((q) => ({
    id: q.id,
    orderNo: `QT-${q.id.slice(0, 8).toUpperCase()}`,
    customerName: q.project?.customer.name ?? "未知客戶",
    phone: q.project?.customer.customerContacts?.phone ?? "-",
    date: q.createdAt.toISOString().split("T")[0],
    customerType: q.project?.customer.customerType ?? "NORMAL",
    company: q.project?.customer.customerContacts?.company ?? "-",
    amount: q.amount,
  }))

  const totalAmountSum = amountData.reduce((sum, o) => sum + o.amount, 0)
  const amountSummary = {
    totalSales: totalAmountSum,
    avgQuote: amountData.length > 0 ? Math.round(totalAmountSum / amountData.length) : 0,
    quoteCount: amountData.length,
  }

  // ── 5. BROADCAST 廣播報告資料 ──
  const broadcasts = await db.broadcast.findMany({
    select: {
      id: true,
      title: true,
      _count: { select: { broadcastLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const broadcastData: BroadcastCampaignData[] = broadcasts.map((b) => ({
    id: b.id,
    name: b.title,
    applications: b._count.broadcastLogs,
  }))

  // ── 6. EMPLOYEE 員工報告資料 ──
  const staffList = await db.user.findMany({
    where: { role: "EMPLOYEE" },
    select: {
      id: true,
      name: true,
      assignedProjects: {
        select: {
          status: true,
          quotes: { select: { id: true } },
        },
      },
    },
  })

  const employeeData: EmployeeStaffData[] = staffList.map((emp) => {
    const totalProjects = emp.assignedProjects.length
    const quotedCount = emp.assignedProjects.filter(
      (p) => p.quotes.length > 0 || p.status === "ASSIGNED"
    ).length
    const completedCount = emp.assignedProjects.filter(
      (p) => p.status === "COMPLETED"
    ).length
    return {
      id: emp.id,
      staffId: `EMP-${emp.id.slice(0, 6).toUpperCase()}`,
      name: emp.name ?? "未知",
      followUps: totalProjects,
      quoted: quotedCount,
      completed: completedCount,
    }
  })

  // ── Render ──
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">報告管理</h1>
        <CreateReportDialog />
      </div>

      <ReportsTabs
        reports={reports as ReportWithRelations[]}
        reportsByType={reportsByType}
        // 各類型真實資料
        salesData={salesData}
        salesSummary={salesSummary}
        productData={productData}
        amountData={amountData}
        amountSummary={amountSummary}
        broadcastData={broadcastData}
        employeeData={employeeData}
      />
    </div>
  )
}
