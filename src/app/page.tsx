'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { StatCardSkeleton } from '@/components/common/SkeletonCard'
import { TrendingUp, ShoppingCart, FolderOpen, Building2 } from 'lucide-react'
import Button from '@/components/common/Button'

interface DashboardStats {
  totalPurchase: number
  purchaseEntries: number
  projectCount: number
  vendorCount: number
  projectTotals: Array<{
    id: string
    name: string
    purchaseCount: number
    totalAmount: number
  }>
  vendorTotals: Array<{
    id: string
    name: string
    purchaseCount: number
    totalAmount: number
  }>
  recentPurchases: Array<{
    id: string
    purchaseNumber: string
    purchaseDate: string
    project: string
    vendor: string
    totalAmount: number
  }>
  monthlyTotals: Array<{
    month: number
    monthName: string
    totalAmount: number
  }>
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Overview of your purchase activity</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Unable to load dashboard data</p>
      </div>
    )
  }

  const summaryCards = [
    {
      title: 'Total Purchase',
      value: formatCurrency(stats.totalPurchase),
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Purchase Entries',
      value: stats.purchaseEntries.toString(),
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Projects',
      value: stats.projectCount.toString(),
      icon: FolderOpen,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Vendors',
      value: stats.vendorCount.toString(),
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of your purchase activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">{card.title}</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-br text-gray-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Project-wise Purchase */}
        <Card>
          <CardHeader>
            <CardTitle>Project-wise Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.projectTotals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No projects yet</div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {stats.projectTotals.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.purchaseCount} purchases</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base flex-shrink-0">{formatCurrency(project.totalAmount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendor-wise Purchase */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor-wise Purchase</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.vendorTotals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No vendors yet</div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {stats.vendorTotals.slice(0, 5).map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
                      <p className="text-sm text-gray-500">{vendor.purchaseCount} purchases</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base flex-shrink-0">{formatCurrency(vendor.totalAmount)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentPurchases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No purchases yet</div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {stats.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:bg-gray-50 transition-colors">
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
                        <span className="text-gray-900 truncate ml-2">{purchase.project}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Vendor</span>
                        <span className="text-gray-900 truncate ml-2">{purchase.vendor}</span>
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
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Purchase No.</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Project</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Vendor</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPurchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{purchase.purchaseNumber}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{formatShortDate(purchase.purchaseDate)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{purchase.project}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{purchase.vendor}</td>
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

      {/* Monthly Purchase Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.monthlyTotals.every((m) => m.totalAmount === 0) ? (
            <div className="text-center py-8 text-gray-500">No data available</div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {stats.monthlyTotals.map((month) => (
                <div key={month.month} className="flex items-center gap-2 sm:gap-4">
                  <div className="w-12 sm:w-16 text-xs sm:text-sm font-medium text-gray-600 flex-shrink-0">{month.monthName}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 sm:h-10 overflow-hidden min-w-0">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2 sm:pr-4 transition-all duration-500"
                      style={{
                        width: `${Math.min((month.totalAmount / Math.max(...stats.monthlyTotals.map(m => m.totalAmount))) * 100, 100)}%`,
                      }}
                    >
                      {month.totalAmount > 0 && (
                        <span className="text-[10px] sm:text-xs font-semibold text-white truncate">
                          {formatCurrency(month.totalAmount)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button fullWidth size="lg" onClick={() => router.push('/new-purchase')}>
          <ShoppingCart className="h-5 w-5" />
          <span className="ml-2">New Purchase</span>
        </Button>
        <Button variant="secondary" fullWidth size="lg" onClick={() => router.push('/projects')}>
          <FolderOpen className="h-5 w-5" />
          <span className="ml-2">View Projects</span>
        </Button>
        <Button variant="secondary" fullWidth size="lg" onClick={() => router.push('/vendors')}>
          <Building2 className="h-5 w-5" />
          <span className="ml-2">View Vendors</span>
        </Button>
      </div>
    </div>
  )
}
