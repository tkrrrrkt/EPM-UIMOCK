#!/usr/bin/env node
/**
 * v0-fetch-api.ts - v0 Platform APIを使ってチャットからファイルを取得
 *
 * Usage:
 *   npx tsx scripts/v0-fetch-api.ts <chat_id> <context>/<feature>
 *
 * Example:
 *   npx tsx scripts/v0-fetch-api.ts b_5wM2tffNU2y master-data/employee-master
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve, join, dirname } from 'path'
import { mkdir, writeFile } from 'fs/promises'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function writeFiles(files: any[], outDir: string) {
  let successCount = 0
  let failCount = 0

  for (const file of files) {
    try {
      const fullPath = join(outDir, file.path || file.name || 'unknown')
      await mkdir(dirname(fullPath), { recursive: true })
      await writeFile(fullPath, file.content || '', 'utf8')
      console.log(`  ✓ ${file.path || file.name}`)
      successCount++
    } catch (error: any) {
      console.error(`  ✗ ${file.path || file.name}: ${error.message}`)
      failCount++
    }
  }

  return { successCount, failCount }
}

async function main() {
  // Parse arguments
  const chatId = process.argv[2]
  const featurePath = process.argv[3]

  if (!chatId || !featurePath) {
    log('red', '❌ Error: Missing arguments')
    console.log('')
    console.log('Usage: npx tsx scripts/v0-fetch-api.ts <chat_id> <context>/<feature>')
    console.log('')
    console.log('Example:')
    console.log('  npx tsx scripts/v0-fetch-api.ts b_5wM2tffNU2y master-data/employee-master')
    console.log('')
    process.exit(1)
  }

  const [context, feature] = featurePath.split('/')
  if (!context || !feature) {
    log('red', '❌ Error: Invalid feature path format')
    console.log('Expected format: <context>/<feature>')
    console.log('Example: master-data/employee-master')
    process.exit(1)
  }

  // Check API key
  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    log('red', '❌ Error: V0_API_KEY not found in environment')
    console.log('Please set V0_API_KEY in .env.local')
    process.exit(1)
  }

  // Output directory
  const outDir = join(process.cwd(), 'apps', 'web', '_v0_drop', context, feature, 'src')

  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log('cyan', '📡 v0 Platform API - Fetch & Export Script')
  log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  log('yellow', `Chat ID:    ${chatId}`)
  log('yellow', `Feature:    ${featurePath}`)
  log('yellow', `Context:    ${context}`)
  log('yellow', `Feature:    ${feature}`)
  log('yellow', `Output:     ${outDir}`)
  console.log('')

  try {
    // Fetch chat by ID
    log('blue', '[1/3] Fetching chat from v0...')
    const chat = await v0.chats.getById({ id: chatId })

    log('green', '✅ Chat found!')
    console.log(`   ID: ${chat.id}`)
    console.log(`   Name: ${chat.name}`)
    console.log(`   Messages: ${chat.messages?.length || 0}`)
    console.log(`   Files: ${chat.files?.length || 0}`)
    console.log('')

    // Check for files
    if (!chat.files || chat.files.length === 0) {
      log('yellow', '⚠️  No files found in this chat')
      console.log('')
      console.log('This could mean:')
      console.log('  - The chat is still processing (try again in a few seconds)')
      console.log('  - The chat did not generate any code files')
      console.log('  - The chat only contains text responses')
      console.log('')
      log('blue', 'Chat URL: ' + chat.webUrl)
      process.exit(0)
    }

    // Create output directory
    log('blue', '[2/3] Creating output directory...')
    await mkdir(outDir, { recursive: true })
    log('green', `✅ Directory created: ${outDir}`)
    console.log('')

    // Write files
    log('blue', `[3/3] Writing ${chat.files.length} files...`)
    const { successCount, failCount } = await writeFiles(chat.files, outDir)
    console.log('')

    if (failCount > 0) {
      log('yellow', `⚠️  Completed with warnings: ${successCount} succeeded, ${failCount} failed`)
    } else {
      log('green', `✅ Successfully exported ${successCount} files!`)
    }

    console.log('')
    log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    log('green', '🎉 Export completed!')
    log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    log('blue', 'Next steps:')
    console.log('  1. Review generated files in:')
    console.log(`     ${outDir}`)
    console.log('  2. Run integration script:')
    console.log(`     ./scripts/v0-integrate.sh ${featurePath}`)
    console.log('')

  } catch (error: any) {
    console.log('')
    log('red', '❌ Error: ' + error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', JSON.stringify(error.response.data, null, 2))
    }
    console.log('')
    process.exit(1)
  }
}

main()
