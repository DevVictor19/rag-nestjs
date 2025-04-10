import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore, type QdrantLibArgs } from '@langchain/qdrant';
import { HttpService } from '@nestjs/axios';
import { KnowledgeProcessingMessage } from 'src/rabbitmq/knowledge-processing.queue.service';
import { Knowledge } from './vectors.type';

@Injectable()
export class VectorsService implements OnModuleInit {
  private readonly embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: this.configService.getOrThrow('GEMINI_API_KEY'),
    modelName: 'models/text-embedding-004',
  });
  private readonly logger = new Logger(VectorsService.name);
  private readonly qdrantBaseUrl = this.configService.getOrThrow('QDRANT_URL');

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit() {
    try {
      await this.initializeScrapeCollection();
      this.logger.log('Scrape collection initialized');
    } catch (error) {
      this.logger.error('Error initializing scrape collection', error);
    }
  }

  async saveKnowledge(knowledge: KnowledgeProcessingMessage) {
    this.logger.log('Saving knowledge', knowledge.url);

    const { url, source, title, paragraphs, date } = knowledge;

    const metadata = {
      url,
      source,
      title,
      date,
    };

    paragraphs.forEach(async (paragraph) => {
      try {
        await QdrantVectorStore.fromTexts(
          [paragraph],
          metadata,
          this.embeddings,
          {
            collectionName: 'scrape',
            url: this.qdrantBaseUrl,
          },
        );

        this.logger.log('Knowledge saved', paragraph);
      } catch (error) {
        this.logger.error('Error saving knowledge', error);
      }
    });
  }

  async queryKnowledge(query: string, topK: number): Promise<Knowledge[]> {
    const retriever = await this.getRetriever(topK);
    const result = await retriever.invoke(query);
    return result as Knowledge[];
  }

  private async initializeScrapeCollection() {
    await this.httpService.axiosRef.put(
      `${this.qdrantBaseUrl}/collections/scrape`,
      {
        vectors: {
          size: 768,
          distance: 'Cosine',
        },
      },
    );
  }

  private async getRetriever(topK: number) {
    const connParams: QdrantLibArgs = {
      collectionName: 'scrape',
      url: this.qdrantBaseUrl,
    };

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      this.embeddings,
      connParams,
    );

    return vectorStore.asRetriever(topK);
  }
}
