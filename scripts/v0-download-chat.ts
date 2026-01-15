#!/usr/bin/env node
/**
 * v0-download-chat.ts - v0チャットから最新バージョンをダウンロード
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve, join, dirname } from 'path'
import { mkdir, writeFile } from 'fs/promises'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const chatId = process.argv[2]
  const featurePath = process.argv[3]

  if (!chatId || !featurePath) {
    console.log('Usage: npx tsx scripts/v0-download-chat.ts <chat_id> <context>/<feature>')
    console.log('Example: npx tsx scripts/v0-download-chat.ts qlGZHOCLnkx master-data/employee-list')
    process.exit(1)
  }

  const [context, feature] = featurePath.split('/')
  const outDir = join(process.cwd(), 'apps', 'web', '_v0_drop', context, feature, 'src')

  console.log('📡 Attempting to fetch chat:', chatId)
  console.log('')

  try {
    // Try to find the chat in the list
    const chats = await v0.chats.find({ limit: 60 })
    const chat = chats.data?.find((c: any) => c.id === chatId)

    if (!chat) {
      console.error('❌ Chat not found in your chat list')
      console.log('Available chats:')
      chats.data?.slice(0, 5).forEach((c: any) => {
        console.log(`  - ${c.name} (ID: ${c.id})`)
      })
      process.exit(1)
    }

    console.log('✅ Chat found:', chat.name)
    console.log('   URL:', chat.webUrl)
    console.log('')

    // Get messages to find versions
    const messages = await v0.chats.findMessages({ chatId })
    console.log('📨 Messages:', messages.data?.length || 0)
    console.log('')

    // Look for versions in messages
    let versionFound = false
    for (const msg of messages.data || []) {
      if (msg.role === 'assistant' && msg.attachments) {
        console.log('📎 Message with attachments found')
        console.log('   Attachments:', msg.attachments.length)

        // Try to get versions
        try {
          const versions = await v0.chats.findVersions({ chatId, messageId: msg.id })
          console.log('   Versions:', versions.data?.length || 0)

          if (versions.data && versions.data.length > 0) {
            versionFound = true
            const latestVersion = versions.data[0]
            console.log('   Latest version ID:', latestVersion.id)

            // Try to download version
            const versionData = await v0.chats.getVersion({
              chatId,
              messageId: msg.id,
              versionId: latestVersion.id,
            })

            console.log('')
            console.log('📦 Version data:')
            console.log(JSON.stringify(versionData, null, 2))
          }
        } catch (e: any) {
          console.log('   Error fetching versions:', e.message)
        }
      }
    }

    if (!versionFound) {
      console.log('⚠️  No code versions found in this chat')
      console.log('')
      console.log('💡 Suggestion: Use the "Add to Codebase" button in v0 web UI instead')
      console.log('   Then run: npx shadcn@latest add "<url>"')
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
    }
    process.exit(1)
  }
}

main()
