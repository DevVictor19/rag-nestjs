import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { ProcessLinksUsecase } from './usecases/process-links.usecase';
import { ScraperModule } from 'src/scraper/scraper.module';

@Module({
  imports: [RabbitmqModule, ScraperModule],
  providers: [LLMService, ProcessLinksUsecase],
  exports: [LLMService],
})
export class LLMModule {}
