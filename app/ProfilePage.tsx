'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

const DISCORD_USER_ID = '877018055815868426'

const STATUS_ICONS: Record<string, string> = {
  online: 'https://cdn3.emoji.gg/emojis/1514-online-blank.png',
  idle: 'https://cdn3.emoji.gg/emojis/5204-idle-blank.png',
  dnd: 'https://cdn3.emoji.gg/emojis/4431-dnd-blank.png',
  offline: 'https://cdn3.emoji.gg/emojis/6610-invisible-offline-blank.png',
}

interface LanyardData {
  discord_status: 'online' | 'idle' | 'dnd' | 'offline'
  discord_user: {
    id: string
    avatar: string | null
    username: string
  }
}

interface ProfilePageProps {
  achievements: Record<string, string[]>
  grade: string
  bio: string
  birthday: string
}

function calcAge(birthday: string) {
  const birthDate = new Date(birthday)
  const now = new Date()
  let years = now.getFullYear() - birthDate.getFullYear()
  let months = now.getMonth() - birthDate.getMonth()
  let days = now.getDate() - birthDate.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return `${years} years, ${months} months, and ${days} days`
}

function calcYearsActive(achievements: Record<string, string[]>) {
  const years = Object.keys(achievements).length
  return years
}

function calcTotalAchievements(achievements: Record<string, string[]>) {
  return Object.values(achievements).reduce((sum, arr) => sum + arr.length, 0)
}

function getDiscordAvatar(userId: string, avatarId: string): string {
  const isAnimated = avatarId.startsWith('a_')
  const extension = isAnimated ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.${extension}?size=256`
}

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export default function ProfilePage({ achievements, grade, bio, birthday }: ProfilePageProps) {
  const [mounted, setMounted] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [discordData, setDiscordData] = useState<LanyardData | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsLightMode(true)
      document.body.classList.add('light-mode')
    }
  }, [])

  useEffect(() => {
    const fetchLanyard = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) setDiscordData(json.data)
        }
      } catch {
        // silently ignore
      }
    }

    fetchLanyard()
    const interval = setInterval(fetchLanyard, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const initAOS = async () => {
      const AOS = (await import('aos')).default
      AOS.init({ once: true, duration: 700 })
    }
    initAOS()

    const initParticles = async () => {
      const particlesJS = (window as unknown as { particlesJS?: unknown }).particlesJS
      if (particlesJS) {
        ;(particlesJS as (id: string, config: unknown) => void)('particles-js', {
          particles: {
            number: { value: 40, density: { enable: true, value_area: 900 } },
            shape: { type: 'circle', stroke: { width: 0, color: '#000' } },
            opacity: { value: 0.35, random: true, anim: { enable: true, speed: 1, opacity_min: 0.05 } },
            size: { value: 2.5, random: true, anim: { enable: true, speed: 3, size_min: 0.1 } },
            line_linked: {
              enable: true,
              distance: 160,
              color: isLightMode ? '#1976d2' : '#4fc3f7',
              opacity: isLightMode ? 0.5 : 0.25,
              width: 1
            },
            move: {
              enable: true,
              speed: 2,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out'
            }
          },
          interactivity: {
            detect_on: 'window',
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' },
              resize: true
            }
          },
          retina_detect: true
        })
      }
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0'
    script.onload = initParticles
    document.body.appendChild(script)
  }, [mounted, isLightMode])

  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev
      document.body.classList.toggle('light-mode', next)
      localStorage.setItem('theme', next ? 'light' : 'dark')
      return next
    })
  }

  const sortedYears = Object.keys(achievements).sort((a, b) => parseInt(b) - parseInt(a))

  const filteredAchievements = sortedYears.reduce<Record<string, string[]>>((acc, year) => {
    const q = searchQuery.toLowerCase()
    const filtered = achievements[year].filter(
      (a) => a.toLowerCase().includes(q) || year.includes(q)
    )
    if (filtered.length > 0) acc[year] = filtered
    return acc
  }, {})

  const filteredYears = Object.keys(filteredAchievements).sort((a, b) => parseInt(b) - parseInt(a))

  const status = discordData?.discord_status ?? 'offline'
  const avatarId = discordData?.discord_user?.avatar
  const avatarUrl = avatarId ? getDiscordAvatar(DISCORD_USER_ID, avatarId) : null

  return (
    <>
      <div id="particles-js" className={styles.particles} />

      <nav className={styles.navbar}>
        <span className={styles.navBrand}>abyn.xyz</span>
      </nav>

      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle Dark/Light Mode"
        suppressHydrationWarning
      >
        {mounted ? (isLightMode ? '🌙' : '☀️') : '🌓'}
      </button>

      <main className={styles.container}>
        <div className={styles.hero} data-aos="fade-down">
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarRing}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Abyan's Discord Avatar"
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarInitials}>A</div>
              )}
            </div>
            <img
              src={STATUS_ICONS[status] ?? STATUS_ICONS.offline}
              alt={status}
              className={styles.statusIcon}
              title={`Discord: ${status}`}
            />
          </div>
          <h1>Abyan</h1>
          <p className={styles.bio}>{bio}</p>

          <p className={styles.ageLine} data-aos="fade-up" data-aos-delay="100">
            {mounted && (
              <span suppressHydrationWarning>I'm {calcAge(birthday)} old</span>
            )}
          </p>

          <div className={styles.statsRow} data-aos="fade-up" data-aos-delay="150">
            <div className={styles.statCard}>
              <span className={styles.statValue}>{calcYearsActive(achievements)}</span>
              <span className={styles.statLabel}>Years Active</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{calcTotalAchievements(achievements)}</span>
              <span className={styles.statLabel}>Achievements</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{grade}</span>
              <span className={styles.statLabel}>Current Grade</span>
            </div>
          </div>

          <a
            href="https://abyn.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.biolinksButton}
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <IconLink />
            Visit my links
          </a>

          <div className={styles.scrollIndicator} data-aos="fade-up" data-aos-delay="300">
            <span className={styles.scrollText}>Scroll to explore achievements</span>
            <svg className={styles.scrollChevron} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        <div className={styles.divider} data-aos="fade-up" data-aos-delay="250" />

        <div className={styles.searchContainer} data-aos="fade-up" data-aos-delay="150">
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search achievements..."
            aria-label="Search Achievements"
          />
          {mounted && searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <h2 data-aos="fade-up" data-aos-delay="200">Achievements</h2>

        {filteredYears.length === 0 ? (
          <p className={styles.noResults} data-aos="fade-up">No achievements found.</p>
        ) : (
          <div className={styles.achievements} data-aos="fade-up" data-aos-delay="250">
            {filteredYears.map((year) => (
              <div key={year} className={styles.yearGroup}>
                <div className={styles.yearTitle}>
                  <span className={styles.yearBadge}>{year}</span>
                </div>
                {filteredAchievements[year].map((achievement, index) => (
                  <div key={index} className={styles.achievement}>
                    <span className={styles.achievementDot} />
                    {achievement}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      <a
        href="mailto:abyn@abyn.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.contactButton}
      >
        <IconMail />
        Contact Me
      </a>

      <link href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css" rel="stylesheet" />
    </>
  )
}
