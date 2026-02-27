import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getBirthday, setBirthday } from '@/lib/achievements'

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

  const birthday = await getBirthday()
  return NextResponse.json({ success: true, data: birthday })
}

export async function PUT(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { birthday } = body

    if (!birthday || typeof birthday !== 'string' || birthday.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Birthday must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birthday.trim())) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Birthday must be in YYYY-MM-DD format' },
        { status: 400 }
      )
    }

    await setBirthday(birthday.trim())
    return NextResponse.json({ success: true, message: 'Birthday updated', data: birthday.trim() })
  } catch (error) {
    console.error('Update birthday error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update birthday' },
      { status: 500 }
    )
  }
}
