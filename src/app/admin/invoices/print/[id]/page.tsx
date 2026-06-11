// src/app/admin/invoices/print/[id]/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import db from "@/lib/db"
import { notFound } from "next/navigation"
import { PrintInvoiceClient } from "./PrintInvoiceClient"


interface Props {
  params: Promise<{ id: string }>
}

export default async function PrintInvoicePage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      quote: {
        include: {
          project: {
            include: {
              customer: {
                select: { name: true, email: true },
              },
            },
          },
        },
      },
    },
  })

  if (!invoice) notFound()

  return <PrintInvoiceClient invoice={invoice} />
}
