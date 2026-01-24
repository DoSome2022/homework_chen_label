// src/components/admin/BroadcastForm.tsx
'use client'

import { useState } from "react"
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
import { createBroadcast, updateBroadcast } from "@/lib/actions/admin-broadcast"
import Image from "next/image"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useRef } from "react"


type BroadcastFormValues = {
  title: string
  content: string
  videoUrl?: string
  imageUrl?: string 
  scheduledAt?: string | null 
}

type BroadcastFormProps = {
  broadcast?: {
    id?: string
    title?: string
    content?: string
    imageUrl?: string | null
    videoUrl?: string | null
    scheduledAt?: Date | null
  }
  onSuccess: () => void
}

export function BroadcastForm({ broadcast, onSuccess }: BroadcastFormProps) {
  const [preview, setPreview] = useState<string | null>(broadcast?.imageUrl || null)
  const [videoPreview, setVideoPreview] = useState<string | null>(broadcast?.videoUrl || null)
  const [dateOpen, setDateOpen] = useState(false)
const fileInputRef = useRef<HTMLInputElement>(null)


  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: broadcast?.title || "",
      content: broadcast?.content || "",
      videoUrl: broadcast?.videoUrl || "",
      imageUrl: broadcast?.imageUrl || "",   // 新增這行
      scheduledAt: broadcast?.scheduledAt ? broadcast.scheduledAt.toISOString().slice(0, 16) : "",
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
  if (!url) return null;
  
  // 匹配常見的 YouTube 網址格式 (包含一般 watch, 短網址 youtu.be, 和已經是 embed 的)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  // ID 通常是 11 個字元
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // 如果不是 YouTube 網址，就回傳原網址 (也許是 Vimeo 或其他支援 iframe 的連結)
  // 但如果是無效的 YouTube 連結，這裡回傳原網址可能會繼續報錯，視需求而定
  return url; 
};

// 修改 onSubmit 函式，加入事件參數 e
const onSubmit = async (data: BroadcastFormValues, e?: React.BaseSyntheticEvent) => {
  // 防止瀏覽器預設提交行為（雖然 handleSubmit 已處理，但加上更安全）
  e?.preventDefault();

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("videoUrl", data.videoUrl || "");

  if (data.scheduledAt) {
    formData.append("scheduledAt", data.scheduledAt);
  }

  // 從提交事件中直接取得原生表單元素，並找到 file input
  const nativeForm = e?.target as HTMLFormElement | null;
  if (nativeForm) {
    const fileInput = nativeForm.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (file) {
      formData.append("image", file);
    }
  }

  try {
    let result;
    if (broadcast?.id) {
      result = await updateBroadcast(broadcast.id, formData);
    } else {
      result = await createBroadcast(formData);
    }

    console.log("建立/更新結果：", result);
    onSuccess();
  } catch (err) {
    console.error("提交失敗：", err);
    // 建議在此處加入使用者提示，例如 toast 顯示錯誤訊息
  }
};

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
                {/* 這裡修改: 使用 getYoutubeEmbedUrl 轉換網址 */}
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


          {/* 新增：排程發布時間 */}
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>排程發布時間（選填，留空立即發布）</FormLabel>
                <FormControl>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "yyyy-MM-dd HH:mm") : "選擇時間"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date.toISOString())
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

<FormItem>
  <FormLabel>圖片（選填）</FormLabel>
  <Input 
    type="file" 
    accept="image/*" 
    onChange={handleImageChange}
    ref={fileInputRef}           // ← 新增這行
  />
  {preview && (
    <div className="mt-4 rounded-lg overflow-hidden border">
      <Image src={preview} alt="預覽" width={500} height={300} className="object-cover w-full" />
    </div>
  )}
</FormItem>

          <DialogFooter>
            <Button type="submit">
              {broadcast?.id ? "儲存變更" : "發布廣播"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}