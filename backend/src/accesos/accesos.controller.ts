import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccesosService } from './accesos.service';

@ApiTags('accesos')
@Controller('accesos')
export class AccesosController {
  constructor(private readonly accesosService: AccesosService) {}

  @Post()
  create(@Body() createAccesoDto: any) {
    return this.accesosService.create(createAccesoDto);
  }

  @Get()
  findAll() {
    return this.accesosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accesosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccesoDto: any) {
    return this.accesosService.update(+id, updateAccesoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accesosService.remove(+id);
  }
}