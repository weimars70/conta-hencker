import { supabase } from '../../config/supabase';

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

export const accesosService = {
  async getAll(filters?: AccesosFilters): Promise<AccesosResponse> {
    let query = supabase.from('accesos').select('*', { count: 'exact' });

    // Apply filters
    if (filters?.empresa) {
      query = query.ilike('empresa', `%${filters.empresa}%`);
    }
    if (filters?.usuario) {
      query = query.ilike('usuario', `%${filters.usuario}%`);
    }
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  },

  async getOne(usuario: string): Promise<Acceso> {
    const { data, error } = await supabase
      .from('accesos')
      .select('*')
      .eq('usuario', usuario)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  async create(acceso: Partial<Acceso>): Promise<Acceso> {
    const { data, error } = await supabase
      .from('accesos')
      .insert(acceso)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  },

  async update(usuario: string, acceso: Partial<Acceso>): Promise<Acceso> {
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
  },

  async delete(usuario: string): Promise<void> {
    const { error } = await supabase
      .from('accesos')
      .delete()
      .eq('usuario', usuario);
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async validateAccess(usuario: string, empresa: string): Promise<boolean> {
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
  }
};