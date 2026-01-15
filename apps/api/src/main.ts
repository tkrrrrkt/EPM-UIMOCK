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
  await app.listen(port)
  console.log(`Domain API is running on: http://localhost:${port}/api`)
}

bootstrap()
