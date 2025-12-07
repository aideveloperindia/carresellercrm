'use client'

import { useState } from 'react'

interface WaButtonProps {
  phone: string
  body?: string
  recipientId?: string
  recipientType?: 'buyer' | 'seller' | 'lead'
  className?: string
  children?: React.ReactNode
}

export default function WaButton({
  phone,
  body = 'Hello',
  recipientId,
  recipientType,
  className = '',
  children,
}: WaButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/messages/wa-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          body,
          recipientId,
          recipientType,
        }),
      })

      const data = await response.json()
      if (data.waLink) {
        window.open(data.waLink, '_blank')
      }
    } catch (error) {
      console.error('Error creating WA link:', error)
      alert('Failed to create WhatsApp link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-2 ${className} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        'Loading...'
      ) : (
        <>
          <span>📱</span>
          {children || 'WhatsApp'}
        </>
      )}
    </button>
  )
}

