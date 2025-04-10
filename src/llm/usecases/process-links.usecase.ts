import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LLMService } from '../llm.service';
import {
  LinkProcessingQueueService,
  Message,
} from 'src/rabbitmq/link-processing-queue.service';
import { ScraperService } from 'src/scraper/scraper.service';
import { ScrapeData } from 'src/scraper/entities/scrape-data.entity';

@Injectable()
export class ProcessLinksUsecase implements OnModuleInit {
  private readonly logger = new Logger(ProcessLinksUsecase.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly linkProcessingQueueService: LinkProcessingQueueService,
    private readonly scraperService: ScraperService,
  ) {}

  async onModuleInit() {
    await this.linkProcessingQueueService.consume(this.execute.bind(this));
  }

  private async execute(message: Message) {
    try {
      const { url, source } = message;
      const cleanedPageHtml = await this.scraperService.getCleanedPageHtml(url);
      const markdown =
        await this.scraperService.parseHtmlToMarkdown(cleanedPageHtml);

      const scrapeData = await this.scraperService.getScrapeData(url);

      if (scrapeData) {
        this.logger.log('Scrape data already exists');

        console.log(scrapeData);

        return;
      }

      const data = await this.llmService.extractDataFromMarkdown(markdown);

      this.logger.log('Scrape data extracted');

      if (!data) {
        this.logger.error('No data extracted');
        return;
      }

      const entity = new ScrapeData();
      entity.url = url;
      entity.source = source;
      entity.title = data.title;
      entity.content = data.content;
      entity.date = data.date;

      await this.scraperService.saveScrapeData(entity);
    } catch (error) {
      this.logger.error('Error processing link', error);
    }
  }
}
