import { Redis } from '@upstash/redis'
import achievementsData from '@/data/achievements.json'

const KEY_PREFIX = 'abyan-profile:'
const ACHIEVEMENTS_KEY = `${KEY_PREFIX}achievements`
const ADMIN_KEY = `${KEY_PREFIX}admin`

type AchievementsData = Record<string, string[]>
interface AdminData {
  hashedPassword: string
  createdAt: string
}

let redis: Redis | null = null
let cachedAchievements: AchievementsData | null = null
let cachedAdmin: AdminData | null = null

function resolveRedisCredentials(): { url: string; token: string } | null {
  const urlKey = Object.keys(process.env).find((k) => k.endsWith('_KV_REST_API_URL'))
  if (!urlKey) return null

  const prefix = urlKey.slice(0, urlKey.indexOf('_KV_REST_API_URL'))
  const tokenKey = `${prefix}_KV_REST_API_TOKEN`
  const url = process.env[urlKey]
  const token = process.env[tokenKey]

  if (url && token) return { url, token }
  return null
}

function getRedis(): Redis | null {
  if (redis) return redis

  try {
    const credentials = resolveRedisCredentials()
    if (credentials) {
      redis = new Redis(credentials)
      return redis
    }
  } catch {
    console.log('Redis not available, using in-memory storage')
  }

  return null
}

function getInitialAchievements(): AchievementsData {
  if (cachedAchievements) {
    return cachedAchievements
  }

  cachedAchievements = achievementsData as AchievementsData
  return cachedAchievements
}

export async function getAchievements(): Promise<AchievementsData> {
  const client = getRedis()

  try {
    if (client) {
      const achievements = await client.get<AchievementsData>(ACHIEVEMENTS_KEY)
      if (achievements) {
        return achievements
      }
    }
  } catch (error) {
    console.error('Redis read error:', error)
  }

  if (cachedAchievements) {
    return cachedAchievements
  }

  const initialData = getInitialAchievements()
  cachedAchievements = initialData

  if (client) {
    try {
      await client.set(ACHIEVEMENTS_KEY, initialData)
    } catch (error) {
      console.error('Redis write error:', error)
    }
  }

  return initialData
}

export async function setAchievements(achievements: AchievementsData): Promise<boolean> {
  cachedAchievements = achievements

  const client = getRedis()
  if (client) {
    try {
      await client.set(ACHIEVEMENTS_KEY, achievements)
    } catch (error) {
      console.error('Redis write error:', error)
    }
  }

  return true
}

export async function addAchievement(year: string, achievement: string): Promise<AchievementsData> {
  const achievements = await getAchievements()

  if (!achievements[year]) {
    achievements[year] = []
  }

  achievements[year].push(achievement)
  await setAchievements(achievements)

  return achievements
}

export async function updateAchievement(
  year: string,
  index: number,
  newAchievement: string
): Promise<AchievementsData | null> {
  const achievements = await getAchievements()

  if (!achievements[year] || achievements[year][index] === undefined) {
    return null
  }

  achievements[year][index] = newAchievement
  await setAchievements(achievements)

  return achievements
}

export async function deleteAchievement(
  year: string,
  index: number
): Promise<AchievementsData | null> {
  const achievements = await getAchievements()

  if (!achievements[year] || achievements[year][index] === undefined) {
    return null
  }

  achievements[year].splice(index, 1)

  if (achievements[year].length === 0) {
    delete achievements[year]
  }

  await setAchievements(achievements)

  return achievements
}

export async function getAdmin(): Promise<AdminData | null> {
  const client = getRedis()

  if (client) {
    try {
      return await client.get<AdminData>(ADMIN_KEY)
    } catch (error) {
      console.error('Redis read error:', error)
    }
  }

  return cachedAdmin
}

export async function setAdmin(hashedPassword: string): Promise<boolean> {
  const adminData: AdminData = {
    hashedPassword,
    createdAt: new Date().toISOString()
  }

  cachedAdmin = adminData

  const client = getRedis()
  if (client) {
    try {
      await client.set(ADMIN_KEY, adminData)
      return true
    } catch (error) {
      console.error('Redis write error:', error)
    }
  }

  return true
}

export async function isAdminSetup(): Promise<boolean> {
  const admin = await getAdmin()
  return !!admin && !!admin.hashedPassword
}
