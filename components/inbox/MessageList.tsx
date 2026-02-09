"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Check, CheckCheck } from "lucide-react"

interface Message {
  id: string
  content: string
  direction: 'in' | 'out'
  status: string
  created_at: string
  type: string
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (scrollRef.current) {
        // Find the viewport element inside ScrollArea
        const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-[#efeae2]">
      <div className="flex flex-col gap-2 pb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[70%] rounded-lg p-2 px-3 text-sm shadow-sm relative group",
              msg.direction === 'out' 
                ? "self-end bg-[#d9fdd3] rounded-tr-none" 
                : "self-start bg-white rounded-tl-none"
            )}
          >
            <div className="break-words">
                {msg.type === 'image' ? (
                    <div className="mb-1">
                        <img src={msg.content} alt="Media" className="rounded-md max-w-full h-auto" />
                    </div>
                ) : (
                    <span>{msg.content}</span>
                )}
            </div>
            <div className="flex items-center justify-end gap-1 mt-1 select-none">
              <span className="text-[10px] text-gray-500 leading-none">
                {formatTime(msg.created_at)}
              </span>
              {msg.direction === 'out' && (
                <span className={cn(
                    "text-[14px]",
                    msg.status === 'read' ? "text-blue-500" : "text-gray-400"
                )}>
                  {msg.status === 'sent' && <Check className="h-3 w-3" />}
                  {(msg.status === 'delivered' || msg.status === 'read') && <CheckCheck className="h-3 w-3" />}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
