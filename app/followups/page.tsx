'use client'

import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'

interface FollowUp {
  id: string
  leadId?: string
  buyerId?: string
  sellerId?: string
  carId?: string
  type: string
  scheduledAt: string
  notes?: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

export default function FollowupsPage() {
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'pending' | 'overdue'>('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    leadId: '',
    buyerId: '',
    sellerId: '',
    carId: '',
    type: '',
    scheduledAt: '',
    notes: '',
  })

  useEffect(() => {
    fetchFollowups()
  }, [filter])

  const fetchFollowups = async () => {
    try {
      const url = filter === 'all' ? '/api/followups' : `/api/followups?filter=${filter}`
      const response = await fetch(url)
      const data = await response.json()
      setFollowups(data)
    } catch (error) {
      console.error('Error fetching followups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          leadId: formData.leadId || null,
          buyerId: formData.buyerId || null,
          sellerId: formData.sellerId || null,
          carId: formData.carId || null,
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          leadId: '',
          buyerId: '',
          sellerId: '',
          carId: '',
          type: '',
          scheduledAt: '',
          notes: '',
        })
        fetchFollowups()
      }
    } catch (error) {
      console.error('Error creating followup:', error)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/followups/${id}/complete`, {
        method: 'PUT',
      })
      fetchFollowups()
    } catch (error) {
      console.error('Error completing followup:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">Loading...</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Follow-ups</h1>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border rounded"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Add Follow-up'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Follow-up</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="call, visit, test-drive, payment, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled At *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Lead ID</label>
                  <input
                    type="text"
                    value={formData.leadId}
                    onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Buyer ID</label>
                  <input
                    type="text"
                    value={formData.buyerId}
                    onChange={(e) => setFormData({ ...formData, buyerId: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create Follow-up
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Scheduled At</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((followup) => (
                <tr key={followup.id} className="border-t">
                  <td className="px-4 py-3">{followup.type}</td>
                  <td className="px-4 py-3">
                    {new Date(followup.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {followup.completed ? (
                      <span className="text-green-600">Completed</span>
                    ) : (
                      <span className="text-orange-600">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{followup.notes || '-'}</td>
                  <td className="px-4 py-3">
                    {!followup.completed && (
                      <button
                        onClick={() => handleComplete(followup.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

