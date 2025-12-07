import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/serverAuth'
import { prisma } from '@/lib/prisma'
import Header from './components/Header'

export default async function Dashboard() {
  const admin = await requireAuth()

  // Get counts
  const [buyersCount, sellersCount, carsCount, availableCarsCount, todayFollowupsCount] =
    await Promise.all([
      prisma.buyer.count({ where: { deleted: false } }),
      prisma.seller.count({ where: { deleted: false } }),
      prisma.car.count({ where: { deleted: false } }),
      prisma.car.count({ where: { deleted: false, status: 'available' } }),
      (async () => {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const todayEnd = new Date(todayStart)
        todayEnd.setDate(todayEnd.getDate() + 1)
        return prisma.followUp.count({
          where: {
            deleted: false,
            completed: false,
            scheduledAt: {
              gte: todayStart,
              lt: todayEnd,
            },
          },
        })
      })(),
    ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm mb-2">Total Buyers</h2>
            <p className="text-3xl font-bold text-blue-600">{buyersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm mb-2">Total Sellers</h2>
            <p className="text-3xl font-bold text-green-600">{sellersCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm mb-2">Total Cars</h2>
            <p className="text-3xl font-bold text-purple-600">{carsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm mb-2">Available Cars</h2>
            <p className="text-3xl font-bold text-orange-600">{availableCarsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-gray-600 text-sm mb-2">Today&apos;s Follow-ups</h2>
            <p className="text-3xl font-bold text-red-600">{todayFollowupsCount}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

