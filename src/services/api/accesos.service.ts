import { supabase } from '../../config/supabase';
import { apiClient } from './client';
import { USE_SUPABASE } from '../../config/environment';

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

export interface AccesosFilters {
  page?: number;
  limit?: number;
  empresa?: string;
  usuario?: string;
  nombre?: string;
  email?: string;
  activo?: boolean;
}

export interface AccesosResponse {
  data: Acceso[];
  total: number;
  page: number;
  limit: number;
}

// Función para obtener datos desde Supabase
async function getFromSupabase(filters?: AccesosFilters): Promise<AccesosResponse> {
  console.log('🔍 Consultando desde Supabase...');
  
  let query = supabase.from('accesos').select('*', { count: 'exact' });

  // Apply filters
  if (filters?.empresa) {
    console.log('🔍 Aplicando filtro empresa:', filters.empresa);
    query = query.ilike('empresa', `%${filters.empresa}%`);
  }
  if (filters?.usuario) {
    console.log('🔍 Aplicando filtro usuario:', filters.usuario);
    query = query.ilike('usuario', `%${filters.usuario}%`);
  }
  if (filters?.nombre) {
    console.log('🔍 Aplicando filtro nombre:', filters.nombre);
    query = query.ilike('nombre', `%${filters.nombre}%`);
  }
  if (filters?.email) {
    console.log('🔍 Aplicando filtro email:', filters.email);
    query = query.ilike('email', `%${filters.email}%`);
  }
  if (filters?.activo !== undefined) {
    console.log('🔍 Aplicando filtro activo:', filters.activo);
    query = query.eq('activo', filters.activo);
  }

  // Apply pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const offset = (page - 1) * limit;
  console.log('🔍 Aplicando paginación:', { page, limit, offset });
  query = query.range(offset, offset + limit - 1);

  console.log('🔍 Ejecutando consulta a Supabase...');
  const { data, error, count } = await query;
  
  console.log('📊 Respuesta de Supabase:', { data, error, count });
  
  if (error) {
    console.error('❌ Error en consulta Supabase:', error);
    throw new Error(error.message);
  }

  const response = {
    data: data || [],
    total: count || 0,
    page,
    limit
  };
  
  console.log('✅ Respuesta final de Supabase:', response);
  return response;
}

// Función para obtener datos desde PostgreSQL (vía API backend)
async function getFromPostgreSQL(filters?: AccesosFilters): Promise<AccesosResponse> {
  console.log('🔍 Consultando desde PostgreSQL vía API backend...');
  
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.empresa) params.append('empresa', filters.empresa);
  if (filters?.usuario) params.append('usuario', filters.usuario);
  if (filters?.nombre) params.append('nombre', filters.nombre);
  if (filters?.email) params.append('email', filters.email);
  if (filters?.activo !== undefined) {
    params.append('activo', filters.activo.toString());
  }
  
  const finalUrl = `/accesos?${params.toString()}`;
  console.log('🌐 URL final para PostgreSQL:', finalUrl);

  const { data } = await apiClient.get(finalUrl);
  console.log('📊 Respuesta de PostgreSQL:', data);
  return data;
}

export const accesosService = {
  async getAll(filters?: AccesosFilters): Promise<AccesosResponse> {
    console.log('🔍 AccesosService.getAll - Iniciando consulta con filtros:', filters);
    console.log('🔧 Modo de conexión USE_SUPABASE:', USE_SUPABASE);
    
    if (USE_SUPABASE) {
      return await getFromSupabase(filters);
    } else {
      return await getFromPostgreSQL(filters);
    }
  },

  async getOne(usuario: string): Promise<Acceso> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('accesos')
        .select('*')
        .eq('usuario', usuario)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } else {
      const { data } = await apiClient.get(`/accesos/${usuario}`);
      return data;
    }
  },

  async create(acceso: Partial<Acceso>): Promise<Acceso> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('accesos')
        .insert(acceso)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } else {
      const { data } = await apiClient.post('/accesos', acceso);
      return data;
    }
  },

  async update(usuario: string, acceso: Partial<Acceso>): Promise<Acceso> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('accesos')
        .update(acceso)
        .eq('usuario', usuario)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } else {
      const { data } = await apiClient.put(`/accesos/${usuario}`, acceso);
      return data;
    }
  },

  async delete(usuario: string): Promise<void> {
    if (USE_SUPABASE) {
      const { error } = await supabase
        .from('accesos')
        .delete()
        .eq('usuario', usuario);
      
      if (error) {
        throw new Error(error.message);
      }
    } else {
      await apiClient.delete(`/accesos/${usuario}`);
    }
  },

  async validateAccess(usuario: string, empresa: string): Promise<boolean> {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('accesos')
        .select('activo')
        .eq('usuario', usuario)
        .eq('empresa', empresa)
        .single();
      
      if (error) {
        return false;
      }
      
      return data?.activo || false;
    } else {
      try {
        const { data } = await apiClient.get(`/accesos/validate/${usuario}/${empresa}`);
        return data.activo || false;
      } catch (error) {
        return false;
      }
    }
  }
};