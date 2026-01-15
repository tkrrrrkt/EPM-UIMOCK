import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  /**
   * Set tenant context for RLS
   * Must be called before any query that uses RLS
   */
  async setTenantContext(tenantId: string) {
    await this.$executeRawUnsafe(`SET app.tenant_id = '${tenantId}'`)
  }
}
