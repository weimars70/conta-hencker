import { PartialType } from '@nestjs/swagger';
import { CreateGenericRecordDto } from './create-generic-record.dto';

export class UpdateGenericRecordDto extends PartialType(CreateGenericRecordDto) {}