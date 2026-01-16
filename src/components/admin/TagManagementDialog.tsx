// // src/components/admin/TagManagementDialog.tsx
// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { createTag, updateTag, deleteTag } from "@/lib/actions/tag"
// import { Tag } from "@prisma/client"
// import { Trash2, Plus } from "lucide-react"

// interface TagManagementDialogProps {
//   // 可傳入現有標籤列表（若需要即時更新）
// }

// export function TagManagementDialog({}: TagManagementDialogProps) {
//   const [open, setOpen] = useState(false)
//   const [name, setName] = useState("")
//   const [color, setColor] = useState("#e5e7eb")
//   const [editingTag, setEditingTag] = useState<Tag | null>(null)

//   // 這裡假設您從某處取得 allTags，或在 Dialog 內重新查詢
//   // 為了簡化，此處省略 allTags 列表顯示與編輯，您可自行擴充

//   const handleCreate = async () => {
//     if (!name.trim()) return
//     await createTag(name.trim(), color)
//     setName("")
//     setColor("#e5e7eb")
//     setOpen(false)
//   }

//   const handleUpdate = async () => {
//     if (!editingTag || !name.trim()) return
//     await updateTag(editingTag.id, name.trim(), color)
//     setEditingTag(null)
//     setName("")
//     setColor("#e5e7eb")
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline">
//           <Plus className="mr-2 h-4 w-4" />
//           管理標籤
//         </Button>
//       </DialogTrigger>

//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>標籤管理</DialogTitle>
//           <DialogDescription>
//             新增或編輯全域標籤，標籤可用於客戶分類與快速過濾
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4 py-4">
//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="name" className="text-right">
//               標籤名稱
//             </Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="col-span-3"
//               placeholder="例如：VIP、高價值、待開發..."
//             />
//           </div>

//           <div className="grid grid-cols-4 items-center gap-4">
//             <Label htmlFor="color" className="text-right">
//               顏色
//             </Label>
//             <Input
//               id="color"
//               type="color"
//               value={color}
//               onChange={(e) => setColor(e.target.value)}
//               className="col-span-3 h-10 w-full p-1"
//             />
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button onClick={handleCreate} disabled={!name.trim()}>
//               新增標籤
//             </Button>
//             {editingTag && (
//               <Button onClick={handleUpdate} variant="secondary">
//                 更新
//               </Button>
//             )}
//           </div>

//           {/* 若要顯示現有標籤列表並支援編輯/刪除，可在此處加入 */}
//           {/* 例如：allTags.map(tag => (...)) */}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             關閉
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }


// src/components/admin/TagManagementDialog.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTag, updateTag, deleteTag } from "@/lib/actions/tag"
import { Tag } from "@prisma/client"
import { Trash2, Plus, Pencil } from "lucide-react"

interface TagManagementDialogProps {
  // 若父元件需要即時得知標籤變更，可傳入 refresh 回調
  onTagsChange?: () => Promise<void> | void
  // 若想在對話框內顯示所有標籤，建議從父元件傳入（避免在 client component 直接 query）
  // allTags?: Tag[]
  // 暫時使用 props 傳入的方式最乾淨
}

export function TagManagementDialog({ onTagsChange }: TagManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#e5e7eb")
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  // 假設 allTags 從父元件傳入，或您可在此處使用 useQuery / SWR 等工具取得
  // 為展示完整功能，此處先使用空陣列，實際使用時請從 props 傳入
  const allTags: Tag[] = [] // ← 請替換成實際資料來源，例如 props.allTags

  const resetForm = () => {
    setName("")
    setColor("#e5e7eb")
    setEditingTag(null)
  }

  const handleCreateOrUpdate = async () => {
    if (!name.trim()) return

    if (editingTag) {
      // 更新
      await updateTag(editingTag.id, name.trim(), color)
    } else {
      // 新增
      await createTag(name.trim(), color)
    }

    resetForm()
    await onTagsChange?.() // 通知父元件重新載入標籤
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setName(tag.name)
    setColor(tag.color || "#e5e7eb")
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm("確定要刪除此標籤？已綁定客戶的標籤也會一併移除關聯。")) return
    await deleteTag(tagId)
    await onTagsChange?.()
  }

  const handleCancelEdit = () => {
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          管理標籤
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>標籤管理</DialogTitle>
          <DialogDescription>
            新增、編輯或刪除全域標籤，用於客戶分類與快速篩選
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 表單區域 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name">標籤名稱</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：VIP、高價值、待開發..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">顏色</Label>
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full p-1"
              />
            </div>

            <div className="flex gap-2 items-end">
              <Button
                onClick={handleCreateOrUpdate}
                disabled={!name.trim()}
                className="flex-1"
              >
                {editingTag ? "更新標籤" : "新增標籤"}
              </Button>

              {editingTag && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  取消編輯
                </Button>
              )}
            </div>
          </div>

          {/* 現有標籤列表 */}
          <div className="border rounded-md p-4">
            <h4 className="text-sm font-medium mb-3">現有標籤</h4>
            {allTags.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                尚未建立任何標籤
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <div
                    key={tag.id}
                    style={{ backgroundColor: tag.color || "#e5e7eb" }}
                    className="px-3 py-1 rounded text-sm font-medium flex items-center gap-2"
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleEdit(tag)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive hover:text-destructive/90"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            關閉
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}