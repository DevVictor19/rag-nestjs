import { IsNotEmpty, IsString } from 'class-validator';

export class GeneratePromptDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}
