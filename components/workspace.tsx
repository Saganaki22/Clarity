"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Header } from "@/components/header/header"
import { Content } from "@/components/content/content"
import { useMobile } from "@/hooks/use-mobile"
import { getCurrentPageId, getSidebarState, setSidebarState, getPages, type Page, getFromStorage } from "@/lib/storage"
import { SettingsModal } from "@/components/modals/settings-modal"
import { ProfileModal } from "@/components/modals/profile-modal"

export function Workspace() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPageId, setCurrentPageId] = useState<string>("")
  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const isMobile = useMobile()

  // Add a state for profile data
  const [profileData, setProfileData] = useState<any>(null)

  // Initialize state from local storage
  useEffect(() => {
    const sidebarState = getSidebarState()
    setSidebarCollapsed(sidebarState.collapsed)
    setSidebarOpen(sidebarState.open)

    const pageId = getCurrentPageId()
    setCurrentPageId(pageId)

    const allPages = getPages()
    setPages(allPages)

    const page = allPages.find((p) => p.id === pageId) || null
    setCurrentPage(page)

    // Apply saved font size
    const settings = getFromStorage("clarity_settings", {
      appearance: { fontSize: 16 },
    })

    if (settings.appearance && settings.appearance.fontSize) {
      document.documentElement.style.setProperty("--base-font-size", `${settings.appearance.fontSize}px`)
      document.body.style.fontSize = `${settings.appearance.fontSize}px`
    }

    setIsLoading(false)
  }, [])

  // Save sidebar state to local storage when it changes
  useEffect(() => {
    if (!isLoading) {
      setSidebarState({ collapsed: sidebarCollapsed, open: sidebarOpen })
    }
  }, [sidebarCollapsed, sidebarOpen, isLoading])

  useEffect(() => {
    // Load profile data
    const PROFILE_STORAGE_KEY = "clarity_profile"
    const defaultProfile = {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "",
      bio: "I'm a knowledge worker who loves organizing information.",
    }

    const profile = getFromStorage(PROFILE_STORAGE_KEY, defaultProfile)
    setProfileData(profile)
  }, [])

  // Add a function to refresh profile data
  const refreshProfileData = () => {
    const PROFILE_STORAGE_KEY = "clarity_profile"
    const defaultProfile = {
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "",
      bio: "I'm a knowledge worker who loves organizing information.",
    }

    const profile = getFromStorage(PROFILE_STORAGE_KEY, defaultProfile)
    setProfileData(profile)
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const handlePageChange = (pageId: string) => {
    setCurrentPageId(pageId)
    const page = pages.find((p) => p.id === pageId) || null
    setCurrentPage(page)
  }

  const refreshPages = () => {
    const allPages = getPages()
    setPages(allPages)

    // Refresh current page data
    const page = allPages.find((p) => p.id === currentPageId) || null
    setCurrentPage(page)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sidebarCollapsed}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pages={pages}
          currentPageId={currentPageId}
          onPageChange={handlePageChange}
          onPagesChange={refreshPages}
          onSettingsClick={() => setShowSettingsModal(true)}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            isMobile={isMobile}
            currentPage={currentPage}
            onPageChange={refreshPages}
            onProfileClick={() => setShowProfileModal(true)}
            onSettingsClick={() => setShowSettingsModal(true)}
            profileData={profileData}
          />
          <Content currentPage={currentPage} onPageChange={refreshPages} />
        </div>
      </div>

      {/* Modals */}
      <ProfileModal open={showProfileModal} onOpenChange={setShowProfileModal} onProfileUpdate={refreshProfileData} />
      <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
    </>
  )
}

