import { NextResponse } from 'next/server'
import { logWebhook } from '@/lib/logger'
import { persistMessage } from '@/lib/inbox'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json()
  const workspaceId = body?.workspaceId as string | undefined
  const phone = body?.to?.phone as string | undefined
  const messageData = body?.message || {}
  const type = messageData.type || 'text'
  const text = messageData.text || messageData.caption // Use caption as text if present
  const mediaUrl = messageData.image || messageData.audio || messageData.video || messageData.document
  const externalMessageId = body?.externalMessageId as string | undefined

  // Persist Outbound Message
  if (workspaceId && phone && (text || mediaUrl)) {
     const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )
    
    await persistMessage(supabase, {
      workspaceId,
      phone,
      text: text || '',
      mediaUrl,
      type,
      direction: 'out',
      status: 'sent',
      externalMessageId
    })
  }

  const url = process.env.MAKE_OUTBOX_WEBHOOK_URL as string
  if (!url) {
    await logWebhook({
      workspaceId,
      route: '/api/inbox/send',
      status: 'invalid',
      error: 'missing MAKE_OUTBOX_WEBHOOK_URL',
      payload: body,
    })
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-make-secret': process.env.MAKE_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    await logWebhook({
      workspaceId,
      route: '/api/inbox/send',
      status: res.ok ? 'forwarded' : 'error',
      error: res.ok ? null : `status=${res.status} body=${text}`,
      payload: body,
    })
    return NextResponse.json({ ok: res.ok, status: res.status })
  } catch (e: any) {
    await logWebhook({
      workspaceId,
      route: '/api/inbox/send',
      status: 'error',
      error: e?.message || 'unknown_error',
      payload: body,
    })
    return NextResponse.json({ error: 'forward_failed' }, { status: 502 })
  }
}
