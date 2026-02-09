
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Fetch conversations (limit 50 for performance)
    const { data: convs, error } = await admin
      .from('conversations')
      .select(`
        id,
        created_at,
        updated_at,
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
      .limit(50)

    if (error) {
        console.error('Admin Fetch Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch last message content for each conversation
    // This restores the "last_message" functionality that was broken due to missing column
    const formatted = await Promise.all(convs.map(async (c: any) => {
        let lastMsgContent = ""
        // Fetch the actual last message content from messages table
        const { data: msg } = await admin
            .from('messages')
            .select('content')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        
        if (msg) lastMsgContent = msg.content

        return {
            id: c.id,
            contact_name: c.contacts?.name,
            contact_phone: c.contacts?.phone,
            avatar_url: c.contacts?.avatar_url,
            last_message: lastMsgContent, // Now populated correctly
            last_message_at: c.last_message_at || c.created_at,
            unread_count: c.unread_count || 0,
            workspace_id: c.workspace_id
        }
    }))

    return NextResponse.json({ conversations: formatted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
