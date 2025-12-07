import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, hashPassword, signToken, createSessionCookie, getCurrentAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Get admin from database
    const adminRecord = await prisma.admin.findUnique({
      where: { id: admin.id },
    })

    if (!adminRecord) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }

    // Verify old password
    const isValid = await comparePassword(oldPassword, adminRecord.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Old password is incorrect' },
        { status: 401 }
      )
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newPasswordHash },
    })

    // Create new token and update cookie
    const token = signToken({
      adminId: admin.id,
      email: admin.email,
    })

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', createSessionCookie(token))

    return response
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

