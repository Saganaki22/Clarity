"use client"

// Types for our data model
export interface Page {
  id: string
  title: string
  icon?: string
  coverImage?: string
  content: Block[]
  parentId?: string
  createdAt: string
  updatedAt: string
}

export interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
  // Image properties
  alignment?: "left" | "center" | "right"
  width?: string
  rotation?: number
  caption?: string
}

export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "code"
  | "image"
  | "table"
  | "todo"

// Initial data
const initialPages: Page[] = [
  {
    id: "home",
    title: "Home",
    icon: "🏠",
    content: [
      { id: "1", type: "heading1", content: "Welcome to Clarity" },
      { id: "2", type: "paragraph", content: "Your minimal, focused workspace for notes and knowledge management." },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    content: [
      { id: "1", type: "heading1", content: "Getting Started with Clarity" },
      {
        id: "2",
        type: "paragraph",
        content: "Welcome to Clarity! This guide will help you get started with the basics.",
      },
      { id: "3", type: "heading2", content: "Creating Pages" },
      { id: "4", type: "paragraph", content: "Click the '+ New Page' button in the sidebar to create a new page." },
      { id: "5", type: "heading2", content: "Using Blocks" },
      {
        id: "6",
        type: "paragraph",
        content: "Clarity uses a block-based editor. Type '/' to see available block types.",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "project-management",
    title: "Project Management",
    icon: "📊",
    coverImage: "/placeholder.svg?height=160&width=900",
    content: [
      { id: "1", type: "heading1", content: "Getting Started with Project Management" },
      {
        id: "2",
        type: "paragraph",
        content:
          "Effective project management is crucial for delivering successful outcomes. Here's how to get started:",
      },
      { id: "3", type: "heading2", content: "Define Your Project Scope" },
      {
        id: "4",
        type: "paragraph",
        content:
          "A clear project scope helps you understand what needs to be accomplished and sets boundaries for your work.",
      },
      { id: "5", type: "bulletList", content: "Identify project goals and objectives" },
      { id: "6", type: "bulletList", content: "Define deliverables and success criteria" },
      { id: "7", type: "bulletList", content: "Establish project constraints (time, budget, resources)" },
      { id: "8", type: "heading2", content: "Create a Project Plan" },
      {
        id: "9",
        type: "paragraph",
        content: "A detailed project plan serves as a roadmap for your project execution.",
      },
      { id: "10", type: "todo", content: "Break down the project into manageable tasks", checked: true },
      { id: "11", type: "todo", content: "Estimate time and resources for each task", checked: true },
      { id: "12", type: "todo", content: "Identify dependencies between tasks", checked: false },
      { id: "13", type: "todo", content: "Assign responsibilities to team members", checked: false },
      { id: "14", type: "heading2", content: "Monitor and Control" },
      {
        id: "15",
        type: "paragraph",
        content: "Regular monitoring helps you stay on track and make adjustments as needed.",
      },
      { id: "16", type: "numberedList", content: "Track progress against the plan" },
      { id: "17", type: "numberedList", content: "Identify and address issues promptly" },
      { id: "18", type: "numberedList", content: "Communicate status to stakeholders" },
      { id: "19", type: "numberedList", content: "Adjust the plan as necessary" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Storage keys
const PAGES_STORAGE_KEY = "clarity_pages"
const CURRENT_PAGE_KEY = "clarity_current_page"
const SIDEBAR_STATE_KEY = "clarity_sidebar_state"
const THEME_KEY = "clarity_theme"

// Helper functions for local storage
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error)
    return defaultValue
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error)
  }
}

// Page management functions
export function getPages(): Page[] {
  return getFromStorage<Page[]>(PAGES_STORAGE_KEY, initialPages)
}

export function savePage(page: Page): void {
  const pages = getPages()
  const existingPageIndex = pages.findIndex((p) => p.id === page.id)

  if (existingPageIndex >= 0) {
    // Update existing page
    pages[existingPageIndex] = {
      ...page,
      updatedAt: new Date().toISOString(),
    }
  } else {
    // Add new page
    pages.push({
      ...page,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  setToStorage(PAGES_STORAGE_KEY, pages)
}

export function deletePage(pageId: string): void {
  const pages = getPages()
  const filteredPages = pages.filter((page) => page.id !== pageId)
  setToStorage(PAGES_STORAGE_KEY, filteredPages)

  // If current page is deleted, set current page to home
  const currentPageId = getCurrentPageId()
  if (currentPageId === pageId) {
    setCurrentPageId("home")
  }
}

export function getCurrentPageId(): string {
  return getFromStorage<string>(CURRENT_PAGE_KEY, "project-management")
}

export function setCurrentPageId(pageId: string): void {
  setToStorage(CURRENT_PAGE_KEY, pageId)
}

export function getSidebarState(): { collapsed: boolean; open: boolean } {
  return getFromStorage<{ collapsed: boolean; open: boolean }>(SIDEBAR_STATE_KEY, { collapsed: false, open: false })
}

export function setSidebarState(state: { collapsed: boolean; open: boolean }): void {
  setToStorage(SIDEBAR_STATE_KEY, state)
}

// Theme storage
export const getTheme = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("theme") || "light"
}

export const setTheme = (theme: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("theme", theme)

  // Apply theme class to document for immediate effect
  if (theme === "dark") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

