#!/usr/bin/env node
/**
 * v0-get-version-files.ts - バージョンの詳細とファイルを取得
 */

import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve, join, dirname } from 'path'
import { mkdir, writeFile } from 'fs/promises'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const chatId = process.argv[2] || 'qlGZHOCLnkx'
  const versionId = process.argv[3] || 'b_5wM2tffNU2y'
  const featurePath = process.argv[4]

  const apiKey = process.env.V0_API_KEY
  if (!apiKey) {
    console.error('❌ V0_API_KEY not found')
    process.exit(1)
  }

  console.log(`📡 Fetching version details...`)
  console.log(`   Chat ID: ${chatId}`)
  console.log(`   Version ID: ${versionId}`)
  console.log('')

  try {
    // Get version details
    const version = await v0.chats.getVersion({
      chatId,
      versionId,
    })

    console.log('✅ Version found!')
    console.log('')
    console.log('Full version object:')
    console.log(JSON.stringify(version, null, 2))
    console.log('')

    // Check for files
    if (version.files && version.files.length > 0) {
      console.log(`📂 Found ${version.files.length} files!`)
      console.log('')

      if (featurePath) {
        const [context, feature] = featurePath.split('/')
        const outDir = join(process.cwd(), 'apps', 'web', '_v0_drop', context, feature, 'src')

        console.log(`📥 Writing files to: ${outDir}`)
        await mkdir(outDir, { recursive: true })

        for (const file of version.files) {
          const fullPath = join(outDir, file.path || file.name || 'unknown')
          await mkdir(dirname(fullPath), { recursive: true })
          await writeFile(fullPath, file.content || '', 'utf8')
          console.log(`  ✓ ${file.path || file.name}`)
        }

        console.log('')
        console.log(`✅ Successfully exported ${version.files.length} files!`)
      } else {
        console.log('Files:')
        version.files.forEach((file: any) => {
          console.log(`  - ${file.path || file.name} (${file.content?.length || 0} bytes)`)
        })
        console.log('')
        console.log('To download files, run:')
        console.log(`  npx tsx scripts/v0-get-version-files.ts ${chatId} ${versionId} <context>/<feature>`)
      }
    } else {
      console.log('⚠️  No files in this version')
    }

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
