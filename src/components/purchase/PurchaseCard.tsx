import { formatCurrency, formatShortDate } from '@/lib/utils'
import { FileText, MoreVertical } from 'lucide-react'

interface Purchase {
  id: string
  purchaseNumber: string
  purchaseDate: string
  project: { name: string }
  vendor: { name: string }
  deliveryLocation: string
  invoiceNumber: string | null
  totalAmount: number
}

interface PurchaseCardProps {
  purchase: Purchase
  onClick: () => void
}

export default function PurchaseCard({ purchase, onClick }: PurchaseCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{purchase.purchaseNumber}</p>
            <p className="text-sm text-gray-500">{formatShortDate(purchase.purchaseDate)}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Project</span>
          <span className="font-medium text-gray-900">{purchase.project.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Vendor</span>
          <span className="font-medium text-gray-900">{purchase.vendor.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Delivery</span>
          <span className="font-medium text-gray-900 truncate max-w-[150px]">{purchase.deliveryLocation}</span>
        </div>
        {purchase.invoiceNumber && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Invoice</span>
            <span className="font-medium text-gray-900">{purchase.invoiceNumber}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-lg font-bold text-blue-600">{formatCurrency(purchase.totalAmount)}</p>
      </div>
    </div>
  )
}
