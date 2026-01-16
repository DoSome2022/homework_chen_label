'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createInitialAdmin } from "@/lib/actions/auth"
import { useState } from "react"

const adminSchema = z.object({
  name: z.string().min(2, "姓名至少 2 個字元"),
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(6, "密碼至少 6 個字元"),
})

export default function InitAdminPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (data: z.infer<typeof adminSchema>) => {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("email", data.email)
    formData.append("password", data.password)

    try {
      await createInitialAdmin(formData)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立 Admin 失敗")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>初始 Admin 已建立</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">請前往 <a href="/login" className="underline">登入頁面</a> 使用新帳號登入。</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">建立初始 Admin 帳號</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">此頁面僅首次使用，請妥善保管帳號資訊</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive mb-4">{error}</p>}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>密碼</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full">建立 Admin</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}