import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getGrade, setGrade } from '@/lib/achievements'

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

  const grade = await getGrade()
  return NextResponse.json({ success: true, data: grade })
}

export async function PUT(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { grade } = body

    if (!grade || typeof grade !== 'string' || grade.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Grade must be a non-empty string' },
        { status: 400 }
      )
    }

    await setGrade(grade.trim())
    return NextResponse.json({ success: true, message: 'Grade updated', data: grade.trim() })
  } catch (error) {
    console.error('Update grade error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update grade' },
      { status: 500 }
    )
  }
}
