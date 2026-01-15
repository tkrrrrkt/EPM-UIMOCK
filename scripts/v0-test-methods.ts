#!/usr/bin/env node
import { v0 } from 'v0-sdk'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

async function main() {
  const chatId = 'qlGZHOCLnkx'

  console.log('Testing different methods to access chat:', chatId)
  console.log('')

  // Method 1: find (already worked)
  try {
    console.log('1. Using find()...')
    const chats = await v0.chats.find({ limit: 20 })
    const chat = chats.data.find((c: any) => c.id === chatId)
    if (chat) {
      console.log('✅ Found via find()!')
      console.log('   Files:', chat.files?.length || 0)
      console.log('   Messages:', chat.messages?.length || 0)
      console.log('   Full chat object keys:', Object.keys(chat))
      if (chat.files && chat.files.length > 0) {
        console.log('   File details:', JSON.stringify(chat.files, null, 2))
      }
    }
  } catch (e: any) {
    console.log('❌', e.message)
  }

  console.log('')

  // Method 2: findVersions
  try {
    console.log('2. Using findVersions()...')
    const versions = await v0.chats.findVersions({ chatId })
    console.log('✅ Versions found!')
    console.log('   Count:', versions.data?.length || 0)
    if (versions.data && versions.data.length > 0) {
      console.log('   Latest version has files:', versions.data[0].files?.length || 0)
      if (versions.data[0].files && versions.data[0].files.length > 0) {
        console.log('   Files in version:', JSON.stringify(versions.data[0].files, null, 2))
      }
    }
  } catch (e: any) {
    console.log('❌', e.message)
  }
}

main()
