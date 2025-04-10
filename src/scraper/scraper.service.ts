import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as cheerio from 'cheerio';
import * as TurndownService from 'turndown';
import { Readable } from 'stream';
import { ScraperRecord } from './scraper.types';
import { HttpService } from '@nestjs/axios';
import { ScrapeData } from './entities/scrape-data.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ScraperService {
  private readonly turndownService = new TurndownService();

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(ScrapeData.name)
    private readonly scrapeDataModel: Model<ScrapeData>,
  ) {}

  async processCsv(file: Express.Multer.File): Promise<ScraperRecord[]> {
    const results: any[] = [];

    return new Promise((resolve, reject) => {
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);

      bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getCleanedPageHtml(url: string): Promise<string> {
    const { data } = await this.httpService.axiosRef.get(url);

    const $ = cheerio.load(data);

    $('script').remove();
    $('style').remove();
    $('link').remove();
    $('meta').remove();

    return $.html();
  }

  async parseHtmlToMarkdown(html: string): Promise<string> {
    return this.turndownService.turndown(html);
  }

  async saveScrapeData(scrapeData: ScrapeData) {
    const createdScrapeData = new this.scrapeDataModel(scrapeData);
    return createdScrapeData.save();
  }

  async getScrapeData(url: string) {
    return this.scrapeDataModel.findOne({ url });
  }
}
