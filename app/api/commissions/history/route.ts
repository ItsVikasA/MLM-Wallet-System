import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db/connection'
import TransactionModel from '@/models/Transaction'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const memberId = session.user.id

    // Get all commission transactions (these represent pairing events)
    const commissionHistory = await TransactionModel.find({
      memberId,
      type: 'commission',
    })
      .sort({ timestamp: -1 })
      .limit(50)

    const history = commissionHistory.map((transaction) => ({
      id: transaction._id.toString(),
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      description: transaction.description,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      relatedMemberId: transaction.relatedMemberId?.toString(),
    }))

    return NextResponse.json({ history })
  } catch (error: any) {
    console.error('Error fetching commission history:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commission history' },
      { status: 500 }
    )
  }
}
