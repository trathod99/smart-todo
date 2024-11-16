'use client'
import React from 'react'
import { Building2, Flag, GraduationCap, Home, Tag, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Priority } from '../types'

interface SidebarProps {
  categories: string[]
  selectedFilter: string | null
  onSelectFilter: (filter: string | null) => void
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'P1', label: 'P1', color: 'text-red-500 hover:bg-red-50', icon: <Flag className="h-4 w-4" /> },
  { value: 'P2', label: 'P2', color: 'text-orange-500 hover:bg-orange-50', icon: <Flag className="h-4 w-4" /> },
  { value: 'P3', label: 'P3', color: 'text-blue-500 hover:bg-blue-50', icon: <Flag className="h-4 w-4" /> },
  { value: 'P4', label: 'P4', color: 'text-gray-500 hover:bg-gray-50', icon: <Flag className="h-4 w-4" /> },
]

const DEFAULT_CATEGORIES = [
  { label: 'Work', icon: <Building2 className="h-4 w-4" /> },
  { label: 'Personal', icon: <Home className="h-4 w-4" /> },
  { label: 'Study', icon: <GraduationCap className="h-4 w-4" /> },
]

export function Sidebar({ categories, selectedFilter, onSelectFilter }: SidebarProps) {
  const allCategories = [...new Set([...DEFAULT_CATEGORIES.map(c => c.label), ...categories])]

  return (
    <div className="w-60 h-[calc(100vh-8rem)] bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="space-y-6">
        <div>
          <button
            onClick={() => onSelectFilter(null)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors mb-2",
              selectedFilter === null && "bg-gray-100"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            All Tasks
          </button>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Priority</h2>
          <div className="space-y-1">
            {PRIORITY_OPTIONS.map((priority) => (
              <button
                key={priority.value}
                onClick={() => onSelectFilter(selectedFilter === priority.value ? null : priority.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  priority.color,
                  selectedFilter === priority.value && "bg-gray-100"
                )}
              >
                {priority.icon}
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</h2>
          <div className="space-y-1">
            {allCategories.map((category) => {
              const defaultCategory = DEFAULT_CATEGORIES.find(c => c.label === category)
              return (
                <button
                  key={category}
                  onClick={() => onSelectFilter(selectedFilter === category ? null : category)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors",
                    selectedFilter === category && "bg-gray-100"
                  )}
                >
                  {defaultCategory?.icon || <Tag className="h-4 w-4" />}
                  {category}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 