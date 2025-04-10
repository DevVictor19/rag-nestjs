import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublishLinksToQueueUsecase } from './usecases/publish-links-to-queue.usecase';

@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly publishLinksToQueueUsecase: PublishLinksToQueueUsecase,
  ) {}

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    await this.publishLinksToQueueUsecase.execute(file);
  }
}
