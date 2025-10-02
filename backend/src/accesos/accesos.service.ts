import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export interface Acceso {
  empresa: string;
  usuario: string;
  nombre: string;
  email: string;
  clave: string;
  nivel: string;
  codigo: number;
  bodega: number;
  centro_costos: number;
  activo: boolean;
}

@Injectable()
export class AccesosService {
  private readonly logger = new Logger(AccesosService.name);

  constructor(
    private configService: ConfigService,
    private readonly databaseService: DatabaseService
  ) {}

  async findAll(query: any = {}) {
    try {
      const { page = 1, limit = 10, empresa = '', usuario = '', nombre = '', email = '', activo } = query;

      this.logger.log('📊 Usando DatabaseService para obtener accesos');
      let queryText = 'SELECT * FROM accesos';
      const params = [];
      const conditions = [];

      if (empresa) {
        conditions.push(`empresa ILIKE $${params.length + 1}`);
        params.push(`%${empresa}%`);
      }
      if (usuario) {
        conditions.push(`usuario ILIKE $${params.length + 1}`);
        params.push(`%${usuario}%`);
      }
      if (nombre) {
        conditions.push(`nombre ILIKE $${params.length + 1}`);
        params.push(`%${nombre}%`);
      }
      if (email) {
        conditions.push(`email ILIKE $${params.length + 1}`);
        params.push(`%${email}%`);
      }
      if (activo !== undefined) {
        conditions.push(`activo = $${params.length + 1}`);
        params.push(activo);
      }

      if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
      }
      queryText += ' ORDER BY empresa, usuario';

      const dbClient = this.databaseService.getDbClient();
      let allAccesos;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        let supabaseQuery = supabase.from('accesos').select('*', { count: 'exact' });
        
        // Aplicar filtros en Supabase
        if (empresa) supabaseQuery = supabaseQuery.ilike('empresa', `%${empresa}%`);
        if (usuario) supabaseQuery = supabaseQuery.ilike('usuario', `%${usuario}%`);
        if (nombre) supabaseQuery = supabaseQuery.ilike('nombre', `%${nombre}%`);
        if (email) supabaseQuery = supabaseQuery.ilike('email', `%${email}%`);
        if (activo !== undefined) supabaseQuery = supabaseQuery.eq('activo', activo);

        const { data, error, count } = await supabaseQuery;
        if (error) {
          throw error;
        }
        allAccesos = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query(queryText, params);
        allAccesos = result.rows;
      }

      // Convertir activo de integer a boolean para consistencia de tipos
      const accesosWithBooleanActivo = allAccesos.map(acceso => ({
        ...acceso,
        activo: acceso.activo === 1 || acceso.activo === true
      }));

      const total = accesosWithBooleanActivo.length;

      // Aplicar paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const paginatedAccesos = accesosWithBooleanActivo
        .slice(offset, offset + parseInt(limit));

      const response = {
        data: paginatedAccesos,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      };

      this.logger.log(`✅ Accesos obtenidos: ${paginatedAccesos.length} de ${total} total`);
      return response;
    } catch (error) {
      console.error('❌ Error en findAll accesos:', error);
      throw new InternalServerErrorException('Error al obtener accesos');
    }
  }

  async findOne(usuario: string): Promise<Acceso | undefined> {
    try {
      this.logger.log(`📊 Usando DatabaseService para obtener acceso con usuario: ${usuario}`);
      const dbClient = this.databaseService.getDbClient();
      let acceso;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('accesos').select('*').eq('usuario', usuario).single();
        if (error) {
          throw error;
        }
        acceso = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('SELECT * FROM accesos WHERE usuario = $1', [usuario]);
        acceso = result.rows[0];
      }

      if (!acceso) {
        throw new NotFoundException(`Acceso con usuario ${usuario} no encontrado`);
      }

      return acceso;
    } catch (error) {
      console.error('❌ Error en findOne acceso:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener acceso');
    }
  }

  async create(createAccesoDto: Partial<Acceso>): Promise<Acceso> {
    try {
      this.logger.log('📊 Usando DatabaseService para crear acceso');
      const dbClient = this.databaseService.getDbClient();
      let newAcceso;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('accesos').insert(createAccesoDto).select().single();
        if (error) {
          throw error;
        }
        newAcceso = data;
      } else {
        const pgPool = dbClient as Pool;
        const fields = Object.keys(createAccesoDto);
        const values = Object.values(createAccesoDto);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        
        const queryText = `
          INSERT INTO accesos (${fields.join(', ')}) 
          VALUES (${placeholders}) 
          RETURNING *
        `;
        
        const result = await pgPool.query(queryText, values);
        newAcceso = result.rows[0];
      }

      this.logger.log('✅ Acceso creado exitosamente');
      return newAcceso;
    } catch (error) {
      console.error('❌ Error en create acceso:', error);
      throw new InternalServerErrorException('Error al crear acceso');
    }
  }

  async update(usuario: string, updateAccesoDto: Partial<Acceso>): Promise<Acceso> {
    try {
      this.logger.log(`📊 Usando DatabaseService para actualizar acceso: ${usuario}`);
      const dbClient = this.databaseService.getDbClient();
      let updatedAcceso;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase
          .from('accesos')
          .update(updateAccesoDto)
          .eq('usuario', usuario)
          .select()
          .single();
        if (error) {
          throw error;
        }
        updatedAcceso = data;
      } else {
        const pgPool = dbClient as Pool;
        const fields = Object.keys(updateAccesoDto);
        const values = Object.values(updateAccesoDto);
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        
        const queryText = `
          UPDATE accesos 
          SET ${setClause} 
          WHERE usuario = $${values.length + 1} 
          RETURNING *
        `;
        
        const result = await pgPool.query(queryText, [...values, usuario]);
        updatedAcceso = result.rows[0];
      }

      if (!updatedAcceso) {
        throw new NotFoundException(`Acceso con usuario ${usuario} no encontrado`);
      }

      this.logger.log('✅ Acceso actualizado exitosamente');
      return updatedAcceso;
    } catch (error) {
      console.error('❌ Error en update acceso:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar acceso');
    }
  }

  async remove(usuario: string): Promise<void> {
    try {
      this.logger.log(`📊 Usando DatabaseService para eliminar acceso: ${usuario}`);
      const dbClient = this.databaseService.getDbClient();

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { error } = await supabase.from('accesos').delete().eq('usuario', usuario);
        if (error) {
          throw error;
        }
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('DELETE FROM accesos WHERE usuario = $1', [usuario]);
        if (result.rowCount === 0) {
          throw new NotFoundException(`Acceso con usuario ${usuario} no encontrado`);
        }
      }

      this.logger.log('✅ Acceso eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error en remove acceso:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar acceso');
    }
  }

  async validateAccess(usuario: string, empresa: string): Promise<{ activo: boolean }> {
    try {
      this.logger.log(`📊 Validando acceso para usuario: ${usuario}, empresa: ${empresa}`);
      const dbClient = this.databaseService.getDbClient();
      let acceso;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase
          .from('accesos')
          .select('activo')
          .eq('usuario', usuario)
          .eq('empresa', empresa)
          .single();
        if (error) {
          return { activo: false };
        }
        acceso = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query(
          'SELECT activo FROM accesos WHERE usuario = $1 AND empresa = $2',
          [usuario, empresa]
        );
        acceso = result.rows[0];
      }

      return { activo: acceso?.activo || false };
    } catch (error) {
      console.error('❌ Error en validateAccess:', error);
      return { activo: false };
    }
  }
}