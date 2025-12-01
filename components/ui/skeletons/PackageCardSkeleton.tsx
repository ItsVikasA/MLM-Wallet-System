import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PackageCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Gradient Header */}
      <div className="p-6 bg-gradient-to-br from-gray-200 to-gray-300">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-full bg-white/30" />
          <Skeleton className="h-6 w-16 bg-white/30" />
        </div>
        <Skeleton className="h-7 w-32 mb-2 bg-white/30" />
        <Skeleton className="h-10 w-24 bg-white/30" />
      </div>

      {/* Package Details */}
      <CardContent className="p-6">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
