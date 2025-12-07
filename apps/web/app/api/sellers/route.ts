import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''

    const where: any = { deleted: false }

    if (q) {
      // For MongoDB, Prisma handles contains as regex
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
      ]
    }

    const sellers = await prisma.seller.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(sellers)
  } catch (error: any) {
    console.error('Get sellers error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      )
    }

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { name, phone, email, address, carDetails, notes } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      return NextResponse.json(
        { error: 'Phone is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Create seller - keep it simple and safe
    const sellerData: any = {
      name: String(name).trim(),
      phone: String(phone).trim(),
    }

    // Add optional fields only if they have values
    if (email && String(email).trim()) {
      sellerData.email = String(email).trim()
    }
    if (address && String(address).trim()) {
      sellerData.address = String(address).trim()
    }
    if (notes && String(notes).trim()) {
      sellerData.notes = String(notes).trim()
    }

    // Handle carDetails - Prisma Json field for MongoDB
    // IMPORTANT: Only add if it's a valid object with actual data
    if (carDetails && typeof carDetails === 'object' && !Array.isArray(carDetails) && carDetails !== null) {
      const cleanCarDetails: Record<string, any> = {}
      
      // Only include fields that have actual values
      for (const [key, value] of Object.entries(carDetails)) {
        // Skip null, undefined, empty strings
        if (value === null || value === undefined || value === '') {
          continue
        }
        
        // Handle different types
        if (typeof value === 'string' && value.trim() !== '') {
          cleanCarDetails[key] = value.trim()
        } else if (typeof value === 'number' && !isNaN(value)) {
          cleanCarDetails[key] = value
        } else if (typeof value === 'boolean') {
          cleanCarDetails[key] = value
        }
      }
      
      // Only add carDetails if we have at least one valid field
      if (Object.keys(cleanCarDetails).length > 0) {
        sellerData.carDetails = cleanCarDetails
      }
    }

    console.log('Creating seller with data:', JSON.stringify(sellerData, null, 2))

    let seller
    try {
      // Ensure we're only sending valid data to Prisma
      const finalSellerData: any = {
        name: sellerData.name,
        phone: sellerData.phone,
      }
      
      if (sellerData.email) finalSellerData.email = sellerData.email
      if (sellerData.address) finalSellerData.address = sellerData.address
      if (sellerData.notes) finalSellerData.notes = sellerData.notes
      if (sellerData.carDetails && Object.keys(sellerData.carDetails).length > 0) {
        finalSellerData.carDetails = sellerData.carDetails
      }
      
      seller = await prisma.seller.create({
        data: finalSellerData,
      })
      console.log('Seller created successfully:', seller.id)
    } catch (dbError: any) {
      console.error('Database error creating seller:', dbError)
      console.error('Error code:', dbError?.code)
      console.error('Error message:', dbError?.message)
      console.error('Full error:', JSON.stringify(dbError, null, 2))
      return NextResponse.json(
        {
          error: 'Failed to create seller in database',
          message: dbError?.message || 'Database error',
          code: dbError?.code || 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' ? dbError?.stack : undefined
        },
        { status: 500 }
      )
    }

    // If car details provided, create car
    if (carDetails && carDetails.brand && carDetails.price) {
      try {
        const carPrice = Number(carDetails.price)
        if (!isNaN(carPrice) && carPrice > 0) {
          const car = await prisma.car.create({
            data: {
              brand: String(carDetails.brand),
              model: String(carDetails.model || carDetails.brand),
              year: carDetails.year ? Number(carDetails.year) : null,
              price: carPrice,
              status: 'available',
              color: carDetails.color ? String(carDetails.color) : null,
              fuelType: carDetails.fuelType ? String(carDetails.fuelType) : null,
              transmission: carDetails.transmission ? String(carDetails.transmission) : null,
              mileage: carDetails.mileage ? Number(carDetails.mileage) : null,
              registration: carDetails.registration ? String(carDetails.registration) : null,
              vin: carDetails.vin ? String(carDetails.vin) : null,
              sellerId: seller.id,
              priceHistory: [{ price: carPrice, date: new Date().toISOString() }],
            },
          })

          return NextResponse.json({
            ...seller,
            createdCar: { id: car.id, brand: car.brand, model: car.model, price: car.price }
          }, { status: 201 })
        }
      } catch (carError: any) {
        // Return seller even if car fails
        return NextResponse.json({
          ...seller,
          carCreationError: carError?.message || 'Car creation failed'
        }, { status: 201 })
      }
    }

    return NextResponse.json(seller, { status: 201 })
  } catch (error: any) {
    console.error('Create seller error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create seller',
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN'
      },
      { status: 500 }
    )
  }
}
