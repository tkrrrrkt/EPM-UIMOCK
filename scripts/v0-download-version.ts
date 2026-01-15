#!/usr/bin/env node
/**
 * v0-download-version.ts - チャットの特定バージョンをダウンロード
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve, join, dirname } from 'path'
import { mkdir, writeFile } from 'fs/promises'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const chatId = process.argv[2]

  if (!chatId) {
    console.error('Usage: npx tsx scripts/v0-download-version.ts <chat_id>')
    process.exit(1)
  }

  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    console.error('❌ V0_API_KEY not found')
    process.exit(1)
  }

  console.log(`📡 Fetching versions for chat: ${chatId}`)
  console.log('')

  try {
    // Get all versions of the chat
    const versions = await v0.chats.findVersions({ chatId })

    if (!versions || !versions.data || versions.data.length === 0) {
      console.log('⚠️  No versions found')
      process.exit(0)
    }

    console.log(`Found ${versions.data.length} versions:`)
    console.log('')

    for (const version of versions.data.slice(0, 5)) {
      console.log(`Version ${version.id}:`)
      console.log(`  Name: ${version.name || '(No name)'}`)
      console.log(`  Created: ${new Date(version.createdAt).toLocaleString()}`)
      console.log(`  Updated: ${new Date(version.updatedAt).toLocaleString()}`)
      console.log('')
    }

    // Try to download the latest version
    const latestVersion = versions.data[0]
    console.log(`📥 Downloading latest version: ${latestVersion.id}`)

    const downloadResult = await v0.chats.downloadVersion({
      chatId,
      versionId: latestVersion.id,
    })

    console.log('Download result:')
    console.log(JSON.stringify(downloadResult, null, 2))

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
