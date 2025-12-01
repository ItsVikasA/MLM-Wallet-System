import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db/connection'
import { findTreeNodeByMemberId, findMemberById } from '@/lib/db/helpers'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const memberId = session.user.id

    // Get tree node with leg volumes
    const treeNode = await findTreeNodeByMemberId(memberId)
    if (!treeNode) {
      return NextResponse.json(
        { error: 'Member not found in tree' },
        { status: 404 }
      )
    }

    // Get member's active package to calculate next pairing
    const member = await findMemberById(memberId)
    let nextPairingAmount = 0
    let commissionRate = 0

    if (member?.activePackageId) {
      const Package = (await import('@/models/Package')).default
      const activePackage = await Package.findById(member.activePackageId)
      if (activePackage) {
        commissionRate = activePackage.commissionRate
        const minVolume = Math.min(treeNode.leftLegVolume, treeNode.rightLegVolume)
        nextPairingAmount = minVolume * (commissionRate / 100)
      }
    }

    return NextResponse.json({
      leftLegVolume: treeNode.leftLegVolume,
      rightLegVolume: treeNode.rightLegVolume,
      nextPairingAmount,
      commissionRate,
      hasActivePackage: !!member?.activePackageId,
    })
  } catch (error: any) {
    console.error('Error fetching leg volumes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leg volumes' },
      { status: 500 }
    )
  }
}
