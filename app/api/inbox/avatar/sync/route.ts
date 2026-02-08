import { NextResponse } from 'next/server'
import { logWebhook } from '../../../../../lib/logger'
import { ensureBuckets, uploadToSupabaseStorage } from '../../../../../lib/storage'
import { createClient } from '@supabase/supabase-js'

// Removed fs usage to avoid potential build issues in Next.js App Router
// Using console.log which should appear in server stdout

function debugLog(msg: string) {
  console.log(`[AVATAR_DEBUG] ${msg}`);
}

export async function POST(req: Request) {
  try {
    debugLog('Received request');
    const body = await req.json().catch(() => ({}))
    debugLog(`Payload: ${JSON.stringify(body)}`);
    const workspaceId = body?.workspaceId as string | undefined
    const contactPhone = body?.contactPhone as string | undefined
    // Accept avatarUrl (standard) or senderPhoto (Z-API webhook direct mapping)
    const avatarUrl = (body?.avatarUrl || body?.senderPhoto) as string | undefined
    const secret = req.headers.get('x-make-secret')
    if (!secret || secret !== process.env.MAKE_WEBHOOK_SECRET) {
    await logWebhook({
      workspaceId,
      route: '/api/inbox/avatar/sync',
      status: 'unauthorized',
      error: 'invalid_secret',
      payload: body,
    })
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!workspaceId || !contactPhone) {
    await logWebhook({
      workspaceId,
      route: '/api/inbox/avatar/sync',
      status: 'invalid',
      error: 'missing_fields',
      payload: body,
    })
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  try {
    debugLog('Calling ensureBuckets');
    await ensureBuckets()
    debugLog('ensureBuckets done');
  } catch (e: any) {
    debugLog(`ensureBuckets failed: ${e.message}`);
    return NextResponse.json({ error: 'storage_error', details: e.message }, { status: 500 });
  }

  let buffer: Buffer | null = null
  let contentType = 'image/jpeg'
  if (avatarUrl) {
    try {
      const res = await fetch(avatarUrl)
      if (!res.ok) {
        await logWebhook({
          workspaceId,
          route: '/api/inbox/avatar/sync',
          status: 'error',
          error: `download_failed status=${res.status}`,
          payload: { avatarUrl },
        })
        return NextResponse.json({ error: 'download_failed' }, { status: 502 })
      }
      const arr = await res.arrayBuffer()
      buffer = Buffer.from(arr)
      contentType = res.headers.get('content-type') || contentType
    } catch (e: any) {
      await logWebhook({
        workspaceId,
        route: '/api/inbox/avatar/sync',
        status: 'error',
        error: e?.message || 'download_error',
        payload: { avatarUrl },
      })
      return NextResponse.json({ error: 'download_error' }, { status: 502 })
    }
  } else {
    try {
      const tmpl = process.env.ZAPI_AVATAR_URL_TEMPLATE as string | undefined
      const clientToken = process.env.ZAPI_CLIENT_TOKEN as string | undefined
      if (tmpl) {
        const base = tmpl.replace('{PHONE}', contactPhone)
        const headers: Record<string, string> = {}
        if (clientToken) headers['client-token'] = clientToken
        let res = await fetch(base, { headers })
        if (res.ok) {
          const ct = res.headers.get('content-type') || ''
          if (ct.startsWith('image/')) {
            const arr = await res.arrayBuffer()
            buffer = Buffer.from(arr)
            contentType = ct || contentType
          } else {
            const j = await res.json().catch(() => null as any)
            const pic = j?.profilePicUrl || j?.avatarUrl || j?.url || null
            if (pic) {
              const r2 = await fetch(pic)
              if (r2.ok) {
                const arr2 = await r2.arrayBuffer()
                buffer = Buffer.from(arr2)
                contentType = r2.headers.get('content-type') || contentType
              }
            }
          }
        } else if (clientToken) {
          const withToken = base.includes('?')
            ? `${base}&client_token=${clientToken}`
            : `${base}?client_token=${clientToken}`
          res = await fetch(withToken)
          if (res.ok) {
            const ct = res.headers.get('content-type') || ''
            if (ct.startsWith('image/')) {
              const arr = await res.arrayBuffer()
              buffer = Buffer.from(arr)
              contentType = ct || contentType
            } else {
              const j = await res.json().catch(() => null as any)
              const pic = j?.profilePicUrl || j?.avatarUrl || j?.url || null
              if (pic) {
                const r2 = await fetch(pic)
                if (r2.ok) {
                  const arr2 = await r2.arrayBuffer()
                  buffer = Buffer.from(arr2)
                  contentType = r2.headers.get('content-type') || contentType
                }
              }
            }
          }
        }
        if (!buffer) {
          try {
            const idx = base.indexOf('/contacts')
            if (idx > -1) {
              const root = base.slice(0, idx + '/contacts'.length)
              const urlQuery = `${root}/profile-picture?phone=${contactPhone}`
              const urlPath = `${root}/${contactPhone}/profile-picture`
              const candidates = [urlQuery, urlPath]
              for (const candidate of candidates) {
                let r = await fetch(candidate, { headers })
                if (!r.ok && clientToken) {
                  const withToken2 = candidate.includes('?')
                    ? `${candidate}&client_token=${clientToken}`
                    : `${candidate}?client_token=${clientToken}`
                  r = await fetch(withToken2)
                }
                if (r.ok) {
                  const ct2 = r.headers.get('content-type') || ''
                  if (ct2.startsWith('image/')) {
                    const arr2 = await r.arrayBuffer()
                    buffer = Buffer.from(arr2)
                    contentType = ct2 || contentType
                    break
                  } else {
                    const jj = await r.json().catch(() => null as any)
                    const pic2 = jj?.profilePicUrl || jj?.avatarUrl || jj?.url || null
                    if (pic2) {
                      const r3 = await fetch(pic2)
                      if (r3.ok) {
                        const arr3 = await r3.arrayBuffer()
                        buffer = Buffer.from(arr3)
                        contentType = r3.headers.get('content-type') || contentType
                        break
                      }
                    }
                  }
                }
              }
            }
          } catch {}
        }
      }
    } catch (e: any) {
      await logWebhook({
        workspaceId,
        route: '/api/inbox/avatar/sync',
        status: 'error',
        error: e?.message || 'fallback_error',
        payload: { contactPhone },
      })
    }
    if (!buffer) {
      await logWebhook({
        workspaceId,
        route: '/api/inbox/avatar/sync',
        status: 'skipped',
        error: 'no_avatar',
        payload: body,
      })
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 })
    }
  }

  const path = `avatars/${workspaceId}/contacts/${contactPhone}.jpg`
  try {
    debugLog(`Uploading to ${path}`);
    const upload = await uploadToSupabaseStorage({
      bucket: 'avatars',
      path,
      buffer,
      contentType,
      upsert: true,
      signedSeconds: 600,
    })
    debugLog(`Upload success: ${JSON.stringify(upload)}`);
    const admin = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    )
    const { data: existing } = await admin
      .from('contacts')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('phone', contactPhone)
      .limit(1)
    let contactId: string | null = null
    if (existing && existing.length > 0) {
      contactId = existing[0].id
      await admin.from('contacts').update({ profile_pic_url: path }).eq('id', contactId)
    } else {
      const { data: inserted } = await admin
        .from('contacts')
        .insert({ workspace_id: workspaceId, phone: contactPhone, profile_pic_url: path })
        .select('id')
        .single()
      contactId = inserted?.id ?? null
    }
    await logWebhook({
      workspaceId,
      route: '/api/inbox/avatar/sync',
      status: 'stored',
      error: null,
      payload: { contactPhone, path, contactId },
    })
    return NextResponse.json({ ok: true, url: upload.signedUrl })
  } catch (e: any) {
    debugLog(`Final catch: ${e.message}`);
    await logWebhook({
      workspaceId,
      route: '/api/inbox/avatar/sync',
      status: 'error',
      error: e?.message || 'upload_failed',
      payload: { contactPhone },
    })
    return NextResponse.json({ error: 'upload_failed', details: e.message }, { status: 500 })
  }
} catch (fatal: any) {
    console.error('FATAL ERROR in avatar sync:', fatal);
    return NextResponse.json({ 
      error: 'fatal_error', 
      message: fatal.message, 
      stack: fatal.stack 
    }, { status: 500 });
  }
}
