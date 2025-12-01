'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Wallet, 
  DollarSign,
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Minus,
  Filter,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { WalletCardSkeleton } from '@/components/ui/skeletons/WalletCardSkeleton'
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

interface WalletData {
  mainBalance: number
  commissionBalance: number
}

interface Transaction {
  id: string
  memberId: string
  walletType: 'main' | 'commission'
  type: 'deposit' | 'purchase' | 'commission' | 'withdrawal'
  amount: number
  balanceBefore: number
  balanceAfter: number
  timestamp: string
  description: string
  relatedMemberId?: string
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  
  // Filters
  const [walletTypeFilter, setWalletTypeFilter] = useState<string>('all')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchWallets()
    fetchTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, walletTypeFilter, transactionTypeFilter, startDate, endDate])

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets')
      if (!response.ok) throw new Error('Failed to fetch wallets')
      const data = await response.json()
      setWallets(data)
    } catch (error) {
      console.error('Error fetching wallets:', error)
      toast.error('Failed to load wallet data')
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wallets/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Wallet type filter
    if (walletTypeFilter !== 'all') {
      filtered = filtered.filter(t => t.walletType === walletTypeFilter)
    }

    // Transaction type filter
    if (transactionTypeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === transactionTypeFilter)
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(t => new Date(t.timestamp) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter(t => new Date(t.timestamp) <= new Date(endDate))
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/wallets/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Deposit failed')
      }

      toast.success(`Successfully deposited $${amount.toFixed(2)}`)
      setDepositDialogOpen(false)
      setDepositAmount('')
      await fetchWallets()
      await fetchTransactions()
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (wallets && amount > wallets.commissionBalance) {
      toast.error('Insufficient balance')
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/wallets/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed')
      }

      toast.success(`Successfully withdrew $${amount.toFixed(2)}`)
      setWithdrawDialogOpen(false)
      setWithdrawAmount('')
      await fetchWallets()
      await fetchTransactions()
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed')
    } finally {
      setProcessing(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Wallet', 'Amount', 'Balance Before', 'Balance After', 'Description']
    const rows = filteredTransactions.map(t => [
      format(new Date(t.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      t.type,
      t.walletType,
      t.amount.toFixed(2),
      t.balanceBefore.toFixed(2),
      t.balanceAfter.toFixed(2),
      t.description
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'commission':
        return <ArrowUpRight className="h-4 w-4" />
      case 'withdrawal':
      case 'purchase':
        return <ArrowDownRight className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'commission':
        return 'text-green-600 bg-green-100'
      case 'withdrawal':
      case 'purchase':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeBadgeVariant = (type: string): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" => {
    switch (type) {
      case 'deposit':
        return 'success'
      case 'commission':
        return 'default'
      case 'withdrawal':
        return 'warning'
      case 'purchase':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
            <p className="text-muted-foreground">
              Manage your main wallet and commission wallet
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
                  <div className="text-4xl font-bold mb-4">
                    ${wallets?.mainBalance.toFixed(2) || '0.00'}
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setDepositDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
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
                  <div className="text-4xl font-bold mb-4">
                    ${wallets?.commissionBalance.toFixed(2) || '0.00'}
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setWithdrawDialogOpen(true)}
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>View and filter all your transactions</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToCSV}
                  disabled={filteredTransactions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Wallet Type</label>
                  <Select
                    value={walletTypeFilter}
                    onChange={(e) => setWalletTypeFilter(e.target.value)}
                  >
                    <option value="all">All Wallets</option>
                    <option value="main">Main Wallet</option>
                    <option value="commission">Commission Wallet</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Transaction Type</label>
                  <Select
                    value={transactionTypeFilter}
                    onChange={(e) => setTransactionTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="purchase">Purchase</option>
                    <option value="commission">Commission</option>
                    <option value="withdrawal">Withdrawal</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Transaction Table */}
              {loading ? (
                <TableSkeleton rows={10} columns={6} />
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTypeBadgeVariant(transaction.type)}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {transaction.walletType}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className={`rounded-full p-1 ${getTransactionColor(transaction.type)}`}>
                                {getTransactionIcon(transaction.type)}
                              </div>
                              <span className={
                                transaction.type === 'deposit' || transaction.type === 'commission'
                                  ? 'text-green-600 font-semibold'
                                  : 'text-red-600 font-semibold'
                              }>
                                {transaction.type === 'deposit' || transaction.type === 'commission' ? '+' : '-'}
                                ${transaction.amount.toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${transaction.balanceAfter.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                        {filteredTransactions.length} transactions
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Deposit Dialog */}
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit to Main Wallet</DialogTitle>
              <DialogDescription>
                Enter the amount you want to deposit to your main wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDepositDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Deposit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw from Commission Wallet</DialogTitle>
              <DialogDescription>
                Available balance: ${wallets?.commissionBalance.toFixed(2) || '0.00'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  max={wallets?.commissionBalance || 0}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setWithdrawDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={processing}
                variant="destructive"
              >
                {processing ? 'Processing...' : 'Withdraw'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
