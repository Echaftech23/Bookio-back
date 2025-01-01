import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { Book } from '../entities/book.entity';
import { UploadsService } from '../../uploads/providers/uploads.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(
    createBookDto: CreateBookDto,
    file: Express.Multer.File,
  ): Promise<Book> {
    if (!file) {
      throw new NotFoundException('Image not found');
    }

    const image = await this.uploadsService.uploadFile(file);
    const createBook = new this.bookModel({ ...createBookDto, image });
    return createBook.save();
  }

  async findAll(
    page: number = 1,
    limit: number = 6,
  ): Promise<{ books: Book[]; totalBooks: number }> {
    const skip = (page - 1) * limit;
    const [books, totalBooks] = await Promise.all([
      this.bookModel.find().skip(skip).limit(limit).exec(),
      this.bookModel.countDocuments().exec(),
    ]);
    return { books, totalBooks };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ): Promise<Book> {
    const book = await this.findBookById(id);

    if (file) {
      const newImageUrl = await this.handleFileUpload(book, file);
      updateBookDto.image = newImageUrl;
    }

    return this.updateBook(id, updateBookDto);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findBookById(id);
    if (book.image) {
      await this.uploadsService.deleteFile(book.image);
    }
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  private async findBookById(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  private async handleFileUpload(
    book: Book,
    file: Express.Multer.File,
  ): Promise<string> {
    if (book.image) {
      await this.uploadsService.deleteFile(book.image);
    }
    const newImageUrl = await this.uploadsService.uploadFile(file);
    return newImageUrl;
  }

  private async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return updatedBook;
  }
}
