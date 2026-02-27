'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

interface ProfilePageProps {
  achievements: Record<string, string[]>
}

export default function ProfilePage({ achievements }: ProfilePageProps) {
  const [mounted, setMounted] = useState(false)
  const [isLightMode, setIsLightMode] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsLightMode(true)
      document.body.classList.add('light-mode')
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      // Initialize AOS
      const initAOS = async () => {
        const AOS = (await import('aos')).default
        AOS.init()
      }
      initAOS()

      // Initialize particles
      const initParticles = async () => {
        const particlesJS = (window as unknown as { particlesJS?: unknown }).particlesJS
        if (particlesJS) {
          ;(particlesJS as (id: string, config: unknown) => void)('particles-js', {
            particles: {
              number: { value: 50, density: { enable: true, value_area: 800 } },
              shape: { type: 'circle', stroke: { width: 0, color: isLightMode ? '#121212' : '#ffffff' } },
              opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
              size: { value: 3, random: true, anim: { enable: true, speed: 4, size_min: 0.1 } },
              line_linked: {
                enable: true,
                distance: 150,
                color: isLightMode ? '#1976d2' : '#ffffff',
                opacity: isLightMode ? 1 : 0.4,
                width: 1
              },
              move: {
                enable: true,
                speed: 3,
                direction: 'random',
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

      // Load particles.js script
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0'
      script.onload = initParticles
      document.body.appendChild(script)
    }
  }, [mounted, isLightMode])

  const toggleTheme = () => {
    setIsLightMode(!isLightMode)
    document.body.classList.toggle('light-mode')
    localStorage.setItem('theme', !isLightMode ? 'light' : 'dark')
  }

  // Calculate age
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

  const liveCounter = `${years} years, ${months} months, and ${days} days`

  const sortedYears = Object.keys(achievements).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <>
      <div id="particles-js" className={styles.particles}></div>

      <nav className={styles.navbar}>
        <a href="https://blog.abyn.xyz" target="_blank" rel="noopener noreferrer">Blog</a>
        <a href="https://note.abyn.xyz" target="_blank" rel="noopener noreferrer">Note</a>
      </nav>

      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle Dark/Light Mode"
      >
        🌓
      </button>

      <main className={styles.container}>
        <h1 data-aos="fade-down">Abyan&apos;s Profile</h1>
        <p data-aos="fade-up" data-aos-delay="200">
          Hi! My name is Abyan. I&apos;m a 10th grader, and I&apos;m {liveCounter} old. Take a look at my profile!
        </p>

        <div className={styles.mediaContainer}>
          <iframe
            src="https://www.instagram.com/abyb.1/embed"
            className={`${styles.instagramEmbed} ${isLightMode ? styles.light : ''}`}
            frameBorder="0"
            scrolling="no"
            allowTransparency
            data-aos="zoom-in"
            data-aos-delay="400"
          />
          <img
            src="https://i.imgur.com/UUigaWa.jpeg"
            alt="Abyan's Image"
            className={`${styles.profileImage} ${isLightMode ? styles.light : ''}`}
            loading="lazy"
            data-aos="zoom-in"
            data-aos-delay="600"
          />
        </div>

        <div className={styles.searchContainer} data-aos="zoom-in-up" data-aos-delay="200">
          <input
            type="text"
            id="achievement-search"
            placeholder="Search achievements..."
            aria-label="Search Achievements"
            className={isLightMode ? styles.light : ''}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <h2 data-aos="fade-up" data-aos-delay="800">Achievements</h2>
        <div className={styles.achievements} data-aos="fade-up" data-aos-delay="1000">
          {sortedYears.map((year) => (
            <div key={year} className={styles.yearGroup}>
              <div className={styles.yearTitle}>{year}</div>
              {achievements[year].map((achievement, index) => (
                <div key={index} className={styles.achievement}>
                  {achievement}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      <a
        href="mailto:abyn@abyn.xyz"
        className={styles.contactButton}
        data-aos="fade-up"
        data-aos-delay="1200"
      >
        Contact Me
      </a>

      <link href="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.css" rel="stylesheet" />
    </>
  )
}
