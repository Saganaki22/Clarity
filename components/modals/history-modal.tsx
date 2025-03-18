"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { Page } from "@/lib/storage"
import { formatDistanceToNow } from "date-fns"

interface HistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page | null
}

interface VersionHistory {
  id: string
  timestamp: string
  author: string
  changes: string
}

export function HistoryModal({ open, onOpenChange, page }: HistoryModalProps) {
  // In a real app, this would come from a database
  // For now, we'll generate some fake history based on the page
  const generateFakeHistory = (page: Page | null): VersionHistory[] => {
    if (!page) return []

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    return [
      {
        id: "v4",
        timestamp: now.toISOString(),
        author: "You",
        changes: "Updated content",
      },
      {
        id: "v3",
        timestamp: oneHourAgo.toISOString(),
        author: "You",
        changes: "Added new section",
      },
      {
        id: "v2",
        timestamp: oneDayAgo.toISOString(),
        author: "You",
        changes: "Changed title",
      },
      {
        id: "v1",
        timestamp: threeDaysAgo.toISOString(),
        author: "You",
        changes: "Created page",
      },
    ]
  }

  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const versions = generateFakeHistory(page)

  const handleRestore = () => {
    if (!selectedVersion) return

    // In a real app, this would restore the selected version
    alert(`Restored version ${selectedVersion}`)
    onOpenChange(false)
  }

  if (!page) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>View and restore previous versions of this page.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`flex items-start justify-between p-3 rounded-md cursor-pointer ${
                    selectedVersion === version.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  <div>
                    <div className="font-medium">{version.changes}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })} by {version.author}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{version.id}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRestore} disabled={!selectedVersion}>
            Restore This Version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

