#!/usr/bin/env node
/**
 * v0-fetch-chat.ts - 既存のv0チャットからファイルを取得
 *
 * Usage:
 *   npx tsx scripts/v0-fetch-chat.ts <chat_id>
 *   npx tsx scripts/v0-fetch-chat.ts b_5wM2tffNU2y
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import { join, dirname } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const chatId = process.argv[2]

  if (!chatId) {
    console.error('Usage: npx tsx scripts/v0-fetch-chat.ts <chat_id>')
    console.error('Example: npx tsx scripts/v0-fetch-chat.ts b_5wM2tffNU2y')
    process.exit(1)
  }

  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    console.error('❌ V0_API_KEY not found in .env.local')
    process.exit(1)
  }

  console.log(`📡 Fetching chat: ${chatId}`)
  console.log('')

  try {
    // Get chat details
    const chat = await v0.chats.get({ id: chatId })

    console.log('✅ Chat found!')
    console.log('   ID:', chat.id)
    console.log('   Status:', chat.status)
    console.log('')

    // Log full response to understand structure
    console.log('📋 Full chat response:')
    console.log(JSON.stringify(chat, null, 2))
    console.log('')

    // Try to get messages
    try {
      const messages = await v0.chats.listMessages({ chatId })
      console.log('💬 Messages:')
      console.log(JSON.stringify(messages, null, 2))
    } catch (e: any) {
      console.log('⚠️  Could not fetch messages:', e.message)
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', JSON.stringify(error.response.data, null, 2))
    }
    process.exit(1)
  }
}

main()
