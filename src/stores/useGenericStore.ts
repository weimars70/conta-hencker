import { defineStore } from 'pinia';
import { api } from '../services/api';
import { useAuthStore } from './auth'; // Importar el store de autenticación

export const useGenericStore = defineStore('generic', {
  state: () => ({
    records: {} as Record<string, any[]>, // Stores records per table name
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchRecords(tableName: string, filter: string = '') {
      this.loading = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        const empresa = authStore.user?.empresa; // Obtener la empresa del usuario logueado
        if (!empresa) {
          throw new Error('No se ha seleccionado una empresa.');
        }
        let url = `/generic-capture?tabla=${tableName}&empresa=${empresa}`;
        if (filter) {
          url += `&filter=${filter}`;
        }
        console.log('URL de la API con filtro:', url); // Añadir esta línea
        const response = await api.get(url);
        console.log('API response data:', response.data); // Add this line
        this.records[tableName] = response.data;
        return response.data; // Add this line to return the fetched data
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error fetching records';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createRecord(tableName: string, payload: any) {
      this.loading = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        const empresa = authStore.user?.empresa;
        if (!empresa) {
          throw new Error('No se ha seleccionado una empresa.');
        }
        const response = await api.post(`/generic-capture?tabla=${tableName}&empresa=${empresa}`, payload);
        // Optionally, refresh the list after creation
        // await this.fetchRecords(payload.tabla);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error creating record';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRecord(tableName: string, id: string, payload: any) {
      this.loading = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        const empresa = authStore.user?.empresa;
        if (!empresa) {
          throw new Error('No se ha seleccionado una empresa.');
        }
        const response = await api.patch(`/generic-capture/${id}?tabla=${tableName}&empresa=${empresa}`, payload);
        // Optionally, refresh the list after update
        // await this.fetchRecords(tableName);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error updating record';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteRecord(tableName: string, id: string) {
      this.loading = true;
      this.error = null;
      try {
        const authStore = useAuthStore();
        const empresa = authStore.user?.empresa;
        if (!empresa) {
          throw new Error('No se ha seleccionado una empresa.');
        }
        await api.delete(`/generic-capture/${id}?tabla=${tableName}&empresa=${empresa}`);
        // Optionally, refresh the list after deletion
        // await this.fetchRecords(tableName);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Error deleting record';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});