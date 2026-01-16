'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
// import { updateReport, reportSchema } from "@/lib/actions/admin-report"
import { useState } from "react"
import { Edit } from "lucide-react"
import { reportSchema } from "@/lib/schemas/report"
import { updateReport } from "@/lib/actions/admin-report"

type Report = {
  id: string
  type: "SALES" | "PRODUCT" | "AMOUNT" | "BROADCAST" | "EMPLOYEE"
  title: string
  content: string
  projectId: string | null
}

type FormValues = {
  type: "SALES" | "PRODUCT" | "AMOUNT" | "BROADCAST" | "EMPLOYEE"
  title: string
  content: string
  projectId?: string
}

export function EditReportDialog({ report }: { report: Report }) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: report.type,
      title: report.title,
      content: report.content,
      projectId: report.projectId || "",
    },
  })

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData()
    formData.append("type", data.type)
    formData.append("title", data.title)
    formData.append("content", data.content)
    if (data.projectId) formData.append("projectId", data.projectId)

    await updateReport(report.id, formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>編輯報告</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>報告類型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SALES">銷售</SelectItem>
                      <SelectItem value="PRODUCT">產品</SelectItem>
                      <SelectItem value="AMOUNT">金額</SelectItem>
                      <SelectItem value="BROADCAST">廣播/廣告</SelectItem>
                      <SelectItem value="EMPLOYEE">員工</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>報告標題</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>報告內容</FormLabel>
                  <FormControl>
                    <Textarea rows={8} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* projectId 可選，若未來需要自動完成可擴充 */}
            <DialogFooter>
              <Button type="submit">儲存變更</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}