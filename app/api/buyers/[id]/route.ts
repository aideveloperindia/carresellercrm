import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const buyer = await prisma.buyer.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(buyer)
  } catch (error) {
    console.error('Get buyer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, email, address, preferences, notes, incrementVisits } = body

    const buyer = await prisma.buyer.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email || null
    if (address !== undefined) updateData.address = address || null
    if (preferences !== undefined) updateData.preferences = preferences
    if (notes !== undefined) updateData.notes = notes || null
    if (incrementVisits === true) {
      updateData.visitsCount = { increment: 1 }
    }

    const updatedBuyer = await prisma.buyer.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedBuyer)
  } catch (error) {
    console.error('Update buyer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await prisma.buyer.update({
      where: { id: params.id },
      data: { deleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete buyer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

