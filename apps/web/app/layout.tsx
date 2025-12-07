import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Image from 'next/image'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Car Reseller CRM',
  description: 'CRM for used car resellers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="mt-auto py-4 px-6 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>Built by</span>
              <Link 
                href="https://www.aideveloperindia.store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/A-logo-transparent.png"
                  alt="AI Developer India Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
                <span className="font-medium text-gray-700">AI Developer India</span>
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}






