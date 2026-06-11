// src/app/api/broadcasts/[id]/logs/route.ts
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const logs = await db.broadcastLog.findMany({
    where: { broadcastId: id },
    include: {
      customer: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(logs)
}
