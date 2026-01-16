import db from "@/lib/db"
import { CreateReportDialog } from "@/components/admin/CreateReportDialog"
import { ReportTable } from "@/components/admin/ReportTable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 定義有效報告類型
const validReportTypes = ["SALES", "PRODUCT", "AMOUNT", "BROADCAST", "EMPLOYEE"] as const

type ValidReportType = (typeof validReportTypes)[number]

export default async function AdminReportsPage({
  searchParams,
}: {
  // 1. 修改定義：這裡必須是 Promise
  searchParams: Promise<{ type?: string }>
}) {
  // 2. 必須先 await 解析參數
  const { type } = await searchParams

  // 3. 使用解析出來的 `type` 變數來進行判斷
  const typeFilter: ValidReportType | undefined = 
    type && validReportTypes.includes(type as ValidReportType)
      ? (type as ValidReportType)
      : undefined

  // 查詢報告（當有篩選時才套用 where）
  const reports = await db.report.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    include: {
      author: { select: { name: true, role: true } },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // 計算各類型報告數量
  const reportsByType = await Promise.all(
    validReportTypes.map(async (t) => ({
      type: t,
      count: await db.report.count({ where: { type: t } }),
    }))
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">報告管理</h1>
        <CreateReportDialog />
      </div>

      <Tabs defaultValue="ALL" className="w-full">
        <TabsList className="grid w-full grid-cols-6 max-w-4xl">
          <TabsTrigger value="ALL">全部</TabsTrigger>
          {reportsByType.map(({ type: t, count }) => (
            <TabsTrigger key={t} value={t}>
              {t === "SALES" && "銷售"}
              {t === "PRODUCT" && "產品"}
              {t === "AMOUNT" && "金額"}
              {t === "BROADCAST" && "廣播/廣告"}
              {t === "EMPLOYEE" && "員工"}
              {" "}({count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ALL">
          <ReportTable reports={reports} />
        </TabsContent>

        {validReportTypes.map((t) => (
          <TabsContent key={t} value={t}>
            <ReportTable reports={reports.filter((r) => r.type === t)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
