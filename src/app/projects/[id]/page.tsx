'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import LoadingState from '@/components/common/LoadingState'
import Button from '@/components/common/Button'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: string
  vendor: { name: string }
  deliveryLocation: string
  totalAmount: number
}

interface ProjectDetails {
  id: string
  siteCode: string
  name: string
  clientName: string
  purchaseCount: number
  totalAmount: number
  purchases: Purchase[]
}

export default function ProjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<ProjectDetails | null>(null)

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const response = await fetch(`/api/projects?id=${params.id}`)
        const data = await response.json()

        if (data.success) {
          const projectData = data.data
          const totalAmount = projectData.purchases.reduce(
            (sum: number, p: { totalAmount: number }) => sum + Number(p.totalAmount),
            0
          )

          setProject({
            id: projectData.id,
            siteCode: projectData.siteCode,
            name: projectData.name,
            clientName: projectData.clientName,
            purchaseCount: projectData.purchases.length,
            totalAmount,
            purchases: projectData.purchases.map((p: { id: string; purchaseNumber: string; purchaseDate: string; vendor: { name: string }; deliveryLocation: string; totalAmount: number }) => ({
              id: p.id,
              purchaseNumber: p.purchaseNumber,
              purchaseDate: p.purchaseDate,
              vendor: { name: p.vendor.name },
              deliveryLocation: p.deliveryLocation,
              totalAmount: p.totalAmount,
            })),
          })
        } else {
          router.push('/projects')
        }
      } catch (error) {
        console.error('Error fetching project details:', error)
        router.push('/projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [params.id, router])

  if (loading) {
    return <LoadingState />
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Project not found</p>
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
          <h1 className="text-xs sm:text-sm md:text-base font-semibold text-blue-600 mb-1 truncate">{project.siteCode}</h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{project.name}</h2>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{project.clientName} • {project.purchaseCount} purchases</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-500">Total Purchase</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{formatCurrency(project.totalAmount)}</p>
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
          {project.purchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No purchases yet for this project</div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {project.purchases.map((purchase) => (
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
                        <span className="text-gray-500">Vendor</span>
                        <span className="text-gray-900 truncate ml-2">{purchase.vendor.name}</span>
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
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Vendor</th>
                      <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Delivery</th>
                      <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        onClick={() => router.push(`/purchases/${purchase.id}`)}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-gray-600">{formatShortDate(purchase.purchaseDate)}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-gray-600">{purchase.vendor.name}</td>
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
    </div>
  )
}
