import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksService } from './providers/books.service';
import { BooksController } from './controllers/books.controller';
import { Book, BookSchema } from './entities/book.entity';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    UploadsModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
