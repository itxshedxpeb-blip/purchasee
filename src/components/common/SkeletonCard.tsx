import { SkeletonLoader } from './LoadingState'

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-8 w-32" />
        </div>
        <SkeletonLoader className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <SkeletonLoader className="h-4 w-24" />
      <SkeletonLoader className="h-4 w-20" />
      <SkeletonLoader className="h-4 w-28" />
      <SkeletonLoader className="h-4 w-20 ml-auto" />
    </div>
  )
}

export function ListCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-3">
        <SkeletonLoader className="h-5 w-32" />
        <SkeletonLoader className="h-4 w-48" />
        <div className="flex gap-2 pt-2">
          <SkeletonLoader className="h-8 w-24" />
          <SkeletonLoader className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}
