import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlanContableService } from './plan-contable.service';

@ApiTags('plan-contable')
@Controller('plan-contable')
export class PlanContableController {
  constructor(private readonly planContableService: PlanContableService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener cuentas del plan contable' })
  @ApiResponse({ status: 200, description: 'Cuentas obtenidas correctamente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  async obtenerCuentas(
    @Query('empresa') empresa: string
  ) {
    return this.planContableService.obtenerCuentas(empresa);
  }

  @Get(':cuenta')
  @ApiOperation({ summary: 'Obtener cuenta específica del plan contable' })
  @ApiResponse({ status: 200, description: 'Cuenta obtenida correctamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  async obtenerCuentaPorId(
    @Param('cuenta') cuenta: string,
    @Query('empresa') empresa: string
  ) {
    return this.planContableService.obtenerCuentaPorId(empresa, cuenta);
  }

  @Post('registrar')
  @ApiOperation({ summary: 'Registrar cuenta en el plan contable' })
  @ApiResponse({ status: 200, description: 'Cuenta registrada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async registrarCuenta(
    @Query('empresa') empresa: string,
    @Body() cuentaData: any
  ) {
    return this.planContableService.registrarCuenta(empresa, cuentaData);
  }
}