import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nombre del usuario', required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ description: 'Email del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  clave: string;

  @ApiProperty({ description: 'Teléfono del usuario', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ description: 'Estado activo', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}