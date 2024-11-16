export type Priority = 'P1' | 'P2' | 'P3' | 'P4'

export interface Todo {
    id: string
    title: string
    dueDate: Date
    duration: string
    priority: Priority
    categories: string[]
}
  
export interface TodoFormProps {
    onSubmit: (title: string) => void
}
  
export interface TodoItemProps {
    todo: Todo
    index: number
    onUpdate: (updates: Partial<Todo>) => void
}