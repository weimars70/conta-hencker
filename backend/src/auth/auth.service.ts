import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { use } from 'passport';
import bcrypt from 'bcrypt';
import { SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usuariosService: UsuariosService,
    private readonly databaseService: DatabaseService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const usuario = await this.usuariosService.findByEmailWithPassword(email);
      if (!usuario) {
        console.log('❌ AUTH SERVICE - Usuario no encontrado');
        return null;
      }
      // Comparación directa de contraseñas (sin hash por ahora)
      const esValida = await bcrypt.compare(password, usuario.clave_hash);
      if (esValida) {
        const { clave_hash, ...result } = usuario;
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('❌ AUTH SERVICE - Error en validateUser:', error);
      return null;
    }
  }

  async login(user: any) {
    console.log('user:::', user);
    try {
      
      const payload = { 
        email: user.email, 
        sub: user.id,
        nombre: user.nombre 
      };
      
      const access_token = this.jwtService.sign(payload);
    
      let empresas = [];
      try {
        const dbClient = this.databaseService.getDbClient();
        let result: any;

        if (useSupabase) {
          const supabase = dbClient as SupabaseClient;
          const { data, error } = await supabase
            .from('view_empresas_usuarios')
            .select('empresa, nombre_empresa, usuario_id, nombre_usuario, nivel, codigo, bodega, centro_costos, activo')
            .eq('usuario_id', user.id)
            .eq('activo', true);

          if (error) {
            throw error;
          }
          result = { rows: data };
        } else {
          const pgPool = dbClient as Pool;
          const query = `
            SELECT empresa, nombre_empresa, usuario_id, nombre_usuario, nivel, codigo, bodega, centro_costos, activo 
            FROM view_empresas_usuarios 
            WHERE usuario_id = $1 AND activo = true
          `;
          console.log('query:::', query);
          console.log('user.id:::', user.id);
          result = await pgPool.query(query, [user.id]);
        }
        
        empresas = result.rows.map(item => ({
          empresa: item.empresa,
          nombre: item.nombre_empresa,
          nivel: item.nivel,
          codigo: item.codigo,
          bodega: item.bodega,
          centro_costos: item.centro_costos
        }));
        
        console.log(`✅ AUTH SERVICE - Empresas obtenidas para usuario ${user.id}:`, empresas.length);
      } catch (error) {
        console.error('❌ AUTH SERVICE - Error al obtener empresas:', error);
        // Si hay error, devolver array vacío en lugar de fallar
        empresas = [];
      }
      
      console.log('✅ AUTH SERVICE - Token generado exitosamente');
      
      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          telefono: user.telefono,
          activo: user.activo
        },
        empresas
      };
    } catch (error) {
      console.error('❌ AUTH SERVICE - Error en login:', error);
      throw new UnauthorizedException('Error al generar token');
    }
  }
}