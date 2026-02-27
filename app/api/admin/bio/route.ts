import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getBio, setBio } from '@/lib/achievements'

async function authenticate(request: NextRequest): Promise<{ authorized: boolean; error?: NextResponse }> {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized', message: 'No token provided' }, { status: 401 })
    }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Unauthorized', message: 'Invalid or expired token' }, { status: 401 })
    }
  }

  return { authorized: true }
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  const bio = await getBio()
  return NextResponse.json({ success: true, data: bio })
}

export async function PUT(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { bio } = body

    if (!bio || typeof bio !== 'string' || bio.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Bio must be a non-empty string' },
        { status: 400 }
      )
    }

    await setBio(bio.trim())
    return NextResponse.json({ success: true, message: 'Bio updated', data: bio.trim() })
  } catch (error) {
    console.error('Update bio error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update bio' },
      { status: 500 }
    )
  }
}
