import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

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

    const followup = await prisma.followUp.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!followup) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      )
    }

    const updatedFollowup = await prisma.followUp.update({
      where: { id: params.id },
      data: {
        completed: true,
        completedAt: new Date(),
      },
    })

    return NextResponse.json(updatedFollowup)
  } catch (error) {
    console.error('Complete followup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







