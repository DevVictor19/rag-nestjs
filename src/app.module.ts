import { Module } from '@nestjs/common';
import { ScraperModule } from './scraper/scraper.module';
import { LLMModule } from './llm/llm.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { DatabaseModule } from './database/database.module';
import { VectorsModule } from './vectors/vectors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScraperModule,
    LLMModule,
    RabbitmqModule,
    DatabaseModule,
    VectorsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
