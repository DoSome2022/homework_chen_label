// // src/components/admin/CustomerTable.tsx
// 'use client'

// import { useState } from "react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"
// import { toggleCustomerType } from "@/lib/actions/admin-customer"
// import Link from "next/link"
// import Papa from "papaparse"
// import { Tag } from "@prisma/client"
// import {
//   DndContext,
//   pointerWithin,
//   PointerSensor,
//   KeyboardSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
//   useDraggable,
//   useDroppable,
// } from "@dnd-kit/core"
// import {
//   SortableContext,
//   horizontalListSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable"
// import { CSS } from "@dnd-kit/utilities"
// import { addTagToCustomer, removeTagFromCustomer } from "@/lib/actions/tag"
// import { DroppableCell } from "./DroppableCell"
// import { TagItem } from "./TagItem"

// interface Customer {
//   id: string
//   name: string | null
//   email: string | null
//   customerType: "NORMAL" | "POTENTIAL" | string | null
//   projects: unknown[]
//   tags: { tag: Tag }[]
// }

// interface CustomerTableProps {
//   customers: Customer[]
//   allTags: Tag[]
// }

// // 可拖曳標籤（全域可用標籤）
// function DraggableTag({ tag }: { tag: Tag }) {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: `global-${tag.id}`,
//   })

//   const style = {
//     transform: CSS.Translate.toString(transform),
//   }

//   return (
//     <div
//       ref={setNodeRef}
//       style={{ ...style, backgroundColor: tag.color || "#e5e7eb", color: "#000" }}
//       className="px-3 py-1 rounded text-sm font-medium cursor-grab active:cursor-grabbing select-none touch-none"
//       {...listeners}
//       {...attributes}
//     >
//       {tag.name}
//     </div>
//   )
// }

// // 已綁定客戶的標籤（可排序 + 可移除）
// // function TagItem({ tag, customerId }: { tag: Tag; customerId: string }) {
// //   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
// //     id: `${customerId}-${tag.id}`,
// //   })

// //   const style = {
// //     transform: CSS.Transform.toString(transform),
// //     transition,
// //   }

// //   return (
// //     <div
// //       ref={setNodeRef}
// //       style={{ ...style, backgroundColor: tag.color || "#e5e7eb", color: "#000" }}
// //       className="px-2 py-1 rounded text-sm font-medium flex items-center gap-1 cursor-grab active:cursor-grabbing select-none touch-none"
// //       {...attributes}
// //       {...listeners}
// //     >
// //       {tag.name}
// //       <button
// //         onClick={() => removeTagFromCustomer(customerId, tag.id)}
// //         className="text-xs text-gray-600 hover:text-red-600 ml-1"
// //       >
// //         ×
// //       </button>
// //     </div>
// //   )
// // }

// export function CustomerTable({ customers, allTags }: CustomerTableProps) {
//   const [selected, setSelected] = useState<string[]>([])

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(KeyboardSensor)
//   )

//   console.log("[CustomerTable] 渲染完成，客戶數量:", customers.length)
//   console.log("[CustomerTable] 可用標籤數量:", allTags.length)

//   // 全選 / 取消全選
//   const toggleAll = () => {
//     if (selected.length === customers.length) {
//       setSelected([])
//     } else {
//       setSelected(customers.map((c) => c.id))
//     }
//   }

//   // 單一選擇 / 取消選擇
//   const toggleSelect = (id: string) => {
//     setSelected((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     )
//   }

//   // 批量更新客戶類型
//   const bulkToggle = async (newType: "NORMAL" | "POTENTIAL") => {
//     for (const id of selected) {
//       await toggleCustomerType(id, newType)
//     }
//     setSelected([])
//   }

//   const handleDragEnd = async (event: DragEndEvent) => {
//     console.log("[DragEnd] 拖曳結束事件觸發")
//     console.log("[DragEnd] active.id:", event.active.id)
//     console.log("[DragEnd] over?.id:", event.over?.id ?? "無目標區域")

//     const { active, over } = event

//     if (!over) {
//       console.log("[DragEnd] 沒有拖放到任何 droppable 區域，結束")
//       return
//     }

//     const activeId = active.id as string
//     let tagId: string

//     if (activeId.startsWith("global-")) {
//       tagId = activeId.replace("global-", "")
//       console.log("[DragEnd] 從全域標籤區拖曳，tagId:", tagId)
//     } else {
//       const parts = activeId.split("-")
//       tagId = parts[parts.length - 1]
//       console.log("[DragEnd] 從客戶標籤區拖曳，tagId:", tagId)
//     }

//     if (over.id.toString().startsWith("customer-")) {
//       const targetCustomerId = over.id.toString().replace("customer-", "")
//       console.log("[DragEnd] 目標客戶 ID:", targetCustomerId)

