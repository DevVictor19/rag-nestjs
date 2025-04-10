import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DB_URI'),
        dbName: configService.getOrThrow('DB_NAME'),
        user: configService.getOrThrow('DB_USER'),
        pass: configService.getOrThrow('DB_PASSWORD'),
        autoIndex: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
