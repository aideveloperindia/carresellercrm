'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Car Reseller CRM
        </Link>
        <nav className="flex gap-4 items-center">
          <Link href="/" className="hover:underline">Dashboard</Link>
          <Link href="/buyers" className="hover:underline">Buyers</Link>
          <Link href="/sellers" className="hover:underline">Sellers</Link>
          <Link href="/cars" className="hover:underline">Cars</Link>
          <Link href="/leads" className="hover:underline">Leads</Link>
          <Link href="/followups" className="hover:underline">Follow-ups</Link>
          <Link href="/auth/change-password" className="hover:underline">Settings</Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}

