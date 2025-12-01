import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db/connection'
import TransactionModel from '@/models/Transaction'
import { findTreeNodeByMemberId } from '@/lib/db/helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const memberId = session.user.id

    // Get all commission transactions
    const commissionTransactions = await TransactionModel.find({
      memberId,
      type: 'commission',
    }).sort({ timestamp: -1 })

    // Calculate total commissions earned (all-time)
    const totalCommissions = commissionTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )

    // Get commission breakdown by month
    const monthlyBreakdown: { [key: string]: number } = {}
    const weeklyBreakdown: { [key: string]: number } = {}

    commissionTransactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp)
      
      // Monthly breakdown
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyBreakdown[monthKey] = (monthlyBreakdown[monthKey] || 0) + transaction.amount

      // Weekly breakdown (ISO week)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      weeklyBreakdown[weekKey] = (weeklyBreakdown[weekKey] || 0) + transaction.amount
    })

    // Get leg volumes
    const treeNode = await findTreeNodeByMemberId(memberId)
    const legVolumes = treeNode
      ? {
          left: treeNode.leftLegVolume,
          right: treeNode.rightLegVolume,
        }
      : { left: 0, right: 0 }

    return NextResponse.json({
      totalCommissions,
      monthlyBreakdown: Object.entries(monthlyBreakdown)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      weeklyBreakdown: Object.entries(weeklyBreakdown)
        .map(([week, amount]) => ({ week, amount }))
        .sort((a, b) => a.week.localeCompare(b.week)),
      legVolumes,
      recentCommissions: commissionTransactions.slice(0, 10).map((t) => ({
        id: t._id.toString(),
        amount: t.amount,
        timestamp: t.timestamp,
        description: t.description,
        relatedMemberId: t.relatedMemberId?.toString(),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching commission summary:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commission summary' },
      { status: 500 }
    )
  }
}
