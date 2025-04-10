import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  KnowledgeProcessingQueueService,
  KnowledgeProcessingMessage,
} from 'src/rabbitmq/knowledge-processing.queue.service';
import { VectorsService } from '../vectors.service';
@Injectable()
export class ProcessKnowledgeUsecase implements OnModuleInit {
  constructor(
    private readonly knowledgeProcessingQueueService: KnowledgeProcessingQueueService,
    private readonly vectorsService: VectorsService,
  ) {}

  async onModuleInit() {
    await this.knowledgeProcessingQueueService.consume(this.execute.bind(this));
  }

  private async execute(message: KnowledgeProcessingMessage) {
    await this.vectorsService.saveKnowledge(message);
  }
}