//       if (tagId) {
//         console.log("[DragEnd] 準備呼叫 addTagToCustomer", { targetCustomerId, tagId })
//         try {
//           await addTagToCustomer(targetCustomerId, tagId)
//           console.log("[DragEnd] addTagToCustomer 成功")
//         } catch (err) {
//           console.error("[DragEnd] addTagToCustomer 失敗:", err)
//         }
//       } else {
//         console.warn("[DragEnd] tagId 解析失敗，無法新增")
//       }
//     } else {
//       console.log("[DragEnd] 目標區域不是客戶，忽略")
//     }
//   }

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={pointerWithin}
//       onDragEnd={handleDragEnd}
//     >
//       <div>
//         {selected.length > 0 && (
//           <div className="mb-4 flex items-center gap-4 p-4 bg-muted rounded">
//             <span>已選 {selected.length} 位客戶</span>
//             <Button onClick={() => bulkToggle("POTENTIAL")} size="sm">
//               批量設為潛力客
//             </Button>
//             <Button onClick={() => bulkToggle("NORMAL")} size="sm" variant="secondary">
//               批量設為普通客
//             </Button>
//             <Button onClick={() => setSelected([])} size="sm" variant="outline">
//               取消選擇
//             </Button>
//           </div>
//         )}

//         {/* 可用標籤拖曳來源區 */}
//         <div className="mb-6 p-4 bg-gray-50 rounded border">
//           <p className="text-sm font-medium mb-2">可用標籤（拖曳到客戶列）</p>
//           <div className="flex flex-wrap gap-2">
//             {allTags.map((tag) => (
//               <DraggableTag key={tag.id} tag={tag} />
//             ))}
//           </div>
//         </div>

//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-12">
//                 <Checkbox
//                   checked={selected.length === customers.length && customers.length > 0}
//                   onCheckedChange={toggleAll}
//                 />
//               </TableHead>
//               <TableHead>姓名</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>客戶類型</TableHead>
//               <TableHead>標籤</TableHead>
//               <TableHead>項目數</TableHead>
//               <TableHead>操作</TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {customers.map((customer) => {
//               // 為每個客戶的標籤區建立 droppable
//               const { setNodeRef: droppableRef } = useDroppable({
//                 id: `customer-${customer.id}`,
//               })

//               return (
//                 <TableRow key={customer.id}>
//                   <TableCell>
//                     <Checkbox
//                       checked={selected.includes(customer.id)}
//                       onCheckedChange={() => toggleSelect(customer.id)}
//                     />
//                   </TableCell>
//                   <TableCell className="font-medium">{customer.name || "-"}</TableCell>
//                   <TableCell>{customer.email}</TableCell>
//                   <TableCell>
//                     <Badge variant={customer.customerType === "POTENTIAL" ? "default" : "secondary"}>
//                       {customer.customerType === "POTENTIAL" ? "潛力客" : "普通客"}
//                     </Badge>
//                   </TableCell>

//                   <TableCell>
//                     <div ref={droppableRef} className="min-h-[80px] p-4 border-2 border-dashed">
//                       {/* <SortableContext
//                         items={customer.tags.map((t) => `${customer.id}-${t.tag.id}`)}
//                         strategy={horizontalListSortingStrategy}
//                       >
//                         <div className="flex flex-wrap gap-2">
//                           {customer.tags.map(({ tag }) => (
//                             <TagItem key={tag.id} tag={tag} customerId={customer.id} />
//                           ))}
//                         </div>
//                       </SortableContext> */}

//                       {/* 提示文字放在 droppable 內 */}
//                       {/* <div className="text-center text-sm text-blue-600 mt-2">
//                         拖放標籤至此
//                       </div> */}
//                       <DroppableCell customerId={customer.id} tags={customer.tags} />
//                     </div>
//                   </TableCell>

//                   <TableCell>{customer.projects.length}</TableCell>

//                   <TableCell className="space-x-2">
//                     <Button asChild size="sm">
//                       <Link href={`/dashboard/admin/customers/${customer.id}`}>
//                         查看詳情
//                       </Link>
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               )
//             })}
//           </TableBody>
//         </Table>

