'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Package as PackageIcon, Check, Sparkles, Crown, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Package } from '@/types'
import { PackageCardSkeleton } from '@/components/ui/skeletons/PackageCardSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

interface WalletData {
  mainBalance: number
  commissionBalance: number
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [activePackage, setActivePackage] = useState<Package | null>(null)
  const [wallets, setWallets] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchPackages(),
        fetchActivePackage(),
        fetchWallets()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      if (!response.ok) throw new Error('Failed to fetch packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast.error('Failed to load packages')
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

  const handlePurchaseClick = (pkg: Package) => {
    setSelectedPackage(pkg)
    setPurchaseDialogOpen(true)
  }

  const handlePurchase = async () => {
    if (!selectedPackage) return

    // Validate sufficient balance
    if (wallets && wallets.mainBalance < selectedPackage.price) {
      toast.error('Insufficient balance in main wallet')
      return
    }

    setPurchasing(true)
    try {
      const response = await fetch('/api/packages/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      toast.success(`Successfully purchased ${selectedPackage.name}!`, {
        description: `${data.commissionsDistributed || 0} upline members received commissions`
      })
      
      setPurchaseDialogOpen(false)
      setSelectedPackage(null)
      await fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed')
    } finally {
      setPurchasing(false)
    }
  }

  const getPackageIcon = (index: number) => {
    const icons = [PackageIcon, Zap, Sparkles, Crown]
    const Icon = icons[index % icons.length]
    return <Icon className="h-6 w-6" />
  }

  const getPackageGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-emerald-500',
    ]
    return gradients[index % gradients.length]
  }

  const isActivePackage = (pkg: Package) => {
    return activePackage?.id === pkg.id
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div>
              <Skeleton className="h-9 w-32 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>

            {/* Current Balance Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-32" />
              </CardContent>
            </Card>

            {/* Packages Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PackageCardSkeleton />
              <PackageCardSkeleton />
              <PackageCardSkeleton />
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
            <p className="text-muted-foreground">
              Choose a package to activate your account and start earning commissions
            </p>
          </div>

          {/* Current Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Main Wallet Balance</CardTitle>
              <CardDescription>Available for package purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${wallets?.mainBalance.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          {/* Packages Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, index) => (
              <Card 
                key={pkg.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isActivePackage(pkg) ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${getPackageGradient(index)} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-full bg-white/20 p-3">
                      {getPackageIcon(index)}
                    </div>
                    {isActivePackage(pkg) && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${pkg.price.toFixed(0)}</span>
                    <span className="text-white/80">.00</span>
                  </div>
                </div>

                {/* Package Details */}
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 min-h-[3rem]">
                    {pkg.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Commission Rate</span>
                      <span className="font-semibold">{(pkg.commissionRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={pkg.isActive ? 'success' : 'secondary'}>
                        {pkg.isActive ? 'Available' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isActivePackage(pkg) ? 'outline' : 'default'}
                    disabled={isActivePackage(pkg) || !pkg.isActive}
                    onClick={() => handlePurchaseClick(pkg)}
                  >
                    {isActivePackage(pkg) ? 'Current Package' : 'Purchase Package'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {packages.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No packages available</p>
                <p className="text-sm text-muted-foreground">
                  Check back later for available packages
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Purchase Confirmation Dialog */}
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Package Purchase</DialogTitle>
              <DialogDescription>
                Review the details before completing your purchase
              </DialogDescription>
            </DialogHeader>
            
            {selectedPackage && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Package</span>
                    <span className="text-lg font-bold">{selectedPackage.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Price</span>
                    <span className="text-lg font-bold">${selectedPackage.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Commission Rate</span>
                    <span className="text-lg font-bold">
                      {(selectedPackage.commissionRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-medium">${wallets?.mainBalance.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">After Purchase</span>
                    <span className="font-medium">
                      ${((wallets?.mainBalance || 0) - selectedPackage.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {wallets && wallets.mainBalance < selectedPackage.price && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-sm text-destructive font-medium">
                      Insufficient balance. Please deposit funds to your main wallet first.
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPurchaseDialogOpen(false)}
                disabled={purchasing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={purchasing || !!(wallets && selectedPackage && wallets.mainBalance < selectedPackage.price)}
              >
                {purchasing ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
