import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export interface TipoDocumento {
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface CuentaContable {
  cuenta: string;
  nombre: string;
  con_nit?: boolean;
  con_aplica?: boolean;
  con_cheque?: boolean;
  con_rete?: boolean;
  porcentaje?: number;
  con_comen?: boolean;
  baseminima?: number;
}

export interface CentroCosto {
  codigo: string;
  nombre: string;
}

export interface FuenteContable {
  codigo: string;
  nombre: string;
}

export interface Nit {
  nit: string;
  nombre: string;
}

@Injectable()
export class ContabilidadService {
  private readonly logger = new Logger(ContabilidadService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async getTiposDocumento(empresa: string): Promise<TipoDocumento[]> {
    try {
      this.logger.log(`Obteniendo tipos de documento para empresa: ${empresa}`);
      
      const dbClient = this.databaseService.getDbClient();
      let result;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase
          .from('tipo_consecutivo')
          .select('codigo, nombre, activo')
          .eq('empresa', empresa)
          .eq('activo', true)
          .order('nombre');
        
        if (error) {
          throw error;
        }
        result = data;
      } else {
        const pgPool = dbClient as Pool;
        const query = `
          SELECT codigo, nombre, activo 
          FROM public.tipo_consecutivo 
          WHERE empresa = $1 AND activo = true
          ORDER BY nombre
        `;
        const queryResult = await pgPool.query(query, [empresa]);
        result = queryResult.rows;
      }
      
      this.logger.log(`Encontrados ${result.length} tipos de documento`);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener tipos de documento:', error);
      throw error;
    }
  }

  async getCuentasContables(empresa: string): Promise<CuentaContable[]> {
    try {
      this.logger.log(`Obteniendo cuentas contables para empresa: ${empresa}`);
      
      const dbClient = this.databaseService.getDbClient();
      let result;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase
          .from('plan_contable')
          .select('cuenta, nombre, con_nit, con_aplica, con_cheque, con_rete, porcentaje, con_comen, baseminima')
          .eq('empresa', empresa)
          .eq('activo', true)
          .filter('cuenta', 'like', '_______*') // Más de 6 caracteres
          .order('cuenta');
        
        if (error) {
          throw error;
        }
        result = data;
      } else {
        const pgPool = dbClient as Pool;
        const query = `
          SELECT cuenta, nombre, con_nit, con_aplica, con_cheque, con_rete, porcentaje, con_comen, baseminima
          FROM public.plan_contable 
          WHERE activo = true AND LENGTH(cuenta) > 6 AND empresa = $1
          ORDER BY cuenta
        `;
        const queryResult = await pgPool.query(query, [empresa]);
        result = queryResult.rows;
      }
      
      this.logger.log(`Encontradas ${result.length} cuentas contables`);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener cuentas contables:', error);
      throw error;
    }
  }

  async getCentrosCostos(empresa: string): Promise<CentroCosto[]> {
    try {
      this.logger.log(`Obteniendo centros de costos para empresa: ${empresa}`);
      
      const dbClient = this.databaseService.getDbClient();
      let result;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase
          .from('centro_costos')
          .select('codigo, nombre')
          .eq('empresa', empresa)
          .eq('activo', true)
          .order('nombre');
        
        if (error) {
          throw error;
        }
        result = data;
      } else {
        const pgPool = dbClient as Pool;
        const query = `
          SELECT codigo, nombre 
          FROM public.centro_costos 
          WHERE activo = true AND empresa = $1
          ORDER BY nombre
        `;
        const queryResult = await pgPool.query(query, [empresa]);
        result = queryResult.rows;
      }
      
      this.logger.log(`Encontrados ${result.length} centros de costos`);
      return result;
    } catch (error) {
      this.logger.error('Error al obtener centros de costos:', error);
      throw error;
    }
  }

  async getFuentesContables(empresa: string): Promise<FuenteContable[]> {
    try {
      this.logger.log(`Obteniendo fuentes contables para empresa: ${empresa}`);
      
      const dbClient = this.databaseService.getDbClient();
      let result;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase
          .from('fuente_contable')
          .select('codigo, nombre')
          .eq('empresa', empresa)
          .eq('activo', true)
          .order('nombre');
        
        if (error) {
          throw error;
        }
        result = data;
      } else {
        const pgPool = dbClient as Pool;
        const query = `
          SELECT codigo, nombre 
          FROM public.fuente_contable 
          WHERE activo = true AND empresa = $1
          ORDER BY nombre
        `;
        const queryResult = await pgPool.query(query, [empresa]);
        result = queryResult.rows;
      }
      
      this.logger.log(`Encontradas ${result.length} fuentes contables`);
      return result;
    } catch (error) {
      this.logger.error(`Error obteniendo fuentes contables: ${error.message}`);
      throw error;
    }
  }

  async getNits(empresa: string, filter?: string): Promise<Nit[]> {
    try {
      this.logger.log(`Obteniendo nits para empresa: ${empresa}${filter ? ` con filtro: ${filter}` : ''}`);
      
      const dbClient = this.databaseService.getDbClient();
      let result;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        let query = supabase
          .from('nits')
          .select('nit, nombre')
          .eq('activo', true)
          .eq('empresa', empresa);

        if (filter) {
          query = query.or(`nit.ilike.%${filter}%,nombre.ilike.%${filter}%`);
        }

        const { data, error } = await query.order('nombre');
        
        if (error) {
          throw error;
        }
        result = data;
      } else {
        const pgPool = dbClient as Pool;
        let query = `
          SELECT nit, nombre 
          FROM public.nits 
          WHERE activo = true AND empresa = $1
        `;
        const values = [empresa];

        if (filter) {
          query += ` AND (nit ILIKE $2 OR nombre ILIKE $3)`;
          values.push(`%${filter}%`, `%${filter}%`);
        }

        query += ` ORDER BY nombre`;
        
        const queryResult = await pgPool.query(query, values);
        result = queryResult.rows;
      }
      
      this.logger.log(`Encontrados ${result.length} nits`);
      return result;
    } catch (error) {
      this.logger.error(`Error obteniendo nits: ${error.message}`);
      throw error;
    }
  }
}