
import { SupabaseClient } from '@supabase/supabase-js'

export async function persistMessage(s: SupabaseClient, params: {
  workspaceId: string
  phone: string
  contactName?: string
  contactAvatar?: string
  text: string
  direction: 'in' | 'out'
  status: string
  type?: string
  mediaUrl?: string
  externalMessageId?: string
}) {
  // 1. Get or Create Contact
  let contactId: string | null = null
  
  // Normalize phone check (Handle Brazil 9th digit)
  // Check for both 8 and 9 digit versions if it's a BR number
  const cleanPhone = params.phone.replace(/\D/g, '')
  let possiblePhones = [params.phone]
  
  if (cleanPhone.startsWith('55') && (cleanPhone.length === 12 || cleanPhone.length === 13)) {
      const base = cleanPhone.substring(2) // Remove 55
      const ddd = base.substring(0, 2)
      const number = base.substring(2)
      
      if (number.length === 8) {
          // Add 9
          possiblePhones.push(`55${ddd}9${number}`)
      } else if (number.length === 9 && number.startsWith('9')) {
          // Remove 9
          possiblePhones.push(`55${ddd}${number.substring(1)}`)
      }
  }

  const { data: contacts } = await s
    .from('contacts')
    .select('id, name, profile_pic_url, phone')
    .eq('workspace_id', params.workspaceId)
    .in('phone', possiblePhones)
    .limit(1)

  const contact = contacts && contacts.length > 0 ? contacts[0] : null

  if (contact) {
    contactId = contact.id
    // Optional: Update name/avatar if missing or changed
    if (params.contactName || params.contactAvatar) {
        const updates: any = {}
        if (params.contactName && contact.name === params.phone) updates.name = params.contactName
        if (params.contactAvatar && !contact.profile_pic_url) updates.profile_pic_url = params.contactAvatar
        
        if (Object.keys(updates).length > 0) {
            await s.from('contacts').update(updates).eq('id', contactId)
        }
    }
  } else {
    const { data: newContact, error: createContactErr } = await s
      .from('contacts')
      .insert({
        workspace_id: params.workspaceId,
        phone: params.phone,
        name: params.contactName || params.phone, // Use provided name or default to phone
        profile_pic_url: params.contactAvatar || null,
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
  // Handle media: if mediaUrl exists, we prepend/append it to content or store it if we had a column.
  // Since we don't have a media_url column, we'll store it in content: "URL \n CAPTION"
  let finalContent = params.text || ''
  if (params.mediaUrl) {
    finalContent = params.text ? `${params.mediaUrl}\n${params.text}` : params.mediaUrl
  }

  const { data: msg, error: msgErr } = await s
    .from('messages')
    .insert({
      workspace_id: params.workspaceId,
      conversation_id: conversationId,
      content: finalContent,
      direction: params.direction,
      type: params.type || 'text',
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
