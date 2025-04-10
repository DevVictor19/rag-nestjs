import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export interface LLMResponse {
  title: string;
  paragraphs: string[];
  date: string;
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash-lite',
    temperature: 0,
    maxRetries: 2,
    apiKey: this.configService.getOrThrow('GEMINI_API_KEY'),
  });

  constructor(private readonly configService: ConfigService) {}

  async extractDataFromMarkdown(markdown: string): Promise<LLMResponse | null> {
    const prompt = `Analyze the following article in markdown format and extract the following data:

**title** - title of the page
**paragraphs** - paragraphs of the page
**date** - date of the page

# Rules
- Remove all the markdown formatting
- Remove links

# Output format

Return the data in JSON format.

{
"title": string,
"paragraphs": string[],
"date": string
}

# Markdown: ${markdown}`;

    try {
      this.logger.log('Extracting data from markdown');
      const { content } = await this.llm.invoke(prompt);

      this.logger.log('Cleaning response');

      if (!content || typeof content !== 'string') {
        this.logger.error('No content from LLM');
        return null;
      }

      const cleanedResponse = this.cleanAiJsonResponse(content);

      this.logger.log(`Response cleaned: ${cleanedResponse}`);

      return JSON.parse(cleanedResponse) as LLMResponse;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  private cleanAiJsonResponse(response: string): string {
    return response
      .replace('```json', '')
      .replace('```JSON', '')
      .replace('``` JSON', '')
      .replace('```', '')
      .replace('json\n', '');
  }
}
