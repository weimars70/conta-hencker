import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenericCaptureService } from './generic-capture.service';

@ApiTags('generic-capture')
@Controller('generic-capture')
export class GenericCaptureController {
  constructor(private readonly genericCaptureService: GenericCaptureService) {}

  @Post()
  create(@Query('tabla') tabla: string, @Query('empresa') empresa: string, @Body() createGenericRecordDto: any) {
    return this.genericCaptureService.create(tabla, empresa, createGenericRecordDto);
  }

  @Get()
  findAll(@Query('tabla') tabla: string, @Query('empresa') empresa: string, @Query('filter') filter?: string, @Query('search') search?: string) {
    // Usar 'search' si está presente, sino usar 'filter'
    const searchTerm = search || filter;
    return this.genericCaptureService.findAll(tabla, empresa, searchTerm);
  }

  @Get(':codigo')
  findOne(@Query('tabla') tabla: string, @Query('empresa') empresa: string, @Param('codigo') codigo: string) {
    return this.genericCaptureService.findOne(tabla, empresa, +codigo);
  }

  @Patch(':codigo')
  update(@Query('tabla') tabla: string, @Query('empresa') empresa: string, @Param('codigo') codigo: string, @Body() updateGenericRecordDto: any) {
    return this.genericCaptureService.update(tabla, empresa, +codigo, updateGenericRecordDto);
  }

  @Delete(':codigo')
  remove(@Query('tabla') tabla: string, @Query('empresa') empresa: string, @Param('codigo') codigo: string) {
    return this.genericCaptureService.remove(tabla, empresa, +codigo);
  }
}