//         {/* 匯出 CSV */}
//         <Button
//           variant="outline"
//           size="sm"
//           className="mt-4"
//           onClick={() => {
//             const csv = Papa.unparse(
//               customers.map((c) => ({
//                 ID: c.id,
//                 姓名: c.name || "",
//                 Email: c.email || "",
//                 類型: c.customerType === "POTENTIAL" ? "潛力客" : "普通客",
//                 項目數: c.projects.length,
//                 標籤: c.tags.map((t) => t.tag.name).join(", "),
//               }))
//             )
//             const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
//             const url = URL.createObjectURL(blob)
//             const link = document.createElement("a")
//             link.href = url
//             link.download = "customers.csv"
//             link.click()
//             URL.revokeObjectURL(url)
//           }}
//         >
//           匯出 CSV（含標籤）
//         </Button>
//       </div>
//     </DndContext>
//   )
// }



// B 可行的

// src/components/admin/CustomerTable.tsx
'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toggleCustomerType } from "@/lib/actions/admin-customer"
import Link from "next/link"
import Papa from "papaparse"
import { Tag } from "@prisma/client"
import {
  DndContext,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDraggable,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { addTagToCustomer } from "@/lib/actions/tag"
import { DroppableCell } from "./DroppableCell"

interface Customer {
  id: string
  name: string | null
  email: string | null
  customerType: "NORMAL" | "POTENTIAL" | string | null
  projects: unknown[]
  tags: { tag: Tag }[]
}

interface CustomerTableProps {
  customers: Customer[]
  allTags: Tag[]
}

// 可拖曳的「全域標籤」元件
function DraggableTag({ tag }: { tag: Tag }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `global-${tag.id}`,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: tag.color || "#e5e7eb", color: "#000" }}
      className="px-3 py-1 rounded text-sm font-medium cursor-grab active:cursor-grabbing select-none touch-none"
      {...listeners}
      {...attributes}
    >
      {tag.name}
    </div>
  )
}

export function CustomerTable({ customers, allTags }: CustomerTableProps) {
  const [selected, setSelected] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  // 全選 / 取消全選
  const toggleAll = () => {
    if (selected.length === customers.length) {
      setSelected([])
    } else {
      setSelected(customers.map((c) => c.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const bulkToggle = async (newType: "NORMAL" | "POTENTIAL") => {
    for (const id of selected) {
      await toggleCustomerType(id, newType)
    }
    setSelected([])
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    let tagId: string

    if (activeId.startsWith("global-")) {
      tagId = activeId.replace("global-", "")
    } else {
      // 未來若支援客戶內標籤排序，這裡可再處理
      return
    }

    if (over.id.toString().startsWith("customer-")) {
      const customerId = over.id.toString().replace("customer-", "")
      try {
        await addTagToCustomer(customerId, tagId)
      } catch (err) {
        console.error("新增標籤失敗:", err)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={handleDragEnd}
    >
      <div>
        {selected.length > 0 && (
          <div className="mb-4 flex items-center gap-4 p-4 bg-muted rounded">
            <span>已選 {selected.length} 位客戶</span>
            <Button onClick={() => bulkToggle("POTENTIAL")} size="sm">
              批量設為潛力客
            </Button>
            <Button onClick={() => bulkToggle("NORMAL")} size="sm" variant="secondary">
              批量設為普通客
            </Button>
            <Button onClick={() => setSelected([])} size="sm" variant="outline">
              取消選擇
            </Button>
          </div>
        )}

        {/* 可用標籤拖曳來源區 */}
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <p className="text-sm font-medium mb-2">可用標籤（拖曳到客戶列）</p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <DraggableTag key={tag.id} tag={tag} />
            ))}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selected.length === customers.length && customers.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>客戶類型</TableHead>
              <TableHead>標籤</TableHead>
              <TableHead>項目數</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(customer.id)}
                    onCheckedChange={() => toggleSelect(customer.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{customer.name || "-"}</TableCell>
                <TableCell>{customer.email || "-"}</TableCell>
                <TableCell>
                  <Badge variant={customer.customerType === "POTENTIAL" ? "default" : "secondary"}>
                    {customer.customerType === "POTENTIAL" ? "潛力客" : "普通客"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <DroppableCell customerId={customer.id} tags={customer.tags} />
                </TableCell>

                <TableCell>{customer.projects.length}</TableCell>

                <TableCell className="space-x-2">
                  <Button asChild size="sm">
                    <Link href={`/dashboard/admin/customers/${customer.id}`}>
                      查看詳情
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 匯出 CSV */}
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => {
            const csv = Papa.unparse(
              customers.map((c) => ({
                ID: c.id,
                姓名: c.name || "",
                Email: c.email || "",
                類型: c.customerType === "POTENTIAL" ? "潛力客" : "普通客",
                項目數: c.projects.length,
                標籤: c.tags.map((t) => t.tag.name).join(", "),
              }))
            )
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "customers.csv"
            link.click()
            URL.revokeObjectURL(url)
          }}
        >
          匯出 CSV（含標籤）
        </Button>
      </div>
    </DndContext>
  )
}