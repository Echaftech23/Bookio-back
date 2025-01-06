import { ConfigService } from '@nestjs/config';
import { UploadToAwsProvider } from './upload-to-aws.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class UploadsService {
  constructor(
    private readonly UploadToAwsProvider: UploadToAwsProvider,
    private readonly ConfigService: ConfigService,
  ) {}

  public async uploadFile(file: Express.Multer.File) {
    if (
      !['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('File type not supported');
    }

    try {
      // Upload file to AWS S3
      const name = await this.UploadToAwsProvider.fileUpload(file);

      //generate a new entry in the database
      const ImageUrl = `https://${this.ConfigService.get<string>('AWS_CLOUDFRONT_URL')}/${name}`;

      return ImageUrl;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  public async deleteFile(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').pop();
      await this.UploadToAwsProvider.fileDelete(fileName);
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
