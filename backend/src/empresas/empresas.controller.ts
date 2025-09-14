import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@ApiTags('empresas')
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa creada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe una empresa con el mismo código o NIT' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas obtenida correctamente' })
  findAll(@Query() query: any) {
    return this.empresasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una empresa' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe otra empresa con el mismo código o NIT' })
  update(@Param('id') id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresasService.update(+id, updateEmpresaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una empresa' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  remove(@Param('id') id: string) {
    return this.empresasService.remove(+id);
  }
}