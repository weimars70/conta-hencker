import { Module } from '@nestjs/common';
import { GenericCaptureService } from './generic-capture.service';
import { GenericCaptureController } from './generic-capture.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GenericCaptureController],
  providers: [GenericCaptureService],
})
export class GenericCaptureModule {}