import { getAchievements } from '@/lib/achievements'
import ProfilePage from './ProfilePage'

export default async function Home() {
  const achievements = await getAchievements()
  
  return <ProfilePage achievements={achievements} />
}
