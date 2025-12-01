import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUpline } from '@/services/genealogyService'
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

    const result = await getUpline(memberId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ upline: result.upline })
  } catch (error: any) {
    console.error('Error fetching upline:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch upline' },
      { status: 500 }
    )
  }
}
