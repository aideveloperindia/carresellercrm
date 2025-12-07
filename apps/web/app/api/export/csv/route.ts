import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function convertToCSV(data: any[], headers: string[]): string {
  const rows = data.map((item) => {
    return headers.map((header) => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value).replace(/"/g, '""')
    })
  })

  const csvRows = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ]

  return csvRows.join('\n')
}

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
    const type = searchParams.get('type')

    if (!type || !['buyers', 'sellers', 'cars', 'leads'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: buyers, sellers, cars, or leads' },
        { status: 400 }
      )
    }

    let data: any[] = []
    let headers: string[] = []

    switch (type) {
      case 'buyers':
        data = await prisma.buyer.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
        })
        headers = ['id', 'name', 'phone', 'email', 'address', 'visitsCount', 'notes', 'createdAt']
        break

      case 'sellers':
        data = await prisma.seller.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
        })
        headers = ['id', 'name', 'phone', 'email', 'address', 'notes', 'createdAt']
        break

      case 'cars':
        data = await prisma.car.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
        })
        headers = ['id', 'brand', 'model', 'year', 'registration', 'price', 'status', 'color', 'fuelType', 'transmission', 'mileage', 'createdAt']
        break

      case 'leads':
        data = await prisma.lead.findMany({
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
        })
        headers = ['id', 'buyerId', 'carId', 'source', 'status', 'visitsCount', 'notes', 'createdAt']
        break
    }

    const csv = convertToCSV(data, headers)
    const filename = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






