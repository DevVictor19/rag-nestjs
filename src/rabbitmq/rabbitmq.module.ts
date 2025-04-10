import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { LinkProcessingQueueService } from './link-processing-queue.service';

@Module({
  providers: [RabbitMQService, LinkProcessingQueueService],
  exports: [LinkProcessingQueueService],
})
export class RabbitmqModule {}
