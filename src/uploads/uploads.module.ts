import { Module } from '@nestjs/common';
import { UploadsService } from './providers/uploads.service';
import { UploadsController } from './controllers/uploads.controller';
import { UploadToAwsProvider } from './providers/upload-to-aws.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadToAwsProvider],
  exports: [UploadsService],
})
export class UploadsModule {}
