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
import { useEffect, useState } from "react";
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

      await verifyPhoneOtp(formData);
      router.push("/dashboard");
      toast.success("登入成功");
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

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登入</CardTitle>
        </CardHeader>

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
                onSubmit={phoneForm.handleSubmit(
                  otpRequested ? onVerifyOtp : () => onRequestOtp()
                )}
                className="space-y-6"
              >
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
                          disabled={otpRequested}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading
                    ? "處理中..."
                    : otpRequested
                    ? "驗證並登入"
                    : "取得驗證碼"}
                </Button>

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