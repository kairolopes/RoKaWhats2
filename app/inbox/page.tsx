"use client"

import * as React from "react"
import { createClient } from "@supabase/supabase-js"
import { ConversationList } from "@/components/inbox/ConversationList"
import { ChatHeader } from "@/components/inbox/ChatHeader"
import { MessageList } from "@/components/inbox/MessageList"
import { MessageComposer } from "@/components/inbox/MessageComposer"
import { useRouter } from "next/navigation"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pplduhvmiefrsnrslfwt.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzc5OTUsImV4cCI6MjA4NjA1Mzk5NX0.W8nZf0tpxTAfLb0CELOJs0LYQdOonLJz9SkjMbu_KCg"
const supabase = createClient(supabaseUrl, supabaseKey)

export default function InboxPage() {
  const router = useRouter()
  const [conversations, setConversations] = React.useState<any[]>([])
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null)

  const selectedIdRef = React.useRef<string | null>(null)

  // Update ref when state changes
  React.useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  // Realtime subscription (Run once on mount)
  React.useEffect(() => {
    fetchConversations()

    const channel = supabase
      .channel('global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('Realtime Event:', payload)
          const newMsg = payload.new

          // 1. Update Messages list if in current conversation
          if (selectedIdRef.current && newMsg.conversation_id === selectedIdRef.current) {
            setMessages((prev) => {
                // Avoid duplicates if we already added it optimistically (check by ID or temp ID)
                // Since we don't have temp IDs easily matching DB IDs, we might get duplicates if we aren't careful.
                // But optimistic ID is usually temporary.
                // For now, let's just append. If we implement proper optimistic, we replace.
                // Check if message with same ID exists
                if (prev.some(m => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
            })
          }

          // 2. Update Conversations list
          setConversations((prev) => {
            const index = prev.findIndex(c => c.id === newMsg.conversation_id)
            if (index > -1) {
              const updatedConv = {
                ...prev[index],
                last_message: newMsg.content,
                last_message_at: newMsg.created_at,
                unread_count: newMsg.direction === 'in' ? (prev[index].unread_count || 0) + 1 : prev[index].unread_count
              }
              const newPrev = [...prev]
              newPrev.splice(index, 1)
              return [updatedConv, ...newPrev]
            } else {
              fetchConversations()
              return prev
            }
          })
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime Status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // Dependency array empty -> runs once

  // Polling fallback (every 3s)
  React.useEffect(() => {
    const interval = setInterval(() => {
        if (selectedIdRef.current) {
            fetchMessages(selectedIdRef.current)
        }
        fetchConversations()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Fetch messages when selected conversation changes
  React.useEffect(() => {
    if (!selectedId) return
    fetchMessages(selectedId)
  }, [selectedId])

  const fetchMessages = async (convId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        // Merge with current state to avoid flickering?
        // Simple replace is easier but might reset scroll.
        // MessageList handles scroll on change.
        // To avoid scroll jumping, we should only update if length changed or new message.
        setMessages(prev => {
            if (JSON.stringify(prev) === JSON.stringify(data)) return prev
            return data || []
        })
      }
  }

  const fetchConversations = async () => {
    try {
      // Join with contacts
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          last_message,
          last_message_at,
          unread_count,
          workspace_id,
          contact_id,
          contacts (
            id,
            name,
            phone,
            avatar_url
          )
        `)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      const formatted = data.map((c: any) => ({
        id: c.id,
        contact_name: c.contacts?.name,
        contact_phone: c.contacts?.phone,
        avatar_url: c.contacts?.avatar_url,
        last_message: c.last_message,
        last_message_at: c.last_message_at || c.created_at,
        unread_count: c.unread_count || 0,
        workspace_id: c.workspace_id
      }))

      setConversations(formatted)
      if (formatted.length > 0 && !workspaceId) {
          setWorkspaceId(formatted[0].workspace_id)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedId) return // Removed workspaceId check as we get it from conv

    const currentConv = conversations.find(c => c.id === selectedId)
    if (!currentConv) return

    try {
      // Optimistic Update
      const tempMsg = {
        id: 'temp-' + Date.now(),
        conversation_id: selectedId,
        workspace_id: currentConv.workspace_id,
        content: text,
        direction: 'out',
        status: 'sending',
        created_at: new Date().toISOString(),
        type: 'text'
      }
      setMessages(prev => [...prev, tempMsg])

      // Call API
      const res = await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentConv.workspace_id,
          to: {
            phone: currentConv.contact_phone
          },
          message: {
            type: 'text',
            text: text
          }
        })
      })

      if (!res.ok) {
        console.error('Failed to send message')
        // Revert optimistic update (optional, or mark as failed)
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'failed' } : m))
      } else {
        // Success
        // Wait for Realtime to replace it? 
        // Realtime will insert a NEW message with a real ID.
        // We should probably filter out the temp message when the real one arrives or just leave it?
        // If we leave it, we get duplicates.
        // Simple hack: When Realtime comes, it adds the real one. We can keep the temp one until refresh or remove it?
        // Better: Update the temp message to 'sent' if we can link them. But we can't easily link without an ID returned from API.
        // The API returns { ok: true }.
        
        // For now, let's just mark it as sent locally.
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'sent' } : m))
      }
      
      // No need to manually add to state, Realtime will catch it
      // But for better UX (lag), we could optimistically add it.
      // Let's rely on Realtime for now to ensure consistency as requested "ver atualizar"
      
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedId)

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[400px] flex-shrink-0">
        <ConversationList 
          conversations={conversations} 
          selectedId={selectedId} 
          onSelect={setSelectedId} 
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#efeae2] relative">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <MessageList messages={messages} />
            <MessageComposer onSend={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
                <h3 className="text-xl font-medium mb-2">RokaWhats Web</h3>
                <p>Select a conversation to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
