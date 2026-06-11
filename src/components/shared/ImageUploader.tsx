// // src/components/shared/ImageUploader.tsx

// 'use client'

// import { useState } from "react"
// import { uploadImage } from "@/lib/actions/client"
// import { Button } from "@/components/ui/button"
// import { X, Upload, Image as ImageIcon } from "lucide-react"
// import Image from "next/image"

// interface ImageUploaderProps {
//   value?: string[]
//   disabled?: boolean
//   onChange: (urls: string[]) => void
//   onRemove: (url: string) => void
// }

// export function ImageUploader({
//   value = [],
//   disabled = false,
//   onChange,
//   onRemove,
// }: ImageUploaderProps) {
//   const [uploading, setUploading] = useState(false)

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file || disabled) return

//     setUploading(true)
//     try {
//       const formData = new FormData()
//       formData.append("image", file)
//       const url = await uploadImage(formData)

//       // 確保 url 是非空字串
//       if (typeof url === "string" && url.trim()) {
//         onChange([...value, url.trim()])
//       }
//     } catch (error) {
//       console.error("上傳失敗:", error)
//       alert("圖片上傳失敗，請再試一次")
//     } finally {
//       setUploading(false)
//       e.target.value = ""
//     }
//   }

//   // 安全過濾：只保留有效的非空字串 URL
//   const validUrls = value.filter(
//     (url): url is string => typeof url === "string" && url.trim() !== ""
//   )

//   return (
//     <div className="space-y-4">
//       {/* 上傳按鈕 */}
//       <div>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleUpload}
//           disabled={disabled || uploading}
//           className="hidden"
//           id="image-upload"
//         />
//         <label htmlFor="image-upload">
//           <Button
//             type="button"
//             variant="outline"
//             disabled={disabled || uploading}
//             className="cursor-pointer"
//             asChild
//           >
//             <span>
//               {uploading ? (
//                 <>
//                   <Upload className="mr-2 h-4 w-4 animate-spin" />
//                   上傳中...
//                 </>
//               ) : (
//                 <>
//                   <Upload className="mr-2 h-4 w-4" />
//                   上傳圖片
//                 </>
//               )}
//             </span>
//           </Button>
//         </label>
//       </div>

//       {/* 已上傳圖片預覽 */}
//       {validUrls.length > 0 && (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//           {validUrls.map((url) => (
//             <div key={url} className="relative group">
//               <div className="aspect-square relative overflow-hidden rounded-lg border">
//                 <Image
//                   src={url}
//                   alt="產品圖片"
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//               <Button
//                 size="icon"
//                 variant="destructive"
//                 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
//                 onClick={() => onRemove(url)}
//                 disabled={disabled}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* 若無有效圖片顯示提示 */}
//       {validUrls.length === 0 && !uploading && (
//         <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
//           <ImageIcon className="h-12 w-12 mb-4" />
//           <p>尚未上傳任何圖片</p>
//         </div>
//       )}
//     </div>
//   )
// }


// src/components/shared/FileUploader.tsx
'use client'

import { useState, useRef } from "react"

import { Button } from "@/components/ui/button"
import { X, Upload, File, Image as  FileText } from "lucide-react"
import Image from "next/image"
import { uploadFile } from "@/lib/actions/staff-message"

interface FileUploaderProps {
  value?: { url: string; name: string; type: string }[]
  disabled?: boolean
  onChange: (files: { url: string; name: string; type: string }[]) => void
  onRemove: (url: string) => void
  accept?: string  // 預設接受所有檔案類型
}

export function FileUploader({
  value = [],
  disabled = false,
  onChange,
  onRemove,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip",
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || disabled) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadFile(formData)

      if (result.url) {
        onChange([
          ...value,
          { url: result.url, name: result.name, type: result.type },
        ])
      }
    } catch (error) {
      console.error("上傳失敗:", error)
      alert("檔案上傳失敗，請再試一次")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const isImage = (type: string) => type.startsWith("image/")

  return (
    <div className="space-y-4">
      {/* 上傳按鈕 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          disabled={disabled || uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
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
                  上傳附件
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {/* 已上傳檔案列表 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((file) => (
            <div key={file.url} className="relative group border rounded-lg p-2">
              {isImage(file.type) ? (
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center bg-muted rounded-lg">
                  <FileText className="h-8 w-8 mb-1" />
                  <p className="text-xs text-center truncate w-full px-1">
                    {file.name}
                  </p>
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition w-6 h-6"
                onClick={() => onRemove(file.url)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && !uploading && (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
          <File className="h-8 w-8 mb-2" />
          <p className="text-sm">支援圖片、PDF、Word、Excel 等格式</p>
        </div>
      )}
    </div>
  )
}
