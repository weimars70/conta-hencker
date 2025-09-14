import { defineStore } from 'pinia'
import { ref } from 'vue'
import { empresasService } from '../services/api/empresas.service'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'

export const useEmpresasStore = defineStore('empresas', () => {
  const $q = useQuasar()
  const router = useRouter()
  const authStore = useAuthStore()
  
  // Estado
  const lista = ref([])
  const total = ref(0)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })
  
  // Filtros
  const filters = ref({
    empresa: '',
    nombre: '',
    nit: '',
    ciudad: '',
    activo: undefined
  })

  // Empresa para formulario
  const empresaActiva = ref({
    id: null,
    empresa: '',
    nombre: '',
    abreviado: '',
    nit: '',
    dg_verifica: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    fax: '',
    correo: '',
    niveles: ''
  })

  // Métodos
  async function fetchEmpresas() {
    try {
      loading.value = true
      console.log('🔍 STORE - Obteniendo empresas con filtros:', {
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage
      })
      
      const response = await empresasService.getAll({
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage
      })
      
      lista.value = response.data
      total.value = response.total
      pagination.value.rowsNumber = response.total
      
      console.log('✅ STORE - Empresas obtenidas:', lista.value.length)
    } catch (error) {
      console.error('❌ STORE - Error obteniendo empresas:', error)
      
      // Manejar errores de autenticación
      if (error.isAuthError) {
        router.push('/login')
      } else {
        // Mostrar notificación de error
        $q.notify({
          type: 'negative',
          message: error.message || 'Error al obtener empresas',
          icon: 'error'
        })
      }
      
      // Devolver lista vacía en caso de error
      lista.value = []
      total.value = 0
      pagination.value.rowsNumber = 0
    } finally {
      loading.value = false
    }
  }

  async function guardar(empresa) {
    try {
      if (empresa.id) {
        // Actualizar empresa existente
        await empresasService.update(empresa.id, empresa)
        $q.notify({
          type: 'positive',
          message: 'Empresa actualizada correctamente',
          icon: 'check'
        })
      } else {
        // Crear nueva empresa
        await empresasService.create(empresa)
        $q.notify({
          type: 'positive',
          message: 'Empresa creada correctamente',
          icon: 'check'
        })
      }
      return true
    } catch (error) {
      console.error('❌ Error guardando empresa:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || error.message || 'Error al guardar empresa',
        icon: 'error'
      })
      return false
    }
  }

  async function eliminar(id) {
    try {
      await empresasService.delete(id)
      $q.notify({
        type: 'positive',
        message: 'Empresa eliminada correctamente',
        icon: 'check'
      })
      await fetchEmpresas()
      return true
    } catch (error) {
      console.error('❌ Error eliminando empresa:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || error.message || 'Error al eliminar empresa',
        icon: 'error'
      })
      return false
    }
  }
  
  function seleccionarEmpresa(empresa) {
    empresaActiva.value = { ...empresa }
  }

  function limpiarFormulario() {
    empresaActiva.value = {
      id: null,
      empresa: '',
      nombre: '',
      abreviado: '',
      nit: '',
      dg_verifica: '',
      direccion: '',
      telefono: '',
      ciudad: '',
      fax: '',
      correo: '',
      niveles: ''
    }
  }

  function limpiarFiltros() {
    filters.value = {
      empresa: '',
      nombre: '',
      nit: '',
      ciudad: '',
      activo: undefined
    }
  }

  return {
    // Estado
    lista,
    total,
    loading,
    pagination,
    filters,
    empresaActiva,
    
    // Métodos
    fetchEmpresas,
    guardar,
    eliminar,
    seleccionarEmpresa,
    limpiarFormulario,
    limpiarFiltros
  }
})