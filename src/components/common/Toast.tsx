'use client'

import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  type: 'success' | 'error' | 'warning'
  message: string
  onClose: () => void
}

export default function Toast({ type, message, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-lg page-transition',
        bgColors[type]
      )}
    >
      {icons[type]}
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/50 transition-colors text-gray-400 hover:text-gray-600"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
