import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BooksService } from '../providers/books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('book data', createBookDto);
    return this.booksService.create(createBookDto, file);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.booksService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('updated data', updateBookDto);
    return this.booksService.update(id, updateBookDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
