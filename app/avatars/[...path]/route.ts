import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathParams = params.path
  if (!pathParams || pathParams.length === 0) {
    return new NextResponse('Not found', { status: 404 })
  }

  // The DB stores "avatars/workspaceId/contacts/phone.jpg"
  // The URL is /avatars/workspaceId/contacts/phone.jpg
  // params.path is ['workspaceId', 'contacts', 'phone.jpg']
  // We need to reconstruct the path expected by storage.
  // The file is stored at "avatars/" + params.path.join('/')
  
  const storagePath = 'avatars/' + pathParams.join('/')

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.storage
    .from('avatars')
    .download(storagePath)

  if (error) {
    console.error(`[Avatar Proxy] Error downloading ${storagePath}:`, error.message)
    return new NextResponse('Image not found', { status: 404 })
  }

  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
