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
    const brand = searchParams.get('brand')
    const model = searchParams.get('model')
    const status = searchParams.get('status')

    const where: any = {
      deleted: false,
    }

    if (brand) {
      where.brand = { contains: brand }
    }
    if (model) {
      where.model = { contains: model }
    }
    if (status) {
      where.status = status
    }

    const cars = await prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(cars)
  } catch (error) {
    console.error('Get cars error:', error)
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
    const {
      brand,
      model,
      year,
      registration,
      vin,
      mileage,
      price,
      status,
      color,
      fuelType,
      transmission,
      notes,
      sellerId,
    } = body

    if (!brand || !model || !price) {
      return NextResponse.json(
        { error: 'Brand, model, and price are required' },
        { status: 400 }
      )
    }

    const car = await prisma.car.create({
      data: {
        brand,
        model,
        year: year || null,
        registration: registration || null,
        vin: vin || null,
        mileage: mileage || null,
        price: parseFloat(price),
        status: status || 'available',
        color: color || null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        notes: notes || null,
        sellerId: sellerId || null,
        priceHistory: [{ price: parseFloat(price), date: new Date().toISOString() }],
      },
    })

    return NextResponse.json(car, { status: 201 })
  } catch (error) {
    console.error('Create car error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

