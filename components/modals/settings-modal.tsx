"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { getFromStorage, setToStorage } from "@/lib/storage"

interface SettingsData {
  appearance: {
    fontSize: number
    reducedMotion: boolean
    reducedBorder: boolean
    highContrast: boolean
  }
  notifications: {
    emailDigest: boolean
    mentions: boolean
    comments: boolean
    updates: boolean
  }
  privacy: {
    shareUsageData: boolean
    allowCookies: boolean
  }
}

const SETTINGS_STORAGE_KEY = "clarity_settings"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const defaultSettings: SettingsData = {
    appearance: {
      fontSize: 16,
      reducedMotion: false,
      reducedBorder: false,
      highContrast: false,
    },
    notifications: {
      emailDigest: true,
      mentions: true,
      comments: true,
      updates: true,
    },
    privacy: {
      shareUsageData: true,
      allowCookies: true,
    },
  }

  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const savedSettings = getFromStorage(SETTINGS_STORAGE_KEY, defaultSettings)
    setSettings(savedSettings)

    // Apply font size from saved settings
    applyFontSize(savedSettings.appearance.fontSize)
  }, [open])

  // Apply font size to the document
  const applyFontSize = (size: number) => {
    document.documentElement.style.setProperty("--base-font-size", `${size}px`)
    document.body.style.fontSize = `${size}px`
  }

  const handleSave = () => {
    setToStorage(SETTINGS_STORAGE_KEY, settings)
    setHasChanges(false)
    onOpenChange(false)
  }

  const updateAppearance = (key: keyof SettingsData["appearance"], value: any) => {
    const updatedSettings = {
      ...settings,
      appearance: {
        ...settings.appearance,
        [key]: value,
      },
    }

    setSettings(updatedSettings)
    setHasChanges(true)

    // Apply font size change immediately
    if (key === "fontSize") {
      applyFontSize(value)
    }

    // Apply other appearance settings immediately
    if (key === "reducedMotion") {
      document.documentElement.classList.toggle("reduce-motion", value)
    }

    if (key === "reducedBorder") {
      document.documentElement.classList.toggle("reduce-border", value)
    }

    if (key === "highContrast") {
      document.documentElement.classList.toggle("high-contrast", value)
    }
  }

  const updateNotifications = (key: keyof SettingsData["notifications"], value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    })
    setHasChanges(true)
  }

  const updatePrivacy = (key: keyof SettingsData["privacy"], value: boolean) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    })
    setHasChanges(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your application settings</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label>Font Size ({settings.appearance.fontSize}px)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">Small</span>
                  <Slider
                    value={[settings.appearance.fontSize]}
                    min={12}
                    max={20}
                    step={1}
                    onValueChange={(value) => updateAppearance("fontSize", value[0])}
                    className="flex-1"
                  />
                  <span className="text-sm">Large</span>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reduced-motion" className="flex-grow">
                  Reduced Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.appearance.reducedMotion}
                  onCheckedChange={(checked) => updateAppearance("reducedMotion", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="reduced-border" className="flex-grow">
                  Reduced Borders
                </Label>
                <Switch
                  id="reduced-border"
                  checked={settings.appearance.reducedBorder}
                  onCheckedChange={(checked) => updateAppearance("reducedBorder", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="high-contrast" className="flex-grow">
                  High Contrast
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.appearance.highContrast}
                  onCheckedChange={(checked) => updateAppearance("highContrast", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-digest" className="flex-grow">
                  Email Digest
                </Label>
                <Switch
                  id="email-digest"
                  checked={settings.notifications.emailDigest}
                  onCheckedChange={(checked) => updateNotifications("emailDigest", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mentions" className="flex-grow">
                  Mentions
                </Label>
                <Switch
                  id="mentions"
                  checked={settings.notifications.mentions}
                  onCheckedChange={(checked) => updateNotifications("mentions", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="comments" className="flex-grow">
                  Comments
                </Label>
                <Switch
                  id="comments"
                  checked={settings.notifications.comments}
                  onCheckedChange={(checked) => updateNotifications("comments", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="updates" className="flex-grow">
                  Product Updates
                </Label>
                <Switch
                  id="updates"
                  checked={settings.notifications.updates}
                  onCheckedChange={(checked) => updateNotifications("updates", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex-grow">
                  <Label htmlFor="share-usage" className="block">
                    Share Usage Data
                  </Label>
                  <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data</p>
                </div>
                <Switch
                  id="share-usage"
                  checked={settings.privacy.shareUsageData}
                  onCheckedChange={(checked) => updatePrivacy("shareUsageData", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-grow">
                  <Label htmlFor="allow-cookies" className="block">
                    Allow Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">Enable cookies for a better experience</p>
                </div>
                <Switch
                  id="allow-cookies"
                  checked={settings.privacy.allowCookies}
                  onCheckedChange={(checked) => updatePrivacy("allowCookies", checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

