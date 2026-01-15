#!/usr/bin/env node
/**
 * v0-explore-api.ts - v0 SDK API構造を調査
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  console.log('🔍 Exploring v0 SDK API structure...')
  console.log('')

  console.log('Available v0 methods:')
  console.log(Object.keys(v0))
  console.log('')

  if (v0.chats) {
    console.log('Available v0.chats methods:')
    console.log(Object.keys(v0.chats))
    console.log('')
  }

  if (v0.projects) {
    console.log('Available v0.projects methods:')
    console.log(Object.keys(v0.projects))
    console.log('')
  }

  // Try creating a simple chat and inspect response
  try {
    console.log('📡 Creating test chat...')
    const chat = await v0.chats.create({
      message: 'Hello world',
    })

    console.log('✅ Chat created!')
    console.log('')
    console.log('Chat object keys:')
    console.log(Object.keys(chat))
    console.log('')
    console.log('Full chat object:')
    console.log(JSON.stringify(chat, null, 2))

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

main()
