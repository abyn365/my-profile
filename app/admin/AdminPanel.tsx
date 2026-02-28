'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './admin.module.css'

interface AchievementsData {
  [year: string]: string[]
}

interface FilteredAchievement {
  text: string
  index: number
}

export default function AdminPanel() {
  const [token, setToken] = useState<string | null>(null)
  const [setupRequired, setSetupRequired] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [achievements, setAchievements] = useState<AchievementsData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Auth form states
  const [setupPassword, setSetupPassword] = useState('')
  const [setupConfirm, setSetupConfirm] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Profile settings states
  const [grade, setGrade] = useState('')
  const [gradeInput, setGradeInput] = useState('')
  const [bio, setBio] = useState('')
  const [bioInput, setBioInput] = useState('')
  const [birthday, setBirthday] = useState('')
  const [birthdayInput, setBirthdayInput] = useState('')

  // Achievement form states
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()))
  const [newAchievement, setNewAchievement] = useState('')

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())

  // Bulk editor states
  const [bulkJson, setBulkJson] = useState('')

  // Modal states
  const [editModal, setEditModal] = useState<{ year: string; index: number; text: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ year: string; index: number; text: string } | null>(null)
  const [deleteYearModal, setDeleteYearModal] = useState<{ year: string; count: number } | null>(null)

  const passwordRequirements = {
    length: setupPassword.length >= 8,
    upper: /[A-Z]/.test(setupPassword),
    lower: /[a-z]/.test(setupPassword),
    number: /\d/.test(setupPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(setupPassword)
  }

  const checkAuthStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setSetupRequired(data.setupRequired)

      const savedToken = localStorage.getItem('adminToken')
      if (savedToken && !data.setupRequired) {
        setToken(savedToken)
        setIsAuthenticated(true)
      }
    } catch {
      setError('Failed to check auth status')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!token) return

    try {
      const [achievementsRes, gradeRes, bioRes, birthdayRes] = await Promise.all([
        fetch('/api/admin/achievements', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/grade', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/bio', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/birthday', { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (achievementsRes.status === 401) {
        localStorage.removeItem('adminToken')
        setToken(null)
        setIsAuthenticated(false)
        return
      }

      const achievementsData = await achievementsRes.json()
      if (achievementsData.success) setAchievements(achievementsData.data)

      if (gradeRes.ok) {
        const gradeData = await gradeRes.json()
        if (gradeData.success) {
          setGrade(gradeData.data)
          setGradeInput(gradeData.data)
        }
      }

      if (bioRes.ok) {
        const bioData = await bioRes.json()
        if (bioData.success) {
          setBio(bioData.data)
          setBioInput(bioData.data)
        }
      }

      if (birthdayRes.ok) {
        const birthdayData = await birthdayRes.json()
        if (birthdayData.success) {
          setBirthday(birthdayData.data)
          setBirthdayInput(birthdayData.data)
        }
      }
    } catch {
      setError('Failed to load data')
    }
  }, [token])

  useEffect(() => { checkAuthStatus() }, [checkAuthStatus])
  useEffect(() => { if (isAuthenticated) loadData() }, [isAuthenticated, loadData])
  useEffect(() => {
    setExpandedYears((prev) => {
      const next = new Set<string>()
      Object.keys(achievements).forEach((year) => {
        if (prev.has(year)) next.add(year)
      })
      return next
    })
  }, [achievements])

  const notify = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (setupPassword !== setupConfirm) { setError('Passwords do not match'); return }
    if (!Object.values(passwordRequirements).every(Boolean)) { setError('Password does not meet requirements'); return }
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: setupPassword })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Setup failed'); return }
      notify('Account created! Please login.')
      setSetupRequired(false)
      setSetupPassword('')
      setSetupConfirm('')
    } catch { setError('Setup failed') }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Login failed'); return }
      localStorage.setItem('adminToken', data.token)
      setToken(data.token)
      setIsAuthenticated(true)
      setLoginPassword('')
    } catch { setError('Login failed') }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setIsAuthenticated(false)
    setAchievements({})
  }

  const handleGradeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!gradeInput.trim()) { setError('Grade cannot be empty'); return }
    try {
      const res = await fetch('/api/admin/grade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grade: gradeInput.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update grade'); return }
      setGrade(data.data)
      notify('Grade updated!')
    } catch { setError('Failed to update grade') }
  }

  const handleBioUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!bioInput.trim()) { setError('Bio cannot be empty'); return }
    try {
      const res = await fetch('/api/admin/bio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bio: bioInput.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update bio'); return }
      setBio(data.data)
      notify('Bio updated!')
    } catch { setError('Failed to update bio') }
  }

  const handleBirthdayUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!birthdayInput.trim()) { setError('Birthday cannot be empty'); return }
    try {
      const res = await fetch('/api/admin/birthday', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ birthday: birthdayInput.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update birthday'); return }
      setBirthday(data.data)
      notify('Birthday updated!')
    } catch { setError('Failed to update birthday') }
  }

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedAchievement = newAchievement.trim()
    if (!trimmedAchievement) { setError('Achievement cannot be empty'); return }
    setError(null)
    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ year: newYear, achievement: trimmedAchievement })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to add achievement'); return }
      setAchievements(data.data)
      setNewAchievement('')
      notify('Achievement added!')
    } catch { setError('Failed to add achievement') }
  }

  const handleEditAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal) return
    setError(null)
    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ year: editModal.year, index: editModal.index, achievement: editModal.text })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update achievement'); return }
      setAchievements(data.data)
      setEditModal(null)
      notify('Achievement updated!')
    } catch { setError('Failed to update achievement') }
  }

  const handleDeleteAchievement = async () => {
    if (!deleteModal) return
    setError(null)
    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ year: deleteModal.year, index: deleteModal.index })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to delete achievement'); return }
      setAchievements(data.data)
      setDeleteModal(null)
      notify('Achievement deleted!')
    } catch { setError('Failed to delete achievement') }
  }

  const handleDeleteYear = async () => {
    if (!deleteYearModal || !token) return
    setError(null)
    try {
      const updatedAchievements = { ...achievements }
      delete updatedAchievements[deleteYearModal.year]

      const res = await fetch('/api/admin/achievements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ achievements: updatedAchievements })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to delete year'); return }
      setAchievements(data.data)
      setDeleteYearModal(null)
      notify('Year removed!')
    } catch { setError('Failed to delete year') }
  }

  const validateAchievementsPayload = (data: unknown): data is AchievementsData => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return false

    return Object.entries(data as Record<string, unknown>).every(([year, items]) => {
      if (!/^\d{4}$/.test(year)) return false
      if (!Array.isArray(items)) return false
      return items.every((item) => typeof item === 'string')
    })
  }

  const normalizeAchievementsPayload = (data: AchievementsData): AchievementsData => {
    const normalized: AchievementsData = {}
    for (const [year, items] of Object.entries(data)) {
      const cleaned = items.map((item) => item.trim()).filter(Boolean)
      normalized[year] = cleaned
    }
    return normalized
  }

  const handleBulkUpdate = async () => {
    if (!token) return
    setError(null)

    if (!bulkJson.trim()) {
      setError('Bulk editor is empty. Paste or load JSON to continue.')
      return
    }

    try {
      const parsed = JSON.parse(bulkJson)
      if (!validateAchievementsPayload(parsed)) {
        setError('Bulk JSON must be a year-to-achievements map with arrays of strings.')
        return
      }

      const normalized = normalizeAchievementsPayload(parsed)

      const res = await fetch('/api/admin/achievements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ achievements: normalized })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update achievements'); return }
      setAchievements(data.data)
      setBulkJson(JSON.stringify(data.data, null, 2))
      notify('Achievements updated in bulk!')
    } catch (err) {
      console.error(err)
      setError('Invalid JSON format. Please check your bulk data.')
    }
  }

  const handleBulkLoad = () => {
    setBulkJson(JSON.stringify(achievements, null, 2))
  }

  const handleBulkClear = () => {
    setBulkJson('')
  }

  const handleCopyJson = async () => {
    const payload = bulkJson.trim() || JSON.stringify(achievements, null, 2)
    try {
      await navigator.clipboard.writeText(payload)
      notify('JSON copied to clipboard!')
    } catch {
      setError('Failed to copy JSON. Please copy it manually.')
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBulkJson(reader.result)
        notify('File loaded into bulk editor.')
      } else {
        setError('Unable to read the file contents.')
      }
    }
    reader.onerror = () => setError('Failed to read the uploaded file.')
    reader.readAsText(file)
    event.target.value = ''
  }

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const next = new Set(prev)
      if (next.has(year)) {
        next.delete(year)
      } else {
        next.add(year)
      }
      return next
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setYearFilter('all')
  }

  const sortedYears = Object.keys(achievements).sort((a, b) => parseInt(b) - parseInt(a))
  const totalAchievements = sortedYears.reduce((sum, y) => sum + achievements[y].length, 0)

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const isFiltering = normalizedSearch.length > 0 || yearFilter !== 'all'

  const filteredAchievements = Object.entries(achievements).reduce(
    (acc, [year, items]) => {
      if (yearFilter !== 'all' && year !== yearFilter) return acc

      const filteredItems = items
        .map((text, index) => ({ text, index }))
        .filter(({ text }) => (normalizedSearch ? text.toLowerCase().includes(normalizedSearch) : true))

      if (filteredItems.length > 0) {
        acc[year] = filteredItems
      }

      return acc
    },
    {} as Record<string, FilteredAchievement[]>
  )

  const filteredYears = Object.keys(filteredAchievements).sort((a, b) => parseInt(b) - parseInt(a))
  const totalFilteredAchievements = filteredYears.reduce(
    (sum, year) => sum + filteredAchievements[year].length,
    0
  )

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <div className={styles.authLogo}>
            <span>⚙</span>
          </div>
          <a href="/" className={styles.backLink}>← Back to profile</a>

          {setupRequired ? (
            <>
              <h2>Create Admin Account</h2>
              <p className={styles.authSubtitle}>Set up your admin password to get started</p>
              {error && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}
              {success && <div className={styles.alert + ' ' + styles.alertSuccess}>{success}</div>}
              <form onSubmit={handleSetup} className={styles.form}>
                <div className={styles.field}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    required
                  />
                  <ul className={styles.requirements}>
                    {[
                      [passwordRequirements.length, 'At least 8 characters'],
                      [passwordRequirements.upper, 'One uppercase letter'],
                      [passwordRequirements.lower, 'One lowercase letter'],
                      [passwordRequirements.number, 'One number'],
                      [passwordRequirements.special, 'One special character'],
                    ].map(([met, label]) => (
                      <li key={label as string} className={met ? styles.reqMet : styles.reqUnmet}>
                        <span>{met ? '✓' : '○'}</span> {label as string}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.field}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                </div>
                <button type="submit" className={styles.btnPrimary}>Create Account</button>
              </form>
            </>
          ) : (
            <>
              <h2>Admin Login</h2>
              <p className={styles.authSubtitle}>Sign in to manage your profile</p>
              {error && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.field}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className={styles.btnPrimary}>Sign In</button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLeft}>
            <a href="/" className={styles.topbarBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Profile
            </a>
            <span className={styles.topbarTitle}>Admin Panel</span>
          </div>
          <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
        </div>
      </header>

      <div className={styles.content}>
        {error && <div className={styles.alert + ' ' + styles.alertError}>{error}</div>}
        {success && <div className={styles.alert + ' ' + styles.alertSuccess}>{success}</div>}

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{sortedYears.length}</span>
            <span className={styles.statLabel}>Years</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{totalAchievements}</span>
            <span className={styles.statLabel}>Achievements</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{grade || '—'}</span>
            <span className={styles.statLabel}>Current Grade</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {isFiltering ? `${totalFilteredAchievements} / ${totalAchievements}` : totalAchievements}
            </span>
            <span className={styles.statLabel}>Showing</span>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Settings</h2>
          <div className={styles.card}>
            <form onSubmit={handleGradeUpdate} className={styles.inlineForm}>
              <div className={styles.field}>
                <label>Grade / School Year</label>
                <input
                  type="text"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  placeholder="e.g. 10th grader"
                  required
                />
              </div>
              <button type="submit" className={styles.btnSave}>Save</button>
            </form>
            <form onSubmit={handleBioUpdate} className={styles.inlineForm} style={{ marginTop: '16px' }}>
              <div className={styles.field}>
                <label>Bio</label>
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Write a short bio..."
                  rows={2}
                  required
                />
              </div>
              <button type="submit" className={styles.btnSave}>Save</button>
            </form>
            <form onSubmit={handleBirthdayUpdate} className={styles.inlineForm} style={{ marginTop: '16px' }}>
              <div className={styles.field}>
                <label>Birthday (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={birthdayInput}
                  onChange={(e) => setBirthdayInput(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.btnSave}>Save</button>
            </form>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Add Achievement</h2>
          <div className={styles.card}>
            <form onSubmit={handleAddAchievement} className={styles.addRow}>
              <div className={styles.field} style={{ width: '130px', flexShrink: 0 }}>
                <label>Year</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  min={1900}
                  max={2100}
                  required
                />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label>Achievement</label>
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="Enter achievement description..."
                  required
                />
              </div>
              <button type="submit" className={styles.btnAdd}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                Add
              </button>
            </form>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Search & Filters</h2>
          <div className={styles.card}>
            <div className={styles.filterRow}>
              <div className={`${styles.field} ${styles.filterField}`}>
                <label>Search achievements</label>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by keyword..."
                />
              </div>
              <div className={styles.field}>
                <label>Year</label>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                  <option value="all">All years</option>
                  {sortedYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterActions}>
                <button type="button" className={styles.btnGhost} onClick={handleClearFilters}>Reset</button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setExpandedYears(new Set(filteredYears))}
                >
                  Expand All
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setExpandedYears(new Set())}
                >
                  Collapse All
                </button>
              </div>
            </div>
            <p className={styles.filterSummary}>
              {filteredYears.length === 0
                ? 'No achievements match the current filters.'
                : `Showing ${totalFilteredAchievements} achievements across ${filteredYears.length} years${isFiltering ? ' (filtered).' : '.'}`}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>All Achievements</h2>
          {filteredYears.length === 0 ? (
            <div className={styles.empty}>
              {isFiltering
                ? 'No achievements match the current filters. Try adjusting your search.'
                : 'No achievements yet. Add your first one above.'}
            </div>
          ) : (
            <div className={styles.yearList}>
              {filteredYears.map((year) => (
                <div key={year} className={styles.yearCard}>
                  <div className={styles.yearHeader}>
                    <button
                      className={styles.yearToggle}
                      onClick={() => toggleYear(year)}
                    >
                      <div className={styles.yearToggleLeft}>
                        <span className={styles.yearLabel}>{year}</span>
                        <span className={styles.yearCount}>
                          {isFiltering
                            ? `${filteredAchievements[year].length} / ${achievements[year].length}`
                            : achievements[year].length}
                        </span>
                      </div>
                      <svg className={`${styles.chevron} ${expandedYears.has(year) ? styles.chevronOpen : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <div className={styles.yearActions}>
                      <button
                        className={styles.btnYearDelete}
                        onClick={() => setDeleteYearModal({ year, count: achievements[year].length })}
                      >
                        Delete Year
                      </button>
                    </div>
                  </div>
                  <div className={`${styles.yearItems} ${expandedYears.has(year) ? styles.open : ''}`}>
                    {filteredAchievements[year].map(({ text, index }) => (
                      <div key={`${year}-${index}`} className={styles.achievementRow}>
                        <span className={styles.achievementText}>{text}</span>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => setEditModal({ year, index, text })}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => setDeleteModal({ year, index, text })}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bulk Editor</h2>
          <div className={styles.card}>
            <p className={styles.helperText}>
              Paste JSON to replace your achievements, or load the current data to make quick edits.
            </p>
            <div className={styles.bulkControls}>
              <button type="button" className={styles.btnGhost} onClick={handleBulkLoad}>Load Current Data</button>
              <button type="button" className={styles.btnGhost} onClick={handleCopyJson}>Copy JSON</button>
              <label className={styles.fileButton}>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleFileImport}
                />
                Import JSON
              </label>
            </div>
            <textarea
              className={styles.bulkTextarea}
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              placeholder={`{\n  "2024": ["Achievement one"],\n  "2023": ["Achievement two"]\n}`}
              rows={8}
            />
            <div className={styles.bulkActions}>
              <button type="button" className={styles.btnDanger} onClick={handleBulkClear}>Clear</button>
              <button type="button" className={styles.btnPrimary} onClick={handleBulkUpdate}>Apply Updates</button>
            </div>
          </div>
        </section>
      </div>

      {editModal && (
        <div className={styles.overlay} onClick={() => setEditModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Achievement</h3>
            <form onSubmit={handleEditAchievement} className={styles.form}>
              <div className={styles.field}>
                <label>Achievement</label>
                <textarea
                  value={editModal.text}
                  onChange={(e) => setEditModal({ ...editModal, text: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnGhost} onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className={styles.btnPrimary}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className={styles.overlay} onClick={() => setDeleteModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Achievement</h3>
            <p className={styles.modalBody}>Are you sure you want to delete this achievement?</p>
            <p className={styles.deletePreview}>{deleteModal.text}</p>
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className={styles.btnDanger} onClick={handleDeleteAchievement}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteYearModal && (
        <div className={styles.overlay} onClick={() => setDeleteYearModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Year</h3>
            <p className={styles.modalBody}>
              This will permanently remove all achievements for {deleteYearModal.year}.
            </p>
            <p className={styles.deletePreview}>
              {deleteYearModal.count} achievements will be deleted.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setDeleteYearModal(null)}>Cancel</button>
              <button className={styles.btnDanger} onClick={handleDeleteYear}>Delete Year</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
