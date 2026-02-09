
import { SupabaseClient } from '@supabase/supabase-js'

async function logPersist(s: SupabaseClient, msg: string, data?: any) {
    try {
        await s.from('webhook_logs').insert({
            route: 'DEBUG:persistMessage',
            payload: { msg, data },
            created_at: new Date().toISOString()
        });
    } catch (e) {
        console.error('Failed to log persist debug:', e);
    }
}

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
  await logPersist(s, `Starting persistMessage`, params);

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

  await logPersist(s, `Searching contacts`, { possiblePhones });

  const { data: contacts, error: contactError } = await s
    .from('contacts')
    .select('id, name, profile_pic_url, phone')
    .eq('workspace_id', params.workspaceId)
    .in('phone', possiblePhones)
    .limit(1)

  if (contactError) {
      await logPersist(s, `Contact search error`, contactError);
  }

  const contact = contacts && contacts.length > 0 ? contacts[0] : null

  if (contact) {
    contactId = contact.id
    await logPersist(s, `Found existing contact`, { contactId });
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
    await logPersist(s, `Creating new contact`, { phone: params.phone });
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
      await logPersist(s, `Error creating contact`, createContactErr);
      return { error: `contact_create_failed: ${createContactErr.message}` }
    }
    contactId = newContact.id
    await logPersist(s, `Created new contact`, { contactId });
  }

  // 2. Get or Create Conversation
  let conversationId: string | null = null
  const { data: conv, error: convErr } = await s
    .from('conversations')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('contact_id', contactId)
    .single()
  
  if (convErr && convErr.code !== 'PGRST116') {
      await logPersist(s, `Conversation search error`, convErr);
  }

  if (conv) {
    conversationId = conv.id
    await logPersist(s, `Found existing conversation`, { conversationId });
    // Update last_message_at
    await s.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId)
  } else {
    await logPersist(s, `Creating new conversation`, { contactId });
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
      await logPersist(s, `Error creating conversation`, createConvErr);
      return { error: `conversation_create_failed: ${createConvErr.message}` }
    }
    conversationId = newConv.id
    await logPersist(s, `Created new conversation`, { conversationId });
  }

  // 3. Insert Message
  // Handle media: if mediaUrl exists, we prepend/append it to content or store it if we had a column.
  // Since we don't have a media_url column, we'll store it in content: "URL \n CAPTION"
  let finalContent = params.text || ''
  if (params.mediaUrl) {
    finalContent = params.text ? `${params.mediaUrl}\n${params.text}` : params.mediaUrl
  }

  await logPersist(s, `Inserting message`, { conversationId, finalContent });

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
    await logPersist(s, `Error inserting message`, msgErr);
    return { error: `message_insert_failed: ${msgErr.message}` }
  }

  await logPersist(s, `Message persisted successfully`, { id: msg.id });
  return { ok: true, messageId: msg.id, conversationId, contactId }
}
