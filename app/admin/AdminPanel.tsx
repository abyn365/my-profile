'use client'

import { useEffect, useState, useCallback } from 'react'
import styles from './admin.module.css'

interface AchievementsData {
  [year: string]: string[]
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

  // Achievement form states
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()))
  const [newAchievement, setNewAchievement] = useState('')

  // Modal states
  const [editModal, setEditModal] = useState<{ year: string; index: number; text: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ year: string; index: number; text: string } | null>(null)

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
      const [achievementsRes, gradeRes, bioRes] = await Promise.all([
        fetch('/api/admin/achievements', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/grade', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/bio', { headers: { Authorization: `Bearer ${token}` } })
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
    } catch {
      setError('Failed to load data')
    }
  }, [token])

  useEffect(() => { checkAuthStatus() }, [checkAuthStatus])
  useEffect(() => { if (isAuthenticated) loadData() }, [isAuthenticated, loadData])

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

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ year: newYear, achievement: newAchievement })
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

  const sortedYears = Object.keys(achievements).sort((a, b) => parseInt(b) - parseInt(a))
  const totalAchievements = sortedYears.reduce((sum, y) => sum + achievements[y].length, 0)

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
          <h2 className={styles.sectionTitle}>All Achievements</h2>
          {sortedYears.length === 0 ? (
            <div className={styles.empty}>No achievements yet. Add your first one above.</div>
          ) : (
            <div className={styles.yearList}>
              {sortedYears.map((year) => (
                <div key={year} className={styles.yearCard}>
                  <button
                    className={styles.yearToggle}
                    onClick={() => {
                      const el = document.getElementById(`year-${year}`)
                      el?.classList.toggle(styles.open)
                    }}
                  >
                    <div className={styles.yearToggleLeft}>
                      <span className={styles.yearLabel}>{year}</span>
                      <span className={styles.yearCount}>{achievements[year].length}</span>
                    </div>
                    <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div id={`year-${year}`} className={styles.yearItems}>
                    {achievements[year].map((achievement, index) => (
                      <div key={index} className={styles.achievementRow}>
                        <span className={styles.achievementText}>{achievement}</span>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.btnEdit}
                            onClick={() => setEditModal({ year, index, text: achievement })}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.btnDelete}
                            onClick={() => setDeleteModal({ year, index, text: achievement })}
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
    </div>
  )
}
