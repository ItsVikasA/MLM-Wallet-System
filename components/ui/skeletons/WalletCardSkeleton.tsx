import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WalletCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40 mt-2" />
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </div>
    </Card>
  )
}
