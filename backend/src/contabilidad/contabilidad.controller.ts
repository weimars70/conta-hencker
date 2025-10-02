import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContabilidadService, TipoDocumento, CuentaContable, CentroCosto, FuenteContable, Nit } from './contabilidad.service';

@ApiTags('contabilidad')
@Controller('contabilidad')
export class ContabilidadController {
  constructor(private readonly contabilidadService: ContabilidadService) {}

  @Get('tipos-documento')
  @ApiOperation({ summary: 'Obtener tipos de documento por empresa' })
  @ApiQuery({ name: 'empresa', description: 'Código de la empresa', required: true })
  @ApiResponse({ status: 200, description: 'Lista de tipos de documento' })
  async getTiposDocumento(@Query('empresa') empresa: string) {
    return this.contabilidadService.getTiposDocumento(empresa);
  }

  @Get('cuentas-contables')
  @ApiOperation({ summary: 'Obtener cuentas contables por empresa' })
  @ApiQuery({ name: 'empresa', description: 'Código de la empresa', required: true })
  @ApiResponse({ status: 200, description: 'Lista de cuentas contables' })
  async getCuentasContables(@Query('empresa') empresa: string): Promise<CuentaContable[]> {
    return this.contabilidadService.getCuentasContables(empresa);
  }

  @Get('centros-costos')
  @ApiOperation({ summary: 'Obtener centros de costos por empresa' })
  @ApiQuery({ name: 'empresa', description: 'Código de la empresa', required: true })
  @ApiResponse({ status: 200, description: 'Lista de centros de costos' })
  async getCentrosCostos(@Query('empresa') empresa: string): Promise<CentroCosto[]> {
    return this.contabilidadService.getCentrosCostos(empresa);
  }

  @Get('fuentes-contables')
  @ApiOperation({ summary: 'Obtener fuentes contables por empresa' })
  @ApiQuery({ name: 'empresa', description: 'Código de la empresa', required: true })
  @ApiResponse({ status: 200, description: 'Lista de fuentes contables' })
  async getFuentesContables(@Query('empresa') empresa: string): Promise<FuenteContable[]> {
    return this.contabilidadService.getFuentesContables(empresa);
  }

  @Get('nits')
  @ApiOperation({ summary: 'Obtener nits por empresa con búsqueda opcional' })
  @ApiQuery({ name: 'empresa', description: 'Código de la empresa', required: true })
  @ApiQuery({ name: 'filter', description: 'Filtro de búsqueda por nit o nombre', required: false })
  @ApiResponse({ status: 200, description: 'Lista de nits' })
  async getNits(@Query('empresa') empresa: string, @Query('filter') filter?: string): Promise<Nit[]> {
    return this.contabilidadService.getNits(empresa, filter);
  }
}