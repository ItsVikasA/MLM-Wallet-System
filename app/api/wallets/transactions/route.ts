import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTransactionHistory } from '@/services/walletService'
import { connectDB } from '@/lib/db/connection'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const walletType = searchParams.get('walletType') as 'main' | 'commission' | null
    const transactionType = searchParams.get('type') as 'deposit' | 'purchase' | 'commission' | 'withdrawal' | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await connectDB()
    
    const result = await getTransactionHistory({
      memberId: session.user.id,
      walletType: walletType || undefined,
      transactionType: transactionType || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      transactions: result.transactions,
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
