#!/usr/bin/env node
/**
 * v0-test.ts - v0 Platform API テストスクリプト
 *
 * Usage:
 *   V0_API_KEY=your_key npx tsx scripts/v0-test.ts
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const apiKey = process.env.V0_API_KEY

  if (!apiKey) {
    console.error('❌ Error: V0_API_KEY not found in environment')
    console.error('   Please set V0_API_KEY in .env.local')
    process.exit(1)
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 20) + '...')
  console.log('')

  try {
    console.log('📡 Testing v0 Platform API connection...')
    console.log('')

    // Simple test: create a chat with a basic prompt
    const chat = await v0.chats.create({
      message: 'Create a simple React button component with TypeScript',
    })

    console.log('✅ Chat created successfully!')
    console.log('   Chat ID:', chat.id)
    console.log('   Status:', chat.status)
    console.log('')

    // Check if files are available
    if (chat.files && chat.files.length > 0) {
      console.log(`📂 Generated files (${chat.files.length}):`)
      chat.files.forEach((file: any) => {
        console.log(`   - ${file.name} (${file.content?.length || 0} bytes)`)
      })
    } else {
      console.log('⚠️  No files generated yet (chat may still be processing)')
      console.log('   Chat status:', chat.status)
    }

    console.log('')
    console.log('🎉 v0 Platform API is working correctly!')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', error.response.data)
    }
    process.exit(1)
  }
}

main()
