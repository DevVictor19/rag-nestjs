import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { LinkProcessingQueueService } from './link-processing-queue.service';
import { KnowledgeProcessingQueueService } from './knowledge-processing.queue.service';

@Module({
  providers: [
    RabbitMQService,
    LinkProcessingQueueService,
    KnowledgeProcessingQueueService,
  ],
  exports: [LinkProcessingQueueService, KnowledgeProcessingQueueService],
})
export class RabbitmqModule {}
