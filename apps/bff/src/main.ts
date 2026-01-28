import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global prefix for BFF API
  app.setGlobalPrefix('api/bff')

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })

  const port = process.env.BFF_PORT || 3001
  const host = process.env.BFF_HOST || process.env.HOST || '127.0.0.1'
  await app.listen(port, host)

  console.log(`BFF is running on: http://${host}:${port}`)
}

bootstrap()
