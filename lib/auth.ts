import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production'
const COOKIE_NAME = 'crcrm_session'
const COOKIE_MAX_AGE = 8 * 60 * 60 // 8 hours in seconds

export interface TokenPayload {
  adminId: string
  email: string
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Sign a JWT token with admin payload
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Create a session cookie with the JWT token
 */
export function createSessionCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    `Path=/`,
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'HttpOnly',
  ]
    .filter(Boolean)
    .join('; ')

  return cookieOptions
}

/**
 * Clear the session cookie
 */
export function clearSessionCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = [
    `${COOKIE_NAME}=`,
    `Max-Age=0`,
    `Path=/`,
    isProduction ? 'Secure' : '',
    'SameSite=Strict',
    'HttpOnly',
  ]
    .filter(Boolean)
    .join('; ')

  return cookieOptions
}

/**
 * Get the current admin from the request cookie
 */
export async function getCurrentAdmin(): Promise<{ id: string; email: string } | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  return { id: payload.adminId, email: payload.email }
}

