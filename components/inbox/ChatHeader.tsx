"use client"

import { MoreVertical, Search, Phone, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Conversation {
  id: string
  contact_name: string
  contact_phone: string
  avatar_url?: string
}

interface ChatHeaderProps {
  conversation: Conversation
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <div className="h-16 border-b flex items-center justify-between px-4 bg-slate-50">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={conversation.avatar_url} />
          <AvatarFallback>{conversation.contact_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium text-sm">{conversation.contact_name || conversation.contact_phone}</h2>
          <p className="text-xs text-muted-foreground">
             {/* Mock presence */}
             Online
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
