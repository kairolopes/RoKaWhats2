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

  // Fetch conversations on mount
  React.useEffect(() => {
    fetchConversations()

    // Realtime subscription for Messages (Global for now to catch new messages in any conversation)
    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('New message received:', payload)
          const newMsg = payload.new

          // 1. Update Messages list if in current conversation
          if (selectedId && newMsg.conversation_id === selectedId) {
            setMessages((prev) => [...prev, newMsg])
            // Mark as read if we are viewing it? (Logic for another time)
          }

          // 2. Update Conversations list (move to top, update snippet)
          setConversations((prev) => {
            const index = prev.findIndex(c => c.id === newMsg.conversation_id)
            if (index > -1) {
              const updatedConv = {
                ...prev[index],
                last_message: newMsg.content,
                last_message_at: newMsg.created_at,
                unread_count: newMsg.direction === 'in' ? (prev[index].unread_count || 0) + 1 : prev[index].unread_count
              }
              // Move to top
              const newPrev = [...prev]
              newPrev.splice(index, 1)
              return [updatedConv, ...newPrev]
            } else {
              // New conversation? Fetch it.
              // For simplicity, just re-fetch all for now or fetch single
              fetchConversations()
              return prev
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  // Fetch messages when selected conversation changes
  React.useEffect(() => {
    if (!selectedId) return

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching messages:', error)
      } else {
        setMessages(data || [])
      }
    }

    fetchMessages()
  }, [selectedId])

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
    if (!selectedId || !workspaceId) return

    const currentConv = conversations.find(c => c.id === selectedId)
    if (!currentConv) return

    try {
      // Call API
      const res = await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspaceId,
          phone: currentConv.contact_phone,
          text: text,
          type: 'text'
        })
      })

      if (!res.ok) {
        console.error('Failed to send message')
        alert('Failed to send message')
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
