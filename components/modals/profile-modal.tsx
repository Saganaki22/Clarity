"use client"

import { DialogFooter } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"
import { getFromStorage, setToStorage } from "@/lib/storage"

interface ProfileData {
  name: string
  email: string
  avatar: string
  bio: string
}

const PROFILE_STORAGE_KEY = "clarity_profile"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileUpdate?: () => void
}

export function ProfileModal({ open, onOpenChange, onProfileUpdate }: ProfileModalProps) {
  const defaultProfile: ProfileData = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "",
    bio: "I'm a knowledge worker who loves organizing information.",
  }

  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Load profile data when modal opens
  useEffect(() => {
    if (open) {
      const savedProfile = getFromStorage(PROFILE_STORAGE_KEY, defaultProfile)
      setProfile(savedProfile)
      setIsEditing(false)
    }
  }, [open])

  const handleSave = () => {
    setToStorage(PROFILE_STORAGE_KEY, profile)
    setIsEditing(false)

    // Call onProfileUpdate if provided
    if (onProfileUpdate) {
      onProfileUpdate()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAvatar = event.target.result as string
        setProfile({ ...profile, avatar: newAvatar })

        // Save the profile and update
        setToStorage(PROFILE_STORAGE_KEY, { ...profile, avatar: newAvatar })
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setShowCamera(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageDataUrl = canvas.toDataURL("image/png")
        setProfile({ ...profile, avatar: imageDataUrl })
        stopCamera()

        // Save the profile and update
        setToStorage(PROFILE_STORAGE_KEY, { ...profile, avatar: imageDataUrl })
        if (onProfileUpdate) {
          onProfileUpdate()
        }
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const handleClose = () => {
    stopCamera()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>View and edit your profile information.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.name} />
              ) : (
                <AvatarFallback className="text-2xl">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              )}
            </Avatar>

            {isEditing && (
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">Upload avatar</span>
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={startCamera}>
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Take photo</span>
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            )}
          </div>

          {showCamera && (
            <div className="relative w-full">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-md border" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="mt-2 flex justify-center gap-2">
                <Button onClick={capturePhoto}>Capture</Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid w-full gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!isEditing}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

