'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ActivePackageCard } from '@/components/packages/ActivePackageCard'
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  Package as PackageIcon,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { Package } from '@/types'
import { DashboardCardSkeleton } from '@/components/ui/skeletons/DashboardCardSkeleton'
import { WalletCardSkeleton } from '@/components/ui/skeletons/WalletCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

interface WalletData {
  mainBalance: number
  commissionBalance: number
}

interface Transaction {
  id: string
  type: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  amount: number
  timestamp: string
  description: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [wallets, setWallets] = useState<WalletData | null>(null)
  const [activePackage, setActivePackage] = useState<Package | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchWallets(),
        fetchActivePackage(),
        fetchRecentTransactions()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets')
      if (!response.ok) throw new Error('Failed to fetch wallets')
      const data = await response.json()
      setWallets(data)
    } catch (error) {
      console.error('Error fetching wallets:', error)
    }
  }

  const fetchActivePackage = async () => {
    try {
      const response = await fetch('/api/packages/active')
      if (!response.ok) throw new Error('Failed to fetch active package')
      const data = await response.json()
      setActivePackage(data)
    } catch (error) {
      console.error('Error fetching active package:', error)
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/wallets/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      const recent = (data.transactions || []).slice(0, 5)
      setRecentTransactions(recent)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Welcome Section */}
            <div>
              <Skeleton className="h-9 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>

            {/* Wallet Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
              <WalletCardSkeleton />
              <WalletCardSkeleton />
            </div>

            {/* Active Package Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>

            {/* Recent Transactions Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your account.
          </p>
        </div>

        {/* Wallet Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Main Wallet */}
          <Card className="overflow-hidden">
            <div className="gradient-wallet-main p-6 text-white">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Main Wallet</CardTitle>
                  <Wallet className="h-5 w-5 opacity-80" />
                </div>
                <CardDescription className="text-white/80">
                  Available for purchases
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${wallets?.mainBalance.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="flex-1"
                    onClick={() => router.push('/wallets')}
                  >
                    Deposit
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-white/20 text-white hover:bg-white/30 border border-white/30"
                    onClick={() => router.push('/packages')}
                  >
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Commission Wallet */}
          <Card className="overflow-hidden">
            <div className="gradient-wallet-commission p-6 text-white">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Commission Wallet</CardTitle>
                  <DollarSign className="h-5 w-5 opacity-80" />
                </div>
                <CardDescription className="text-white/80">
                  Earned commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ${wallets?.commissionBalance.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="mt-4">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => router.push('/wallets')}
                  >
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Active Package Card */}
        <ActivePackageCard package={activePackage} showDetails={true} />

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/transactions')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const isCredit = transaction.type === 'deposit' || transaction.type === 'commission'
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${
                          isCredit
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {isCredit ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.timestamp), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        isCredit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isCredit ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  )
}
