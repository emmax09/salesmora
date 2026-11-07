import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { HealthModule } from './modules/health/health.module.js';

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3001),
  WEB_ORIGIN: Joi.string().uri({ scheme: ['http', 'https'] }).default('http://localhost:3000'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
      validationSchema: environmentSchema,
      validationOptions: { allowUnknown: true, abortEarly: false },
    }),
    HealthModule,
  ],
})
export class AppModule {}
