import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccesoDto {
  @ApiProperty({ description: 'Empresa', required: false, default: '01' })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiProperty({ description: 'Nivel de acceso', required: false })
  @IsOptional()
  @IsString()
  nivel?: string;

  @ApiProperty({ description: 'Código', required: false })
  @IsOptional()
  @IsNumber()
  codigo?: number;

  @ApiProperty({ description: 'Bodega', required: false })
  @IsOptional()
  @IsNumber()
  bodega?: number;

  @ApiProperty({ description: 'Centro de costos', required: false })
  @IsOptional()
  @IsNumber()
  centro_costos?: number;

  @ApiProperty({ description: 'Estado activo', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ description: 'ID del usuario' })
  @IsNumber()
  @IsNotEmpty()
  usuario_id: number;
}