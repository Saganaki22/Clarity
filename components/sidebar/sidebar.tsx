"use client"

import { useEffect, useRef, useState } from "react"
import { Home, Search, Settings, FileText, Star, Clock, Plus, X, MoreHorizontal, Trash2, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { SidebarSection } from "@/components/sidebar/sidebar-section"
import { SidebarItem } from "@/components/sidebar/sidebar-item"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { type Page, savePage, deletePage, setCurrentPageId } from "@/lib/storage"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SidebarProps {
  collapsed: boolean
  open: boolean
  onClose: () => void
  pages: Page[]
  currentPageId: string
  onPageChange: (pageId: string) => void
  onPagesChange: () => void
  onSettingsClick: () => void
}

interface NewPageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onTitleChange: (title: string) => void
  onSubmit: () => void
}

export function Sidebar({
  collapsed,
  open,
  onClose,
  pages,
  currentPageId,
  onPageChange,
  onPagesChange,
  onSettingsClick,
}: SidebarProps) {
  const isMobile = useMobile()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [newPageDialogOpen, setNewPageDialogOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState("")
  const [favorites, setFavorites] = useState<Page[]>([])
  const [recentPages, setRecentPages] = useState<Page[]>([])
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchResults, setSearchResults] = useState<Page[]>([])

  // Filter pages for different sections
  useEffect(() => {
    // Get favorites from localStorage or create an empty array
    const favoritesFromStorage = localStorage.getItem("clarity_favorites")
      ? JSON.parse(localStorage.getItem("clarity_favorites") || "[]")
      : []

    // Filter pages that are in favorites
    setFavorites(pages.filter((page) => favoritesFromStorage.includes(page.id)))

    // Sort by updatedAt for recent pages
    setRecentPages(
      [...pages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    )
  }, [pages])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && open && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobile, open, onClose])

  // Prevent scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobile, open])

  const handleCreateNewPage = () => {
    if (!newPageTitle.trim()) return

    const newPage: Page = {
      id: Date.now().toString(),
      title: newPageTitle,
      icon: "📄",
      content: [
        { id: "1", type: "heading1", content: newPageTitle },
        { id: "2", type: "paragraph", content: "" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    savePage(newPage)
    setNewPageDialogOpen(false)
    setNewPageTitle("")
    onPagesChange()

    // Navigate to the new page
    setCurrentPageId(newPage.id)
    onPageChange(newPage.id)
  }

  const handleDeletePage = (pageId: string) => {
    // Don't allow deletion of home page
    if (pageId === "home") {
      alert("You cannot delete the home page.")
      return
    }

    setPageToDelete(pageId)
    setShowDeleteDialog(true)
  }

  // Fix the confirmDeletePage function to use pageToDelete instead of pageId
  const confirmDeletePage = () => {
    if (pageToDelete) {
      // Don't allow deletion of home page
      if (pageToDelete === "home") {
        alert("You cannot delete the home page.")
        setShowDeleteDialog(false)
        setPageToDelete(null)
        return
      }

      deletePage(pageToDelete)

      // If we're deleting the current page, navigate to home
      if (pageToDelete === currentPageId) {
        setCurrentPageId("home")
        onPageChange("home")
      }

      // Refresh the pages list
      onPagesChange()

      setShowDeleteDialog(false)
      setPageToDelete(null)
    }
  }

  // Add a duplicate page function
  const duplicatePage = (pageId: string) => {
    const pageToDuplicate = pages.find((p) => p.id === pageId)
    if (pageToDuplicate) {
      const duplicatedPage = {
        ...pageToDuplicate,
        id: Date.now().toString(),
        title: `${pageToDuplicate.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      savePage(duplicatedPage)
      onPagesChange()

      // Navigate to the new page
      setCurrentPageId(duplicatedPage.id)
      onPageChange(duplicatedPage.id)
    }
  }

  const toggleFavorite = (pageId: string) => {
    // Get current favorites
    const favoritesFromStorage = localStorage.getItem("clarity_favorites")
      ? JSON.parse(localStorage.getItem("clarity_favorites") || "[]")
      : []

    let newFavorites

    // If already favorited, remove it
    if (favoritesFromStorage.includes(pageId)) {
      newFavorites = favoritesFromStorage.filter((id: string) => id !== pageId)
    } else {
      // Otherwise add it
      newFavorites = [...favoritesFromStorage, pageId]
    }

    // Save to localStorage
    localStorage.setItem("clarity_favorites", JSON.stringify(newFavorites))

    // Update state
    setFavorites(pages.filter((page) => newFavorites.includes(page.id)))
  }

  const isPageFavorited = (pageId: string) => {
    const favoritesFromStorage = localStorage.getItem("clarity_favorites")
      ? JSON.parse(localStorage.getItem("clarity_favorites") || "[]")
      : []
    return favoritesFromStorage.includes(pageId)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setShowSearchResults(false)
      setSearchResults([])
      return
    }

    // Search in page titles and content
    const results = pages.filter((page) => {
      // Search in title
      if (page.title.toLowerCase().includes(query.toLowerCase())) {
        return true
      }

      // Search in content
      return page.content.some((block) => block.content.toLowerCase().includes(query.toLowerCase()))
    })

    setSearchResults(results)
    setShowSearchResults(true)
  }

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        />
        <div
          ref={sidebarRef}
          className={cn(
            "fixed top-0 bottom-0 left-0 z-50 w-sidebar bg-background border-r p-4 overflow-y-auto transition-transform duration-200 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                C
              </div>
              <h1 className="text-xl font-semibold">Clarity</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {showSearchResults ? (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Search Results</h3>
              {searchResults.length > 0 ? (
                searchResults.map((page) => (
                  <SidebarItem
                    key={page.id}
                    icon={page.icon ? <span>{page.icon}</span> : <FileText className="h-4 w-4" />}
                    label={page.title}
                    active={currentPageId === page.id}
                    onClick={() => {
                      onPageChange(page.id)
                      setShowSearchResults(false)
                      setSearchQuery("")
                      onClose()
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No results found</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start"
                onClick={() => {
                  setShowSearchResults(false)
                  setSearchQuery("")
                }}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <SidebarContent
              pages={pages}
              favorites={favorites}
              recentPages={recentPages}
              currentPageId={currentPageId}
              onPageChange={(pageId) => {
                onPageChange(pageId)
                onClose() // Close sidebar on mobile after navigation
              }}
              onDeletePage={handleDeletePage}
              onDuplicatePage={duplicatePage}
              onToggleFavorite={toggleFavorite}
              isPageFavorited={isPageFavorited}
              onSettingsClick={onSettingsClick}
            />
          )}

          <Button className="w-full mt-6" size="sm" onClick={() => setNewPageDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <div className="mt-4">
            <ThemeToggle collapsed={false} />
          </div>
        </div>

        <NewPageDialog
          open={newPageDialogOpen}
          onOpenChange={setNewPageDialogOpen}
          title={newPageTitle}
          onTitleChange={setNewPageTitle}
          onSubmit={handleCreateNewPage}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPageToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePage}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <div
      className={cn(
        "h-screen border-r p-4 overflow-y-auto sidebar-transition",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar",
      )}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold">
          C
        </div>
        {!collapsed && <h1 className="text-xl font-semibold">Clarity</h1>}
      </div>

      {!collapsed ? (
        <>
          {!collapsed && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {showSearchResults ? (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Search Results</h3>
              {searchResults.length > 0 ? (
                searchResults.map((page) => (
                  <SidebarItem
                    key={page.id}
                    icon={page.icon ? <span>{page.icon}</span> : <FileText className="h-4 w-4" />}
                    label={page.title}
                    active={currentPageId === page.id}
                    onClick={() => {
                      onPageChange(page.id)
                      setShowSearchResults(false)
                      setSearchQuery("")
                    }}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No results found</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full justify-start"
                onClick={() => {
                  setShowSearchResults(false)
                  setSearchQuery("")
                }}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <SidebarContent
              pages={pages}
              favorites={favorites}
              recentPages={recentPages}
              currentPageId={currentPageId}
              onPageChange={onPageChange}
              onDeletePage={handleDeletePage}
              onDuplicatePage={duplicatePage}
              onToggleFavorite={toggleFavorite}
              isPageFavorited={isPageFavorited}
              onSettingsClick={onSettingsClick}
            />
          )}

          <Button className="w-full mt-6" size="sm" onClick={() => setNewPageDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
          <div className="mt-4">
            <ThemeToggle collapsed={false} />
          </div>
        </>
      ) : (
        <CollapsedSidebarContent
          onNewPage={() => setNewPageDialogOpen(true)}
          currentPageId={currentPageId}
          onPageChange={onPageChange}
          onSettingsClick={onSettingsClick}
        />
      )}

      <NewPageDialog
        open={newPageDialogOpen}
        onOpenChange={setNewPageDialogOpen}
        title={newPageTitle}
        onTitleChange={setNewPageTitle}
        onSubmit={handleCreateNewPage}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPageToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface SidebarContentProps {
  pages: Page[]
  favorites: Page[]
  recentPages: Page[]
  currentPageId: string
  onPageChange: (pageId: string) => void
  onDeletePage: (pageId: string) => void
  onDuplicatePage: (pageId: string) => void
  onToggleFavorite: (pageId: string) => void
  isPageFavorited: (pageId: string) => boolean
  onSettingsClick: () => void
}

function SidebarContent({
  pages,
  favorites,
  recentPages,
  currentPageId,
  onPageChange,
  onDeletePage,
  onDuplicatePage,
  onToggleFavorite,
  isPageFavorited,
  onSettingsClick,
}: SidebarContentProps) {
  return (
    <>
      <div className="space-y-1 mb-4">
        <SidebarItem
          icon={<Home className="h-4 w-4" />}
          label="Home"
          active={currentPageId === "home"}
          onClick={() => onPageChange("home")}
        />
      </div>

      <SidebarSection title="Favorites">
        {favorites.length > 0 ? (
          favorites.map((page) => (
            <div key={page.id} className="group relative">
              <SidebarItem
                icon={page.icon ? <span>{page.icon}</span> : <FileText className="h-4 w-4" />}
                label={page.title}
                active={currentPageId === page.id}
                onClick={() => onPageChange(page.id)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute right-1 top-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleFavorite(page.id)}>
                    <Star className="h-4 w-4 mr-2 fill-warning text-warning" />
                    Remove from Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicatePage(page.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeletePage(page.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground px-2 py-1">No favorites yet</p>
        )}
      </SidebarSection>

      <SidebarSection title="Pages">
        {pages
          .filter((page) => page.id !== "home")
          .map((page) => (
            <div key={page.id} className="group relative">
              <SidebarItem
                icon={page.icon ? <span>{page.icon}</span> : <FileText className="h-4 w-4" />}
                label={page.title}
                active={currentPageId === page.id}
                onClick={() => onPageChange(page.id)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute right-1 top-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleFavorite(page.id)}>
                    <Star className={`h-4 w-4 mr-2 ${isPageFavorited(page.id) ? "fill-warning text-warning" : ""}`} />
                    {isPageFavorited(page.id) ? "Remove from Favorites" : "Add to Favorites"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicatePage(page.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeletePage(page.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
      </SidebarSection>

      <div className="mt-6 space-y-1">
        <SidebarSection title="Recent">
          {recentPages.map((page) => (
            <SidebarItem
              key={page.id}
              icon={<Clock className="h-4 w-4" />}
              label={page.title}
              active={currentPageId === page.id}
              onClick={() => onPageChange(page.id)}
            />
          ))}
        </SidebarSection>
        <SidebarItem icon={<Settings className="h-4 w-4" />} label="Settings" onClick={onSettingsClick} />
      </div>
    </>
  )
}

interface CollapsedSidebarContentProps {
  onNewPage: () => void
  currentPageId: string
  onPageChange: (pageId: string) => void
  onSettingsClick: () => void
}

function CollapsedSidebarContent({
  onNewPage,
  currentPageId,
  onPageChange,
  onSettingsClick,
}: CollapsedSidebarContentProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-md"
        onClick={() => alert("Search functionality coming soon!")}
      >
        <Search className="h-5 w-5" />
      </Button>
      <Button
        variant={currentPageId === "home" ? "default" : "ghost"}
        size="icon"
        className="rounded-md"
        onClick={() => onPageChange("home")}
      >
        <Home className="h-5 w-5" />
      </Button>
      <Button
        variant={currentPageId === "getting-started" ? "default" : "ghost"}
        size="icon"
        className="rounded-md"
        onClick={() => onPageChange("getting-started")}
      >
        <Star className="h-5 w-5" />
      </Button>
      <Button
        variant={currentPageId === "project-management" ? "default" : "ghost"}
        size="icon"
        className="rounded-md"
        onClick={() => onPageChange("project-management")}
      >
        <FileText className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-md" onClick={onSettingsClick}>
        <Settings className="h-5 w-5" />
      </Button>
      <Button size="icon" className="rounded-md mt-4" onClick={onNewPage}>
        <Plus className="h-5 w-5" />
      </Button>
      <div className="mt-auto pt-4">
        <ThemeToggle collapsed={true} />
      </div>
    </div>
  )
}

function NewPageDialog({ open, onOpenChange, title, onTitleChange, onSubmit }: NewPageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>Enter a title for your new page.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="page-title">Page Title</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled"
            className="mt-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSubmit()
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!title.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

