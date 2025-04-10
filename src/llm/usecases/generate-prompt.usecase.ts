import { Injectable } from '@nestjs/common';
import { LLMService } from '../llm.service';
import { VectorsService } from 'src/vectors/vectors.service';

type Source = {
  title: string;
  url: string;
  date: string;
};

type Output = {
  answer: string;
  sources: Source[];
};

@Injectable()
export class GeneratePromptUsecase {
  constructor(
    private readonly llmService: LLMService,
    private readonly vectorsService: VectorsService,
  ) {}

  async execute(query: string): Promise<Output> {
    const knowledge = await this.vectorsService.queryKnowledge(query, 10);
    const answer = await this.llmService.generateAnswerUsingKnowledge(
      knowledge.map((k) => k.pageContent),
      query,
    );

    const uniqueSources = knowledge.reduce((acc, k) => {
      const existingSource = acc.find((s) => s.url === k.metadata.url);
      if (!existingSource) {
        acc.push({
          title: k.metadata.title,
          url: k.metadata.url,
          date: k.metadata.date,
        });
      }
      return acc;
    }, [] as Source[]);

    return {
      answer,
      sources: uniqueSources,
    };
  }
}
