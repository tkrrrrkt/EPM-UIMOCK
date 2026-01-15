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
  await app.listen(port)

  console.log(`BFF is running on: http://localhost:${port}`)
}

bootstrap()
