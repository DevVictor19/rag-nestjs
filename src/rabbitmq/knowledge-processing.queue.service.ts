import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

export const KNOWLEDGE_PROCESSING_QUEUE = 'knowledge-processing-queue';

export type KnowledgeProcessingMessage = {
  url: string;
  source: string;
  title: string;
  paragraphs: string[];
  date: string;
};

@Injectable()
export class KnowledgeProcessingQueueService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(message: KnowledgeProcessingMessage) {
    await this.rabbitMQService.publishToQueue(
      KNOWLEDGE_PROCESSING_QUEUE,
      message,
    );
  }

  async consume(
    callback: (message: KnowledgeProcessingMessage) => Promise<void>,
  ) {
    await this.rabbitMQService.consumeFromQueue(
      KNOWLEDGE_PROCESSING_QUEUE,
      callback,
    );
  }
}
