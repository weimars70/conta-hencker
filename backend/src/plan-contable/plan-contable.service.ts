import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

@Injectable()
export class PlanContableService {
  private readonly logger = new Logger(PlanContableService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async registrarCuenta(empresa: string, cuentaData: any) {
    this.logger.log('📊 Registrando cuenta en plan contable:', cuentaData);
    
    const {
      periodo,
      cuenta,
      naturaleza,
      nombre,
      codigo,
      subcodigo,
      columna,
      requiereNit,
      nit,
      fuente,
      fuenteSelect,
      centroCostos,
      centroCostosSelect,
      requiereFactura,
      saldoFacturaCierre,
      cheque,
      retencion,
      porcentajeRetencion,
      comentarios,
      concepto,
      baseMinimaRetencion,
      actividad
    } = cuentaData;

    const dbClient = this.databaseService.getDbClient();
    
    try {
      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        
        // Para Supabase, llamar la función directamente
        const { data, error } = await supabase.rpc('func_registra_plan_contable', {
          vempresa: empresa,
          vperiodo: periodo || new Date().getFullYear().toString(),
          vcuenta: cuenta,
          vdeb_cre: naturaleza || 1,
          vnombre: nombre,
          vcodigo: codigo || '',
          vsubcodigo: subcodigo || '',
          vcolumna: columna || 1,
          vcon_nit: requiereNit || false,
          vnit: nit || '',
          vcon_fuente: fuente || false,
          vfuente: fuenteSelect || null,
          vcon_ctrc: centroCostos || false,
          vcentro_costos: centroCostosSelect || null,
          vcon_aplica: requiereFactura || false,
          vsdo_aplica: saldoFacturaCierre || false,
          vcon_cheque: cheque || false,
          vcon_rete: retencion || false,
          vporcentaje: porcentajeRetencion || null,
          vcon_comen: comentarios || false,
          vcon_concepto: concepto || false,
          vbaseminima: baseMinimaRetencion || null,
          vactividad: actividad || 'N'
        });
        
        if (error) {
          this.logger.error('Error en Supabase:', error);
          throw error;
        }
        
        return data;
      } else {
        const pgPool = dbClient as Pool;
        
        // Para PostgreSQL, llamar la función usando SQL
        const query = `
          SELECT public.func_registra_plan_contable(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
          ) as resultado
        `;
        
        const params = [
          empresa,                                    // vempresa
          periodo || new Date().getFullYear().toString(), // vperiodo
          cuenta,                                     // vcuenta
          naturaleza || 1,                           // vdeb_cre
          nombre,                                     // vnombre
          codigo || '',                              // vcodigo
          subcodigo || '',                           // vsubcodigo
          columna || 1,                             // vcolumna
          requiereNit || false,                      // vcon_nit
          nit || '',                                 // vnit
          fuente || false,                           // vcon_fuente
          fuenteSelect || null,                      // vfuente
          centroCostos || false,                     // vcon_ctrc
          centroCostosSelect || null,                // vcentro_costos
          requiereFactura || false,                  // vcon_aplica
          saldoFacturaCierre || false,               // vsdo_aplica
          cheque || false,                           // vcon_cheque
          retencion || false,                        // vcon_rete
          porcentajeRetencion || null,               // vporcentaje
          comentarios || false,                      // vcon_comen
          concepto || false,                         // vcon_concepto
          baseMinimaRetencion || null,               // vbaseminima
          actividad || 'N'                           // vactividad
        ];
        
        this.logger.log('Ejecutando función SQL:', query);
        this.logger.log('Parámetros:', params);
        
        const result = await pgPool.query(query, params);
        return result.rows[0];
      }
    } catch (error) {
      this.logger.error('Error registrando cuenta:', error);
      throw error;
    }
  }

  async obtenerCuentas(empresa: string) {
    this.logger.log('📋 Obteniendo cuentas del plan contable para empresa:', empresa);
    
    const dbClient = this.databaseService.getDbClient();
    
    try {
      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        
        const { data, error } = await supabase
          .from('plan_contable')
          .select('*')
          .eq('empresa', empresa)
          .order('cuenta', { ascending: true });
        
        if (error) {
          this.logger.error('Error en Supabase:', error);
          throw error;
        }
        
        return data;
      } else {
        const pgPool = dbClient as Pool;
        
        const query = `
          SELECT A.cuenta, A.nombre as descripcion, A.fuente, A.centro_costos as centrocostos FROM plan_contable A 
          WHERE a.empresa = $1 
          ORDER BY a.cuenta ASC
        `;
        
        this.logger.log('Ejecutando consulta SQL:', query);
        this.logger.log('Parámetros:', [empresa]);
        
        const result = await pgPool.query(query, [empresa]);
        return result.rows;
      }
    } catch (error) {
      this.logger.error('Error obteniendo cuentas:', error);
      throw error;
    }
  }

  async obtenerCuentaPorId(empresa: string, cuenta: string) {
    this.logger.log('🔍 Obteniendo cuenta específica:', { empresa, cuenta });
    
    const dbClient = this.databaseService.getDbClient();
    
    try {
      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        
        const { data, error } = await supabase
          .from('plan_contable')
          .select('*')
          .eq('empresa', empresa)
          .eq('cuenta', cuenta)
          .single();
        
        if (error) {
          this.logger.error('Error en Supabase:', error);
          throw error;
        }
        
        return data;
      } else {
        const pgPool = dbClient as Pool;
        
        const query = `
          SELECT * FROM plan_contable A 
          WHERE a.cuenta = $1 AND a.empresa = $2
        `;
        
        this.logger.log('Ejecutando consulta SQL:', query);
        this.logger.log('Parámetros:', [cuenta, empresa]);
        
        const result = await pgPool.query(query, [cuenta, empresa]);
        return result.rows[0] || null;
      }
    } catch (error) {
      this.logger.error('Error obteniendo cuenta específica:', error);
      throw error;
    }
  }
}