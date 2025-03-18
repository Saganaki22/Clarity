"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarSection({ title, children, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const toggleSection = () => {
    console.log("Toggling section:", title, "from", isOpen, "to", !isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <div className="mb-4">
      <button
        className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground py-1 px-2 rounded-md transition-colors"
        onClick={toggleSection}
        type="button"
      >
        {title}
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      <div className={cn("mt-1 space-y-1", !isOpen && "hidden")}>{children}</div>
    </div>
  )
}

