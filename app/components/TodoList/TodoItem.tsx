'use client'
import React, { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, GripVertical, Tag, Flag } from 'lucide-react'
import { Draggable } from 'react-beautiful-dnd'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Priority, Todo, TodoItemProps } from '../types'

const DURATION_OPTIONS = [
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '45m', label: '45m' },
  { value: '1h', label: '1h' },
  { value: '1.5h', label: '1.5h' },
  { value: '2h', label: '2h' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'P1', label: 'P1', color: 'text-red-500' },
  { value: 'P2', label: 'P2', color: 'text-orange-500' },
  { value: 'P3', label: 'P3', color: 'text-blue-500' },
  { value: 'P4', label: 'P4', color: 'text-gray-500' },
]

export const TodoItem: React.FC<TodoItemProps> = ({ todo, index, onUpdate }) => {
  const [customDuration, setCustomDuration] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const handleCustomDurationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customDuration.trim()) {
      onUpdate({ duration: customDuration })
      setCustomDuration('')
    }
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim() && !todo.categories.includes(newCategory.trim())) {
      onUpdate({ categories: [...todo.categories, newCategory.trim()] })
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    onUpdate({
      categories: todo.categories.filter(c => c !== category)
    })
  }

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
          style={{
            ...provided.draggableProps.style,
            left: 'auto',
            top: 'auto',
            position: (provided.draggableProps.style as any)?.position,
            transform: provided.draggableProps.style?.transform,
          }}
        >
          <div className="flex items-center gap-3">
            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-700 text-sm select-none">{todo.title}</span>
              <div className="flex gap-1 flex-wrap">
                {todo.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600"
                    onClick={() => removeCategory(category)}
                  >
                    {category}
                    <button className="hover:text-gray-800">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 h-auto text-xs hover:bg-gray-50",
                    PRIORITY_OPTIONS.find(p => p.value === todo.priority)?.color
                  )}
                >
                  <Flag className="h-3 w-3" />
                  {todo.priority}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="grid grid-cols-2 gap-1">
                  {PRIORITY_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      className={cn(
                        "px-3 py-1 h-auto text-xs",
                        option.color,
                        todo.priority === option.value && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => onUpdate({ priority: option.value })}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 px-2 py-0.5 h-auto text-xs text-gray-500 hover:bg-gray-50"
                >
                  <Tag className="h-3 w-3 text-gray-400" />
                  Add Tag
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <form onSubmit={handleAddCategory} className="flex gap-1">
                  <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add category..."
                    className="h-7 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-7 text-xs">
                    Add
                  </Button>
                </form>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 px-2 py-0.5 h-auto text-xs text-gray-500 hover:bg-gray-50"
                >
                  <Clock className="h-3 w-3 text-gray-400" />
                  {todo.duration}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    {DURATION_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        variant="ghost"
                        className={cn(
                          "px-3 py-1 h-auto text-xs",
                          todo.duration === option.value && "bg-primary text-primary-foreground"
                        )}
                        onClick={() => onUpdate({ duration: option.value })}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <form onSubmit={handleCustomDurationSubmit} className="flex gap-1">
                    <Input
                      type="text"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="Custom duration..."
                      className="h-7 text-xs"
                    />
                    <Button type="submit" size="sm" className="h-7 text-xs">
                      Set
                    </Button>
                  </form>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 px-2 py-0.5 h-auto text-xs text-gray-500 hover:bg-gray-50"
                >
                  <CalendarIcon className="h-3 w-3 text-gray-400" />
                  {format(new Date(todo.dueDate), 'MMM d')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  selected={new Date(todo.dueDate)}
                  onSelect={(date) => {
                    if (date) {
                      onUpdate({ dueDate: date })
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </li>
      )}
    </Draggable>
  )
}