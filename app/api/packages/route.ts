import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAvailablePackages } from '@/services/packageService'
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

    await connectDB()
    const result = await getAvailablePackages()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.packages || [])
  } catch (error: any) {
    console.error('Error in GET /api/packages:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
