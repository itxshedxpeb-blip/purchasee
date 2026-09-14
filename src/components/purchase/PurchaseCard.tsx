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
      className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{purchase.purchaseNumber}</p>
            <p className="text-xs sm:text-sm text-gray-500">{formatShortDate(purchase.purchaseDate)}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 min-h-[40px] min-w-[40px]">
          <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Project</span>
          <span className="font-medium text-gray-900 truncate ml-2">{purchase.project.name}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Vendor</span>
          <span className="font-medium text-gray-900 truncate ml-2">{purchase.vendor.name}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-500">Delivery</span>
          <span className="font-medium text-gray-900 truncate ml-2">{purchase.deliveryLocation}</span>
        </div>
        {purchase.invoiceNumber && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-500">Invoice</span>
            <span className="font-medium text-gray-900 truncate ml-2">{purchase.invoiceNumber}</span>
          </div>
        )}
      </div>

      <div className="pt-2 sm:pt-3 border-t border-gray-100">
        <p className="text-base sm:text-lg font-bold text-blue-600">{formatCurrency(purchase.totalAmount)}</p>
      </div>
    </div>
  )
}
