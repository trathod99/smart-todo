'use client'
import React, { useState, useMemo } from 'react'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import { TodoForm } from './TodoForm'
import { TodoItem } from './TodoItem'
import { Sidebar } from '../Sidebar'
import { Todo } from '../types'
import { parseTaskDetails } from '../../utils/ai'

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

  const addTodo = async (title: string) => {
    const tempTodo: Todo = {
      id: Date.now().toString(),
      title,
      dueDate: new Date(),
      duration: '15m',
      priority: 'P3',
      categories: [],
    }
    setTodos(prevTodos => [tempTodo, ...prevTodos])

    try {
      const details = await parseTaskDetails(title)
      
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === tempTodo.id
          ? {
              ...todo,
              title: details.title || todo.title,
              dueDate: details.dueDate || todo.dueDate,
              priority: details.priority || todo.priority,
              duration: details.duration || todo.duration
            }
          : todo
      ))
    } catch (error) {
      console.error('Failed to parse task details:', error)
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return

    setTodos(prevTodos => {
      const updatedTodos = [...prevTodos]
      const [movedItem] = updatedTodos.splice(result.source.index, 1)
      updatedTodos.splice(result.destination!.index, 0, movedItem)
      return updatedTodos
    })
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prevTodos => prevTodos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ))
  }

  const allCategories = useMemo(() => {
    const categorySet = new Set<string>()
    todos.forEach(todo => {
      todo.categories.forEach(category => categorySet.add(category))
    })
    return Array.from(categorySet)
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (!selectedFilter) return todos
    
    return todos.filter(todo => 
      todo.priority === selectedFilter || todo.categories.includes(selectedFilter)
    )
  }, [todos, selectedFilter])

  return (
    <div className="max-w-5xl mx-auto mt-16 flex gap-8">
      <Sidebar
        categories={allCategories}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />
      
      <div className="flex-1">
        <div className="max-w-2xl mx-auto p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
          <TodoForm onSubmit={addTodo} />
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="todos-list" direction="vertical">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 mt-4"
                >
                  {filteredTodos.map((todo, index) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      index={index}
                      onUpdate={(updates) => updateTodo(todo.id, updates)}
                    />
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  )
}