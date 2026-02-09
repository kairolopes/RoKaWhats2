
import { SupabaseClient } from '@supabase/supabase-js'

export async function persistMessage(s: SupabaseClient, params: {
  workspaceId: string
  phone: string
  text: string
  direction: 'in' | 'out'
  status: string
  externalMessageId?: string
}) {
  // 1. Get or Create Contact
  let contactId: string | null = null
  const { data: contact } = await s
    .from('contacts')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('phone', params.phone)
    .single()

  if (contact) {
    contactId = contact.id
  } else {
    const { data: newContact, error: createContactErr } = await s
      .from('contacts')
      .insert({
        workspace_id: params.workspaceId,
        phone: params.phone,
        name: params.phone, // Default name
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (createContactErr) {
      return { error: `contact_create_failed: ${createContactErr.message}` }
    }
    contactId = newContact.id
  }

  // 2. Get or Create Conversation
  let conversationId: string | null = null
  const { data: conv } = await s
    .from('conversations')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('contact_id', contactId)
    .single()

  if (conv) {
    conversationId = conv.id
    // Update last_message_at
    await s.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
  } else {
    const { data: newConv, error: createConvErr } = await s
      .from('conversations')
      .insert({
        workspace_id: params.workspaceId,
        contact_id: contactId,
        status: 'open',
        created_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (createConvErr) {
      return { error: `conversation_create_failed: ${createConvErr.message}` }
    }
    conversationId = newConv.id
  }

  // 3. Insert Message
  const { data: msg, error: msgErr } = await s
    .from('messages')
    .insert({
      workspace_id: params.workspaceId,
      conversation_id: conversationId,
      content: params.text,
      direction: params.direction,
      type: 'text',
      status: params.status,
      external_message_id: params.externalMessageId,
    })
    .select('id')
    .single()

  if (msgErr) {
    return { error: `message_insert_failed: ${msgErr.message}` }
  }

  return { ok: true, messageId: msg.id, conversationId, contactId }
}
