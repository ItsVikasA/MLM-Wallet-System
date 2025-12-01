require('dotenv').config({ path: '.env.local' })

// Register tsconfig-paths first
require('tsconfig-paths/register')

require('ts-node').register({
  project: './tsconfig.seed.json',
  transpileOnly: true,
})

require('./seed.ts')
