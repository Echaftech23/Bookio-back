import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: (configService: ConfigService) => {
        const client = new DynamoDBClient({
          region: configService.get<string>('AWS_REGION_DB'),
          credentials: {
            accessKeyId: configService.get<string>('SECRET_KEY_ID'),
            secretAccessKey: configService.get<string>('SECRET_ACCESS_KEY'),
          },
        });
        return DynamoDBDocumentClient.from(client);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DYNAMODB_CLIENT'],
})
export class DynamodbModule {}
