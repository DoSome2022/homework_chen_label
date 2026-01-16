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

type BroadcastFormValues = {
  title: string
  content: string
  videoUrl?: string
  scheduledAt?: string // ISO 字串
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

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      title: broadcast?.title || "",
      content: broadcast?.content || "",
      videoUrl: broadcast?.videoUrl || "",
      scheduledAt: broadcast?.scheduledAt ? broadcast.scheduledAt.toISOString().slice(0, 16) : "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data: BroadcastFormValues) => {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("content", data.content)
    formData.append("videoUrl", data.videoUrl || "")

    if (data.scheduledAt) {
      formData.append("scheduledAt", data.scheduledAt)
    }

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput?.files?.[0]) {
      formData.append("image", fileInput.files[0])
    }

    if (broadcast?.id) {
      await updateBroadcast(broadcast.id, formData)
    } else {
      await createBroadcast(formData)
    }

    onSuccess()
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
                    placeholder="https://www.youtube.com/embed/xxxxxxxxxxx"
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
                  <div className="mt-2">
                    <iframe
                      width="100%"
                      height="200"
                      src={videoPreview}
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
            <Input type="file" accept="image/*" onChange={handleImageChange} />
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