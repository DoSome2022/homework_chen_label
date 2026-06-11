// src/app/admin/quotes/print/[id]/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import db from "@/lib/db"
import { notFound } from "next/navigation"
import { PrintQuoteClient } from "./PrintQuoteClient"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PrintQuotePage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  // ✅ 改為 findUnique（只查一筆），並加入 email 和 description
  const quote = await db.quote.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          customer: {
            select: { name: true, email: true },  // ✅ 加入 email
          },
        },
      },
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
        },
      },
    },
  })

  if (!quote) notFound()

  return <PrintQuoteClient quote={quote} />
}
