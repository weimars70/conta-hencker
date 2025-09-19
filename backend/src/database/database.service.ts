import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { db, useSupabase } from './dbClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  getDbClient() {
    return db;
  }

  async insert(tabla: string, data: any): Promise<any> {
    if (useSupabase) {
      const supabase = db as SupabaseClient;
      const { data: result, error } = await supabase.from(tabla).insert([data]).select();
      if (error) {
        this.logger.error(`Error inserting into ${tabla} (Supabase):`, error.message);
        throw error;
      }
      return result[0];
    } else {
      const pgPool = db as Pool;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `\$${i + 1}`).join(', ');
      const columns = keys.map(key => `\"${key}\"`).join(', ');
      const query = `INSERT INTO \"${tabla}\" (${columns}) VALUES (${placeholders}) RETURNING *`;
      this.logger.log(`Generated SQL Query: ${query}`);
      this.logger.log(`Values: ${values}`);
      try {
        const result = await pgPool.query(query, values);
        return result.rows[0];
      } catch (error) {
        this.logger.error(`Error inserting into ${tabla} (PostgreSQL):`, error.message);
        throw error;
      }
    }
  }

  async findAll(tabla: string, filters: { empresa?: string, filter?: string } = {}): Promise<any[]> {
    if (useSupabase) {
      const supabase = db as SupabaseClient;
      let query = supabase.from(tabla).select('*');
      if (filters.empresa) {
        query = query.eq('empresa', filters.empresa);
      }
      if (filters.filter) {
        const searchTerm = `%${filters.filter}%`;
        // Configurar búsqueda específica por tabla
        if (tabla === 'nits') {
          query = query.or(`nit.ilike.${searchTerm},nombre.ilike.${searchTerm}`);
        } else {
          query = query.or(`(codigo::text).ilike.${searchTerm},nombre.ilike.${searchTerm},abreviado.ilike.${searchTerm}`);
        }
      }
      const { data, error } = await query;
      if (error) {
        this.logger.error(`Error finding all from ${tabla} (Supabase):`, error.message);
        throw error;
      }
      return data;
    } else {
      const pgPool = db as Pool;
      let query = `SELECT * FROM \"${tabla}\"`;
      const values = [];
      const conditions = [];

      if (filters.empresa) {
        conditions.push(`\"empresa\" = \$${values.length + 1}`);
        values.push(filters.empresa);
      }

      if (filters.filter) {
        const searchTerm = `%${filters.filter}%`;
        // Configurar búsqueda específica por tabla
        if (tabla === 'nits') {
          values.push(searchTerm, searchTerm);
          conditions.push(`("nit" ILIKE \$${values.length - 1} OR "nombre" ILIKE \$${values.length})`);
        } else {
          values.push(searchTerm, searchTerm, searchTerm);
          conditions.push(`(CAST("codigo" AS TEXT) ILIKE \$${values.length - 2} OR "nombre" ILIKE \$${values.length - 1} OR "abreviado" ILIKE \$${values.length})`);
        }
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      try {
        const result = await pgPool.query(query, values);
        return result.rows;
      } catch (error) {
        this.logger.error(`Error finding all from ${tabla} (PostgreSQL):`, error.message);
        throw error;
      }
    }
  }

  async findOne(tabla: string, filters: { codigo: number; empresa: string }): Promise<any> {
    if (useSupabase) {
      const supabase = db as SupabaseClient;
      const { data, error } = await supabase.from(tabla)
        .select('*')
        .eq('codigo', filters.codigo)
        .eq('empresa', filters.empresa)
        .single();
      if (error) {
        this.logger.error(`Error finding one from ${tabla} with codigo ${filters.codigo} and empresa ${filters.empresa} (Supabase):`, error.message);
        throw error;
      }
      return data;
    } else {
      const pgPool = db as Pool;
      const query = `SELECT * FROM \"${tabla}\" WHERE \"codigo\" = \$1 AND \"empresa\" = \$2`;
      try {
        const result = await pgPool.query(query, [filters.codigo, filters.empresa]);
        return result.rows[0];
      } catch (error) {
        this.logger.error(`Error finding one from ${tabla} with codigo ${filters.codigo} and empresa ${filters.empresa} (PostgreSQL):`, error.message);
        throw error;
      }
    }
  }

  async update(tabla: string, filters: { codigo: number; empresa: string }, data: any): Promise<any> {
    if (useSupabase) {
      const supabase = db as SupabaseClient;
      const { data: result, error } = await supabase.from(tabla)
        .update(data)
        .eq('codigo', filters.codigo)
        .eq('empresa', filters.empresa)
        .select();
      if (error) {
        this.logger.error(`Error updating ${tabla} with codigo ${filters.codigo} and empresa ${filters.empresa} (Supabase):`, error.message);
        throw error;
      }
      return result[0];
    } else {
      const pgPool = db as Pool;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((key, i) => `\"${key}\" = \$${i + 1}`).join(', ');
      const query = `UPDATE \"${tabla}\" SET ${setClause} WHERE \"codigo\" = \$${keys.length + 1} AND \"empresa\" = \$${keys.length + 2} RETURNING *`;
      this.logger.log(`Generated SQL Query: ${query}`);
      this.logger.log(`Values: ${[...values, filters.codigo, filters.empresa]}`);
      try {
        const result = await pgPool.query(query, [...values, filters.codigo, filters.empresa]);
        return result.rows[0];
      } catch (error) {
        this.logger.error(`Error updating ${tabla} with codigo ${filters.codigo} and empresa ${filters.empresa} (PostgreSQL):`, error.message);
        throw error;
      }
    }
  }

  async remove(tabla: string, filters: { codigo: number; empresa: string }): Promise<any> {
    if (useSupabase) {
      const supabase = db as SupabaseClient;
      const { data: result, error } = await supabase.from(tabla)
        .delete()
        .eq('codigo', filters.codigo)
        .eq('empresa', filters.empresa)
        .select();
      if (error) {
        this.logger.error(`Error deleting from ${tabla} with codigo ${filters.codigo} and empresa ${filters.empresa} (Supabase):`, error.message);
        throw error;
      }
      return result[0];
    } else {
      const pgPool = db as Pool;
      const query = `DELETE FROM \"${tabla}\" WHERE \"codigo\" = \$1 AND \"empresa\" = \$2 RETURNING *`;
      try {
        const result = await pgPool.query(query, [filters.codigo, filters.empresa]);
        return result.rows[0];
      } catch (error) {
        this.logger.error(`Error deleting from ${tabla} with codigo ${filters.codigo} and empresa ${filters.empresa} (PostgreSQL):`, error.message);
        throw error;
      }
    }
  }

  async testConnection(): Promise<void> {
    try {
      this.logger.log('🔌 Testing database connection...');
      this.logger.log(`📊 Use Supabase: ${useSupabase}`);
      
      if (!db) {
        this.logger.error('❌ Database client is null');
        throw new Error('Database client not initialized');
      }
      
      if (useSupabase) {
        const supabase = db as SupabaseClient;
        this.logger.log('🔍 Testing Supabase connection...');
        
        if (typeof supabase.from !== 'function') {
          this.logger.error('❌ Supabase client missing .from() method');
          throw new Error('Invalid Supabase client');
        }
        
        const { data, error } = await supabase.from('usuarios').select('id').limit(1);
        if (error) {
          this.logger.error('❌ Supabase query failed:', error.message);
          throw error;
        } else {
          this.logger.log('✅ Supabase connection successful');
        }
      } else {
        const pgPool = db as Pool;
        this.logger.log('🔍 Testing PostgreSQL connection...');
        
        if (typeof pgPool.query !== 'function') {
          this.logger.error('❌ PostgreSQL client missing .query() method');
          throw new Error('Invalid PostgreSQL client');
        }
        
        const result = await pgPool.query('SELECT 1 as test');
        this.logger.log('✅ PostgreSQL connection successful');
      }
      
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);
      this.logger.error('❌ Error details:', error);
      throw error; // Lanzar el error para que se vea claramente
    }
  }
}