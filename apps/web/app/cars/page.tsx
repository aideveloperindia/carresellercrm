'use client'

import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import { carBrands, carModels, carYears } from '@/lib/carData'

interface Car {
  id: string
  brand: string
  model: string
  year?: number
  price: number
  status: string
  color?: string
  fuelType?: string
  transmission?: string
  mileage?: number
  sellerId?: string
  seller?: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  createdAt: string
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    registration: '',
    vin: '',
    mileage: '',
    price: '',
    status: 'available',
    color: '',
    fuelType: '',
    transmission: '',
    notes: '',
  })

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars')
      const data = await response.json()
      setCars(data)
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? parseInt(formData.year) : null,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          price: parseFloat(formData.price),
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          brand: '',
          model: '',
          year: '',
          registration: '',
          vin: '',
          mileage: '',
          price: '',
          status: 'available',
          color: '',
          fuelType: '',
          transmission: '',
          notes: '',
        })
        setAvailableModels([])
        fetchCars()
      }
    } catch (error) {
      console.error('Error creating car:', error)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchCars()
    } catch (error) {
      console.error('Error updating car status:', error)
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
          <h1 className="text-3xl font-bold">Cars</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Car'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Car</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Brand *</label>
                  <select
                    required
                    value={formData.brand}
                    onChange={(e) => {
                      const selectedBrand = e.target.value
                      setFormData({ ...formData, brand: selectedBrand, model: '' })
                      setAvailableModels(selectedBrand && selectedBrand !== 'Other' ? (carModels[selectedBrand] || []) : [])
                    }}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select Brand...</option>
                    {carBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Model {formData.brand === 'Other' ? '(Enter Brand Name)' : '*'}
                  </label>
                  {formData.brand === 'Other' ? (
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="Enter brand name"
                    />
                  ) : (
                    <select
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      disabled={!formData.brand || availableModels.length === 0}
                      className="w-full px-3 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.brand ? 'Select brand first...' : availableModels.length === 0 ? 'No models available' : 'Select Model...'}
                      </option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select Year...</option>
                    {carYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create Car
              </button>
            </form>
          </div>
        )}

        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{car.brand}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{car.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{car.year || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">₹{car.price.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {car.seller ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{car.seller.name}</div>
                            {car.seller.phone && (
                              <div className="text-gray-600 text-xs">{car.seller.phone}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={car.status}
                          onChange={(e) => handleStatusChange(car.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="reserved">Reserved</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            const newPrice = prompt('Enter new price:')
                            if (newPrice) {
                              fetch(`/api/cars/${car.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ price: parseFloat(newPrice) }),
                              }).then(() => fetchCars())
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Update Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {cars.map((car) => (
              <div key={car.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {car.brand} {car.model}
                    {car.year && ` (${car.year})`}
                  </h3>
                  <div className="text-xl font-bold text-gray-900 mb-2">₹{car.price.toLocaleString()}</div>
                  {car.seller && (
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="font-medium">Seller: {car.seller.name}</div>
                      {car.seller.phone && <div className="text-xs">{car.seller.phone}</div>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                  <select
                    value={car.status}
                    onChange={(e) => handleStatusChange(car.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <button
                    onClick={() => {
                      const newPrice = prompt('Enter new price:')
                      if (newPrice) {
                        fetch(`/api/cars/${car.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ price: parseFloat(newPrice) }),
                        }).then(() => fetchCars())
                      }
                    }}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Update Price
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      </main>
    </div>
  )
}




