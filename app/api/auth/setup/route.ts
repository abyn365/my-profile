import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'
import { setAdmin, isAdminSetup } from '@/lib/achievements'

export async function POST(request: NextRequest) {
  try {
    const alreadySetup = await isAdminSetup()
    if (alreadySetup) {
      return NextResponse.json(
        {
          error: 'Already setup',
          message: 'Admin account already exists. If you need to reset, clear the KV store.'
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

    const validation = validatePasswordStrength(password)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Weak password',
          message: 'Password does not meet security requirements',
          requirements: validation.errors
        },
        { status: 400 }
      )
    }

    const hashedPassword = hashPassword(password)
    const success = await setAdmin(hashedPassword)

    if (!success) {
      return NextResponse.json(
        {
          error: 'Setup failed',
          message: 'Failed to create admin account. Make sure Vercel KV is configured.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin account created successfully. You can now login.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
