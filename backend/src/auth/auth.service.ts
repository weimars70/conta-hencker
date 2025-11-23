import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';
import { DatabaseService } from '../database/database.service';
import { useSupabase } from '../database/dbClient';
import { use } from 'passport';
import * as bcrypt from 'bcryptjs';
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
      console.log('🔍 validateUser - Buscando usuario con email:', email);
      const usuario = await this.usuariosService.findByEmailWithPassword(email);

      if (!usuario) {
        console.log('❌ validateUser - Usuario no encontrado');
        return null;
      }

      console.log('✅ validateUser - Usuario encontrado:', {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        tiene_clave_hash: !!usuario.clave_hash,
        tipo_clave_hash: typeof usuario.clave_hash,
        longitud_clave_hash: usuario.clave_hash ? usuario.clave_hash.length : 0
      });

      // Verificar que clave_hash existe y es un string
      if (!usuario.clave_hash || typeof usuario.clave_hash !== 'string') {
        console.error('❌ validateUser - clave_hash inválido:', {
          clave_hash: usuario.clave_hash,
          tipo: typeof usuario.clave_hash
        });
        return null;
      }

      console.log('🔐 validateUser - Comparando contraseñas...');
      console.log('  - Password recibido:', password);
      console.log('  - Hash almacenado (primeros 20 chars):', usuario.clave_hash.substring(0, 20));

      const esValida = await bcrypt.compare(password, usuario.clave_hash);

      console.log('🔐 validateUser - Resultado comparación:', esValida);

      if (esValida) {
        const { clave_hash, ...result } = usuario;
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ AUTH SERVICE - Error en validateUser:', error);
      console.error('❌ Stack trace:', error.stack);
      return null;
    }
  }

  async login(user: any) {
    try {
      
      const payload = { 
        email: user.email, 
        sub: user.id,
        nombre: user.nombre 
      };
      
      const access_token = this.jwtService.sign(payload);
     console.log('user:::', user);
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
        

      } catch (error) {
        console.error('❌ AUTH SERVICE - Error al obtener empresas:', error);
        // Si hay error, devolver array vacío en lugar de fallar
        empresas = [];
      }
      

      
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