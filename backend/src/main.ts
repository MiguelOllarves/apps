import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors({
    origin: true, // Allow all origins for development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-id',
  });

  app.useStaticAssets(join(process.cwd(), 'public'));

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
  console.log(`Application is running on: http://localhost:4000`);
}
bootstrap();