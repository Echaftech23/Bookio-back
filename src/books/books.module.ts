import { Module } from '@nestjs/common';
import { BooksService } from './providers/books.service';
import { BooksController } from './controllers/books.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
import { DynamodbModule } from 'src/dynamodb/dynamodb.module';

@Module({
  imports: [DynamodbModule, UploadsModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
