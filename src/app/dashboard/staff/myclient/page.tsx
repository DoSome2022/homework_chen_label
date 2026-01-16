
import { ClientCard } from "@/components/staff/ClientCard"
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { redirect } from "next/navigation"


export default async function MyClientsPage() {
  const session = await auth()
  if (session?.user?.role !== "EMPLOYEE") {
    redirect("/unauthorized")
  }

  const employeeId = session.user.id

  const clients = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      customerType: "POTENTIAL",
      projects: {
        some: {
          assignedEmployeeId: employeeId,
        },
      },
    },
    include: {
      projects: {
        where: { assignedEmployeeId: employeeId },
        include: { quotes: true },
      },
      conversations: {
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">我的潛力客戶</h1>

      {clients.length === 0 ? (
        <p className="text-muted-foreground">目前沒有被指派的潛力客戶</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  )
}