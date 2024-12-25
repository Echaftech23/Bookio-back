import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';
import { DatabaseModule } from './database/database.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BooksModule,
    DatabaseModule,
    UploadsModule,
  ],
})
export class AppModule {}
