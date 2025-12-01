'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package as PackageIcon, Calendar, TrendingUp } from 'lucide-react'
import { Package } from '@/types'
import { format } from 'date-fns'
import Link from 'next/link'

interface ActivePackageCardProps {
  package: Package | null
  purchaseDate?: Date
  showDetails?: boolean
}

export function ActivePackageCard({ 
  package: activePackage, 
  purchaseDate,
  showDetails = false 
}: ActivePackageCardProps) {
  if (!activePackage) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <PackageIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg font-medium mb-2">No Active Package</p>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Purchase a package to activate your account and start earning commissions
          </p>
          <Link href="/packages">
            <Button>Browse Packages</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white mb-1">Active Package</CardTitle>
              <CardDescription className="text-white/80">
                Your current subscription
              </CardDescription>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <PackageIcon className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold mb-1">{activePackage.name}</div>
              <p className="text-white/90 text-sm">{activePackage.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
              <div>
                <div className="text-white/80 text-xs mb-1">Package Price</div>
                <div className="text-xl font-bold">${activePackage.price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-white/80 text-xs mb-1">Commission Rate</div>
                <div className="text-xl font-bold">
                  {(activePackage.commissionRate * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {showDetails && purchaseDate && (
              <div className="pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Purchased on {format(purchaseDate, 'MMM dd, yyyy')}</span>
                </div>
              </div>
            )}

            {showDetails && (
              <div className="pt-3">
                <Link href="/packages">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                  >
                    View All Packages
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
