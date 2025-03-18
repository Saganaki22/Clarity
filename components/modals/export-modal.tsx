"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Page } from "@/lib/storage"
import { Download } from "lucide-react"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page | null
}

export function ExportModal({ open, onOpenChange, page }: ExportModalProps) {
  const [format, setFormat] = useState("markdown")
  const [includeSubpages, setIncludeSubpages] = useState(false)

  const handleExport = () => {
    if (!page) return

    // In a real app, this would generate the export file
    // For now, we'll just show what would be exported

    let content = ""

    if (format === "markdown") {
      content = `# ${page.title}\n\n`
      page.content.forEach((block) => {
        switch (block.type) {
          case "heading1":
            content += `# ${block.content}\n\n`
            break
          case "heading2":
            content += `## ${block.content}\n\n`
            break
          case "heading3":
            content += `### ${block.content}\n\n`
            break
          case "paragraph":
            content += `${block.content}\n\n`
            break
          case "bulletList":
            content += `* ${block.content}\n`
            break
          case "numberedList":
            content += `1. ${block.content}\n`
            break
          case "todo":
            content += `- [${block.checked ? "x" : " "}] ${block.content}\n`
            break
          default:
            content += `${block.content}\n\n`
        }
      })
    } else if (format === "html") {
      content = `<h1>${page.title}</h1>\n`
      page.content.forEach((block) => {
        switch (block.type) {
          case "heading1":
            content += `<h1>${block.content}</h1>\n`
            break
          case "heading2":
            content += `<h2>${block.content}</h2>\n`
            break
          case "heading3":
            content += `<h3>${block.content}</h3>\n`
            break
          case "paragraph":
            content += `<p>${block.content}</p>\n`
            break
          case "bulletList":
            content += `<ul>\n  <li>${block.content}</li>\n</ul>\n`
            break
          case "numberedList":
            content += `<ol>\n  <li>${block.content}</li>\n</ol>\n`
            break
          case "todo":
            content += `<div>\n  <input type="checkbox" ${block.checked ? "checked" : ""} /> ${block.content}\n</div>\n`
            break
          default:
            content += `<div>${block.content}</div>\n`
        }
      })
    } else if (format === "json") {
      content = JSON.stringify(page, null, 2)
    }

    // Create a blob and download it
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${page.title}.${format === "json" ? "json" : format === "html" ? "html" : "md"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onOpenChange(false)
  }

  if (!page) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export "{page.title}"</DialogTitle>
          <DialogDescription>Choose export format and options</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown" className="cursor-pointer">
                  Markdown
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="html" />
                <Label htmlFor="html" className="cursor-pointer">
                  HTML
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer">
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-subpages"
              checked={includeSubpages}
              onCheckedChange={(checked) => setIncludeSubpages(checked as boolean)}
            />
            <Label htmlFor="include-subpages" className="cursor-pointer">
              Include subpages
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

