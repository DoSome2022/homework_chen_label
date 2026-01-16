// src/components/admin/TagItem.tsx
'use client'

import { Tag } from "@prisma/client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { removeTagFromCustomer } from "@/lib/actions/tag"

interface TagItemProps {
  tag: Tag
  customerId: string
}

export function TagItem({ tag, customerId }: TagItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `${customerId}-${tag.id}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: tag.color || "#e5e7eb", color: "#000" }}
      className="px-2 py-1 rounded text-sm font-medium flex items-center gap-1 cursor-grab active:cursor-grabbing select-none touch-none"
      {...attributes}
      {...listeners}
    >
      {tag.name}
      <button
        onClick={() => removeTagFromCustomer(customerId, tag.id)}
        className="text-xs text-gray-600 hover:text-red-600 ml-1"
      >
        ×
      </button>
    </div>
  )
}