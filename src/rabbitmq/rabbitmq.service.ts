import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly rabbitMQUrl: string;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly configService: ConfigService) {
    this.rabbitMQUrl = this.configService.getOrThrow<string>('RABBITMQ_URL');
  }

  async onModuleInit() {
    this.connection = await amqp.connect(this.rabbitMQUrl);
    this.channel = await this.connection.createChannel();
    this.logger.log('RabbitMQ connected');
  }

  async onModuleDestroy() {
    try {
      await this.channel.close();
      await this.connection.close();
      this.logger.log('RabbitMQ disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  async publishToQueue(queue: string, message: any): Promise<void> {
    try {
      await this.channel.assertQueue(queue);
      this.channel.sendToQueue(queue, this.prepareMessage(message));
      this.logger.log(`Message sent to queue "${queue}"`);
    } catch (error) {
      this.logger.error('Error publishing to RabbitMQ', error);
    }
  }

  async consumeFromQueue(
    queue: string,
    onMessage: (msg: any) => void,
  ): Promise<void> {
    try {
      await this.channel.assertQueue(queue);
      this.channel.consume(queue, (msg) => {
        if (msg) {
          onMessage(this.parseMessage(msg.content));
          this.channel.ack(msg);
        }
      });
      this.logger.log(`Consuming messages from queue "${queue}"`);
    } catch (error) {
      this.logger.error('Error consuming from RabbitMQ', error);
    }
  }

  private prepareMessage(message: any) {
    return Buffer.from(JSON.stringify(message));
  }

  private parseMessage(message: Buffer) {
    return JSON.parse(message.toString());
  }
}
