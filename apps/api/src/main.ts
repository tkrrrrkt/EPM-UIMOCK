import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global prefix for Domain API
  app.setGlobalPrefix('api')

  // CORS for BFF access
  app.enableCors({
    origin: process.env.BFF_ORIGIN || 'http://localhost:3001',
    credentials: true,
  })

  const port = process.env.API_PORT || 3002
  const host = process.env.API_HOST || process.env.HOST || '127.0.0.1'
  await app.listen(port, host)
  console.log(`Domain API is running on: http://${host}:${port}/api`)
}

bootstrap()
