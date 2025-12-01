'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface LegVolumeVisualizationProps {
  leftLegVolume: number
  rightLegVolume: number
  nextPairingAmount: number
  commissionRate: number
  hasActivePackage: boolean
}

export function LegVolumeVisualization({
  leftLegVolume,
  rightLegVolume,
  nextPairingAmount,
  commissionRate,
  hasActivePackage,
}: LegVolumeVisualizationProps) {
  const minLegVolume = Math.min(leftLegVolume, rightLegVolume)
  const maxLegVolume = Math.max(leftLegVolume, rightLegVolume)
  const pairingProgress = maxLegVolume > 0 ? (minLegVolume / maxLegVolume) * 100 : 0
  const balanceDifference = Math.abs(leftLegVolume - rightLegVolume)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leg Volume Balance</CardTitle>
        <CardDescription>
          Visual representation of your left and right leg volumes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Leg Volume Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Left Leg</span>
                  {leftLegVolume < rightLegVolume && (
                    <Badge variant="outline" className="text-xs">
                      Weaker
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold text-blue-600">
                  ${leftLegVolume.toFixed(2)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: maxLegVolume > 0 ? `${(leftLegVolume / maxLegVolume) * 100}%` : '0%',
                  }}
                >
                  {leftLegVolume > 0 && (
                    <span className="text-xs text-white font-medium">
                      {((leftLegVolume / maxLegVolume) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Right Leg</span>
                  {rightLegVolume < leftLegVolume && (
                    <Badge variant="outline" className="text-xs">
                      Weaker
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold text-green-600">
                  ${rightLegVolume.toFixed(2)}
                </span>
              </div>
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{
                    width: maxLegVolume > 0 ? `${(rightLegVolume / maxLegVolume) * 100}%` : '0%',
                  }}
                >
                  {rightLegVolume > 0 && (
                    <span className="text-xs text-white font-medium">
                      {((rightLegVolume / maxLegVolume) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Indicator */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Balance Status</span>
              <Badge
                variant={pairingProgress >= 80 ? 'success' : pairingProgress >= 50 ? 'default' : 'warning'}
              >
                {pairingProgress >= 80 ? 'Well Balanced' : pairingProgress >= 50 ? 'Moderate' : 'Unbalanced'}
              </Badge>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${pairingProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {pairingProgress.toFixed(1)}% balanced • Difference: ${balanceDifference.toFixed(2)}
            </p>
          </div>

          {/* Pairing Information */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 bg-purple-100 text-purple-600 mt-0.5">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Next Pairing Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${nextPairingAmount.toFixed(2)}
                </p>
                {hasActivePackage && commissionRate > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {commissionRate}% commission rate from your active package
                  </p>
                )}
              </div>
            </div>

            {!hasActivePackage && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900">No Active Package</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Purchase a package to start earning commissions from your leg volumes
                  </p>
                </div>
              </div>
            )}

            {hasActivePackage && minLegVolume > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">Ready to Pair!</p>
                <p className="text-xs text-green-700 mt-1">
                  Your next downline purchase will trigger a pairing and credit ${nextPairingAmount.toFixed(2)} to your commission wallet
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
