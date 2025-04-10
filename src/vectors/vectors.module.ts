import { Module } from '@nestjs/common';
import { VectorsService } from './vectors.service';
import { ProcessKnowledgeUsecase } from './usecases/process-knowledge.usecase';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    RabbitmqModule,
    HttpModule.register({
      headers: {
        'Content-Type': 'application/json',
        'api-key': '',
      },
    }),
  ],
  providers: [VectorsService, ProcessKnowledgeUsecase],
  exports: [VectorsService],
})
export class VectorsModule {}
