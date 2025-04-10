import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

export type LinkProcessingMessage = {
  url: string;
  source: string;
};

export const LINK_PROCESSING_QUEUE = 'link-processing-queue';

@Injectable()
export class LinkProcessingQueueService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publish(message: LinkProcessingMessage) {
    await this.rabbitMQService.publishToQueue(LINK_PROCESSING_QUEUE, message);
  }

  async consume(callback: (message: LinkProcessingMessage) => void) {
    await this.rabbitMQService.consumeFromQueue(
      LINK_PROCESSING_QUEUE,
      callback,
    );
  }
}
