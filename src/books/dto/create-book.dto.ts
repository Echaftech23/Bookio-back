import { IsString, IsDate, IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { BookStatus } from '../enums/book-status.enums';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsDate()
  @IsNotEmpty()
  publishedDate: Date;

  @IsEnum(BookStatus)
  status: BookStatus;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;
}
