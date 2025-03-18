"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { setTheme as saveTheme, getTheme } from "@/lib/storage"

interface ThemeToggleProps {
  collapsed?: boolean
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("light")

  // Initialize theme from local storage
  useEffect(() => {
    const savedTheme = getTheme() || "light"
    setCurrentTheme(savedTheme)
    setTheme(savedTheme)
    setMounted(true)

    // Add a class to the document for immediate visual feedback
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [setTheme])

  // Only show the theme toggle after mounting to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    console.log("Toggling theme to:", newTheme)

    // Update state
    setCurrentTheme(newTheme)

    // Update theme in next-themes
    setTheme(newTheme)

    // Save to local storage
    saveTheme(newTheme)

    // Add/remove class for immediate visual feedback
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (collapsed) {
    return (
      <Button variant="ghost" size="icon" className="rounded-md" onClick={toggleTheme} type="button">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleTheme} type="button">
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 ml-2" />
      <span>Toggle Theme</span>
    </Button>
  )
}

