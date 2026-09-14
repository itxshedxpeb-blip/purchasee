'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import LoadingState from '@/components/common/LoadingState'
import Button from '@/components/common/Button'
import { ArrowLeft, Edit2, Trash2, Package } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { useToast } from '@/components/common/ToastProvider'

interface PurchaseItem {
  id: string
  itemName: string
  description: string | null
  quantity: number
  unit: string
  rate: number
  amount: number
}

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: string
  project: { id: string; name: string }
  vendor: { id: string; name: string }
  deliveryLocation: string
  invoiceNumber: string | null
  subtotal: number
  totalAmount: number
  remarks: string | null
  items: PurchaseItem[]
}

export default function PurchaseDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchPurchase() {
      try {
        const response = await fetch(`/api/purchases?id=${params.id}`)
        const data = await response.json()

        if (data.success) {
          setPurchase(data.data)
        } else {
          router.push('/purchases')
        }
      } catch (error) {
        console.error('Error fetching purchase:', error)
        router.push('/purchases')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchase()
  }, [params.id, router])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/purchases?id=${params.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', 'Purchase deleted successfully')
        router.push('/purchases')
      } else {
        showToast('error', data.message || 'Failed to delete purchase')
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      showToast('error', 'Failed to delete purchase')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (!purchase) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Purchase not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Purchase #{purchase.purchaseNumber}</h1>
            <p className="text-gray-500 mt-1">{formatDate(purchase.purchaseDate)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push(`/purchases/${purchase.id}/edit`)}
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Edit</span>
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project</p>
                  <p className="font-medium text-gray-900">{purchase.project.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vendor</p>
                  <p className="font-medium text-gray-900">{purchase.vendor.name}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Delivery Location</p>
                  <p className="font-medium text-gray-900">{purchase.deliveryLocation}</p>
                </div>
                {purchase.invoiceNumber && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                    <p className="font-medium text-gray-900">{purchase.invoiceNumber}</p>
                  </div>
                )}
                {purchase.remarks && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Remarks</p>
                    <p className="font-medium text-gray-900">{purchase.remarks}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {purchase.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-blue-600">{formatCurrency(item.amount)}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Quantity</span>
                        <span className="text-gray-900">{item.quantity} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rate</span>
                        <span className="text-gray-900">{formatCurrency(item.rate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Item</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Description</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 w-24">Quantity</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 w-20">Unit</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 w-32">Rate</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600 w-40">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4 px-6 text-sm text-gray-900">{item.itemName}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{item.description || '-'}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 text-right">{item.quantity}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 text-right">{item.unit}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 text-right">{formatCurrency(item.rate)}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(purchase.subtotal)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(purchase.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden shadow-lg z-40">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push(`/purchases/${purchase.id}/edit`)}
          >
            <Edit2 className="h-4 w-4" />
            <span className="ml-2">Edit</span>
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-2">Delete</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 page-transition">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Purchase</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this purchase? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
