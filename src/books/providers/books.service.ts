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
    file?: Express.Multer.File,
  ): Promise<Book> {
    let image = createBookDto.image;
    if (file) image = await this.uploadsService.uploadFile(file);

    const createBook = new this.bookModel({ ...createBookDto, image });
    return createBook.save();
  }

  async findAll(page: number = 1, limit: number = 6): Promise<Book[]> {
    const skip = (page - 1) * limit;
    return this.bookModel.find().skip(skip).limit(limit).exec();
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return updatedBook;
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }
}
