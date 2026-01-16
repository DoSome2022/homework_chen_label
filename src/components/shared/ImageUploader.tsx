'use client'

import { useState } from "react"
import { uploadImage } from "@/lib/actions/client"
import { Button } from "@/components/ui/button"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  value?: string[]
  disabled?: boolean
  onChange: (urls: string[]) => void
  onRemove: (url: string) => void
}

export function ImageUploader({
  value = [],
  disabled = false,
  onChange,
  onRemove,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || disabled) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("image", file)
      const url = await uploadImage(formData)

      // 確保 url 是非空字串
      if (typeof url === "string" && url.trim()) {
        onChange([...value, url.trim()])
      }
    } catch (error) {
      console.error("上傳失敗:", error)
      alert("圖片上傳失敗，請再試一次")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // 安全過濾：只保留有效的非空字串 URL
  const validUrls = value.filter(
    (url): url is string => typeof url === "string" && url.trim() !== ""
  )

  return (
    <div className="space-y-4">
      {/* 上傳按鈕 */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={disabled || uploading}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  上傳中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  上傳圖片
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {/* 已上傳圖片預覽 */}
      {validUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {validUrls.map((url) => (
            <div key={url} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={url}
                  alt="產品圖片"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                onClick={() => onRemove(url)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 若無有效圖片顯示提示 */}
      {validUrls.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-4" />
          <p>尚未上傳任何圖片</p>
        </div>
      )}
    </div>
  )
}