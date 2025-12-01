import { connectDB } from '@/lib/db/connection'
import { registerMember } from '@/services/memberService'
import { createPackage } from '@/lib/db/helpers'

async function seed() {
  try {
    console.log('🌱 Starting database seed...')
    
    // Connect to database
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Create packages
    console.log('\n📦 Creating packages...')
    const basicPackage = await createPackage({
      name: 'Basic Package',
      price: 100,
      commissionRate: 0.10,
      description: 'Entry level package with 10% commission',
      isActive: true,
    })
    console.log('✅ Created Basic Package:', basicPackage._id)

    const premiumPackage = await createPackage({
      name: 'Premium Package',
      price: 500,
      commissionRate: 0.15,
      description: 'Premium package with 15% commission',
      isActive: true,
    })
    console.log('✅ Created Premium Package:', premiumPackage._id)

    const vipPackage = await createPackage({
      name: 'VIP Package',
      price: 1000,
      commissionRate: 0.20,
      description: 'VIP package with 20% commission',
      isActive: true,
    })
    console.log('✅ Created VIP Package:', vipPackage._id)

    // Register root member (no sponsor)
    console.log('\n👤 Registering members...')
    const rootMember = await registerMember({
      username: 'admin',
      password: 'admin123',
    })
    
    if (rootMember.success) {
      console.log('✅ Created root member (admin):', rootMember.member?.id)

      // Register member under admin
      const member1 = await registerMember({
        username: 'john_doe',
        password: 'password123',
        sponsorId: rootMember.member?.id,
      })
      
      if (member1.success) {
        console.log('✅ Created member (john_doe):', member1.member?.id)
      }

      // Register another member under admin
      const member2 = await registerMember({
        username: 'jane_smith',
        password: 'password123',
        sponsorId: rootMember.member?.id,
      })
      
      if (member2.success) {
        console.log('✅ Created member (jane_smith):', member2.member?.id)
      }

      // Register member under john_doe
      if (member1.success) {
        const member3 = await registerMember({
          username: 'bob_wilson',
          password: 'password123',
          sponsorId: member1.member?.id,
        })
        
        if (member3.success) {
          console.log('✅ Created member (bob_wilson):', member3.member?.id)
        }
      }
    }

    console.log('\n✅ Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log('- 3 Packages created')
    console.log('- 4 Members registered')
    console.log('- 8 Wallets initialized (2 per member)')
    console.log('- 4 Tree nodes created')
    console.log('\n🔐 Login credentials:')
    console.log('Username: admin | Password: admin123')
    console.log('Username: john_doe | Password: password123')
    console.log('Username: jane_smith | Password: password123')
    console.log('Username: bob_wilson | Password: password123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed()
