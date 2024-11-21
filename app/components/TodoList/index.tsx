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
      duration: '',
      priority: 'P4',
      categories: [],
    }
    setTodos(prevTodos => [tempTodo, ...prevTodos])

    try {
      const existingCategories = Array.from(new Set(todos.flatMap(todo => todo.categories)))
      const details = await parseTaskDetails(title, existingCategories)
      
      setTodos(prevTodos => prevTodos.map(todo =>
        todo.id === tempTodo.id
          ? {
              ...todo,
              title: details.title || todo.title,
              dueDate: details.dueDate || todo.dueDate,
              priority: details.priority || 'P4',
              duration: details.duration || '',
              categories: details.categories
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
    const categoryCount = new Map<string, number>()
    todos.forEach(todo => {
      todo.categories.forEach(category => {
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
      })
    })
    
    return Array.from(categoryCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [todos])

  const filteredTodos = useMemo(() => {
    const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 };
    const sortedTodos = [...todos].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
    
    if (!selectedFilter) return sortedTodos;
    
    return sortedTodos.filter(todo => 
      todo.priority === selectedFilter || todo.categories.includes(selectedFilter)
    );
  }, [todos, selectedFilter]);

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