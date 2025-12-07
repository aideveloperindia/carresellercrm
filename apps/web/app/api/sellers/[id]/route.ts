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

    const seller = await prisma.seller.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(seller)
  } catch (error) {
    console.error('Get seller error:', error)
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
    const { name, phone, email, address, notes } = body

    const seller = await prisma.seller.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email || null
    if (address !== undefined) updateData.address = address || null
    if (notes !== undefined) updateData.notes = notes || null

    const updatedSeller = await prisma.seller.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedSeller)
  } catch (error) {
    console.error('Update seller error:', error)
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

    await prisma.seller.update({
      where: { id: params.id },
      data: { deleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete seller error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







