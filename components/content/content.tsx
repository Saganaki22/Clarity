"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/content/page-header"
import { BlockEditor } from "@/components/content/block-editor"
import { DatabaseView } from "@/components/content/database-view"
import { type Page, savePage } from "@/lib/storage"

interface ContentProps {
  currentPage: Page | null
  onPageChange: () => void
}

export function Content({ currentPage, onPageChange }: ContentProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "database">("editor")

  // Reset to editor tab when page changes
  useEffect(() => {
    setActiveTab("editor")
  }, [currentPage?.id])

  const handleTabChange = (tab: "editor" | "database") => {
    setActiveTab(tab)
  }

  const handleContentChange = (updatedContent: any[]) => {
    if (!currentPage) return

    const updatedPage = {
      ...currentPage,
      content: updatedContent,
      updatedAt: new Date().toISOString(),
    }

    savePage(updatedPage)
    onPageChange()
  }

  if (!currentPage) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-content mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Select a page from the sidebar</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-content mx-auto px-4 md:px-8 py-6">
        <PageHeader page={currentPage} onPageChange={onPageChange} />

        <div className="mt-6 flex gap-2 border-b">
          <button
            className={`px-3 py-2 text-sm font-medium ${activeTab === "editor" ? "border-b-2 border-primary" : "text-muted-foreground"}`}
            onClick={() => handleTabChange("editor")}
          >
            Document
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium ${activeTab === "database" ? "border-b-2 border-primary" : "text-muted-foreground"}`}
            onClick={() => handleTabChange("database")}
          >
            Tasks
          </button>
        </div>

        {activeTab === "editor" ? (
          <BlockEditor blocks={currentPage.content} onBlocksChange={handleContentChange} />
        ) : (
          <DatabaseView />
        )}
      </div>
    </main>
  )
}

