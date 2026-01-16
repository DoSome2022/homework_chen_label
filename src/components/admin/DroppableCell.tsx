// src/components/admin/DroppableCell.tsx
'use client'

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"

import { Tag } from "@prisma/client"
import { TagItem } from "./TagItem"

interface DroppableCellProps {
  customerId: string
  tags: { tag: Tag }[]
}

export function DroppableCell({ customerId, tags }: DroppableCellProps) {
  const { setNodeRef } = useDroppable({
    id: `customer-${customerId}`,
  })

  return (
    <div
      ref={setNodeRef}
      className="min-h-[120px] p-4 border-2 border-dashed border-blue-500 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors flex flex-col"
    >
      <SortableContext
        items={tags.map((t) => `${customerId}-${t.tag.id}`)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag }) => (
            <TagItem key={tag.id} tag={tag} customerId={customerId} />
          ))}
        </div>
      </SortableContext>

      <div className="flex-1 flex items-center justify-center text-sm text-blue-600 mt-2">
        拖放標籤至此
      </div>
    </div>
  )
}