import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadToAwsProvider {
  constructor(private readonly ConfigService: ConfigService) {}

  public async fileUpload(file: Express.Multer.File) {
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: this.ConfigService.get<string>('AWS_PUBLIC_BUCKET_NAME'),
          Key: this.generateFileName(file),
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();
      return uploadResult.Key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }

  private generateFileName(file: Express.Multer.File) {
    let name = file.originalname.split('.')[0];

    // Remove special white space characters
    name = name.replace(/\s, /g, '').trim();

    // Generate a time stamp
    const timestamp = new Date().getTime().toString().trim();

    // Extract file extension
    const extension = path.extname(file.originalname);

    // Return file uuid
    return `${name}-${timestamp}-${uuidv4()}${extension}${extension}`;
  }
}
