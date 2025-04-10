import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

export interface LLMResponse {
  title: string;
  content: string;
  date: string;
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly genai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.genai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow('GEMINI_API_KEY'),
    });
  }

  async extractDataFromMarkdown(markdown: string): Promise<LLMResponse | null> {
    const prompt = `Analyze the following article in markdown format and extract the following data:

**title** - title of the page
**content** - content of the page (paragraphs)
**date** - date of the page


# Output format

Return the data in JSON format.

{
"title": "Title of the page",
"content": "Content of the page",
"date": "Date of the page"
}

# Markdown: ${markdown}`;

    try {
      this.logger.log('Extracting data from markdown');
      const response = await this.genai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });

      this.logger.log('Cleaning response');

      if (!response.text) {
        this.logger.error('No response from GenAI');
        return null;
      }

      const cleanedResponse = this.cleanAiJsonResponse(response.text);

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
