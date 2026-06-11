// 'use client'

// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { registerCustomer } from "@/lib/actions/auth"
// import { useState } from "react"

// const registerSchema = z.object({
//   name: z.string().min(2, "姓名至少 2 個字元"),
//   email: z.string().email("請輸入有效的電子郵件"),
//   password: z.string().min(6, "密碼至少 6 個字元"),
// })

// export default function RegisterPage() {
//   const [error, setError] = useState<string | null>(null)

//   const form = useForm<z.infer<typeof registerSchema>>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: { name: "", email: "", password: "" },
//   })

//   const onSubmit = async (data: z.infer<typeof registerSchema>) => {
//     const formData = new FormData()
//     formData.append("name", data.name)
//     formData.append("email", data.email)
//     formData.append("password", data.password)

//     try {
//       await registerCustomer(formData)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "註冊失敗")
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted/40">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl text-center">註冊新帳號</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {error && <p className="text-destructive mb-4">{error}</p>}

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <FormField control={form.control} name="name" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>姓名</FormLabel>
//                   <FormControl><Input {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="email" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>電子郵件</FormLabel>
//                   <FormControl><Input type="email" {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//               <FormField control={form.control} name="password" render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>密碼</FormLabel>
//                   <FormControl><Input type="password" {...field} /></FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )} />
//               <Button type="submit" className="w-full">註冊</Button>
//             </form>
//           </Form>

//           <p className="text-center mt-4 text-sm text-muted-foreground">
//             已有帳號？ <a href="/login" className="text-primary hover:underline">登入</a>
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Nav from '@/components/nav';
import { Building, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
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
// ✅ 移除未使用的 Card, CardContent, CardHeader, CardTitle
import { registerCustomer } from "@/lib/actions/auth";
import { useLang } from '@/components/context/LangContext';

// ─── Zod Schema ───
// ✅ 移除未使用的 registerSchema（因為是動態的 dynamicSchema 在下面）
type RegisterFormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const { lang } = useLang();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ═══════════════ 雙語對照表 ═══════════════
  const t = {
    zh: {
      title: '會員註冊',
      subtitle: 'BEAUTY LABEL PRINTING COMPANY',
      description: '填寫以下資訊完成註冊，開啟您的標籤定制服務',
      companyName: '公司名稱',
      contactPerson: '聯繫人姓名',
      email: '電子郵件',
      phone: '聯繫電話',
      address: '公司地址',
      password: '設定密碼',
      confirmPassword: '確認密碼',
      companyPlaceholder: '請輸入公司全名',
      contactPlaceholder: '請輸入聯繫人姓名',
      emailPlaceholder: 'example@company.com',
      phonePlaceholder: '請輸入聯繫電話',
      addressPlaceholder: '請輸入公司詳細地址',
      passwordPlaceholder: '請設定密碼（至少6位）',
      confirmPlaceholder: '請再次輸入密碼',
      submit: '提交註冊',
      submitting: '註冊中...',
      required: '*',
      companyRequired: '請輸入公司名稱',
      contactRequired: '請輸入聯繫人姓名',
      contactMin: '姓名至少 2 個字元',
      emailRequired: '請輸入電子郵件',
      emailInvalid: '請輸入有效的電子郵件',
      phoneRequired: '請輸入聯繫電話',
      passwordRequired: '請輸入密碼',
      passwordMin: '密碼至少 6 位字符',
      confirmRequired: '請確認密碼',
      confirmMismatch: '兩次密碼不一致',
      registerError: '註冊失敗',
      loginLink: '已有帳號？',
      login: '登入',
    },
    en: {
      title: 'Register',
      subtitle: 'BEAUTY LABEL PRINTING COMPANY',
      description: 'Fill in the information below to complete registration',
      companyName: 'Company Name',
      contactPerson: 'Contact Person',
      email: 'Email',
      phone: 'Phone Number',
      address: 'Company Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      companyPlaceholder: 'Enter company full name',
      contactPlaceholder: 'Enter contact person name',
      emailPlaceholder: 'example@company.com',
      phonePlaceholder: 'Enter phone number',
      addressPlaceholder: 'Enter company detailed address',
      passwordPlaceholder: 'Set a password (min 6 characters)',
      confirmPlaceholder: 'Re-enter password',
      submit: 'Submit Registration',
      submitting: 'Submitting...',
      required: '*',
      companyRequired: 'Company name is required',
      contactRequired: 'Contact person is required',
      contactMin: 'Name must be at least 2 characters',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      phoneRequired: 'Phone number is required',
      passwordRequired: 'Password is required',
      passwordMin: 'Password must be at least 6 characters',
      confirmRequired: 'Please confirm your password',
      confirmMismatch: 'Passwords do not match',
      registerError: 'Registration failed',
      loginLink: 'Already have an account?',
      login: 'Login',
    },
  }[lang];

  // ─── 註冊 schema 動態驗證訊息 ───
  const dynamicSchema = z.object({
    companyName: z.string().min(1, t.companyRequired),
    contactPerson: z.string().min(2, t.contactMin),
    email: z.string().email(t.emailInvalid),
    phone: z.string().min(8, t.phoneRequired),
    address: z.string().optional(),
    password: z.string().min(6, t.passwordMin),
    confirmPassword: z.string().min(6, t.confirmRequired),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t.confirmMismatch,
    path: ["confirmPassword"],
  });

  // ─── React Hook Form ───
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("contactPerson", data.contactPerson);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("address", data.address || "");
      formData.append("password", data.password);

      await registerCustomer(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.registerError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white text-gray-800 py-8">
        <main className="max-w-2xl mx-auto px-6">
          {/* ─── 頁面標題 ─── */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <h2 className="text-lg text-gray-700 mt-2">{t.subtitle}</h2>
            <p className="text-gray-600 mt-2">{t.description}</p>
          </div>

          {/* ─── 錯誤提示 ─── */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* ─── 註冊表單 ─── */}
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* 公司名稱 */}
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Building size={14} />
                        {t.companyName} <span className="text-red-500">{t.required}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.companyPlaceholder}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 聯繫人姓名 */}
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <User size={14} />
                        {t.contactPerson} <span className="text-red-500">{t.required}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.contactPlaceholder}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 電子郵件 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Mail size={14} />
                        {t.email} <span className="text-red-500">{t.required}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t.emailPlaceholder}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 聯繫電話 */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone size={14} />
                        {t.phone} <span className="text-red-500">{t.required}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder={t.phonePlaceholder}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 公司地址 */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <MapPin size={14} />
                        {t.address}
                      </FormLabel>
                      <FormControl>
                        <textarea
                          rows={3}
                          className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          placeholder={t.addressPlaceholder}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 密碼 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Lock size={14} />
                        {t.password} <span className="text-red-500">{t.required}</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t.passwordPlaceholder}
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 確認密碼 */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Lock size={14} />
                        {t.confirmPassword} <span className="text-red-500">{t.required}</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={t.confirmPlaceholder}
                            disabled={isLoading}
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 提交按鈕 */}
                <div className="mt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t.submitting}
                      </span>
                    ) : (
                      t.submit
                    )}
                  </Button>
                </div>

                {/* 登入連結 */}
                <div className="text-center mt-4 text-sm text-gray-600">
                  {t.loginLink}{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-red-700 font-medium"
                  >
                    {t.login}
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </>
  );
}
