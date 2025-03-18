"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Image, Camera, ImagePlus, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Page, savePage } from "@/lib/storage"
import { EmojiPicker } from "@/components/emoji-picker"
import { Input } from "@/components/ui/input"
import { Pencil, Check, X } from "lucide-react"

interface PageHeaderProps {
  page: Page
  onPageChange: () => void
}

export function PageHeader({ page, onPageChange }: PageHeaderProps) {
  const [showCoverOptions, setShowCoverOptions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(page.title)

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const updatedPage = {
          ...page,
          coverImage: event.target.result as string,
          updatedAt: new Date().toISOString(),
        }
        savePage(updatedPage)
        onPageChange()
      }
    }
    reader.readAsDataURL(file)
  }

  const handleEmojiSelect = (emoji: string) => {
    const updatedPage = {
      ...page,
      icon: emoji,
      updatedAt: new Date().toISOString(),
    }
    savePage(updatedPage)
    onPageChange()
    setShowEmojiPicker(false)
  }

  const handleSaveTitle = () => {
    if (title.trim()) {
      const updatedPage = {
        ...page,
        title,
        updatedAt: new Date().toISOString(),
      }
      savePage(updatedPage)
      onPageChange()
      setIsEditingTitle(false)
    }
  }

  const handleCancelEdit = () => {
    setTitle(page.title)
    setIsEditingTitle(false)
  }

  const handleRemoveCover = () => {
    const updatedPage = {
      ...page,
      coverImage: undefined,
      updatedAt: new Date().toISOString(),
    }
    savePage(updatedPage)
    onPageChange()
  }

  const takeCameraPhoto = () => {
    // Create a video element
    const video = document.createElement("video")
    const canvas = document.createElement("canvas")

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream
        video.play()

        // Create a modal to show the camera feed
        const modal = document.createElement("div")
        modal.style.position = "fixed"
        modal.style.top = "0"
        modal.style.left = "0"
        modal.style.width = "100%"
        modal.style.height = "100%"
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
        modal.style.zIndex = "9999"
        modal.style.display = "flex"
        modal.style.flexDirection = "column"
        modal.style.alignItems = "center"
        modal.style.justifyContent = "center"

        // Add video to modal
        video.style.maxWidth = "90%"
        video.style.maxHeight = "70%"
        modal.appendChild(video)

        // Add capture button
        const captureBtn = document.createElement("button")
        captureBtn.textContent = "Capture"
        captureBtn.style.marginTop = "20px"
        captureBtn.style.padding = "10px 20px"
        captureBtn.style.backgroundColor = "var(--primary)"
        captureBtn.style.color = "white"
        captureBtn.style.border = "none"
        captureBtn.style.borderRadius = "4px"
        captureBtn.style.cursor = "pointer"

        captureBtn.onclick = () => {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw video frame to canvas
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Convert to data URL
          const imageDataUrl = canvas.toDataURL("image/jpeg")

          // Update page with new cover image
          const updatedPage = {
            ...page,
            coverImage: imageDataUrl,
            updatedAt: new Date().toISOString(),
          }
          savePage(updatedPage)
          onPageChange()

          // Clean up
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
          document.body.removeChild(modal)
        }

        // Add cancel button
        const cancelBtn = document.createElement("button")
        cancelBtn.textContent = "Cancel"
        cancelBtn.style.marginTop = "10px"
        cancelBtn.style.padding = "10px 20px"
        cancelBtn.style.backgroundColor = "transparent"
        cancelBtn.style.color = "white"
        cancelBtn.style.border = "1px solid white"
        cancelBtn.style.borderRadius = "4px"
        cancelBtn.style.cursor = "pointer"

        cancelBtn.onclick = () => {
          // Clean up
          const tracks = stream.getTracks()
          tracks.forEach((track) => track.stop())
          document.body.removeChild(modal)
        }

        // Add buttons to modal
        const buttonContainer = document.createElement("div")
        buttonContainer.style.display = "flex"
        buttonContainer.style.gap = "10px"
        buttonContainer.appendChild(captureBtn)
        buttonContainer.appendChild(cancelBtn)
        modal.appendChild(buttonContainer)

        // Add modal to body
        document.body.appendChild(modal)
      })
      .catch((err) => {
        console.error("Error accessing camera:", err)
        alert("Could not access camera. Please check permissions.")
      })
  }

  return (
    <div className="relative mb-8">
      {page.coverImage ? (
        <div
          className="relative h-40 w-full rounded-lg overflow-hidden mb-6"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img src={page.coverImage || "/placeholder.svg"} alt={page.title} className="w-full h-full object-cover" />

          {isHovering && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm"
                onClick={() => setShowCoverOptions(!showCoverOptions)}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Change Cover
              </Button>
            </div>
          )}

          {showCoverOptions && (
            <div className="absolute bottom-16 right-4 p-3 rounded-md bg-background border shadow-md flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <Button size="sm" variant="outline" className="justify-start" onClick={takeCameraPhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button size="sm" variant="outline" className="justify-start" onClick={handleRemoveCover}>
                <X className="h-4 w-4 mr-2" />
                Remove Cover
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleCoverImageUpload}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Add Cover
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleCoverImageUpload}
            />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            className="text-3xl cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            {page.icon || <Smile className="h-8 w-8 text-muted-foreground" />}
          </button>

          {showEmojiPicker && (
            <div className="absolute z-50 top-full left-0 mt-1">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}
        </div>

        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold h-auto py-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTitle()
                } else if (e.key === "Escape") {
                  handleCancelEdit()
                }
              }}
            />
            <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center group">
            <h1 className="text-3xl font-bold">{page.title}</h1>
            <Button
              size="icon"
              variant="ghost"
              className="ml-2 opacity-0 group-hover:opacity-100 h-7 w-7"
              onClick={() => setIsEditingTitle(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm">Last updated: {new Date(page.updatedAt).toLocaleString()}</p>
    </div>
  )
}

