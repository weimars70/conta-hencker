import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

interface Empresa {
  id: number;
  empresa: string;
  nombre: string;
  abreviado: string;
  nit: string;
  dg_verifica: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  fax: string;
  correo: string;
  niveles: string;
  activo: boolean;
}

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(query: any = {}) {
    this.logger.log('📊 Usando PostgreSQL para obtener empresas');
    const { page = 1, limit = 10, empresa = '', nombre = '', nit = '', ciudad = '', activo } = query;

    const conditions = [];
    const params = [];

    if (empresa) {
      conditions.push(`empresa ILIKE $${params.length + 1}`);
      params.push(`%${empresa}%`);
    }
    if (nombre) {
      conditions.push(`nombre ILIKE $${params.length + 1}`);
      params.push(`%${nombre}%`);
    }
    if (nit) {
      conditions.push(`nit ILIKE $${params.length + 1}`);
      params.push(`%${nit}%`);
    }
    if (ciudad) {
      conditions.push(`ciudad ILIKE $${params.length + 1}`);
      params.push(`%${ciudad}%`);
    }
    if (activo !== undefined) {
      conditions.push(`activo = $${params.length + 1}`);
      params.push(activo);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
    const queryText = `SELECT id, empresa, nombre, abreviado, nit, dg_verifica, direccion, telefono, ciudad, fax, correo, niveles, activo FROM empresas${whereClause} ORDER BY id`;

    const dbClient = this.databaseService.getDbClient();
    let allEmpresas;

    if (useSupabase) {
      const supabase = dbClient as SupabaseClient;
      const { data, error } = await supabase.from('empresas').select('id, empresa, nombre, abreviado, nit, dg_verifica, direccion, telefono, ciudad, fax, correo, niveles, activo');
      if (error) {
        throw error;
      }
      allEmpresas = data;
    } else {
      const pgPool = dbClient as Pool;
      const result = await pgPool.query(queryText, params);
      allEmpresas = result.rows;
    }

    const empresasWithBooleanActivo = allEmpresas.map((empresa: any) => ({
      ...empresa,
      activo: Boolean(empresa.activo),
    }));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEmpresas = empresasWithBooleanActivo.slice(startIndex, endIndex);

    return {
      data: paginatedEmpresas,
      total: empresasWithBooleanActivo.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(empresasWithBooleanActivo.length / limit),
    };
  }

  async findOne(id: number) {
    this.logger.log(`📊 Usando DatabaseService para obtener empresa con ID: ${id}`);
    const dbClient = this.databaseService.getDbClient();
    let empresa;

    if (useSupabase) {
      const supabase = dbClient as SupabaseClient;
      const { data, error } = await supabase.from('empresas').select('*').eq('id', id).single();
      if (error) {
        throw error;
      }
      empresa = data;
    } else {
      const pgPool = dbClient as Pool;
      const result = await pgPool.query('SELECT * FROM empresas WHERE id = $1', [id]);
      empresa = result.rows[0];
    }

    if (!empresa) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
    return empresa;
  }

  async create(createEmpresaDto: CreateEmpresaDto) {
    this.logger.log('➕ Creando empresa:', createEmpresaDto);
    try {
      // Verificar si ya existe una empresa con el mismo código o NIT
      const existingEmpresa = await this.findByEmpresaOrNit(createEmpresaDto.empresa, createEmpresaDto.nit);
      
      if (existingEmpresa) {
        this.logger.warn('❌ Ya existe una empresa con el mismo código o NIT');
        throw new ConflictException('Ya existe una empresa con el mismo código o NIT');
      }
      
      const dbClient = this.databaseService.getDbClient();
      let newEmpresa;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('empresas').insert([createEmpresaDto]).select().single();
        if (error) {
          throw error;
        }
        newEmpresa = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query(
          'INSERT INTO empresas (empresa, nombre, abreviado, nit, dg_verifica, direccion, telefono, ciudad, fax, correo, niveles, activo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING * ',
          [createEmpresaDto.empresa, createEmpresaDto.nombre, createEmpresaDto.abreviado, createEmpresaDto.nit, createEmpresaDto.dg_verifica, createEmpresaDto.direccion, createEmpresaDto.telefono, createEmpresaDto.ciudad, createEmpresaDto.fax, createEmpresaDto.correo, createEmpresaDto.niveles, createEmpresaDto.activo]
        );
        newEmpresa = result.rows[0];
      }
      
      this.logger.log('✅ Empresa creada:', newEmpresa);
      
      // Convertir activo de integer a boolean para consistencia de tipos
      return {
        ...newEmpresa,
        activo: Boolean(newEmpresa.activo)
      };
    } catch (error) {
      this.logger.error('❌ Error al crear empresa:', error);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error al crear empresa');
    }
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    this.logger.log(`🔄 Actualizando empresa con ID: ${id}`);
    try {
      const existingEmpresa = await this.findOne(id);
      if (!existingEmpresa) {
        throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
      }

      // Verificar si el nuevo código o NIT ya existe en otra empresa
      if (updateEmpresaDto.empresa || updateEmpresaDto.nit) {
        const conflictEmpresa = await this.findByEmpresaOrNitExcludingId(
          updateEmpresaDto.empresa || existingEmpresa.empresa,
          updateEmpresaDto.nit || existingEmpresa.nit,
          id
        );
        if (conflictEmpresa) {
          throw new ConflictException('Ya existe otra empresa con el mismo código o NIT');
        }
      }

      const dbClient = this.databaseService.getDbClient();
      let updatedEmpresa;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('empresas').update(updateEmpresaDto).eq('id', id).select().single();
        if (error) {
          throw error;
        }
        updatedEmpresa = data;
      } else {
        const pgPool = dbClient as Pool;
        const setClauses = Object.keys(updateEmpresaDto).map((key, index) => `"${key}" = $${index + 2}`);
        const queryText = `UPDATE empresas SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
        const queryParams = [id, ...Object.values(updateEmpresaDto)];
        const result = await pgPool.query(queryText, queryParams);
        updatedEmpresa = result.rows[0];
      }

      if (!updatedEmpresa) {
        throw new NotFoundException(`Empresa con ID ${id} no encontrada después de actualizar`);
      }

      this.logger.log('✅ Empresa actualizada:', updatedEmpresa);
      return {
        ...updatedEmpresa,
        activo: Boolean(updatedEmpresa.activo)
      };
    } catch (error) {
      this.logger.error('❌ Error al actualizar empresa:', error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar empresa');
    }
  }

  async remove(id: number) {
    this.logger.log(`🗑️ Eliminando empresa con ID: ${id}`);
    try {
      const dbClient = this.databaseService.getDbClient();
      let deletedCount;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { count, error } = await supabase.from('empresas').delete().eq('id', id);
        if (error) {
          throw error;
        }
        deletedCount = count;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('DELETE FROM empresas WHERE id = $1', [id]);
        deletedCount = result.rowCount;
      }

      if (deletedCount === 0) {
        throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
      }
      this.logger.log('✅ Empresa eliminada correctamente');
    } catch (error) {
      this.logger.error('❌ Error al eliminar empresa:', error);
      throw new InternalServerErrorException('Error al eliminar empresa');
    }
  }



  // Métodos auxiliares
  private async findByEmpresaOrNit(empresa: string, nit: string): Promise<{ id: number; empresa: string; nombre: string; nit: string } | undefined> {
    this.logger.log('🔍 Buscando empresa por código o NIT:', { empresa, nit });
    const queryText = `SELECT id, empresa, nombre, nit FROM empresas WHERE empresa = $1 OR nit = $2`;
    const params = [empresa, nit];
    
    const dbClient = this.databaseService.getDbClient();
    let resultData;

    if (useSupabase) {
      const supabase = dbClient as SupabaseClient;
      const { data, error } = await supabase.from('empresas').select('id, empresa, nombre, nit').or(`empresa.eq.${empresa},nit.eq.${nit}`).single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      resultData = data;
    } else {
      const pgPool = dbClient as Pool;
      const result = await pgPool.query(queryText, params);
      resultData = result.rows[0];
    }
    return resultData;
  }

  private async findByEmpresaOrNitExcludingId(empresa: string, nit: string, id: number): Promise<{ id: number; empresa: string; nombre: string; nit: string } | undefined> {
    this.logger.log('🔍 Buscando empresa por código o NIT excluyendo ID:', { empresa, nit, id });
    const queryText = `SELECT id, empresa, nombre, nit FROM empresas WHERE (empresa = $1 OR nit = $2) AND id != $3`;
    const params = [empresa, nit, id];
    
    const dbClient = this.databaseService.getDbClient();
    let resultData;

    if (useSupabase) {
      const supabase = dbClient as SupabaseClient;
      const { data, error } = await supabase.from('empresas').select('id, empresa, nombre, nit').or(`empresa.eq.${empresa},nit.eq.${nit}`).neq('id', id).single();
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      resultData = data;
    } else {
      const pgPool = dbClient as Pool;
      const result = await pgPool.query(queryText, params);
      resultData = result.rows[0];
    }
    return resultData;
  }
}