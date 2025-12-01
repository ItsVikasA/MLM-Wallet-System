import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { purchasePackage } from '@/services/packageService'
import { connectDB } from '@/lib/db/connection'



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    await connectDB()
    const result = await purchasePackage(session.user.id, packageId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to purchase package' },
        { status: 400 }
      )
    }

    return NextResponse.json(result.purchase)
  } catch (error: any) {
    console.error('Error in POST /api/packages/purchase:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
