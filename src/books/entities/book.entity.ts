import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BookStatus } from '../enums/book-status.enums';

@Schema({
  collection: 'books',
  timestamps: true,
})
export class Book extends Document {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  title: string;

  @Prop({ required: true, trim: true })
  author: string;

  @Prop({ required: true })
  publishedDate: Date;

  @Prop({
    type: String,
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  image: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
