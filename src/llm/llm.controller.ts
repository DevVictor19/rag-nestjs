import { Body, Controller, Post } from '@nestjs/common';
import { GeneratePromptDto } from './dtos/generate-prompt.dto';
import { GeneratePromptUsecase } from './usecases/generate-prompt.usecase';

@Controller('agent')
export class LlmController {
  constructor(private readonly generatePromptUsecase: GeneratePromptUsecase) {}

  @Post()
  async generatePrompt(@Body() body: GeneratePromptDto) {
    return this.generatePromptUsecase.execute(body.query);
  }
}
