"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose?: () => void
}

// Common emoji categories
const emojiCategories = {
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘"],
  people: ["👶", "👧", "🧒", "👦", "👩", "🧑", "👨", "👵", "🧓", "👴", "👲", "👳‍♀️", "👳‍♂️", "🧕", "👮‍♀️", "👮‍♂️"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🙈", "🙉"],
  food: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆"],
  travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🚚", "🚛", "🚜", "🛴", "🚲", "🛵", "🏍"],
  activities: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🥅", "🏒", "🏑", "🥍", "🏏"],
  objects: ["⌚", "📱", "📲", "💻", "⌨️", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💽", "💾", "💿", "📀", "📼", "📷"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "♥️", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💌", "❣️"],
  flags: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏴‍☠️", "🇦🇨", "🇦🇩", "🇦🇪", "🇦🇫", "🇦🇬", "🇦🇮", "🇦🇱", "🇦🇲", "🇦🇴"],
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmojis, setFilteredEmojis] = useState<Record<string, string[]>>(emojiCategories)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close the picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // This would be handled by the parent component
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter emojis based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEmojis(emojiCategories)
      return
    }

    const filtered: Record<string, string[]> = {}

    Object.entries(emojiCategories).forEach(([category, emojis]) => {
      const matchedEmojis = emojis.filter((emoji) => emoji.toLowerCase().includes(searchTerm.toLowerCase()))

      if (matchedEmojis.length > 0) {
        filtered[category] = matchedEmojis
      }
    })

    setFilteredEmojis(filtered)
  }, [searchTerm])

  return (
    <div ref={containerRef} className="w-64 bg-background border rounded-md shadow-md overflow-hidden">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emoji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="smileys">
        <TabsList className="grid grid-cols-5 h-auto p-0">
          <TabsTrigger value="smileys" className="p-2">
            😀
          </TabsTrigger>
          <TabsTrigger value="people" className="p-2">
            👨
          </TabsTrigger>
          <TabsTrigger value="animals" className="p-2">
            🐶
          </TabsTrigger>
          <TabsTrigger value="food" className="p-2">
            🍎
          </TabsTrigger>
          <TabsTrigger value="objects" className="p-2">
            📱
          </TabsTrigger>
        </TabsList>

        {Object.entries(filteredEmojis).map(([category, emojis]) => (
          <TabsContent key={category} value={category} className="m-0">
            <ScrollArea className="h-48 p-2">
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-accent rounded-md transition-colors"
                    onClick={() => onEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

