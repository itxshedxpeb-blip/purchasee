'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import LoadingState from '@/components/common/LoadingState'
import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import { ArrowLeft, Building2, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { useToast } from '@/components/common/ToastProvider'

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: string
  project: { name: string }
  deliveryLocation: string
  totalAmount: number
}

interface VendorDetails {
  id: string
  name: string
  purchaseCount: number
  totalAmount: number
  purchases: Purchase[]
}

export default function VendorDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<VendorDetails | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchVendorDetails() {
      try {
        const response = await fetch(`/api/vendors?id=${params.id}`)
        const data = await response.json()

        if (data.success) {
          const vendorData = data.data
          const totalAmount = vendorData.purchases.reduce(
            (sum: number, p: { totalAmount: number }) => sum + Number(p.totalAmount),
            0
          )

          setVendor({
            id: vendorData.id,
            name: vendorData.name,
            purchaseCount: vendorData.purchases.length,
            totalAmount,
            purchases: vendorData.purchases.map((p: { id: string; purchaseNumber: string; purchaseDate: string; project: { name: string }; deliveryLocation: string; totalAmount: number }) => ({
              id: p.id,
              purchaseNumber: p.purchaseNumber,
              purchaseDate: p.purchaseDate,
              project: { name: p.project.name },
              deliveryLocation: p.deliveryLocation,
              totalAmount: p.totalAmount,
            })),
          })
        } else {
          router.push('/vendors')
        }
      } catch (error) {
        console.error('Error fetching vendor details:', error)
        router.push('/vendors')
      } finally {
        setLoading(false)
      }
    }

    fetchVendorDetails()
  }, [params.id, router])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/vendors?id=${params.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        showToast('success', data.message || 'Vendor deleted successfully')
        router.push('/vendors')
      } else {
        showToast('error', data.message || 'Failed to delete vendor')
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      showToast('error', 'Failed to delete vendor')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Vendor not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          aria-label="Go back"
          className="min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{vendor.name}</h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{vendor.purchaseCount} purchases</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="min-h-[44px] min-w-[44px] flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">Delete</span>
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Total Purchase</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{formatCurrency(vendor.totalAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {vendor.purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No purchases yet for this vendor</div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {vendor.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    onClick={() => router.push(`/purchases/${purchase.id}`)}
                    className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{purchase.purchaseNumber}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{formatShortDate(purchase.purchaseDate)}</p>
                      </div>
                      <p className="font-bold text-blue-600 text-sm sm:text-base flex-shrink-0">{formatCurrency(purchase.totalAmount)}</p>
                    </div>
                    <div className="space-y-1 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project</span>
                        <span className="text-gray-900 truncate ml-2">{purchase.project.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery</span>
                        <span className="text-gray-900 truncate ml-2">{purchase.deliveryLocation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Project</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Delivery</th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        onClick={() => router.push(`/purchases/${purchase.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-gray-600">{formatShortDate(purchase.purchaseDate)}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-gray-600">{purchase.project.name}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-gray-600">{purchase.deliveryLocation}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-900 text-right">
                          {formatCurrency(purchase.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Vendor"
        size="sm"
      >
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {vendor.purchaseCount > 0
            ? `Are you sure you want to delete this vendor? This will also delete ${vendor.purchaseCount} associated purchase(s). This action cannot be undone.`
            : 'Are you sure you want to delete this vendor? This action cannot be undone.'
          }
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteDialog(false)}
            disabled={deleting}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
            fullWidth
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
