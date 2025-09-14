import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty({ description: 'Código de la empresa' })
  @IsString()
  empresa: string;

  @ApiProperty({ description: 'Nombre completo de la empresa' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Nombre abreviado de la empresa', required: false })
  @IsString()
  @IsOptional()
  abreviado?: string;

  @ApiProperty({ description: 'NIT de la empresa' })
  @IsString()
  nit: string;

  @ApiProperty({ description: 'Dígito de verificación del NIT' })
  @IsString()
  dg_verifica: string;

  @ApiProperty({ description: 'Dirección de la empresa' })
  @IsString()
  direccion: string;

  @ApiProperty({ description: 'Teléfono de la empresa' })
  @IsString()
  telefono: string;

  @ApiProperty({ description: 'Ciudad de la empresa' })
  @IsString()
  ciudad: string;

  @ApiProperty({ description: 'Número de fax de la empresa', required: false })
  @IsString()
  @IsOptional()
  fax?: string;

  @ApiProperty({ description: 'Correo electrónico de la empresa', required: false })
  @IsString()
  @IsOptional()
  correo?: string;

  @ApiProperty({ description: 'Niveles de la empresa', required: false })
  @IsString()
  @IsOptional()
  niveles?: string;

  @ApiProperty({ description: 'Estado de la empresa (activo/inactivo)', required: false })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}