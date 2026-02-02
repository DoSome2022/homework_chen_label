'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {  useEffect, useState } from "react";
import { requestPhoneOtp, verifyPhoneOtp } from "@/lib/actions/auth";
import { toast } from "sonner"; // 若已安裝 sonner，可用來顯示錯誤提示

const emailSchema = z.object({
  email: z.string().email("請輸入有效的電子郵件"),
  password: z.string().min(1, "密碼為必填"),
});

const phoneSchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼"),
  otp: z.string().length(6, "驗證碼必須為 6 位").optional(),
});

type LoginMode = "email" | "phone";

export default function LoginForm() {
  const [mode, setMode] = useState<LoginMode>("email");
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Email 表單
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  // Phone 表單
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", otp: "" },
  });

  // 自動跳轉已登入用戶
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.push("/dashboard");
    }
  }, [status, session, router]);


  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "登入失敗，請檢查帳號密碼");
      } else {
        router.push("/dashboard");
      }
    } catch {
      // 這裡不需要 err 變數，直接忽略
      setError("登入過程中發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const onRequestOtp = async () => {
    console.log(" is working")
    setIsLoading(true);
    setError(null);

    const phone = phoneForm.getValues("phone");
    const formData = new FormData();
    formData.append("phone", phone);

    try {
      const result = await requestPhoneOtp(formData);
      if (result.success) {
        setOtpRequested(true);
        toast.success("驗證碼已發送");
      }
    } catch (err) {
      // 使用 unknown 型別，並做簡單處理
      const errorMessage =
        err instanceof Error ? err.message : "無法發送驗證碼，請稍後再試";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("phone", data.phone);
      formData.append("code", data.otp!);

      // await verifyPhoneOtp(formData);
      // router.push("/dashboard");
      // toast.success("登入成功");
      const result = await verifyPhoneOtp(formData);
  if (result.success) {
    // 因為 cookie 已由 server 設定，直接跳轉
    router.push("/dashboard");
    toast.success("登入成功");
  }
    } catch (err) {
      // 同上，使用 unknown + 型別守衛
      const errorMessage =
        err instanceof Error ? err.message : "驗證失敗，請檢查驗證碼";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard", redirect: true });
    } catch {
      setError("Google 登入失敗");
      toast.error("Google 登入失敗");
    } finally {
      setIsLoading(false);
    }
  };

// 修改原本的 handlePhoneSubmit
const handlePhoneSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // 阻止表單預設提交刷新

  if (otpRequested) {
    // 【情況二：已請求 OTP】
    // 這裡我們希望驗證所有欄位 (包含 OTP)，所以使用 handleSubmit
    // handleSubmit 會處理驗證失敗的情況 (顯示錯誤訊息)
    await phoneForm.handleSubmit(onVerifyOtp)(e);
  } else {
    // 【情況一：尚未請求 OTP】
    // 我們只希望驗證 "phone" 欄位，忽略 "otp"
    const isPhoneValid = await phoneForm.trigger("phone");

    if (isPhoneValid) {
      // 只有當手機號碼格式正確時，才發送請求
      await onRequestOtp();
    }
  }
};



  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登入</CardTitle>
        </CardHeader>

        {error && mode === "phone" && (
  <div className="text-destructive text-sm text-center py-2 bg-destructive/10 rounded-md">
    {error}
  </div>
)}

        <CardContent className="space-y-6">
          {error && <p className="text-destructive text-center">{error}</p>}

          {/* 登入方式切換 */}
          <div className="flex gap-4 justify-center">
            <Button
              variant={mode === "email" ? "default" : "outline"}
              onClick={() => setMode("email")}
            >
              帳號密碼
            </Button>
            <Button
              variant={mode === "phone" ? "default" : "outline"}
              onClick={() => setMode("phone")}
            >
              手機驗證碼
            </Button>
          </div>

          <Separator />

          {/* Email 登入表單 */}
          {mode === "email" && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                <FormField
                  control={emailForm.control}
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
                  control={emailForm.control}
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "登入中..." : "登入"}
                </Button>
              </form>
            </Form>
          )}

          {/* 手機 OTP 登入表單 */}
{mode === "phone" && (
  <Form {...phoneForm}>
    <form
      onSubmit={handlePhoneSubmit}
      className="space-y-6"
    >
      {/* 手機號碼欄位 */}
      <FormField
        control={phoneForm.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>手機號碼</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="例如：91234567 或 +85291234567"
                disabled={otpRequested || isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 發送中提示 */}
      {isLoading && !otpRequested && (
        <div className="text-sm text-muted-foreground text-center py-2">
          正在發送驗證碼，請稍候...
        </div>
      )}

      {/* 發送成功提示 */}
      {otpRequested && !isLoading && (
        <div className="text-sm text-green-600 font-medium text-center py-2">
          驗證碼已發送至您的手機
        </div>
      )}

      {/* 驗證碼輸入欄位 */}
      {otpRequested && (
        <FormField
          control={phoneForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>驗證碼</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="輸入 6 位驗證碼"
                  autoFocus
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* 送出按鈕（含 loading spinner） */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {otpRequested ? "驗證中..." : "發送中..."}
          </div>
        ) : otpRequested ? (
          "驗證並登入"
        ) : (
          "取得驗證碼"
        )}
      </Button>

      {/* 驗證碼有效期提示 */}
      {otpRequested && (
        <p className="text-center text-sm text-muted-foreground">
          驗證碼有效期 5 分鐘
        </p>
      )}
    </form>
  </Form>
)}

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-card px-2 text-xs text-muted-foreground uppercase">
                或
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            使用 Google 登入
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
  );
}