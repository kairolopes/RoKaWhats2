"use client"

import * as React from "react"
import { Mic, Paperclip, Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MessageComposerProps {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [text, setText] = React.useState("")
  const [sending, setSending] = React.useState(false)

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!text.trim() || sending) return

    setSending(true)
    try {
      await onSend(text)
      setText("")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-3 bg-slate-50 border-t flex items-center gap-2">
      <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
        <Smile className="h-6 w-6" />
      </Button>
      <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
        <Paperclip className="h-5 w-5" />
      </Button>
      
      <form onSubmit={handleSend} className="flex-1 flex gap-2">
        <Input 
          className="flex-1 bg-white border-none focus-visible:ring-0" 
          placeholder="Type a message" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled || sending}
        />
      </form>

      {text.trim() ? (
        <Button size="icon" className="shrink-0" onClick={() => handleSend()} disabled={disabled || sending}>
          <Send className="h-5 w-5" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
          <Mic className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
