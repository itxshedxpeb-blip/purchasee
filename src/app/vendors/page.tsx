'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingState from '@/components/common/LoadingState'
import EmptyState from '@/components/common/EmptyState'
import { Building2, Plus } from 'lucide-react'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { Card, CardContent } from '@/components/common/Card'

interface Vendor {
  id: string
  name: string
  _count: {
    purchases: number
  }
}

export default function VendorsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newVendorName, setNewVendorName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch('/api/vendors')
        const data = await response.json()

        if (data.success) {
          setVendors(data.data)
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVendors()
  }, [])

  const handleCreateVendor = async () => {
    if (!newVendorName.trim()) {
      setError('Vendor name is required')
      return
    }

    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newVendorName }),
      })

      const data = await response.json()

      if (data.success) {
        setVendors([...vendors, data.data])
        setNewVendorName('')
        setShowCreateDialog(false)
        setSuccess('Vendor created successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to create vendor')
      }
    } catch {
      setError('Failed to create vendor')
    } finally {
      setCreating(false)
    }
  }

  const handleVendorClick = (id: string) => {
    router.push(`/vendors/${id}`)
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-2">Manage your vendors and view purchase totals</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline ml-2">New Vendor</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No vendors yet"
          description="Add a vendor from the Purchase Entry form"
          actionLabel="New Purchase"
          onAction={() => router.push('/new-purchase')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id}
              onClick={() => handleVendorClick(vendor.id)}
              className="hover:shadow-lg cursor-pointer transition-all duration-200 hover:border-orange-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{vendor.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Purchases</span>
                    <span className="font-medium text-gray-900">{vendor._count.purchases}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Vendor Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 page-transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Vendor</h3>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <div className="w-5 h-5 bg-red-600 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <p className="text-sm text-red-800 flex-1">{error}</p>
              </div>
            )}

            <Input
              label="Vendor Name"
              value={newVendorName}
              onChange={(e) => setNewVendorName(e.target.value)}
              placeholder="Enter vendor name"
            />
            
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateDialog(false)
                  setNewVendorName('')
                  setError('')
                }}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateVendor} isLoading={creating}>
                Create Vendor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {success && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 shadow-lg page-transition">
          <div className="w-5 h-5 bg-green-600 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <p className="text-sm text-green-800 flex-1">{success}</p>
        </div>
      )}
    </div>
  )
}
