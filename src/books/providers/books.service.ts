import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { UploadsService } from '../../uploads/providers/uploads.service';

@Injectable()
export class BooksService {
  private readonly tableName = 'books';

  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDb: DynamoDBDocumentClient,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(createBookDto: CreateBookDto, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('Image not found');
    }

    const image = await this.uploadsService.uploadFile(file);
    const bookId = uuidv4();

    const book = {
      _id: bookId,
      ...createBookDto,
      image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.dynamoDb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: book,
      }),
    );

    return book;
  }

  async findAll(page: number = 1, limit: number = 6) {
    const params: any = {
      TableName: this.tableName,
      Limit: parseInt(limit.toString(), 10), // Ensure limit is an integer
    };

    if (page > 1) {
      const lastEvaluatedKey = await this.getLastEvaluatedKey(page, limit);
      if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
      }
    }

    const response = await this.dynamoDb.send(new ScanCommand(params));

    const countResponse = await this.dynamoDb.send(
      new ScanCommand({
        TableName: this.tableName,
        Select: 'COUNT',
      }),
    );

    return {
      books: response.Items,
      totalBooks: countResponse.Count || 0,
    };
  }

  async findOne(_id: string) {
    const response = await this.dynamoDb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { _id },
      }),
    );

    if (!response.Item) {
      throw new NotFoundException(`Book with ID ${_id} not found`);
    }

    return response.Item;
  }

  async update(
    _id: string,
    updateBookDto: UpdateBookDto,
    file?: Express.Multer.File,
  ) {
    const book = await this.findOne(_id);

    let newImageUrl = book.image;
    if (file) {
      newImageUrl = await this.handleFileUpload(book, file);
    }

    const updateExpression: string[] = [];
    const expressionAttributeValues: { [key: string]: any } = {};
    const expressionAttributeNames: { [key: string]: string } = {};

    Object.entries({ ...updateBookDto, image: newImageUrl }).forEach(
      ([key, value]) => {
        if (value !== undefined && key !== '_id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeValues[`:${key}`] = value;
          expressionAttributeNames[`#${key}`] = key;
        }
      },
    );

    // Ensure updatedAt is only added once
    if (!expressionAttributeNames['#updatedAt']) {
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
    }

    const response = await this.dynamoDb.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { _id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      }),
    );

    return response.Attributes;
  }

  async remove(_id: string): Promise<void> {
    const book = await this.findOne(_id);

    if (book.image) {
      await this.uploadsService.deleteFile(book.image);
    }

    await this.dynamoDb.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { _id },
      }),
    );
  }

  private async handleFileUpload(book: any, file: Express.Multer.File) {
    if (book.image) {
      await this.uploadsService.deleteFile(book.image);
    }
    return await this.uploadsService.uploadFile(file);
  }

  private async getLastEvaluatedKey(page: number, limit: number) {
    const params = {
      TableName: this.tableName,
      Limit: (page - 1) * limit,
    };

    const response = await this.dynamoDb.send(new ScanCommand(params));
    return response.LastEvaluatedKey;
  }
}
