import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMember } from '@/services/memberService'
import { getDownline } from '@/services/genealogyService'
import { connectDB } from '@/lib/db/connection'
import { findTransactionsByMemberId } from '@/lib/db/helpers'



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const memberId = session.user.id

    // Get member information
    const memberResult = await getMember(memberId)
    if (!memberResult.success) {
      return NextResponse.json({ error: memberResult.error }, { status: 400 })
    }

    // Get sponsor information if exists
    let sponsor = null
    if (memberResult.member && memberResult.member.sponsorId) {
      const sponsorResult = await getMember(memberResult.member.sponsorId)
      if (sponsorResult.success && sponsorResult.member) {
        sponsor = {
          id: sponsorResult.member.id,
          username: sponsorResult.member.username,
        }
      }
    }

    // Get downline count
    const downlineResult = await getDownline(memberId)
    const totalDownline = downlineResult.success ? downlineResult.downline?.length || 0 : 0

    // Get total purchases (count of purchase transactions)
    const transactions = await findTransactionsByMemberId(memberId)
    const totalPurchases = transactions.filter((t: any) => t.type === 'purchase').length

    return NextResponse.json({
      member: memberResult.member,
      sponsor,
      statistics: {
        totalDownline,
        totalPurchases,
      },
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
