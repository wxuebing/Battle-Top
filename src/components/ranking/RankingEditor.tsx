"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, Plus } from "lucide-react"
import { Button, Input, Textarea } from "@/components/ui"
import { cn } from "@/lib/utils"

interface RankingItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
  justification?: string
}

interface RankingEditorProps {
  items: RankingItem[]
  onChange: (items: RankingItem[]) => void
}

interface SortableItemProps {
  item: RankingItem
  index: number
  onRemove: (id: string) => void
  onUpdate: (id: string, field: keyof RankingItem, value: string) => void
}

function SortableItem({ item, index, onRemove, onUpdate }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white border rounded-lg p-4 space-y-3",
        isDragging && "shadow-lg ring-2 ring-primary-500"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                index === 0 && "bg-yellow-100 text-yellow-700",
                index === 1 && "bg-gray-200 text-gray-700",
                index === 2 && "bg-orange-100 text-orange-700",
                index > 2 && "bg-gray-100 text-gray-600"
              )}
            >
              {index + 1}
            </span>

            <Input
              value={item.name}
              onChange={(e) => onUpdate(item.id, "name", e.target.value)}
              placeholder="项目名称"
              className="flex-1"
            />

            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <Input
            value={item.imageUrl || ""}
            onChange={(e) => onUpdate(item.id, "imageUrl", e.target.value)}
            placeholder="图片URL（可选）"
          />

          <Textarea
            value={item.description || ""}
            onChange={(e) => onUpdate(item.id, "description", e.target.value)}
            placeholder="项目描述（可选）"
            rows={2}
          />

          <Textarea
            value={item.justification || ""}
            onChange={(e) => onUpdate(item.id, "justification", e.target.value)}
            placeholder="排名理由（可选）"
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}

export function RankingEditor({ items, onChange }: RankingEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      onChange(arrayMove(items, oldIndex, newIndex))
    }
  }

  function addItem() {
    const newItem: RankingItem = {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      imageUrl: "",
      justification: "",
    }
    onChange([...items, newItem])
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id))
  }

  function updateItem(id: string, field: keyof RankingItem, value: string) {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                onRemove={removeItem}
                onUpdate={updateItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        添加项目
      </Button>
    </div>
  )
}
