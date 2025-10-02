import { api } from '../api';

export interface TipoDocumento {
  codigo: string;
  nombre: string;
}

export interface CuentaContable {
  cuenta: string;
  nombre: string;
  con_nit?: boolean;
  con_aplica?: boolean;
  con_cheque?: boolean;
  con_rete?: boolean;
  porcentaje?: number;
  con_comen?: boolean;
  baseminima?: number;
}

export interface CentroCosto {
  codigo: string;
  nombre: string;
}

export interface FuenteContable {
  codigo: string;
  nombre: string;
}

export interface Nit {
  nit: string;
  nombre: string;
}

export class ContabilidadService {
  /**
   * Obtiene los tipos de documento activos para una empresa específica
   * @param empresa - Código de la empresa
   * @returns Promise con la lista de tipos de documento
   */
  static async getTiposDocumento(empresa: string): Promise<TipoDocumento[]> {
    try {
      const response = await api.get(`/contabilidad/tipos-documento?empresa=${empresa}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de documento:', error);
      throw error;
    }
  }

  /**
   * Obtiene las cuentas contables activas para una empresa específica
   * @param empresa - Código de la empresa
   * @returns Promise con la lista de cuentas contables
   */
  static async getCuentasContables(empresa: string): Promise<CuentaContable[]> {
    try {
      const response = await api.get(`/contabilidad/cuentas-contables?empresa=${empresa}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cuentas contables:', error);
      throw error;
    }
  }

  /**
   * Obtiene los centros de costos activos para una empresa específica
   * @param empresa - Código de la empresa
   * @returns Promise con la lista de centros de costos
   */
  static async getCentrosCostos(empresa: string): Promise<CentroCosto[]> {
    try {
      const response = await api.get(`/contabilidad/centros-costos?empresa=${empresa}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener centros de costos:', error);
      throw error;
    }
  }

  /**
   * Obtiene las fuentes contables activas para una empresa específica
   * @param empresa - Código de la empresa
   * @returns Promise con la lista de fuentes contables
   */
  static async getFuentesContables(empresa: string): Promise<FuenteContable[]> {
    try {
      const response = await api.get(`/contabilidad/fuentes-contables?empresa=${empresa}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener fuentes contables:', error);
      throw error;
    }
  }

  /**
   * Obtiene los nits activos para una empresa específica con búsqueda opcional
   * @param empresa - Código de la empresa
   * @param filter - Filtro de búsqueda opcional por nit o nombre
   * @returns Promise con la lista de nits
   */
  static async getNits(empresa: string, filter?: string): Promise<Nit[]> {
    try {
      let url = `/contabilidad/nits?empresa=${empresa}`;
      if (filter) {
        url += `&filter=${encodeURIComponent(filter)}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error al obtener nits:', error);
      throw error;
    }
  }
}