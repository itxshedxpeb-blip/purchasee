'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import LoadingState from '@/components/common/LoadingState'
import EmptyState from '@/components/common/EmptyState'
import Input from '@/components/common/Input'
import Select from '@/components/common/Select'
import { FileText, Search } from 'lucide-react'
import PurchaseCard from '@/components/purchase/PurchaseCard'
import Button from '@/components/common/Button'

interface Project {
  id: string
  siteCode: string
  name: string
  clientName: string
}

interface Vendor {
  id: string
  name: string
}

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: string
  project: Project
  vendor: Vendor
  deliveryLocation: string
  invoiceNumber: string | null
  totalAmount: number
}

interface PurchasesResponse {
  purchases: Purchase[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function PurchasesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [filters, setFilters] = useState({
    search: '',
    projectId: '',
    vendorId: '',
    fromDate: '',
    toDate: '',
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [purchasesRes, projectsRes, vendorsRes] = await Promise.all([
          fetch(`/api/purchases?${new URLSearchParams({
            ...filters,
            page: pagination.page.toString(),
            limit: pagination.limit.toString(),
          })}`),
          fetch('/api/projects'),
          fetch('/api/vendors'),
        ])

        const purchasesData = await purchasesRes.json()
        const projectsData = await projectsRes.json()
        const vendorsData = await vendorsRes.json()

        if (purchasesData.success) {
          setPurchases(purchasesData.data.purchases)
          setPagination(purchasesData.data.pagination)
        }
        if (projectsData.success) setProjects(projectsData.data)
        if (vendorsData.success) setVendors(vendorsData.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters, pagination.page])

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const handlePurchaseClick = (id: string) => {
    router.push(`/purchases/${id}`)
  }

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: `${p.siteCode} - ${p.name}` })),
  ]

  const vendorOptions = [
    { value: '', label: 'All Vendors' },
    ...vendors.map((v) => ({ value: v.id, label: v.name })),
  ]

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Purchases</h1>
        <p className="text-gray-500 mt-2">View and manage purchase history</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search purchases..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.projectId}
            onChange={(e) => handleFilterChange('projectId', e.target.value)}
            options={projectOptions}
          />

          <Select
            value={filters.vendorId}
            onChange={(e) => handleFilterChange('vendorId', e.target.value)}
            options={vendorOptions}
          />

          <Input
            type="date"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            label="From Date"
          />

          <Input
            type="date"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            label="To Date"
          />
        </div>
      </div>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No purchases found"
          description="Create your first purchase to get started"
          actionLabel="New Purchase"
          onAction={() => router.push('/new-purchase')}
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onClick={() => handlePurchaseClick(purchase.id)}
              />
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Purchase No.</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Project</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Vendor</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Delivery</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Invoice</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      onClick={() => handlePurchaseClick(purchase.id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{purchase.purchaseNumber}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{formatShortDate(purchase.purchaseDate)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{purchase.project.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{purchase.vendor.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{purchase.deliveryLocation}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{purchase.invoiceNumber || '-'}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(purchase.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Pagination */}
          {pagination.totalPages > 1 && (
            <div className="md:hidden flex items-center justify-between py-4">
              <p className="text-sm text-gray-500">
                {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
