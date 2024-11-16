'use client'
import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TodoFormProps } from '../types'

export const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [newTodoTitle, setNewTodoTitle] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodoTitle.trim() === '') return
    onSubmit(newTodoTitle)
    setNewTodoTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex items-center gap-2">
      <Input
        type="text"
        value={newTodoTitle}
        onChange={(e) => setNewTodoTitle(e.target.value)}
        placeholder="Add a new task..."
        className="flex-grow shadow-sm text-sm"
      />
      <Button type="submit" size="icon" variant="outline" className="shadow-sm">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}