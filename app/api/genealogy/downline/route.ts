import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDownline } from '@/services/genealogyService'
import { connectDB } from '@/lib/db/connection'



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId') || session.user.id
    const maxDepth = searchParams.get('maxDepth')
      ? parseInt(searchParams.get('maxDepth')!)
      : undefined

    const result = await getDownline(memberId, maxDepth)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ downline: result.downline })
  } catch (error: any) {
    console.error('Error fetching downline:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch downline' },
      { status: 500 }
    )
  }
}
