import { apiClient } from './client';

export interface Usuario {
  id?: number;
  nombre?: string;
  email: string;
  telefono?: string;
  activo: boolean;
}

export interface UsuariosFilters {
  page?: number;
  limit?: number;
  nombre?: string;
  email?: string;
  telefono?: string;
  activo?: boolean | string;
}

export interface UsuariosResponse {
  data: Usuario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const usuariosService = {
  async getAll(filters?: UsuariosFilters): Promise<UsuariosResponse> {
    console.log('🔍 SERVICIO API - Obteniendo usuarios con filtros:', filters);
    console.log('🎯 SERVICIO API - Filtro activo detallado:', {
      valor: filters?.activo,
      tipo: typeof filters?.activo,
      esUndefined: filters?.activo === undefined,
      esNull: filters?.activo === null,
      esTrue: filters?.activo === true,
      esFalse: filters?.activo === false
    });
    
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.nombre) params.append('nombre', filters.nombre);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.telefono) params.append('telefono', filters.telefono);
    if (filters?.activo !== undefined) {
      console.log('📤 SERVICIO API - Agregando parámetro activo:', filters.activo.toString());
      params.append('activo', filters.activo.toString());
    }
    
    const finalUrl = `/usuarios?${params.toString()}`;
    console.log('🌐 SERVICIO API - URL final:', finalUrl);

    const { data } = await apiClient.get(finalUrl);
    console.log('📊 SERVICIO API - Usuarios obtenidos:', data);
    return data;
  },

  async getOne(id: number): Promise<Usuario> {
    console.log('🔍 Obteniendo usuario:', id);
    const { data } = await apiClient.get(`/usuarios/${id}`);
    console.log('👤 Usuario obtenido:', data);
    return data;
  },

  async create(usuario: Partial<Usuario>): Promise<Usuario> {
    console.log('➕ Creando usuario:', usuario);
    const { data } = await apiClient.post('/usuarios', usuario);
    console.log('✅ Usuario creado:', data);
    return data;
  },

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    console.log('📝 Actualizando usuario:', id, usuario);
    const { data } = await apiClient.patch(`/usuarios/${id}`, usuario);
    console.log('✅ Usuario actualizado:', data);
    return data;
  },

  async delete(id: number): Promise<void> {
    console.log('🗑️ Eliminando usuario:', id);
    await apiClient.delete(`/usuarios/${id}`);
    console.log('✅ Usuario eliminado');
  }
};
