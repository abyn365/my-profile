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

  // Form states
  const [setupPassword, setSetupPassword] = useState('')
  const [setupConfirm, setSetupConfirm] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [newYear, setNewYear] = useState('2025')
  const [newAchievement, setNewAchievement] = useState('')
  const [grade, setGrade] = useState('')
  const [gradeInput, setGradeInput] = useState('')

  // Modal states
  const [editModal, setEditModal] = useState<{ year: string; index: number; text: string } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ year: string; index: number; text: string } | null>(null)

  // Password validation
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

  const loadAchievements = useCallback(async () => {
    if (!token) return
    
    try {
      const [achievementsRes, gradeRes] = await Promise.all([
        fetch('/api/admin/achievements', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/grade', { headers: { Authorization: `Bearer ${token}` } })
      ])
      
      if (achievementsRes.status === 401) {
        localStorage.removeItem('adminToken')
        setToken(null)
        setIsAuthenticated(false)
        return
      }
      
      const achievementsData = await achievementsRes.json()
      if (achievementsData.success) {
        setAchievements(achievementsData.data)
      }

      if (gradeRes.ok) {
        const gradeData = await gradeRes.json()
        if (gradeData.success) {
          setGrade(gradeData.data)
          setGradeInput(gradeData.data)
        }
      }
    } catch {
      setError('Failed to load data')
    }
  }, [token])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  useEffect(() => {
    if (isAuthenticated) {
      loadAchievements()
    }
  }, [isAuthenticated, loadAchievements])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (setupPassword !== setupConfirm) {
      setError('Passwords do not match')
      return
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
      setError('Password does not meet requirements')
      return
    }

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: setupPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Setup failed')
        return
      }

      setSuccess('Account created! Please login.')
      setSetupRequired(false)
      setSetupPassword('')
      setSetupConfirm('')
    } catch {
      setError('Setup failed')
    }
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

      if (!res.ok) {
        setError(data.message || 'Login failed')
        return
      }

      localStorage.setItem('adminToken', data.token)
      setToken(data.token)
      setIsAuthenticated(true)
      setLoginPassword('')
    } catch {
      setError('Login failed')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setIsAuthenticated(false)
    setAchievements({})
  }

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ year: newYear, achievement: newAchievement })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to add achievement')
        return
      }

      setAchievements(data.data)
      setNewAchievement('')
      setSuccess('Achievement added!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to add achievement')
    }
  }

  const handleEditAchievement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModal) return
    setError(null)

    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          year: editModal.year,
          index: editModal.index,
          achievement: editModal.text
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to update achievement')
        return
      }

      setAchievements(data.data)
      setEditModal(null)
      setSuccess('Achievement updated!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to update achievement')
    }
  }

  const handleDeleteAchievement = async () => {
    if (!deleteModal) return
    setError(null)

    try {
      const res = await fetch('/api/admin/achievements', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          year: deleteModal.year,
          index: deleteModal.index
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to delete achievement')
        return
      }

      setAchievements(data.data)
      setDeleteModal(null)
      setSuccess('Achievement deleted!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to delete achievement')
    }
  }

  const handleGradeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!gradeInput.trim()) {
      setError('Grade cannot be empty')
      return
    }

    try {
      const res = await fetch('/api/admin/grade', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ grade: gradeInput.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to update grade')
        return
      }

      setGrade(data.data)
      setSuccess('Grade updated!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to update grade')
    }
  }

  const sortedYears = Object.keys(achievements).sort((a, b) => parseInt(b) - parseInt(a))

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.authContainer}>
          <a href="/" className={styles.backLink}>← Back to Profile</a>

          {setupRequired ? (
            <>
              <h2>Create Admin Account</h2>
              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}
              <form onSubmit={handleSetup}>
                <div className={styles.formGroup}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <div className={styles.requirements}>
                    <p>Password must have:</p>
                    <ul>
                      <li className={passwordRequirements.length ? styles.valid : styles.invalid}>
                        At least 8 characters
                      </li>
                      <li className={passwordRequirements.upper ? styles.valid : styles.invalid}>
                        One uppercase letter
                      </li>
                      <li className={passwordRequirements.lower ? styles.valid : styles.invalid}>
                        One lowercase letter
                      </li>
                      <li className={passwordRequirements.number ? styles.valid : styles.invalid}>
                        One number
                      </li>
                      <li className={passwordRequirements.special ? styles.valid : styles.invalid}>
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={setupConfirm}
                    onChange={(e) => setSetupConfirm(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.primaryBtn}>Create Account</button>
              </form>
            </>
          ) : (
            <>
              <h2>Admin Login</h2>
              {error && <div className={styles.error}>{error}</div>}
              <form onSubmit={handleLogin}>
                <div className={styles.formGroup}>
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className={styles.primaryBtn}>Login</button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏆 Achievement Manager</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </div>

      <a href="/" className={styles.backLink}>← Back to Profile</a>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.addForm}>
        <h3>Profile Settings</h3>
        <form onSubmit={handleGradeUpdate}>
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Grade / School Year</label>
              <input
                type="text"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="e.g. 10th grader"
                required
              />
            </div>
            <button type="submit" className={styles.primaryBtn} style={{ width: 'auto', whiteSpace: 'nowrap' }}>
              Save Grade
            </button>
          </div>
          {grade && (
            <p style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Current: <strong style={{ color: 'var(--accent-color)' }}>{grade}</strong>
            </p>
          )}
        </form>
      </div>

      <div className={styles.addForm}>
        <h3>Add New Achievement</h3>
        <form onSubmit={handleAddAchievement}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
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
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>Achievement</label>
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Enter achievement..."
                required
              />
            </div>
            <button type="submit" className={styles.successBtn}>Add</button>
          </div>
        </form>
      </div>

      <div className={styles.achievementsList}>
        <h3>All Achievements</h3>
        {sortedYears.length === 0 ? (
          <div className={styles.loading}>No achievements yet. Add your first one above!</div>
        ) : (
          sortedYears.map((year) => (
            <div key={year} className={styles.yearSection}>
              <div
                className={styles.yearHeader}
                onClick={() => {
                  const el = document.getElementById(`year-${year}`)
                  el?.classList.toggle(styles.open)
                }}
              >
                <h4>{year}</h4>
                <span>{achievements[year].length} achievements</span>
              </div>
              <div id={`year-${year}`} className={styles.achievementsItems}>
                {achievements[year].map((achievement, index) => (
                  <div key={index} className={styles.achievementItem}>
                    <span>{achievement}</span>
                    <div className={styles.actions}>
                      <button
                        className={styles.secondaryBtn}
                        onClick={() => setEditModal({ year, index, text: achievement })}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => setDeleteModal({ year, index, text: achievement })}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className={styles.modal} onClick={() => setEditModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Achievement</h3>
            <form onSubmit={handleEditAchievement}>
              <div className={styles.formGroup}>
                <label>Achievement</label>
                <textarea
                  value={editModal.text}
                  onChange={(e) => setEditModal({ ...editModal, text: e.target.value })}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setEditModal(null)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className={styles.modal} onClick={() => setDeleteModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this achievement?</p>
            <p className={styles.deleteText}>{deleteModal.text}</p>
            <div className={styles.modalActions}>
              <button className={styles.secondaryBtn} onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className={styles.dangerBtn} onClick={handleDeleteAchievement}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
