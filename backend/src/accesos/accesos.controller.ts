import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'empresa', required: false, type: String })
  @ApiQuery({ name: 'usuario', required: false, type: String })
  @ApiQuery({ name: 'nombre', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  findAll(@Query() query: any) {
    return this.accesosService.findAll(query);
  }

  @Get('validate/:usuario/:empresa')
  validateAccess(@Param('usuario') usuario: string, @Param('empresa') empresa: string) {
    return this.accesosService.validateAccess(usuario, empresa);
  }

  @Get(':usuario')
  findOne(@Param('usuario') usuario: string) {
    return this.accesosService.findOne(usuario);
  }

  @Patch(':usuario')
  update(@Param('usuario') usuario: string, @Body() updateAccesoDto: any) {
    return this.accesosService.update(usuario, updateAccesoDto);
  }

  @Delete(':usuario')
  remove(@Param('usuario') usuario: string) {
    return this.accesosService.remove(usuario);
  }
}