import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get('filter') || 'all'

    const where: any = {
      deleted: false,
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    if (filter === 'today') {
      where.scheduledAt = {
        gte: todayStart,
        lt: todayEnd,
      }
      where.completed = false
    } else if (filter === 'pending') {
      where.completed = false
      where.scheduledAt = {
        gte: now,
      }
    } else if (filter === 'overdue') {
      where.completed = false
      where.scheduledAt = {
        lt: now,
      }
    }

    const followups = await prisma.followUp.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    })

    return NextResponse.json(followups)
  } catch (error) {
    console.error('Get followups error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
    const { leadId, buyerId, sellerId, carId, type, scheduledAt, notes } = body

    if (!type || !scheduledAt) {
      return NextResponse.json(
        { error: 'Type and scheduledAt are required' },
        { status: 400 }
      )
    }

    const followup = await prisma.followUp.create({
      data: {
        leadId: leadId || null,
        buyerId: buyerId || null,
        sellerId: sellerId || null,
        carId: carId || null,
        type,
        scheduledAt: new Date(scheduledAt),
        notes: notes || null,
      },
    })

    return NextResponse.json(followup, { status: 201 })
  } catch (error) {
    console.error('Create followup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






