import { Injectable } from '@nestjs/common';
import { ScraperService } from '../scraper.service';
import { LinkProcessingQueueService } from 'src/rabbitmq/link-processing-queue.service';

@Injectable()
export class PublishLinksToQueueUsecase {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly linkProcessingQueueService: LinkProcessingQueueService,
  ) {}

  async execute(file: Express.Multer.File) {
    const records = await this.scraperService.processCsv(file);

    for (const record of records) {
      this.linkProcessingQueueService.publish({
        url: record.URL,
        source: record.Source,
      });
    }
  }
}
