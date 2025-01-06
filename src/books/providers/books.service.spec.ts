import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { UploadsService } from '../../uploads/providers/uploads.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { NotFoundException } from '@nestjs/common';
import { BookStatus } from '../enums/book-status.enums';

describe('BooksService', () => {
  let service: BooksService;
  let mockDynamoDb: jest.Mocked<DynamoDBDocumentClient>;
  let mockUploadsService: jest.Mocked<UploadsService>;

  const mockBook = {
    _id: '123',
    title: 'Test Book',
    author: 'Test Author',
    publishedDate: new Date(),
    status: BookStatus.AVAILABLE,
    description: 'Test Description',
    image: 'http://test-image.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 955578,
  } as Express.Multer.File;

  beforeEach(async () => {
    mockDynamoDb = {
      send: jest.fn(),
    } as any;

    mockUploadsService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: 'DYNAMODB_CLIENT',
          useValue: mockDynamoDb,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  describe('create', () => {
    it('should create a new book with image', async () => {
      const createBookDto: CreateBookDto = {
        title: mockBook.title,
        author: mockBook.author,
        publishedDate: mockBook.publishedDate,
        status: mockBook.status,
        description: mockBook.description,
        image: mockBook.image,
      };

      mockUploadsService.uploadFile.mockResolvedValue('uploaded-image-url');
      mockDynamoDb.send.mockResolvedValue({ Item: mockBook });

      const result = await service.create(createBookDto, mockFile);

      expect(mockUploadsService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(mockDynamoDb.send).toHaveBeenCalledWith(expect.any(PutCommand));
      expect(result).toHaveProperty('_id');
      expect(result.title).toBe(createBookDto.title);
    });

    it('should throw NotFoundException when no file is provided', async () => {
      const createBookDto: CreateBookDto = {
        title: mockBook.title,
        author: mockBook.author,
        publishedDate: mockBook.publishedDate,
        status: mockBook.status,
        description: mockBook.description,
        image: mockBook.image,
      };

      await expect(service.create(createBookDto, null)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const mockResponse = {
        Items: [mockBook],
        Count: 1,
      };

      mockDynamoDb.send
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse);

      const result = await service.findAll(1, 6);

      expect(result).toEqual({
        books: [mockBook],
        totalBooks: 1,
      });
      expect(mockDynamoDb.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockDynamoDb.send.mockResolvedValue({ Item: mockBook });

      const result = await service.findOne('123');

      expect(result).toEqual(mockBook);
      expect(mockDynamoDb.send).toHaveBeenCalledWith(expect.any(GetCommand));
    });

    it('should throw NotFoundException when book not found', async () => {
      mockDynamoDb.send.mockResolvedValue({ Item: null });

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a book with new image', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
      };

      mockDynamoDb.send
        .mockResolvedValueOnce({ Item: mockBook }) // findOne
        .mockResolvedValueOnce({
          Attributes: { ...mockBook, ...updateBookDto },
        }); // update
      mockUploadsService.uploadFile.mockResolvedValue('new-image-url');
      mockUploadsService.deleteFile.mockResolvedValue(undefined);

      const result = await service.update('123', updateBookDto, mockFile);

      expect(mockUploadsService.deleteFile).toHaveBeenCalledWith(
        mockBook.image,
      );
      expect(mockUploadsService.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(mockDynamoDb.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
      expect(result.title).toBe(updateBookDto.title);
    });

    it('should update a book without new image', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
      };

      mockDynamoDb.send
        .mockResolvedValueOnce({ Item: mockBook })
        .mockResolvedValueOnce({
          Attributes: { ...mockBook, ...updateBookDto },
        });

      const result = await service.update('123', updateBookDto);

      expect(mockUploadsService.uploadFile).not.toHaveBeenCalled();
      expect(result.title).toBe(updateBookDto.title);
    });
  });

  describe('remove', () => {
    it('should remove a book and its image', async () => {
      mockDynamoDb.send
        .mockResolvedValueOnce({ Item: mockBook })
        .mockResolvedValueOnce({});
      mockUploadsService.deleteFile.mockResolvedValue(undefined);

      await service.remove('123');

      expect(mockUploadsService.deleteFile).toHaveBeenCalledWith(
        mockBook.image,
      );
      expect(mockDynamoDb.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });
  });
});
