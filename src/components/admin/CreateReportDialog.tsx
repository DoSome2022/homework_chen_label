'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createReport } from "@/lib/actions/admin-report"
import { useState } from "react"
import z from "zod"
import { reportSchema } from "@/lib/schemas/report"

type FormValues = z.infer<typeof reportSchema>

export function CreateReportDialog() {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { title: "", content: "", type: "SALES", projectId: "" },
  })

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData()
    formData.append("type", data.type)
    formData.append("title", data.title)
    formData.append("content", data.content)
    if (data.projectId) formData.append("projectId", data.projectId)

    await createReport(formData)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新增報告</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新增報告</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>報告類型</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇類型" />
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
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>報告標題</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>報告內容</FormLabel>
                <FormControl><Textarea rows={8} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* projectId 可選，未來可加入自動完成功能 */}
            <DialogFooter>
              <Button type="submit">提交報告</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}