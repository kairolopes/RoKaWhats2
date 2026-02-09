"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  contact_name: string
  contact_phone: string
  last_message: string
  last_message_at: string
  unread_count: number
  avatar_url?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = React.useState("")

  const filtered = conversations.filter(c => 
    c.contact_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.contact_phone?.includes(search)
  )

  return (
    <div className="flex flex-col h-full border-r bg-white">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search or start new chat" 
            className="pl-8 bg-slate-100 border-none" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              className={cn(
                "flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50",
                selectedId === conv.id && "bg-slate-100 hover:bg-slate-100"
              )}
              onClick={() => onSelect(conv.id)}
            >
              <Avatar>
                <AvatarImage src={conv.avatar_url} />
                <AvatarFallback>{conv.contact_name?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium truncate">{conv.contact_name || conv.contact_phone}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                    {conv.last_message || "No messages"}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
