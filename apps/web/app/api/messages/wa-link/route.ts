import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '+91'
const SENDER_PHONE = '+919505009699' // Fixed sender number

/**
 * Normalize phone number - ensure it starts with country code
 */
function normalizePhone(phone: string): string {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '')
  
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

    if (!phone) {
      return NextResponse.json(
        { error: 'Receiver phone number is required' },
        { status: 400 }
      )
    }

    // Normalize receiver phone number (from user details)
    const normalizedReceiverPhone = normalizePhone(String(phone))
    
    if (!normalizedReceiverPhone) {
      return NextResponse.json(
        { error: 'Invalid receiver phone number' },
        { status: 400 }
      )
    }

    // Default message if not provided
    const defaultMessage = `Hello! This is a message from Car Reseller CRM.`
    const finalMessage = messageBody || defaultMessage
    
    // Create WhatsApp link - receiver number is from user details
    // Format: https://wa.me/{receiver_number}?text={message}&from={sender_number}
    const encodedMessage = encodeURIComponent(finalMessage)
    const receiverNumber = normalizedReceiverPhone.replace(/\+/g, '')
    const waLink = `https://wa.me/${receiverNumber}?text=${encodedMessage}`

    // Log the message
    try {
      const messageLog = await prisma.messageLog.create({
        data: {
          phone: normalizedReceiverPhone,
          body: finalMessage,
          waLink,
          recipientId: recipientId || null,
          recipientType: recipientType || null,
        },
      })

      return NextResponse.json({
        waLink,
        messageLogId: messageLog.id,
        senderPhone: SENDER_PHONE,
        receiverPhone: normalizedReceiverPhone,
      })
    } catch (dbError: any) {
      // Even if logging fails, return the WhatsApp link
      console.error('Error logging message:', dbError)
      return NextResponse.json({
        waLink,
        senderPhone: SENDER_PHONE,
        receiverPhone: normalizedReceiverPhone,
        warning: 'Message logged but database entry failed',
      })
    }
  } catch (error: any) {
    console.error('Create WA link error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    )
  }
}






