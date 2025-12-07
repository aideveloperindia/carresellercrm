import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/serverAuth'
import { prisma } from '@/lib/prisma'
import Header from './components/Header'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const admin = await requireAuth()

  // Get counts
  const [buyersCount, sellersCount, carsCount, availableCarsCount, todayFollowupsCount, leadsCount, soldCarsCount] =
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
      prisma.lead.count({ where: { deleted: false } }),
      prisma.car.count({ where: { deleted: false, status: 'sold' } }),
    ])

  const stats = [
    {
      title: 'Total Buyers',
      value: buyersCount,
      icon: '👥',
      color: 'blue',
      href: '/buyers',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Sellers',
      value: sellersCount,
      icon: '🏢',
      color: 'green',
      href: '/sellers',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Total Cars',
      value: carsCount,
      icon: '🚗',
      color: 'purple',
      href: '/cars',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Available Cars',
      value: availableCarsCount,
      icon: '✅',
      color: 'indigo',
      href: '/cars?status=available',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Sold Cars',
      value: soldCarsCount,
      icon: '💰',
      color: 'emerald',
      href: '/cars?status=sold',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Total Leads',
      value: leadsCount,
      icon: '📋',
      color: 'orange',
      href: '/leads',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Today\'s Follow-ups',
      value: todayFollowupsCount,
      icon: '📞',
      color: 'red',
      href: '/followups',
      gradient: 'from-red-500 to-red-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {admin.name || 'Admin'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your car reseller business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              href={stat.href}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-2xl shadow-md`}>
                    {stat.icon}
                  </div>
                  <div className={`text-3xl font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                  {stat.title}
                </h3>
                <div className="mt-2 flex items-center text-xs text-gray-500 group-hover:text-gray-600">
                  <span>View all</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/buyers?action=create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                <span className="text-xl">➕</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Add New Buyer</div>
                <div className="text-sm text-gray-600">Register a new customer</div>
              </div>
            </Link>
            <Link
              href="/cars?action=create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                <span className="text-xl">🚗</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Add New Car</div>
                <div className="text-sm text-gray-600">List a vehicle for sale</div>
              </div>
            </Link>
            <Link
              href="/leads?action=create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Create Lead</div>
                <div className="text-sm text-gray-600">Track a new sales opportunity</div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}




