// Quick MongoDB Connection Test
// Run with: node scripts/test-mongodb.js

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI

console.log('🔍 Testing MongoDB Connection...')
console.log('📍 URI:', MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'))

async function testConnection() {
  try {
    console.log('\n⏳ Connecting to MongoDB...')
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    })
    
    console.log('✅ MongoDB Connected Successfully!')
    console.log('📊 Connection State:', mongoose.connection.readyState)
    console.log('🗄️  Database:', mongoose.connection.db.databaseName)
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📁 Collections:', collections.map(c => c.name).join(', ') || 'None yet')
    
    await mongoose.disconnect()
    console.log('\n✅ Test completed successfully!')
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!')
    console.error('Error:', error.message)
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 SOLUTION:')
      console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/')
      console.log('2. Click "Network Access" in sidebar')
      console.log('3. Click "Add IP Address"')
      console.log('4. Click "Allow Access from Anywhere" (for demo)')
      console.log('5. Wait 1-2 minutes and try again')
      console.log('\nOR use local MongoDB:')
      console.log('MONGODB_URI=mongodb://localhost:27017/mlm-wallet-system')
    }
    
    process.exit(1)
  }
}

testConnection()
