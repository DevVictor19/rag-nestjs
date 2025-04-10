import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { PublishLinksToQueueUsecase } from './usecases/publish-links-to-queue.usecase';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { HttpModule } from '@nestjs/axios';
import { ScrapeData, ScrapeDataSchema } from './entities/scrape-data.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    RabbitmqModule,
    MongooseModule.forFeature([
      { name: ScrapeData.name, schema: ScrapeDataSchema },
    ]),
    HttpModule.register({
      maxRedirects: 5,
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Connection: 'keep-alive',
      },
    }),
  ],
  providers: [ScraperService, PublishLinksToQueueUsecase],
  controllers: [ScraperController],
  exports: [ScraperService],
})
export class ScraperModule {}
