import { NextResponse } from 'next/server'
import { isAdminSetup } from '@/lib/achievements'

export async function GET() {
  try {
    const setupComplete = await isAdminSetup()

    return NextResponse.json({
      success: true,
      setupRequired: !setupComplete,
      message: setupComplete
        ? 'Admin account is configured'
        : 'Please setup admin account at /api/auth/setup'
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to check status' },
      { status: 500 }
    )
  }
}
