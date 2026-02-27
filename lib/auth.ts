import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const JWT_EXPIRES_IN = '2h'
const BCRYPT_SALT_ROUNDS = 12

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_SALT_ROUNDS)
}

export function comparePassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): { role: string; iat: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { role: string; iat: number }
  } catch {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export interface PasswordValidation {
  isValid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const errors: string[] = []

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number')
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export interface AuthRequest {
  headers: {
    authorization?: string | null
  }
  user?: { role: string; iat: number }
}

export function withAuth<T extends AuthRequest, R>(
  handler: (request: T) => Promise<R>
): (request: T) => Promise<R | { error: string; message: string }> {
  return async (request: T) => {
    const token = extractTokenFromHeader(request.headers.authorization || null)

    if (!token) {
      return {
        error: 'Unauthorized',
        message: 'No token provided'
      }
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return {
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      }
    }

    request.user = decoded
    return handler(request)
  }
}
