import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  clave_hash: string;
  telefono: string;
  activo: boolean;
}

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    private configService: ConfigService,
    private readonly databaseService: DatabaseService
  ) {}

  async loginUser(email: string, password: string) {
    console.log('🔐 LOGIN - Validando usuario:', email);
    
    // Usar el método validateUser existente
    const user = await this.findByEmailWithPassword(email);
    
    if (!user) {
      console.log('❌ LOGIN - Usuario no encontrado');
      return null;
    }
    
    // Validar contraseña (comparación directa por ahora)
    if (user.clave_hash === password) {
      console.log('✅ LOGIN - Contraseña válida');
      return user;
    }
    
    console.log('❌ LOGIN - Contraseña inválida');
    return null;
  }
  
  async findAll(query: any = {}) {
    try {
      const { page = 1, limit = 10, nombre = '', email = '', telefono = '', activo } = query;

      console.log('🔍 Buscando usuarios con query:', query);
      console.log('🔍 Filtro activo recibido:', activo, 'tipo:', typeof activo);

      this.logger.log('📊 Usando DatabaseService para obtener usuarios');
      let queryText = 'SELECT id, nombre, email, telefono, activo FROM usuarios';
      const params = [];
      const conditions = [];

      if (nombre) {
        conditions.push(`nombre ILIKE $${params.length + 1}`);
        params.push(`%${nombre}%`);
      }
      if (email) {
        conditions.push(`email ILIKE $${params.length + 1}`);
        params.push(`%${email}%`);
      }
      if (telefono) {
        conditions.push(`telefono ILIKE $${params.length + 1}`);
        params.push(`%${telefono}%`);
      }
      if (activo !== undefined) {
        conditions.push(`activo = $${params.length + 1}`);
        params.push(activo);
      }

      if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
      }
      queryText += ' ORDER BY id';

      const dbClient = this.databaseService.getDbClient();
      let allUsers;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('usuarios').select('id, nombre, email, telefono, activo');
        if (error) {
          throw error;
        }
        allUsers = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query(queryText, params);
        allUsers = result.rows;
      }

      // Convertir activo de integer a boolean para consistencia de tipos
      const usersWithBooleanActivo = allUsers.map(user => ({
        ...user,
        activo: user.activo === 1 || user.activo === true
      }));

      //console.log('👥 Total usuarios en BD:', allUsers.length);
     // console.log('📋 Usuarios encontrados:', allUsers);

      let filteredUsers = [...usersWithBooleanActivo];

      // Aplicar filtros
      if (nombre) {
        filteredUsers = filteredUsers.filter(user =>
          user.nombre && user.nombre.toLowerCase().includes(nombre.toLowerCase())
        );
      }

      if (email) {
        filteredUsers = filteredUsers.filter(user =>
          user.email && user.email.toLowerCase().includes(email.toLowerCase())
        );
      }

      if (telefono) {
        filteredUsers = filteredUsers.filter(user =>
          user.telefono && user.telefono.toLowerCase().includes(telefono.toLowerCase())
        );
      }

      if (activo !== undefined && activo !== null) {
        console.log('🔍 Aplicando filtro activo:', activo);
        // Convertir el valor recibido a booleano de forma compatible
        let activoBoolean;
        if (typeof activo === 'string') {
          activoBoolean = activo.toLowerCase() === 'true';
        } else if (typeof activo === 'boolean') {
          activoBoolean = activo;
        } else if (typeof activo === 'number') {
          activoBoolean = activo === 1;
        } else {
          activoBoolean = Boolean(activo);
        }

        console.log('🔍 Valor booleano convertido:', activoBoolean);
        filteredUsers = filteredUsers.filter(user => {
          // Normalizar el valor del usuario también
          let userActivo;
          if (typeof user.activo === 'number') {
            userActivo = user.activo === 1;
          } else if (typeof user.activo === 'boolean') {
            userActivo = user.activo;
          } else {
            userActivo = Boolean(user.activo);
          }

          console.log(`🔍 Usuario ${user.id}: activo=${user.activo} (${typeof user.activo}) -> normalizado=${userActivo}, comparando con ${activoBoolean}`);
          return userActivo === activoBoolean;
        });
        console.log('🔍 Usuarios después del filtro activo:', filteredUsers.length);
      }

      const total = filteredUsers.length;

      // Aplicar paginación
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const paginatedUsers = filteredUsers
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .slice(offset, offset + parseInt(limit));

      // Remover contraseña de la respuesta
      const usuariosWithoutPassword = paginatedUsers.map(({ clave_hash, ...usuario }) => usuario);

      

      const response = {
        data: usuariosWithoutPassword,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      };

      console.log('📤 Respuesta final:', JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error('❌ Error en findAll usuarios:', error);
      throw new InternalServerErrorException('Error al obtener usuarios');
    }
  }

  async findOne(id: number): Promise<Usuario | undefined> {
    try {
      this.logger.log(`📊 Usando DatabaseService para obtener usuario con ID: ${id}`);
      const dbClient = this.databaseService.getDbClient();
      let user;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();
        if (error) {
          throw error;
        }
        user = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        user = result.rows[0];
      }

      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      return user;
    } catch (error) {
      console.error('❌ Error en findOne usuario:', error);
      throw new InternalServerErrorException('Error al obtener usuario');
    }
  }


  async create(usuario: Partial<Usuario>): Promise<Usuario> {
    try {
      this.logger.log('📊 Usando DatabaseService para crear usuario');
      const dbClient = this.databaseService.getDbClient();
      let newUsuario;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('usuarios').insert([usuario]).select().single();
        if (error) {
          throw error;
        }
        newUsuario = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query(
          'INSERT INTO usuarios (nombre, email, clave_hash, telefono, activo) VALUES ($1, $2, $3, $4, $5) RETURNING * ',
          [usuario.nombre, usuario.email, usuario.clave_hash, usuario.telefono, usuario.activo]
        );
        newUsuario = result.rows[0];
      }

      return newUsuario;
    } catch (error) {
      console.error('❌ Error en create usuario:', error);
      throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    try {
      this.logger.log(`📊 Usando DatabaseService para actualizar usuario con ID: ${id}`);
      const dbClient = this.databaseService.getDbClient();
      let updatedUsuario;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('usuarios').update(usuario).eq('id', id).select().single();
        if (error) {
          throw error;
        }
        updatedUsuario = data;
      } else {
        const pgPool = dbClient as Pool;
        const setClauses = Object.keys(usuario).map((key, index) => `"${key}" = $${index + 2}`);
        const queryText = `UPDATE usuarios SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`;
        const queryParams = [id, ...Object.values(usuario)];
        const result = await pgPool.query(queryText, queryParams);
        updatedUsuario = result.rows[0];
      }

      if (!updatedUsuario) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      return updatedUsuario;
    } catch (error) {
      console.error('❌ Error en update usuario:', error);
      throw new InternalServerErrorException('Error al actualizar usuario');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      this.logger.log(`📊 Usando DatabaseService para eliminar usuario con ID: ${id}`);
      const dbClient = this.databaseService.getDbClient();
      let deletedCount;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { count, error } = await supabase.from('usuarios').delete().eq('id', id);
        if (error) {
          throw error;
        }
        deletedCount = count;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        deletedCount = result.rowCount;
      }

      if (deletedCount === 0) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
    } catch (error) {
      console.error('❌ Error en remove usuario:', error);
      throw new InternalServerErrorException('Error al eliminar usuario');
    }
  }

  async findByEmail(email: string): Promise<Usuario | undefined> {
    try {
      this.logger.log(`📊 Usando DatabaseService para buscar usuario por email: ${email}`);
      const dbClient = this.databaseService.getDbClient();
      let user;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('usuarios').select('*').eq('email', email).single();
        if (error) {
          throw error;
        }
        user = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        user = result.rows[0];
      }

      return user;
    } catch (error) {
      console.error('❌ Error en findByEmail usuario:', error);
      throw new InternalServerErrorException('Error al buscar usuario por email');
    }
  }

  async findByEmailWithPassword(email: string): Promise<Usuario | undefined> {
    try {
      this.logger.log(`📊 Usando DatabaseService para buscar usuario por email con contraseña: ${email}`);
      const dbClient = this.databaseService.getDbClient();
      let user;

      if (useSupabase) {
        const supabase = dbClient as SupabaseClient;
        const { data, error } = await supabase.from('usuarios').select('*').eq('email', email).single();
        if (error) {
          throw error;
        }
        user = data;
      } else {
        const pgPool = dbClient as Pool;
        const result = await pgPool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        user = result.rows[0];
      }

      return user;
    } catch (error) {
      console.error('❌ Error en findByEmailWithPassword usuario:', error);
      throw new InternalServerErrorException('Error al buscar usuario por email con contraseña');
    }
  }
}