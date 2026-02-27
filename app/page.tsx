import { getAchievements, getGrade, getBio } from '@/lib/achievements'
import ProfilePage from './ProfilePage'

export default async function Home() {
  const [achievements, grade, bio] = await Promise.all([
    getAchievements(),
    getGrade(),
    getBio()
  ])

  return <ProfilePage achievements={achievements} grade={grade} bio={bio} />
}
