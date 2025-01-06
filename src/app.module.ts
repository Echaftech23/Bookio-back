import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';
// import { DatabaseModule } from './database/database.module';
import { UploadsModule } from './uploads/uploads.module';
import { DynamodbModule } from './dynamodb/dynamodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BooksModule,
    DynamodbModule,
    UploadsModule,
  ],
})
export class AppModule {}
