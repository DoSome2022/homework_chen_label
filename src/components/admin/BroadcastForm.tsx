// // src/components/admin/BroadcastForm.tsx
// 'use client'

// import { useState } from "react"
// import { format } from "date-fns"
// import { CalendarIcon } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { broadcastSchema } from "@/lib/schemas/broadcast"
// import { createBroadcast, updateBroadcast } from "@/lib/actions/admin-broadcast"

// import Image from "next/image"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"
// import { cn } from "@/lib/utils"
// import { useRef } from "react"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"


// type BroadcastFormValues = {
//   title: string
//   content: string
//   videoUrl?: string
//   imageUrl?: string 
//   scheduledAt?: string | null 
//    status?: "DRAFT" | "PUBLISHED"   // ✅ 新增
// }

// type BroadcastFormProps = {
//   broadcast?: {
//     id?: string
//     title?: string
//     content?: string
//     imageUrl?: string | null
//     videoUrl?: string | null
//     scheduledAt?: Date | null
//     status?: "DRAFT" | "PUBLISHED"   
//   }
//   onSuccess: () => void
// }

// export function BroadcastForm({ broadcast, onSuccess }: BroadcastFormProps) {
//   const [preview, setPreview] = useState<string | null>(broadcast?.imageUrl || null)
//   const [videoPreview, setVideoPreview] = useState<string | null>(broadcast?.videoUrl || null)

// const fileInputRef = useRef<HTMLInputElement>(null)


//   const form = useForm<BroadcastFormValues>({
//     resolver: zodResolver(broadcastSchema),
//     defaultValues: {
//       title: broadcast?.title || "",
//       content: broadcast?.content || "",
//       videoUrl: broadcast?.videoUrl || "",
//       imageUrl: broadcast?.imageUrl || "",   // 新增這行
//       scheduledAt: broadcast?.scheduledAt ? broadcast.scheduledAt.toISOString().slice(0, 16) : "",
//       status: broadcast?.status || "DRAFT",
//     },
//   })

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       setPreview(URL.createObjectURL(file))
//     }
//   }

// // 用來把 YouTube 網址轉成 embed 格式
// const getYoutubeEmbedUrl = (url: string) => {
//   if (!url) return null;
  
//   // 匹配常見的 YouTube 網址格式 (包含一般 watch, 短網址 youtu.be, 和已經是 embed 的)
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);

//   // ID 通常是 11 個字元
//   if (match && match[2].length === 11) {
//     return `https://www.youtube.com/embed/${match[2]}`;
//   }
  
//   // 如果不是 YouTube 網址，就回傳原網址 (也許是 Vimeo 或其他支援 iframe 的連結)
//   // 但如果是無效的 YouTube 連結，這裡回傳原網址可能會繼續報錯，視需求而定
//   return url; 
// };

// // 修改 onSubmit 函式，加入事件參數 e
// const onSubmit = async (data: BroadcastFormValues, e?: React.BaseSyntheticEvent) => {
//   // 防止瀏覽器預設提交行為（雖然 handleSubmit 已處理，但加上更安全）
//   e?.preventDefault();

//   const formData = new FormData();
//   formData.append("title", data.title);
//   formData.append("content", data.content);
//   formData.append("videoUrl", data.videoUrl || "");

//   if (data.scheduledAt) {
//     formData.append("scheduledAt", data.scheduledAt);
//   }

//   // 從提交事件中直接取得原生表單元素，並找到 file input
//   const nativeForm = e?.target as HTMLFormElement | null;
//   if (nativeForm) {
//     const fileInput = nativeForm.querySelector('input[type="file"]') as HTMLInputElement;
//     const file = fileInput?.files?.[0];

//     if (file) {
//       formData.append("image", file);
//     }
//   }

//   try {
//     let result;
//     if (broadcast?.id) {
//       result = await updateBroadcast(broadcast.id, formData);
//     } else {
//       result = await createBroadcast(formData);
//     }

//     console.log("建立/更新結果：", result);
//     onSuccess();
//   } catch (err) {
//     console.error("提交失敗：", err);
//     // 建議在此處加入使用者提示，例如 toast 顯示錯誤訊息
//   }
// };

//   return (
//     <>
//       <DialogHeader>
//         <DialogTitle>{broadcast?.id ? "編輯" : "新增"}廣播</DialogTitle>
//       </DialogHeader>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="title"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>標題</FormLabel>
//                 <FormControl>
//                   <Input placeholder="輸入標題" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="content"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>內容（支援 Emoji）</FormLabel>
//                 <FormControl>
//                   <Textarea
//                     rows={6}
//                     placeholder="輸入內容... 可直接貼上 Emoji 😊🚀"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           {/* 影片嵌入 */}
//           <FormField
//             control={form.control}
//             name="videoUrl"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>嵌入影片網址（選填）</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="https://www.youtube.com/watch?v=..."
//                     {...field}
//                     value={field.value || ""}
//                     onChange={(e) => {
//                       field.onChange(e)
//                       setVideoPreview(e.target.value)
//                     }}
//                   />
//                 </FormControl>
//                 <FormMessage />
//                 {/* 這裡修改: 使用 getYoutubeEmbedUrl 轉換網址 */}
//                 {videoPreview && (
//                   <div className="mt-2 aspect-video w-full">
//                     <iframe
//                       width="100%"
//                       height="100%"
//                       src={getYoutubeEmbedUrl(videoPreview) || ""}
//                       title="影片預覽"
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                     />
//                   </div>
//                 )}
//               </FormItem>
//             )}
//           />


