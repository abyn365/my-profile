import { NextResponse } from 'next/server'
import { getAchievements } from '@/lib/achievements'

export async function GET() {
  try {
    const achievements = await getAchievements()

    return NextResponse.json(
      { success: true, data: achievements },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}
