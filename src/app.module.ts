import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';
import { LLMModule } from './llm/llm.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScraperModule,
    LLMModule,
    RabbitmqModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
