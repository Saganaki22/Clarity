"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Type,
  ListOrdered,
  List,
  Image,
  Code,
  Table,
  CheckSquare,
  Grip,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block, BlockType } from "@/lib/storage"
import { Button } from "@/components/ui/button"

interface BlockEditorProps {
  blocks: Block[]
  onBlocksChange: (blocks: Block[]) => void
}

export function BlockEditor({ blocks, onBlocksChange }: BlockEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [slashMenuOpen, setSlashMenuOpen] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })

  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const addBlock = (type: BlockType, afterId: string) => {
    const newId = Date.now().toString()
    const newBlock: Block = { id: newId, type, content: "" }

    const updatedBlocks = [...blocks]
    const index = blocks.findIndex((block) => block.id === afterId)

    if (index === -1) {
      updatedBlocks.push(newBlock)
    } else {
      updatedBlocks.splice(index + 1, 0, newBlock)
    }

    onBlocksChange(updatedBlocks)

    // Focus the new block after render
    setTimeout(() => {
      setActiveBlockId(newId)
      blockRefs.current[newId]?.focus()
    }, 0)
  }

  const updateBlockContent = (id: string, content: string) => {
    const updatedBlocks = blocks.map((block) => (block.id === id ? { ...block, content } : block))
    onBlocksChange(updatedBlocks)
  }

  const toggleTodoBlock = (id: string) => {
    const updatedBlocks = blocks.map((block) => (block.id === id ? { ...block, checked: !block.checked } : block))
    onBlocksChange(updatedBlocks)
  }

  const handleKeyDown = (e: React.KeyboardEvent, block: Block, index: number) => {
    // Handle slash command
    if (e.key === "/" && block.content === "") {
      e.preventDefault()
      setSlashMenuOpen(true)

      const rect = e.currentTarget.getBoundingClientRect()
      setSlashMenuPosition({
        top: rect.bottom,
        left: rect.left,
      })
      return
    }

    // Handle Enter key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addBlock("paragraph", block.id)
      return
    }

    // Handle Backspace on empty block
    if (e.key === "Backspace" && block.content === "" && blocks.length > 1) {
      e.preventDefault()

      const updatedBlocks = blocks.filter((b) => b.id !== block.id)
      onBlocksChange(updatedBlocks)

      // Focus previous block
      if (index > 0) {
        const prevBlockId = blocks[index - 1].id
        setActiveBlockId(prevBlockId)
        setTimeout(() => {
          const prevBlockEl = blockRefs.current[prevBlockId]
          if (prevBlockEl) {
            prevBlockEl.focus()
            // Place cursor at the end
            const range = document.createRange()
            const sel = window.getSelection()
            range.selectNodeContents(prevBlockEl)
            range.collapse(false)
            sel?.removeAllRanges()
            sel?.addRange(range)
          }
        }, 0)
      }
    }
  }

  const handleSlashCommand = (type: BlockType) => {
    if (activeBlockId) {
      const updatedBlocks = blocks.map((block) =>
        block.id === activeBlockId ? { ...block, type, content: "" } : block,
      )
      onBlocksChange(updatedBlocks)
      setSlashMenuOpen(false)

      // If it's an image block, trigger file upload
      if (type === "image") {
        setTimeout(() => {
          handleImageUpload(activeBlockId)
        }, 100)
      } else {
        // Focus the block after type change
        setTimeout(() => {
          blockRefs.current[activeBlockId]?.focus()
        }, 0)
      }
    }
  }

  // Add this function after the handleSlashCommand function
  const handleImageUpload = (blockId: string) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const updatedBlocks = blocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  content: event.target.result as string,
                  alignment: "center",
                  width: "auto",
                }
              : block,
          )
          onBlocksChange(updatedBlocks)
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setSlashMenuOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add state for resizing
  const [isResizing, setIsResizing] = useState(false)
  const [resizeBlockId, setResizeBlockId] = useState<string | null>(null)
  const [initialWidth, setInitialWidth] = useState(0)
  const [initialMouseX, setInitialMouseX] = useState(0)

  // Function to update block properties
  const updateBlockProperties = (id: string, properties: Record<string, any>) => {
    const updatedBlocks = blocks.map((block) => (block.id === id ? { ...block, ...properties } : block))
    onBlocksChange(updatedBlocks)
  }

  // Function to delete a block
  const deleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter((block) => block.id !== id)
    onBlocksChange(updatedBlocks)
  }

  // Function to start resizing
  const startResize = (e: React.MouseEvent, blockId: string) => {
    e.preventDefault()

    // Find the block element
    const blockElement = e.currentTarget.closest(".image-container") as HTMLElement
    if (!blockElement) return

    // Set initial values
    setIsResizing(true)
    setResizeBlockId(blockId)
    setInitialWidth(blockElement.offsetWidth)
    setInitialMouseX(e.clientX)

    // Add event listeners for resize
    document.addEventListener("mousemove", handleResize)
    document.addEventListener("mouseup", stopResize)
  }

  // Function to handle resizing
  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !resizeBlockId) return

    const deltaX = e.clientX - initialMouseX
    const newWidth = Math.max(100, initialWidth + deltaX) // Minimum width of 100px

    updateBlockProperties(resizeBlockId, { width: `${newWidth}px` })
  }

  // Function to stop resizing
  const stopResize = () => {
    setIsResizing(false)
    setResizeBlockId(null)

    // Remove event listeners
    document.removeEventListener("mousemove", handleResize)
    document.removeEventListener("mouseup", stopResize)
  }

  // Add cleanup for resize event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResize)
      document.removeEventListener("mouseup", stopResize)
    }
  }, [isResizing])

  // Add state for drag and drop
  const [isDragging, setIsDragging] = useState(false)

  // Add drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  // Simplified file drop handler that just adds the image at the end
  const handleFileDrop = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const newBlock: Block = {
            id: Date.now().toString(),
            type: "image",
            content: event.target.result as string,
            alignment: "center",
            width: "auto",
          }

          // Add the new block at the end
          const updatedBlocks = [...blocks, newBlock]
          onBlocksChange(updatedBlocks)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    // Use the simplified approach
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileDrop(e.dataTransfer.files[0])
    }
  }

  // Add state for dragging images
  const [isDraggingImage, setIsDraggingImage] = useState(false)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  // Function to start dragging an image
  const startDraggingImage = (e: React.MouseEvent, blockId: string, index: number) => {
    // Only start dragging if it's not a resize operation
    if (!isResizing && e.target === e.currentTarget) {
      setIsDraggingImage(true)
      setDraggedBlockId(blockId)
      setDraggedBlockIndex(index)

      // Add event listeners for dragging
      document.addEventListener("mousemove", handleImageDrag)
      document.addEventListener("mouseup", stopDraggingImage)
    }
  }

  // Function to handle image dragging
  const handleImageDrag = (e: MouseEvent) => {
    if (!isDraggingImage || draggedBlockIndex === null) return

    try {
      // Find the block under the cursor
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      if (!elements || elements.length === 0) return

      const blockElement = elements.find((el) => el.classList.contains("block"))

      if (blockElement) {
        const blockId = blockElement.getAttribute("data-block-id")
        if (blockId) {
          const index = blocks.findIndex((block) => block.id === blockId)
          if (index !== -1 && index !== draggedBlockIndex) {
            setDropTargetIndex(index)
          }
        }
      }
    } catch (error) {
      console.error("Error during image drag:", error)
    }
  }

  // Function to stop dragging an image
  const stopDraggingImage = () => {
    try {
      if (isDraggingImage && draggedBlockId && draggedBlockIndex !== null && dropTargetIndex !== null) {
        // Move the block to the new position
        const updatedBlocks = [...blocks]
        const [movedBlock] = updatedBlocks.splice(draggedBlockIndex, 1)
        updatedBlocks.splice(dropTargetIndex, 0, movedBlock)
        onBlocksChange(updatedBlocks)
      }
    } catch (error) {
      console.error("Error stopping image drag:", error)
    }

    // Reset state
    setIsDraggingImage(false)
    setDraggedBlockId(null)
    setDraggedBlockIndex(null)
    setDropTargetIndex(null)

    // Remove event listeners
    document.removeEventListener("mousemove", handleImageDrag)
    document.removeEventListener("mouseup", stopDraggingImage)
  }

  // Add cleanup for drag event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleImageDrag)
      document.removeEventListener("mouseup", stopDraggingImage)
    }
  }, [isDraggingImage])

  return (
    <div
      className={cn("py-6 relative", isDragging && "bg-accent/20")}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)

        // Use the simplified approach
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileDrop(e.dataTransfer.files[0])
        }
      }}
    >
      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="group relative block"
          onFocus={() => setActiveBlockId(block.id)}
          data-block-id={block.id}
        >
          <div className="block-menu">
            <button className="p-1 text-muted-foreground hover:text-foreground">
              <Grip className="h-4 w-4" />
            </button>
            <button
              className="p-1 text-muted-foreground hover:text-foreground"
              onClick={() => addBlock("paragraph", block.id)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {block.type === "paragraph" && (
            <div
              ref={(el) => (blockRefs.current[block.id] = el)}
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
              onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
            />
          )}

          {block.type === "heading1" && (
            <h1
              ref={(el) => (blockRefs.current[block.id] = el)}
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
              onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
            />
          )}

          {block.type === "heading2" && (
            <h2
              ref={(el) => (blockRefs.current[block.id] = el)}
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
              onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
            />
          )}

          {block.type === "heading3" && (
            <h3
              ref={(el) => (blockRefs.current[block.id] = el)}
              contentEditable
              suppressContentEditableWarning
              className="outline-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
              onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
            />
          )}

          {block.type === "bulletList" && (
            <div className="flex">
              <div className="mr-2 mt-1.5">•</div>
              <div
                ref={(el) => (blockRefs.current[block.id] = el)}
                contentEditable
                suppressContentEditableWarning
                className="outline-none flex-1"
                dangerouslySetInnerHTML={{ __html: block.content }}
                onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
                onKeyDown={(e) => handleKeyDown(e, block, index)}
              />
            </div>
          )}

          {block.type === "numberedList" && (
            <div className="flex">
              <div className="mr-2 text-muted-foreground">
                {index - blocks.findIndex((b) => b.type === "numberedList") + 1}.
              </div>
              <div
                ref={(el) => (blockRefs.current[block.id] = el)}
                contentEditable
                suppressContentEditableWarning
                className="outline-none flex-1"
                dangerouslySetInnerHTML={{ __html: block.content }}
                onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
                onKeyDown={(e) => handleKeyDown(e, block, index)}
              />
            </div>
          )}

          {block.type === "todo" && (
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  "flex-shrink-0 mt-1 w-4 h-4 border rounded cursor-pointer flex items-center justify-center",
                  block.checked ? "bg-primary border-primary text-primary-foreground" : "border-input",
                )}
                onClick={() => toggleTodoBlock(block.id)}
              >
                {block.checked && <CheckSquare className="h-3 w-3" />}
              </div>
              <div
                ref={(el) => (blockRefs.current[block.id] = el)}
                contentEditable
                suppressContentEditableWarning
                className={cn("outline-none flex-1", block.checked && "line-through text-muted-foreground")}
                dangerouslySetInnerHTML={{ __html: block.content }}
                onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
                onKeyDown={(e) => handleKeyDown(e, block, index)}
              />
            </div>
          )}

          {block.type === "code" && (
            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <div
                ref={(el) => (blockRefs.current[block.id] = el)}
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
                dangerouslySetInnerHTML={{ __html: block.content || "// Code" }}
                onInput={(e) => updateBlockContent(block.id, e.currentTarget.innerHTML)}
                onKeyDown={(e) => handleKeyDown(e, block, index)}
              />
            </div>
          )}

          {block.type === "image" && (
            <div className="my-4 relative group">
              <div
                className={cn(
                  "image-container relative",
                  block.alignment === "left"
                    ? "float-left mr-4"
                    : block.alignment === "right"
                      ? "float-right ml-4"
                      : "mx-auto",
                )}
                style={{
                  width: block.width || "auto",
                  maxWidth: "100%",
                  transform: `rotate(${block.rotation || 0}deg)`,
                }}
              >
                {/* Add drag handle */}
                <div
                  className="absolute top-2 left-2 p-1 bg-background/80 backdrop-blur-sm rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                  onMouseDown={(e) => startDraggingImage(e, block.id, index)}
                >
                  <Grip className="h-4 w-4" />
                </div>

                <img
                  src={block.content || "/placeholder.svg?height=200&width=400"}
                  alt="Image"
                  className="max-w-full rounded-md"
                  style={{ width: "100%" }}
                />

                {/* Image controls that appear on hover */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md shadow-sm flex p-1">
                  {/* Alignment controls */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateBlockProperties(block.id, { alignment: "left" })}
                    title="Align left"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateBlockProperties(block.id, { alignment: "center" })}
                    title="Align center"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateBlockProperties(block.id, { alignment: "right" })}
                    title="Align right"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>

                  {/* Rotation controls */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateBlockProperties(block.id, { rotation: (block.rotation || 0) - 90 })}
                    title="Rotate left"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateBlockProperties(block.id, { rotation: (block.rotation || 0) + 90 })}
                    title="Rotate right"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>

                  {/* Delete control */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteBlock(block.id)}
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Resize handles */}
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-primary cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => startResize(e, block.id)}
                />
              </div>

              <div
                ref={(el) => (blockRefs.current[block.id] = el)}
                contentEditable
                suppressContentEditableWarning
                className="mt-2 text-sm text-muted-foreground text-center italic outline-none"
                dangerouslySetInnerHTML={{ __html: block.caption || "Click to add a caption" }}
                onInput={(e) => updateBlockProperties(block.id, { caption: e.currentTarget.innerHTML })}
                onKeyDown={(e) => handleKeyDown(e, block, index)}
              />
            </div>
          )}
        </div>
      ))}

      {slashMenuOpen && (
        <div
          className="slash-menu"
          style={{
            top: `${slashMenuPosition.top}px`,
            left: `${slashMenuPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="slash-menu-item" onClick={() => handleSlashCommand("paragraph")}>
            <Type className="h-4 w-4" />
            <span>Text</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("heading1")}>
            <Type className="h-4 w-4" />
            <span>Heading 1</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("heading2")}>
            <Type className="h-4 w-4" />
            <span>Heading 2</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("heading3")}>
            <Type className="h-4 w-4" />
            <span>Heading 3</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("bulletList")}>
            <List className="h-4 w-4" />
            <span>Bullet List</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("numberedList")}>
            <ListOrdered className="h-4 w-4" />
            <span>Numbered List</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("todo")}>
            <CheckSquare className="h-4 w-4" />
            <span>To-do List</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("code")}>
            <Code className="h-4 w-4" />
            <span>Code</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("image")}>
            <Image className="h-4 w-4" />
            <span>Image</span>
          </div>
          <div className="slash-menu-item" onClick={() => handleSlashCommand("table")}>
            <Table className="h-4 w-4" />
            <span>Table</span>
          </div>
        </div>
      )}
    </div>
  )
}

