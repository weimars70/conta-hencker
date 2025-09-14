import { apiClient } from './client';

export interface Empresa {
  id?: number;
  empresa: string;
  nombre: string;
  abreviado?: string;
  nit: string;
  dg_verifica: string;
  direccion: string;
  telefono: string;
  ciudad: string;
  fax: string;
  correo: string;
  niveles: string;
}

export interface EmpresasFilters {
  page?: number;
  limit?: number;
  empresa?: string;
  nombre?: string;
  nit?: string;
  ciudad?: string;
  activo?: boolean | string;
}

export interface EmpresasResponse {
  data: Empresa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const empresasService = {
  async getAll(filters?: EmpresasFilters): Promise<EmpresasResponse> {
    console.log('🔍 SERVICIO API - Obteniendo empresas con filtros:', filters);
    
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.empresa) params.append('empresa', filters.empresa);
    if (filters?.nombre) params.append('nombre', filters.nombre);
    if (filters?.nit) params.append('nit', filters.nit);
    if (filters?.ciudad) params.append('ciudad', filters.ciudad);
    if (filters?.activo !== undefined) {
      params.append('activo', filters.activo.toString());
    }
    
    const finalUrl = `/empresas?${params.toString()}`;
    console.log('🌐 SERVICIO API - URL final:', finalUrl);

    const { data } = await apiClient.get(finalUrl);
    console.log('📊 SERVICIO API - Empresas obtenidas:', data);
    return data;
  },

  async getOne(id: number): Promise<Empresa> {
    console.log('🔍 Obteniendo empresa:', id);
    const { data } = await apiClient.get(`/empresas/${id}`);
    console.log('🏢 Empresa obtenida:', data);
    return data;
  },

  async create(empresa: Partial<Empresa>): Promise<Empresa> {
    console.log('➕ Creando empresa:', empresa);
    const { data } = await apiClient.post('/empresas', empresa);
    console.log('✅ Empresa creada:', data);
    return data;
  },

  async update(id: number, empresa: Partial<Empresa>): Promise<Empresa> {
    console.log('📝 Actualizando empresa:', id, empresa);
    const { data } = await apiClient.patch(`/empresas/${id}`, empresa);
    console.log('✅ Empresa actualizada:', data);
    return data;
  },

  async delete(id: number): Promise<void> {
    console.log('🗑️ Eliminando empresa:', id);
    await apiClient.delete(`/empresas/${id}`);
    console.log('✅ Empresa eliminada');
  }
};