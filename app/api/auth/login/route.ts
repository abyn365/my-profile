import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, generateToken } from '@/lib/auth'
import { getAdmin, isAdminSetup } from '@/lib/achievements'

export async function POST(request: NextRequest) {
  try {
    const setupComplete = await isAdminSetup()
    if (!setupComplete) {
      return NextResponse.json(
        {
          error: 'Not setup',
          message: 'Admin account not created. Please run setup first at /api/auth/setup'
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Password is required' },
        { status: 400 }
      )
    }

    const admin = await getAdmin()

    if (!admin || !admin.hashedPassword) {
      return NextResponse.json(
        { error: 'Configuration error', message: 'Admin account data is corrupted' },
        { status: 500 }
      )
    }

    const isValid = comparePassword(password, admin.hashedPassword)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = generateToken({
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      expiresIn: '2h'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
