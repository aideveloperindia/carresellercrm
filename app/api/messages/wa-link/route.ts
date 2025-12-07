import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '+91'

/**
 * Normalize phone number - ensure it starts with country code
 */
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '')
  
  // If already starts with +, return as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // If starts with 0, remove it
  if (cleaned.startsWith('0')) {
    return DEFAULT_COUNTRY_CODE + cleaned.substring(1)
  }
  
  // Otherwise prepend country code
  return DEFAULT_COUNTRY_CODE + cleaned
}

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
    const { phone, body: messageBody, recipientId, recipientType } = body

    if (!phone || !messageBody) {
      return NextResponse.json(
        { error: 'Phone and body are required' },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone)
    
    // Create WhatsApp link
    const encodedMessage = encodeURIComponent(messageBody)
    const waLink = `https://wa.me/${normalizedPhone.replace('+', '')}?text=${encodedMessage}`

    // Log the message
    const messageLog = await prisma.messageLog.create({
      data: {
        phone: normalizedPhone,
        body: messageBody,
        waLink,
        recipientId: recipientId || null,
        recipientType: recipientType || null,
      },
    })

    return NextResponse.json({
      waLink,
      messageLogId: messageLog.id,
    })
  } catch (error) {
    console.error('Create WA link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

