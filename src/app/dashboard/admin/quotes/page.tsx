import { getQuotes, getAvailableProjects } from "@/lib/actions/quote"
import { QuotesClientPage } from "@/components/admin/quotes/QuotesClientPage"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function QuotesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  // 同時並行抓取兩份數據
  const [quotes, availableProjects] = await Promise.all([
    getQuotes(),
    getAvailableProjects()
  ])

  return (
    <QuotesClientPage 
      initialQuotes={quotes} 
	    projects={availableProjects} // 將專案清單傳入 Client 端
    />
  )
}
