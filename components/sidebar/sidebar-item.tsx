"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  icon?: React.ReactNode
  label: string
  active?: boolean
  collapsible?: boolean
  children?: React.ReactNode
  onClick?: () => void
}

export function SidebarItem({ icon, label, active, collapsible, children, onClick }: SidebarItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleItem = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  if (collapsible) {
    return (
      <div>
        <button
          className={cn("sidebar-item w-full justify-between", active && "active")}
          onClick={onClick}
          type="button"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="truncate">{label}</span>
          </div>
          <button onClick={toggleItem} className="p-0.5 rounded-sm hover:bg-accent">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </button>
        <div className={cn(!isOpen && "hidden")}>{children}</div>
      </div>
    )
  }

  return (
    <button onClick={onClick} className={cn("sidebar-item w-full text-left", active && "active")} type="button">
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}

