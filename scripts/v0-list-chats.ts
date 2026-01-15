#!/usr/bin/env node
/**
 * v0-list-chats.ts - 自分のv0チャット一覧を表示
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    console.error('❌ V0_API_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    console.log('📋 Fetching your v0 chats...')
    console.log('')

    // List all chats
    const chats = await v0.chats.find({
      limit: 20, // Get latest 20 chats
    })

    if (!chats || !chats.data || chats.data.length === 0) {
      console.log('⚠️  No chats found')
      process.exit(0)
    }

    console.log(`Found ${chats.data.length} chats:`)
    console.log('')

    for (const chat of chats.data) {
      console.log(`📝 ${chat.name || '(Untitled)'}`)
      console.log(`   ID: ${chat.id}`)
      console.log(`   URL: ${chat.webUrl}`)
      console.log(`   Files: ${chat.files?.length || 0}`)
      console.log(`   Created: ${new Date(chat.createdAt).toLocaleString()}`)
      console.log('')
    }

    console.log('💡 To fetch a chat, run:')
    console.log('   npx tsx scripts/v0-fetch-api.ts <chat_id> <context>/<feature>')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', JSON.stringify(error.response.data, null, 2))
    }
    process.exit(1)
  }
}

main()
