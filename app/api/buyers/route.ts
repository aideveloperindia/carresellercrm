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
    const q = searchParams.get('q') || ''

    const where: any = {
      deleted: false,
    }

    if (q) {
      // MongoDB case-insensitive search using Prisma
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ]
    }

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(buyers)
  } catch (error) {
    console.error('Get buyers error:', error)
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
    const { name, phone, email, address, preferences, notes } = body

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    const buyer = await prisma.buyer.create({
      data: {
        name,
        phone,
        email: email || null,
        address: address || null,
        preferences: preferences || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(buyer, { status: 201 })
  } catch (error) {
    console.error('Create buyer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

