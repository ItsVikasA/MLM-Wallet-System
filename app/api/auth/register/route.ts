import { NextRequest, NextResponse } from 'next/server'
import { registerMember } from '@/services/memberService'
import { connectDB } from '@/lib/db/connection'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB()

    const body = await request.json()
    const { username, password, sponsorId } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Register member
    const result = await registerMember({
      username,
      password,
      sponsorId,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      member: result.member,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Provide helpful error messages
    let errorMessage = 'Registration failed'
    
    if (error.name === 'MongooseServerSelectionError') {
      errorMessage = 'Database connection failed. Please check MongoDB Atlas IP whitelist or use local MongoDB.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
