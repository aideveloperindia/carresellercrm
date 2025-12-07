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

    const car = await prisma.car.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error('Get car error:', error)
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
    const car = await prisma.car.findFirst({
      where: {
        id: params.id,
        deleted: false,
      },
    })

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.brand !== undefined) updateData.brand = body.brand
    if (body.model !== undefined) updateData.model = body.model
    if (body.year !== undefined) updateData.year = body.year || null
    if (body.registration !== undefined) updateData.registration = body.registration || null
    if (body.vin !== undefined) updateData.vin = body.vin || null
    if (body.mileage !== undefined) updateData.mileage = body.mileage || null
    if (body.status !== undefined) updateData.status = body.status
    if (body.color !== undefined) updateData.color = body.color || null
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType || null
    if (body.transmission !== undefined) updateData.transmission = body.transmission || null
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.sellerId !== undefined) updateData.sellerId = body.sellerId || null

    // Handle price update with history
    if (body.price !== undefined) {
      const newPrice = parseFloat(body.price)
      const currentPriceHistory = (car.priceHistory as any[]) || []
      updateData.price = newPrice
      updateData.priceHistory = [
        ...currentPriceHistory,
        { price: newPrice, date: new Date().toISOString(), notes: body.priceNotes || null },
      ]
    }

    const updatedCar = await prisma.car.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updatedCar)
  } catch (error) {
    console.error('Update car error:', error)
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

    await prisma.car.update({
      where: { id: params.id },
      data: { deleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete car error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







