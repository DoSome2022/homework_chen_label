'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createStaffReport, createSalesActivity } from "@/lib/actions/staff"
import { ImageUploader } from "@/components/shared/ImageUploader"


// 報告表單 schema
const reportSchema = z.object({
  type: z.enum(["SALES", "EMPLOYEE"]),
  title: z.string().min(1),
  content: z.string().min(1),
  projectId: z.string().optional(),
})

// 銷售活動表單 schema
const activitySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export default function StaffWorkspacePage() {
  const [activeTab, setActiveTab] = useState("reports")

  // 報告表單
  const reportForm = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { type: "SALES", title: "", content: "", projectId: "" },
  })

  const onSubmitReport = async (data: z.infer<typeof reportSchema>) => {
    const formData = new FormData()
    formData.append("type", data.type)
    formData.append("title", data.title)
    formData.append("content", data.content)
    if (data.projectId) formData.append("projectId", data.projectId)

    await createStaffReport(formData)
    reportForm.reset()
  }

  // 銷售活動表單
  const activityForm = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: { title: "", content: "" },
  })

  const [activityImage, setActivityImage] = useState<string | null>(null)

  const onSubmitActivity = async (data: z.infer<typeof activitySchema>) => {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("content", data.content)
    // 若有圖片，需透過另一個 Server Action 上傳後再加入
    // 此處簡化，假設前端先上傳圖片取得 url 再送出
    if (activityImage) formData.append("image", activityImage) // 實際需調整

    await createSalesActivity(formData)
    activityForm.reset()
    setActivityImage(null)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">工作區</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="reports">報告</TabsTrigger>
          <TabsTrigger value="activities">銷售活動</TabsTrigger>
        </TabsList>

        {/* 報告 Tab */}
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>新增報告</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...reportForm}>
                <form onSubmit={reportForm.handleSubmit(onSubmitReport)} className="space-y-6">
                  <FormField
                    control={reportForm.control}
                    name="type"
                    render={({ field }) => (
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
                            <SelectItem value="EMPLOYEE">員工</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reportForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>標題</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reportForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>內容</FormLabel>
                        <FormControl><Textarea rows={8} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">提交報告</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* 此處可加入報告列表（從 API 取得員工自己的報告） */}
        </TabsContent>

        {/* 銷售活動 Tab */}
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>發布銷售活動</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...activityForm}>
                <form onSubmit={activityForm.handleSubmit(onSubmitActivity)} className="space-y-6">
                  <FormField
                    control={activityForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活動標題</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={activityForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>活動內容</FormLabel>
                        <FormControl><Textarea rows={8} {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>附加圖片（選填）</FormLabel>
                    <ImageUploader
                      value={activityImage ? [activityImage] : []}           // 顯示目前一張
                      onChange={(urls) => {
                        // 取最新一張（因為您只允許一張）
                        const newUrl = urls[urls.length - 1];
                        setActivityImage(newUrl || null);
                      }}
                      onRemove={() => setActivityImage(null)}                // 移除時清空狀態
                    />
                    {activityImage && <p className="text-sm text-green-600 mt-2">已上傳圖片</p>}
                  </div>
                  <Button type="submit">發布活動</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* 此處可加入銷售活動列表（員工自己的） */}
        </TabsContent>
      </Tabs>
    </div>
  )
}