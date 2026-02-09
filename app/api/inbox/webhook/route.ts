
import { NextResponse } from 'next/server'
import { logWebhook } from '../../../../lib/logger'
import { createClient } from '@supabase/supabase-js'
import { persistMessage } from '../../../../lib/inbox'

export async function POST(req: Request) {
  const secret = req.headers.get('x-make-secret')
  if (!secret || secret !== process.env.MAKE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const raw = await req.text()
  let body: any
  try {
    body = JSON.parse(raw)
  } catch {
    await logWebhook({
      route: '/api/inbox/webhook',
      status: 'invalid',
      error: 'invalid_json',
      payload: raw,
    })
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const workspaceId = body?.workspaceId as string | undefined
  const externalMessageId = body?.externalMessageId as string | undefined
  const phone = body?.phone as string | undefined

  if (!externalMessageId) {
    await logWebhook({
      workspaceId,
      route: '/api/inbox/webhook',
      provider: body?.provider,
      externalMessageId,
      status: 'invalid',
      error: 'missing externalMessageId',
      payload: body,
    })
    return NextResponse.json({ error: 'missing externalMessageId' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )
  const { data: existing } = await supabaseAdmin
    .from('webhook_logs')
    .select('id')
    .eq('route', '/api/inbox/webhook')
    .eq('external_message_id', externalMessageId)
    .limit(1)

  if (existing && existing.length > 0) {
    await logWebhook({
      workspaceId,
      route: '/api/inbox/webhook',
      provider: body?.provider,
      externalMessageId,
      status: 'duplicate',
      error: null,
      payload: body,
    })
    return NextResponse.json({ ok: true, deduped: true })
  }

  const logErr = await logWebhook({
    workspaceId,
    route: '/api/inbox/webhook',
    provider: body?.provider,
    externalMessageId,
    status: 'received',
    error: null,
    payload: body,
  })

  if (logErr) {
    return NextResponse.json({ error: 'log_failed' }, { status: 500 })
  }

  // --- PERSIST TO MESSAGES TABLE ---
  const messageData = body?.message || {}
  const type = messageData.type || 'text'
  
  let text = messageData.text || messageData.caption
  const mediaUrl = messageData.image || messageData.audio || messageData.video || messageData.document || messageData.sticker || messageData.mediaUrl

  // Handle special types content generation
  if (type === 'location' && messageData.latitude && messageData.longitude) {
    text = `https://maps.google.com/?q=${messageData.latitude},${messageData.longitude}`
  } else if (type === 'contact' && messageData.contactName) {
    text = `Contact: ${messageData.contactName} ${messageData.contactPhone ? `(${messageData.contactPhone})` : ''}`
  }

  if (workspaceId && (text || mediaUrl) && phone) {
    // Note: Z-API Inbound format might differ from Outbox format.
    // We expect 'phone' (sender) to be present.
    
    // Attempt to persist
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )
    
    const result = await persistMessage(supabase, {
      workspaceId,
      phone,
      text: text || '',
      mediaUrl,
      type,
      direction: 'in',
      status: 'received',
      externalMessageId
    })
    
    if (result.error) {
       console.error('Persistence failed:', result.error)
       // We don't fail the webhook response, just log
       await logWebhook({
        workspaceId,
        route: '/api/inbox/webhook',
        status: 'persistence_failed',
        error: result.error,
        payload: body,
      })
    }
  }
  
  return NextResponse.json({ ok: true })
}
