import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Book extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop()
  publishedDate: Date;

  @Prop()
  isbn: string;

  @Prop()
  summary: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