//           {/* 新增：排程發布時間 */}
// <FormField
//   control={form.control}
//   name="scheduledAt"
//   render={({ field }) => {
//     // 解析目前的值
//     const currentValue = field.value ? new Date(field.value) : null
    
//     // 日期部分
//     const datePart = currentValue
//       ? format(currentValue, "yyyy-MM-dd")
//       : format(new Date(), "yyyy-MM-dd")
    
//     // 時間部分
//     const timePart = currentValue
//       ? format(currentValue, "HH:mm")
//       : "08:00"

//     // 組合日期+時間
//     const updateDateTime = (date: string, time: string) => {
//       const combined = `${date}T${time}:00`
//       field.onChange(combined)
//     }

//     return (
//       <FormItem>
//         <FormLabel>排程發布時間（選填，留空立即發布）</FormLabel>
//         <div className="flex gap-2">
//           {/* 日期選擇 */}
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant="outline"
//                 className={cn(
//                   "w-full justify-start text-left font-normal",
//                   !field.value && "text-muted-foreground"
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {currentValue
//                   ? format(currentValue, "yyyy-MM-dd")
//                   : "選擇日期"}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//               <Calendar
//                 mode="single"
//                 selected={currentValue || undefined}
//                 onSelect={(date) => {
//                   if (date) {
//                     const dateStr = format(date, "yyyy-MM-dd")
//                     updateDateTime(dateStr, timePart)
//                   }
//                 }}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>

//           {/* 時間選擇（小時:分鐘） */}
//           <select
//             value={timePart}
//             onChange={(e) => {
//               updateDateTime(datePart, e.target.value)
//             }}
//             className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
//           >
//             {Array.from({ length: 24 }, (_, h) =>
//               Array.from({ length: 4 }, (_, m) => {
//                 const hour = String(h).padStart(2, "0")
//                 const min = String(m * 15).padStart(2, "0") // 每 15 分鐘一間隔
//                 return `${hour}:${min}`
//               })
//             ).flat().map((time) => (
//               <option key={time} value={time}>
//                 {time}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* 清除按鈕 */}
//         {field.value && (
//           <Button
//             type="button"
//             variant="ghost"
//             size="sm"
//             className="mt-1"
//             onClick={() => field.onChange("")}
//           >
//             清除排程時間
//           </Button>
//         )}

//         <FormMessage />
//       </FormItem>
//     )
//   }}
// />


//           <FormField
//   control={form.control}
//   name="status"
//   render={({ field }) => (
//     <FormItem>
//       <FormLabel>發布狀態</FormLabel>
//       <Select
//         value={field.value || "DRAFT"}
//         onValueChange={field.onChange}
//       >
//         <FormControl>
//           <SelectTrigger>
//             <SelectValue placeholder="選擇狀態" />
//           </SelectTrigger>
//         </FormControl>
//         <SelectContent>
//           <SelectItem value="DRAFT">
//             <span className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-yellow-400" />
//               草稿（僅儲存，不推送）
//             </span>
//           </SelectItem>
//           <SelectItem value="PUBLISHED">
//             <span className="flex items-center gap-2">
//               <span className="w-2 h-2 rounded-full bg-green-400" />
//               立即發布
//             </span>
//           </SelectItem>
//         </SelectContent>
//       </Select>
//       <FormMessage />
//     </FormItem>
//   )}
// />

// <FormItem>
//   <FormLabel>圖片（選填）</FormLabel>
//   <Input 
//     type="file" 
//     accept="image/*" 
//     onChange={handleImageChange}
//     ref={fileInputRef}           // ← 新增這行
//   />
//   {preview && (
//     <div className="mt-4 rounded-lg overflow-hidden border">
//       <Image src={preview} alt="預覽" width={500} height={300} className="object-cover w-full" />
//     </div>
//   )}
// </FormItem>

//           <DialogFooter>
//             <Button type="submit">
//               {broadcast?.id ? "儲存變更" : "發布廣播"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </Form>
//     </>
//   )
// }


// src/components/admin/BroadcastForm.tsx
'use client'

import { useState, useRef } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { broadcastSchema } from "@/lib/schemas/broadcast"
import { createBroadcast, updateBroadcast } from "@/lib/actions"
import { toast } from "sonner"  // ✅ 導入 toast

import Image from "next/image"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type BroadcastFormValues = {
  title: string
  content: string
  videoUrl?: string
  imageUrl?: string 
  scheduledAt?: string | null 
  status?: "DRAFT" | "PUBLISHED"
}

type BroadcastFormProps = {
  broadcast?: {
    id?: string
    title?: string
    content?: string
    imageUrl?: string | null
    videoUrl?: string | null
    scheduledAt?: Date | null
    status?: "DRAFT" | "PUBLISHED"   
  }
  onSuccess: () => void
}

export function BroadcastForm({ broadcast, onSuccess }: BroadcastFormProps) {
  const [preview, setPreview] = useState<string | null>(broadcast?.imageUrl || null)
  const [videoPreview, setVideoPreview] = useState<string | null>(broadcast?.videoUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)  // ✅ 新增提交狀態
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: broadcast?.title || "",
      content: broadcast?.content || "",
      videoUrl: broadcast?.videoUrl || "",
      imageUrl: broadcast?.imageUrl || "",
      scheduledAt: broadcast?.scheduledAt ? broadcast.scheduledAt.toISOString().slice(0, 16) : "",
      status: broadcast?.status || "DRAFT",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  // 用來把 YouTube 網址轉成 embed 格式
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    
    return url
  }

  // ✅ 修正 onSubmit：使用 fileInputRef 而非從事件取得
  const onSubmit = async (data: BroadcastFormValues) => {
    // 防止重複提交
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("content", data.content)
      formData.append("videoUrl", data.videoUrl || "")
      formData.append("status", data.status || "DRAFT")

      if (data.scheduledAt) {
        formData.append("scheduledAt", data.scheduledAt)
      }

      // ✅ 直接從 fileInputRef 取得檔案
      if (fileInputRef.current && fileInputRef.current.files) {
        const file = fileInputRef.current.files[0]
        if (file) {
          formData.append("image", file)
        }
      }

      let result
      if (broadcast?.id) {
        result = await updateBroadcast(broadcast.id, formData)
        toast.success("廣播已更新！")
      } else {
        result = await createBroadcast(formData)
        toast.success("廣播已建立！")
      }

      console.log("建立/更新結果：", result)
      
      // ✅ 關閉對話框並刷新列表
      onSuccess()
      
    } catch (err) {
      console.error("提交失敗：", err)
      // ✅ 顯示錯誤訊息給使用者
      const errorMessage = err instanceof Error ? err.message : "提交失敗，請稍後再試"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{broadcast?.id ? "編輯" : "新增"}廣播</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>標題</FormLabel>
                <FormControl>
                  <Input placeholder="輸入標題" {...field} />
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
                <FormLabel>內容（支援 Emoji）</FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder="輸入內容... 可直接貼上 Emoji 😊🚀"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 影片嵌入 */}
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>嵌入影片網址（選填）</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e)
                      setVideoPreview(e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
                {videoPreview && (
                  <div className="mt-2 aspect-video w-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src={getYoutubeEmbedUrl(videoPreview) || ""}
                      title="影片預覽"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </FormItem>
            )}
          />

          {/* 排程發布時間 */}
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => {
              const currentValue = field.value ? new Date(field.value) : null
              const datePart = currentValue
                ? format(currentValue, "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd")
              const timePart = currentValue
                ? format(currentValue, "HH:mm")
                : "08:00"

              const updateDateTime = (date: string, time: string) => {
                const combined = `${date}T${time}:00`
                field.onChange(combined)
              }

              return (
                <FormItem>
                  <FormLabel>排程發布時間（選填，留空立即發布）</FormLabel>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {currentValue
                            ? format(currentValue, "yyyy-MM-dd")
                            : "選擇日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={currentValue || undefined}
                          onSelect={(date) => {
                            if (date) {
                              const dateStr = format(date, "yyyy-MM-dd")
                              updateDateTime(dateStr, timePart)
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <select
                      value={timePart}
                      onChange={(e) => {
                        updateDateTime(datePart, e.target.value)
                      }}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {Array.from({ length: 24 }, (_, h) =>
                        Array.from({ length: 4 }, (_, m) => {
                          const hour = String(h).padStart(2, "0")
                          const min = String(m * 15).padStart(2, "0")
                          return `${hour}:${min}`
                        })
                      ).flat().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => field.onChange("")}
                    >
                      清除排程時間
                    </Button>
                  )}

                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>發布狀態</FormLabel>
                <Select
                  value={field.value || "DRAFT"}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇狀態" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        草稿（僅儲存，不推送）
                      </span>
                    </SelectItem>
                    <SelectItem value="PUBLISHED">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        立即發布
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ 圖片上傳 - 使用 ref */}
          <FormItem>
            <FormLabel>圖片（選填）</FormLabel>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            {preview && (
              <div className="mt-4 rounded-lg overflow-hidden border">
                <Image 
                  src={preview} 
                  alt="預覽" 
                  width={500} 
                  height={300} 
                  className="object-cover w-full" 
                />
              </div>
            )}
          </FormItem>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting}  // ✅ 提交中禁用
            >
              {isSubmitting 
                ? "提交中..." 
                : broadcast?.id 
                  ? "儲存變更" 
                  : "發布廣播"
              }
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}