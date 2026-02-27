import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import {
  getAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  setAchievements
} from '@/lib/achievements'

async function authenticate(request: NextRequest): Promise<{ authorized: boolean; error?: NextResponse }> {
  const authHeader = request.headers.get('authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'No token provided' },
        { status: 401 }
      )
    }
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }

  return { authorized: true }
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const achievements = await getAchievements()
    return NextResponse.json({ success: true, data: achievements })
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { year, achievement } = body

    if (!year || !achievement) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Year and achievement are required' },
        { status: 400 }
      )
    }

    const yearNum = parseInt(year)
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Year must be a valid year between 1900 and 2100' },
        { status: 400 }
      )
    }

    if (typeof achievement !== 'string' || achievement.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Achievement must be a non-empty string' },
        { status: 400 }
      )
    }

    const achievements = await addAchievement(yearNum.toString(), achievement.trim())

    return NextResponse.json(
      { success: true, message: 'Achievement added successfully', data: achievements },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add achievement error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to add achievement' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { year, index, achievement } = body

    if (!year || index === undefined || !achievement) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Year, index, and achievement are required' },
        { status: 400 }
      )
    }

    const indexNum = parseInt(index)
    if (isNaN(indexNum) || indexNum < 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Index must be a non-negative number' },
        { status: 400 }
      )
    }

    if (typeof achievement !== 'string' || achievement.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Achievement must be a non-empty string' },
        { status: 400 }
      )
    }

    const achievements = await updateAchievement(year, indexNum, achievement.trim())

    if (!achievements) {
      return NextResponse.json(
        { error: 'Not found', message: 'Achievement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievements
    })
  } catch (error) {
    console.error('Update achievement error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update achievement' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { year, index } = body

    if (!year || index === undefined) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Year and index are required' },
        { status: 400 }
      )
    }

    const indexNum = parseInt(index)
    if (isNaN(indexNum) || indexNum < 0) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Index must be a non-negative number' },
        { status: 400 }
      )
    }

    const achievements = await deleteAchievement(year, indexNum)

    if (!achievements) {
      return NextResponse.json(
        { error: 'Not found', message: 'Achievement not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully',
      data: achievements
    })
  } catch (error) {
    console.error('Delete achievement error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete achievement' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticate(request)
  if (!auth.authorized) return auth.error

  try {
    const body = await request.json()
    const { achievements } = body

    if (!achievements || typeof achievements !== 'object') {
      return NextResponse.json(
        { error: 'Bad request', message: 'Achievements object is required' },
        { status: 400 }
      )
    }

    for (const [year, items] of Object.entries(achievements)) {
      if (!/^\d{4}$/.test(year)) {
        return NextResponse.json(
          { error: 'Bad request', message: `Invalid year format: ${year}` },
          { status: 400 }
        )
      }
      if (!Array.isArray(items)) {
        return NextResponse.json(
          { error: 'Bad request', message: `Achievements for year ${year} must be an array` },
          { status: 400 }
        )
      }
    }

    await setAchievements(achievements)

    return NextResponse.json({
      success: true,
      message: 'Achievements updated successfully',
      data: achievements
    })
  } catch (error) {
    console.error('Batch update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to update achievements' },
      { status: 500 }
    )
  }
}
