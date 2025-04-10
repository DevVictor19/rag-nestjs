import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LLMService } from '../llm.service';
import {
  LinkProcessingQueueService,
  LinkProcessingMessage,
} from 'src/rabbitmq/link-processing-queue.service';
import { ScraperService } from 'src/scraper/scraper.service';
import { ScrapeData } from 'src/scraper/entities/scrape-data.entity';
import { KnowledgeProcessingQueueService } from 'src/rabbitmq/knowledge-processing.queue.service';

@Injectable()
export class ProcessLinksUsecase implements OnModuleInit {
  private readonly logger = new Logger(ProcessLinksUsecase.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly linkProcessingQueueService: LinkProcessingQueueService,
    private readonly knowledgeProcessingQueueService: KnowledgeProcessingQueueService,
    private readonly scraperService: ScraperService,
  ) {}

  async onModuleInit() {
    await this.linkProcessingQueueService.consume(this.execute.bind(this));
  }

  private async execute(message: LinkProcessingMessage) {
    try {
      const { url, source } = message;

      const scrapeData = await this.scraperService.getScrapeData(url);

      if (scrapeData) {
        this.logger.log('Scrape data already exists');

        await this.knowledgeProcessingQueueService.publish({
          url: scrapeData.url,
          source: scrapeData.source,
          title: scrapeData.title,
          paragraphs: scrapeData.paragraphs,
          date: scrapeData.date,
        });

        this.logger.log('Knowledge processing message published');

        return;
      }

      const cleanedPageHtml = await this.scraperService.getCleanedPageHtml(url);
      const markdown =
        await this.scraperService.parseHtmlToMarkdown(cleanedPageHtml);

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
      entity.paragraphs = data.paragraphs;
      entity.date = data.date;

      await this.scraperService.saveScrapeData(entity);

      this.logger.log('Scrape data saved');

      await this.knowledgeProcessingQueueService.publish({
        url,
        source,
        title: data.title,
        paragraphs: data.paragraphs,
        date: data.date,
      });

      this.logger.log('Knowledge processing message published');
    } catch (error) {
      this.logger.error('Error processing link', error);
    }
  }
}
