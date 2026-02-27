'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

interface ProfilePageProps {
  achievements: Record<string, string[]>
}

function calcAge() {
  const birthDate = new Date('2009-04-08')
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

export default function ProfilePage({ achievements }: ProfilePageProps) {
  const [mounted, setMounted] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
              <div className={styles.avatarInitials}>A</div>
            </div>
            <span className={styles.onlineDot} title="Open to connect" />
          </div>
          <h1>Abyan</h1>
          <p className={styles.tagline}>
            10th grader
            {mounted && (
              <> · <span suppressHydrationWarning>{calcAge()}</span> old</>
            )}
          </p>
          <p className={styles.bio}>
            Student, builder, and curious mind. Take a look around!
          </p>
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
        </div>

        <div className={styles.divider} data-aos="fade-up" data-aos-delay="100" />

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
