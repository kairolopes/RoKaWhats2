
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { persistMessage } from '@/lib/inbox'

export async function POST(req: Request) {
  const secret = req.headers.get('x-make-secret')
  if (!secret || secret !== process.env.MAKE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const workspaceId = body?.workspaceId
  const phone = body?.phone
  const text = body?.text
  const direction = body?.direction || 'in'
  const status = body?.status || 'pending'
  const externalMessageId = body?.externalMessageId

  if (!workspaceId || !phone || !text) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  )

  const result = await persistMessage(supabase, {
    workspaceId,
    phone,
    text,
    direction,
    status,
    externalMessageId
  })

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}
