'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import LoadingState from '@/components/common/LoadingState'
import Button from '@/components/common/Button'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'

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
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<VendorDetails | null>(null)

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
    <div className="space-y-6">
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{vendor.name}</h1>
          <p className="text-gray-500 mt-2">{vendor.purchaseCount} purchases</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Total Purchase</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{formatCurrency(vendor.totalAmount)}</p>
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
              <div className="md:hidden space-y-4">
                {vendor.purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    onClick={() => router.push(`/purchases/${purchase.id}`)}
                    className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{purchase.purchaseNumber}</p>
                        <p className="text-sm text-gray-500">{formatShortDate(purchase.purchaseDate)}</p>
                      </div>
                      <p className="font-bold text-blue-600">{formatCurrency(purchase.totalAmount)}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project</span>
                        <span className="text-gray-900">{purchase.project.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Delivery</span>
                        <span className="text-gray-900 truncate max-w-[150px]">{purchase.deliveryLocation}</span>
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
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Project</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Delivery</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        onClick={() => router.push(`/purchases/${purchase.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-6 text-sm text-gray-600">{formatShortDate(purchase.purchaseDate)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{purchase.project.name}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{purchase.deliveryLocation}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
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
    </div>
  )
}
