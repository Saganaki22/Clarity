"use client"

import { useState, useEffect } from "react"
import {
  Menu,
  ChevronRight,
  MoreHorizontal,
  Star,
  Share2,
  Copy,
  Clock,
  Users,
  Bell,
  Trash2,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type Page, savePage, deletePage, setCurrentPageId } from "@/lib/storage"

interface HeaderProps {
  toggleSidebar: () => void
  sidebarCollapsed: boolean
  isMobile: boolean
  currentPage: Page | null
  onPageChange: () => void
  onProfileClick: () => void
  onSettingsClick: () => void
  profileData?: any
}

export function Header({
  toggleSidebar,
  sidebarCollapsed,
  isMobile,
  currentPage,
  onPageChange,
  onProfileClick,
  onSettingsClick,
  profileData,
}: HeaderProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  // Check if page is favorited
  useEffect(() => {
    if (currentPage) {
      const favoritesFromStorage = localStorage.getItem("clarity_favorites")
        ? JSON.parse(localStorage.getItem("clarity_favorites") || "[]")
        : []
      setIsFavorite(favoritesFromStorage.includes(currentPage.id))
    }
  }, [currentPage])

  const toggleFavorite = () => {
    if (!currentPage) return

    // Get current favorites
    const favoritesFromStorage = localStorage.getItem("clarity_favorites")
      ? JSON.parse(localStorage.getItem("clarity_favorites") || "[]")
      : []

    let newFavorites

    // If already favorited, remove it
    if (favoritesFromStorage.includes(currentPage.id)) {
      newFavorites = favoritesFromStorage.filter((id: string) => id !== currentPage.id)
      setIsFavorite(false)
    } else {
      // Otherwise add it
      newFavorites = [...favoritesFromStorage, currentPage.id]
      setIsFavorite(true)
    }

    // Save to localStorage
    localStorage.setItem("clarity_favorites", JSON.stringify(newFavorites))

    // Refresh sidebar
    onPageChange()
  }

  return (
    <header className="border-b h-14 shrink-0 flex items-center px-4 sticky top-0 bg-background z-10">
      <div className="flex items-center gap-2 overflow-hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="flex-shrink-0">
          <Menu className="h-5 w-5" />
        </Button>

        {currentPage && (
          <Breadcrumb className="overflow-hidden">
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink href="#">Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex">
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="overflow-hidden">
                <BreadcrumbLink className="font-medium truncate block max-w-[150px] sm:max-w-none">
                  {currentPage.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleFavorite}>
          <Star className={`h-5 w-5 ${isFavorite ? "fill-warning text-warning" : ""}`} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Share with team
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Clock className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View history</DropdownMenuItem>
            <DropdownMenuItem>Restore previous version</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {profileData?.avatar ? (
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                ) : (
                  <AvatarFallback>
                    {profileData?.name
                      ? profileData.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                      : "JD"}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={onSettingsClick}>Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                if (currentPage) {
                  const duplicatedPage = {
                    ...currentPage,
                    id: Date.now().toString(),
                    title: `${currentPage.title} (Copy)`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }

                  savePage(duplicatedPage)
                  onPageChange()
                  alert("Page duplicated successfully!")
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>Move</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (currentPage && currentPage.id !== "home") {
                  if (confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
                    deletePage(currentPage.id)
                    setCurrentPageId("home")
                    onPageChange()
                  }
                } else {
                  alert("You cannot delete the home page.")
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

