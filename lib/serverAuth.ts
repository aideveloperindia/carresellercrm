import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'crcrm_session'

/**
 * Verify admin authentication from cookie and return admin data
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    redirect('/auth/login')
  }

  const payload = verifyToken(token)
  if (!payload) {
    redirect('/auth/login')
  }

  // Verify admin still exists in database
  const admin = await prisma.admin.findFirst({
    where: {
      id: payload.adminId,
      email: payload.email,
      deleted: false,
    },
  })

  if (!admin) {
    redirect('/auth/login')
  }

  return admin
}

/**
 * Get current admin without redirecting (for optional auth checks)
 */
export async function getAuthAdmin() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const admin = await prisma.admin.findFirst({
    where: {
      id: payload.adminId,
      email: payload.email,
      deleted: false,
    },
  })

  return admin
}

