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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createQuote } from "@/lib/actions/admin-customer"
import { useState } from "react"

const quoteSchema = z.object({
  amount: z.coerce.number().positive("報價金額必須大於 0"),
  details: z.string().optional(),
})

type QuoteFormValues = z.infer<typeof quoteSchema>

type Project = { id: string; title: string }

export function CreateQuoteDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: { amount: 0, details: "" },
  })

  const onSubmit = async (data: QuoteFormValues) => {
    const formData = new FormData()
    formData.append("projectId", project.id)
    formData.append("amount", data.amount.toString())
    if (data.details) formData.append("details", data.details)

    await createQuote(formData)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="mb-4">為此項目新增報價</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>為「{project.title}」新增報價</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>報價金額</FormLabel>
                  <FormControl>
                     <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        // 修正類型不相容 (unknown vs string/number)
                        value={field.value as number | string} 
                        // 確保變更事件能正確傳遞
                        onChange={(e) => field.onChange(e.target.value)} 
                        />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>備註（選填）</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="報價說明" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">提交報價</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}