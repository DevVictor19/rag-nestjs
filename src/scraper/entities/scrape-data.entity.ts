import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HydratedScrapeData = HydratedDocument<ScrapeData>;

@Schema({
  collection: 'scrape_data',
  timestamps: true,
})
export class ScrapeData {
  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  date: string;
}

export const ScrapeDataSchema = SchemaFactory.createForClass(ScrapeData);
