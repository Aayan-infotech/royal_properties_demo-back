import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('upload')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  // ✅ Single Image / Video
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.s3Service.uploadFile(file, 'media');
  }

  // ✅ Multiple Images / Videos
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return this.s3Service.uploadMultiple(files, 'media');
  }

  // ✅ Delete Single
  @Post('delete')
  deleteSingle(@Body('key') key: string) {
    return this.s3Service.deleteFile(key);
  }

  // ✅ Delete Multiple
  @Post('delete-multiple')
  deleteMultiple(@Body('keys') keys: string[]) {
    return this.s3Service.deleteMultiple(keys);
  }
}
