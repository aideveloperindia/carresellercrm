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

    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Get lead error:', error)
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
    const lead = await prisma.lead.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.buyerId !== undefined) updateData.buyerId = body.buyerId || null
    if (body.carId !== undefined) updateData.carId = body.carId || null
    if (body.source !== undefined) updateData.source = body.source || null
    if (body.status !== undefined) updateData.status = body.status
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.incrementVisits === true) {
      updateData.visitsCount = { increment: 1 }
    }

    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Update lead error:', error)
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

    await prisma.lead.update({
      where: { id: params.id },
      data: { deleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






