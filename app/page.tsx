import { getAchievements, getGrade, getBio, getBirthday } from '@/lib/achievements'
import ProfilePage from './ProfilePage'

export default async function Home() {
  const [achievements, grade, bio, birthday] = await Promise.all([
    getAchievements(),
    getGrade(),
    getBio(),
    getBirthday()
  ])

  return <ProfilePage achievements={achievements} grade={grade} bio={bio} birthday={birthday} />
}
