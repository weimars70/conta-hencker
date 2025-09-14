import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGenericRecordDto {
  @ApiProperty({ description: 'Table name' })
  @IsString()
  @IsNotEmpty()
  tabla: string;

  @ApiProperty({ description: 'Company identifier', default: '01' })
  @IsString()
  @IsOptional()
  empresa?: string = '01';

  @ApiProperty({ description: 'Record code', default: 0 })
  @IsNumber()
  @IsOptional()
  codigo?: number = 0;

  @ApiProperty({ description: 'Record name' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Abbreviated name' })
  @IsString()
  @IsNotEmpty()
  abreviado: string;

  @ApiProperty({ description: 'Record status', default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
}