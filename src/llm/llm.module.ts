import { Module } from '@nestjs/common';
import { LLMService } from './llm.service';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { ProcessLinksUsecase } from './usecases/process-links.usecase';
import { ScraperModule } from 'src/scraper/scraper.module';
import { LlmController } from './llm.controller';
import { VectorsModule } from 'src/vectors/vectors.module';
import { GeneratePromptUsecase } from './usecases/generate-prompt.usecase';

@Module({
  imports: [RabbitmqModule, ScraperModule, VectorsModule],
  providers: [LLMService, ProcessLinksUsecase, GeneratePromptUsecase],
  exports: [LLMService],
  controllers: [LlmController],
})
export class LLMModule {}
