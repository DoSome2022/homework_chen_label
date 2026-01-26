// src/components/auth/LoginForm.tsx

'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loginAction } from "@/lib/actions/auth"
import {  signIn, useSession } from "next-auth/react"   // ← 新增 useSession
import { useRouter } from "next/navigation"             // ← 新增 useRouter
import { useEffect, useState } from "react"             // ← 修改 useState 為 useEffect
import { Separator } from "@/components/ui/separator"  // 可選：用來做分隔線
// import { signIn } from "@/lib/auth"



const loginSchema = z.object({
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(1, "密碼為必填"),
})

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)  // 可選：Google 按鈕載入狀態
const { data: session, status } = useSession()
  const router = useRouter()


  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

// 監聽登入狀態變化，登入成功後自動跳轉
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role

      if (role === "ADMIN") {
        router.push("/dashboard")
      } else if (role === "EMPLOYEE") {
        router.push("/dashboard")
      } else if (role === "CUSTOMER") {
        router.push("/dashboard")
      } else {
        // 未知角色，導回首頁或顯示錯誤
        router.push("/")
      }
    }
  }, [status, session, router])

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

    try {
      await loginAction(formData)
      // 成功後通常會自動重導（視 loginAction 實作），這裡可不需額外處理
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入失敗，請稍後再試")
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true)
    setError(null)  // 清空之前的錯誤訊息
    
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",  // 預設導向 client（但實際會被 useEffect 覆蓋）
        redirect: true,             // 自動處理重導（v5 推薦）
      })
    } catch (err) {
      console.log("Error:", err)
      setError("Google 登入失敗，請稍後再試")
      console.error(err)
    } finally {
      setIsLoadingGoogle(false)
    }
  }

// 若正在載入中，顯示載入畫面（避免閃爍）
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登入</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <p className="text-destructive text-center">{error}</p>
          )}

          {/* 原有帳密表單 */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>電子郵件</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密碼</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "登入中..." : "登入"}
              </Button>
            </form>
          </Form>

          {/* 分隔線 + Google 按鈕 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                或
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle}
          >
            {isLoadingGoogle ? "處理中..." : "使用 Google 登入"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            還沒有帳號？{" "}
            <a href="/register" className="text-primary hover:underline">
              註冊
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}