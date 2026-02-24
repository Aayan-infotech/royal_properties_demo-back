import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // ✅ ALLOW ALL ORIGINS (DEV / TEMP)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  // ✅ GLOBAL VALIDATION (ADDED)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, 
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
        }));

        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = app.get(ConfigService);

  const port = config.get<number>('PORT') || 3000;
  const env = config.get<string>('NODE_ENV') || 'development';

  await app.listen(port);

  const appUrl = `http://localhost:${port}`;

  console.log('');
  console.log('===========================================');
  console.log('🚀 NestJS Application Started Successfully');
  console.log(`🌍 Environment : ${env}`);
  console.log(`🔌 Listening   : ${appUrl}`);
  console.log('===========================================');
  console.log('');
}

bootstrap();
