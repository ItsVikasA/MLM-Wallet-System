'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LegVolumeVisualization } from '@/components/commissions/LegVolumeVisualization'
import { PairingHistory } from '@/components/commissions/PairingHistory'
import { 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Activity
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DashboardCardSkeleton } from '@/components/ui/skeletons/DashboardCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

interface CommissionSummary {
  totalCommissions: number
  monthlyBreakdown: { month: string; amount: number }[]
  weeklyBreakdown: { week: string; amount: number }[]
  legVolumes: { left: number; right: number }
  recentCommissions: {
    id: string
    amount: number
    timestamp: string
    description: string
    relatedMemberId?: string
  }[]
}

interface LegVolumeData {
  leftLegVolume: number
  rightLegVolume: number
  nextPairingAmount: number
  commissionRate: number
  hasActivePackage: boolean
}

interface PairingRecord {
  id: string
  amount: number
  timestamp: string
  description: string
  balanceBefore: number
  balanceAfter: number
  relatedMemberId?: string
}

export default function CommissionsPage() {
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [legVolumes, setLegVolumes] = useState<LegVolumeData | null>(null)
  const [pairingHistory, setPairingHistory] = useState<PairingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('monthly')

  useEffect(() => {
    fetchCommissionData()
  }, [])

  const fetchCommissionData = async () => {
    try {
      setLoading(true)
      const [summaryRes, legVolumesRes, historyRes] = await Promise.all([
        fetch('/api/commissions/summary'),
        fetch('/api/commissions/leg-volumes'),
        fetch('/api/commissions/history'),
      ])

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }

      if (legVolumesRes.ok) {
        const legData = await legVolumesRes.json()
        setLegVolumes(legData)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setPairingHistory(historyData.history || [])
      }
    } catch (error) {
      console.error('Error fetching commission data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-3">
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
              <DashboardCardSkeleton />
            </div>

            {/* Leg Volume Visualization Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>

            {/* Commission Trends Chart Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>

            {/* Recent Commissions Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const chartData = chartView === 'monthly' 
    ? summary?.monthlyBreakdown.map(item => ({
        period: format(parseISO(item.month + '-01'), 'MMM yyyy'),
        amount: item.amount,
      })) || []
    : summary?.weeklyBreakdown.slice(-12).map(item => ({
        period: format(parseISO(item.week), 'MMM dd'),
        amount: item.amount,
      })) || []

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commission Tracking</h1>
            <p className="text-muted-foreground">
              Monitor your earnings and leg volume performance
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Total Commissions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Commissions Earned
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary?.totalCommissions.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time earnings
                </p>
              </CardContent>
            </Card>

            {/* Left Leg Volume */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Left Leg Volume
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${legVolumes?.leftLegVolume.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Accumulated sales
                </p>
              </CardContent>
            </Card>

            {/* Right Leg Volume */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Right Leg Volume
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${legVolumes?.rightLegVolume.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Accumulated sales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Leg Volume Visualization */}
          {legVolumes && (
            <LegVolumeVisualization
              leftLegVolume={legVolumes.leftLegVolume}
              rightLegVolume={legVolumes.rightLegVolume}
              nextPairingAmount={legVolumes.nextPairingAmount}
              commissionRate={legVolumes.commissionRate}
              hasActivePackage={legVolumes.hasActivePackage}
            />
          )}

          {/* Commission Trends Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission Trends</CardTitle>
                  <CardDescription>
                    Track your commission earnings over time
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={chartView === 'monthly' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChartView('monthly')}
                  >
                    Monthly
                  </Badge>
                  <Badge
                    variant={chartView === 'weekly' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setChartView('weekly')}
                  >
                    Weekly
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No commission data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Bar dataKey="amount" fill="#8884d8" name="Commission" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Commissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Commissions</CardTitle>
              <CardDescription>Your latest commission earnings</CardDescription>
            </CardHeader>
            <CardContent>
              {!summary?.recentCommissions || summary.recentCommissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commissions earned yet
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.recentCommissions.map((commission) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full p-2 bg-green-100 text-green-600">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{commission.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(commission.timestamp), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        +${commission.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pairing History */}
          <PairingHistory history={pairingHistory} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
