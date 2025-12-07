'use client'

import { useEffect, useState } from 'react'
import Header from '@/app/components/Header'
import WaButton from '@/app/components/WaButton'
import { carBrands, carModels, carYears } from '@/lib/carData'

interface Seller {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  carDetails?: any
  notes?: string
  createdAt: string
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    // Car details
    carBrand: '',
    carModel: '',
    carYear: '',
    price: '',
    carColor: '',
    fuelType: '',
    transmission: '',
    mileage: '',
    registration: '',
    vin: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    fetchSellers()
  }, [search])

  const fetchSellers = async () => {
    try {
      const url = search ? `/api/sellers?q=${encodeURIComponent(search)}` : '/api/sellers'
      const response = await fetch(url)
      
      if (response.status === 401) {
        // Not logged in, redirect to login
        window.location.href = '/auth/login'
        return
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sellers: ${response.status}`)
      }
      
      const data = await response.json()
      setSellers(data)
    } catch (error) {
      console.error('Error fetching sellers:', error)
      if (error instanceof Error && error.message.includes('401')) {
        window.location.href = '/auth/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Build carDetails object from car fields
      const carDetails: any = {}
      if (formData.carBrand && formData.carBrand !== 'Other') {
        carDetails.brand = formData.carBrand
        if (formData.carModel) {
          carDetails.model = formData.carModel
        }
      } else if (formData.carBrand === 'Other' && formData.carModel) {
        // If "Other" is selected, use the model field as brand, and set model to empty or same
        carDetails.brand = formData.carModel
        carDetails.model = formData.carModel // Set model same as brand for "Other"
      }
      if (formData.carYear) {
        const year = parseInt(formData.carYear)
        if (!isNaN(year)) carDetails.year = year
      }
      if (formData.price) {
        const price = parseFloat(formData.price)
        if (!isNaN(price)) carDetails.price = price
      }
      if (formData.carColor) carDetails.color = formData.carColor
      if (formData.fuelType) carDetails.fuelType = formData.fuelType
      if (formData.transmission) carDetails.transmission = formData.transmission
      if (formData.mileage) {
        const mileage = parseInt(formData.mileage)
        if (!isNaN(mileage)) carDetails.mileage = mileage
      }
      if (formData.registration) carDetails.registration = formData.registration
      if (formData.vin) carDetails.vin = formData.vin

      // Build request body - only include carDetails if we have actual car data
      const requestBody: any = {
        name: formData.name,
        phone: formData.phone,
      }
      
      if (formData.email && formData.email.trim()) {
        requestBody.email = formData.email.trim()
      }
      if (formData.address && formData.address.trim()) {
        requestBody.address = formData.address.trim()
      }
      if (formData.notes && formData.notes.trim()) {
        requestBody.notes = formData.notes.trim()
      }
      
      // Only include carDetails if we have at least brand or model
      const hasCarDetails = (carDetails.brand && carDetails.brand.trim()) || (carDetails.model && carDetails.model.trim())
      if (hasCarDetails && Object.keys(carDetails).length > 0) {
        // Clean carDetails - remove empty values
        const cleanCarDetails: any = {}
        Object.entries(carDetails).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '' && value !== 0) {
            cleanCarDetails[key] = value
          }
        })
        
        // Only send if we have at least one valid field
        if (Object.keys(cleanCarDetails).length > 0) {
          requestBody.carDetails = cleanCarDetails
        }
      }

      console.log('Sending seller data:', requestBody)

      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Show success message if car was automatically created
        if (result.createdCar) {
          setSuccessMessage(`✅ Seller created! Car "${result.createdCar.brand} ${result.createdCar.model}" has been automatically added to your inventory.`)
          setTimeout(() => setSuccessMessage(''), 5000)
        } else if (result.carCreationError) {
          setSuccessMessage(`✅ Seller created! ⚠️ ${result.carCreationError}`)
          setTimeout(() => setSuccessMessage(''), 5000)
        } else {
          setSuccessMessage('✅ Seller created successfully!')
          setTimeout(() => setSuccessMessage(''), 3000)
        }
        
        setErrorMessage('')
        setShowForm(false)
        setFormData({ 
          name: '', phone: '', email: '', address: '', notes: '',
          carBrand: '', carModel: '', carYear: '', price: '',
          carColor: '', fuelType: '', transmission: '', mileage: '',
          registration: '', vin: ''
        })
        setAvailableModels([])
        fetchSellers()
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` }
        }
        
        // Handle 401 specifically - redirect to login
        if (response.status === 401) {
          const errorMsg = errorData.error || errorData.details || 'You are not logged in. Redirecting to login page...'
          setErrorMessage(`🔒 ${errorMsg}`)
          setTimeout(() => {
            window.location.href = '/auth/login'
          }, 2000)
        } else {
          const errorMsg = errorData.error || errorData.details || `Failed to create seller (${response.status}). Please check the console for details.`
          console.error('Error response:', errorData)
          setErrorMessage(`❌ ${errorMsg}`)
        }
        setSuccessMessage('')
      }
    } catch (error: any) {
      console.error('Error creating seller:', error)
      setErrorMessage(`Network error: ${error.message || 'Please check your connection and try again.'}`)
      setSuccessMessage('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sellers</h1>
            <p className="text-gray-600">Manage your seller database</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <input
                type="text"
                placeholder="Search sellers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <span className="text-lg">+</span>
              {showForm ? 'Cancel' : 'Add Seller'}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="text-red-600 hover:text-red-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Add Seller Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Seller</h2>
            <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
              💡 <strong>Tip:</strong> When you enter car details below, the car will automatically be added to your inventory (Cars page)!
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter seller name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seller@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes about the seller..."
                  />
                </div>
              </div>

              {/* Car Details Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🚗</span> Car Details (Car the seller is offering)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand *</label>
                    <select
                      required
                      value={formData.carBrand}
                      onChange={(e) => {
                        const selectedBrand = e.target.value
                        setFormData({ ...formData, carBrand: selectedBrand, carModel: '' })
                        setAvailableModels(selectedBrand && selectedBrand !== 'Other' ? (carModels[selectedBrand] || []) : [])
                      }}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Model {formData.carBrand === 'Other' ? '(Enter Brand Name)' : '*'}
                    </label>
                    {formData.carBrand === 'Other' ? (
                      <input
                        type="text"
                        required
                        value={formData.carModel}
                        onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter brand name"
                      />
                    ) : (
                      <select
                        required
                        value={formData.carModel}
                        onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                        disabled={!formData.carBrand || availableModels.length === 0}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!formData.carBrand ? 'Select brand first...' : availableModels.length === 0 ? 'No models available' : 'Select Model...'}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                    <select
                      value={formData.carYear}
                      onChange={(e) => setFormData({ ...formData, carYear: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      value={formData.carColor}
                      onChange={(e) => setFormData({ ...formData, carColor: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Red, Black, White"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage (km)</label>
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Current mileage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
                    <input
                      type="text"
                      value={formData.registration}
                      onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Registration number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">VIN</label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Vehicle Identification Number"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ 
                      name: '', phone: '', email: '', address: '', notes: '',
                      carBrand: '', carModel: '', carYear: '', price: '',
                      carColor: '', fuelType: '', transmission: '', mileage: '',
                      registration: '', vin: ''
                    })
                    setAvailableModels([])
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Seller'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sellers List */}
        {sellers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first seller</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <span>+</span> Add First Seller
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Car Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">{seller.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">{seller.phone}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {seller.email || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4">
                        {seller.carDetails ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {seller.carDetails.brand} {seller.carDetails.model}
                              {seller.carDetails.year && ` (${seller.carDetails.year})`}
                            </div>
                            {seller.carDetails.price && (
                              <div className="text-gray-600">₹{seller.carDetails.price.toLocaleString()}</div>
                            )}
                            <div className="text-gray-500 text-xs mt-1">
                              {seller.carDetails.color && `${seller.carDetails.color} • `}
                              {seller.carDetails.fuelType && `${seller.carDetails.fuelType} • `}
                              {seller.carDetails.transmission}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No car details</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <WaButton phone={seller.phone} recipientId={seller.id} recipientType="seller" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {sellers.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{sellers.length}</span> {sellers.length === 1 ? 'seller' : 'sellers'}
          </div>
        )}
      </main>
    </div>
  )
}
