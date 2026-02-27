import { getAchievements, getGrade } from '@/lib/achievements'
import ProfilePage from './ProfilePage'

export default async function Home() {
  const [achievements, grade] = await Promise.all([
    getAchievements(),
    getGrade()
  ])

  return <ProfilePage achievements={achievements} grade={grade} />
}
