// src/components/admin/quotes/QuoteForm.tsx

'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createQuote, updateQuote } from "@/lib/actions/quote"
import { toast } from "sonner"
import { useState, useEffect } from "react"

// 修改 Schema：使用 string() 然後在提交時轉換
const formSchema = z.object({
  projectId: z.string().min(1, "請選擇一個專案"),
  amount: z.string().min(1, "請輸入金額").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "金額必須大於 0"
  ),
  details: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface QuoteFormProps {
  projects: { id: string; title: string }[]
  initialData?: {
    id: string;
    projectId: string;
    amount: number;
    details: string | null;
  } | null
  onSuccess: () => void
}

export function QuoteForm({ projects, initialData, onSuccess }: QuoteFormProps) {
  const isEditing = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: initialData?.projectId || "",
      amount: initialData?.amount?.toString() || "",
      details: initialData?.details || "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        projectId: initialData.projectId,
        amount: initialData.amount.toString(),
        details: initialData.details || "",
      })
    }
  }, [initialData, form])

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const amountNumber = parseFloat(values.amount)
      
      if (isNaN(amountNumber)) {
        toast.error("請輸入有效的金額")
        return
      }

      if (isEditing && initialData) {
        await updateQuote(initialData.id, {
          amount: amountNumber,
          details: values.details,
        })
        toast.success("報價單已成功更新")
      } else {
        await createQuote({
          projectId: values.projectId,
          amount: amountNumber,
          details: values.details,
        })
        toast.success("報價單已成功建立")
      }
      onSuccess()
    } catch (error) {
      const message = error instanceof Error ? error.message : (isEditing ? "更新失敗" : "建立失敗")
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>選擇專案</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isEditing}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇專案..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>報價金額 </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  {...field}
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
              <FormLabel>報價細節 (選填)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="請輸入報價內容說明..." 
                  className="resize-none"
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (isEditing ? "更新中..." : "處理中...") 
            : (isEditing ? "確認更新報價單" : "確認建立報價單")
          }
        </Button>
      </form>
    </Form>
  )
}