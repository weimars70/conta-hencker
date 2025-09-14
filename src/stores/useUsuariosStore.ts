import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usuariosService } from '../services/api/usuarios.service'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth'

export const useUsuariosStore = defineStore('usuarios', () => {
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
    nombre: '',
    email: '',
    telefono: '',
    activo: undefined
  })

  // Usuario para formulario
  const usuarioActivo = ref({
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    clave: '',
    activo: true
  })

  // Obtener usuarios
  async function fetchUsuarios(props) {
    try {
      loading.value = true
      
      if (!authStore.isAuthenticated) {
        $q.notify({
          type: 'negative',
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        })
        router.push('/login')
        return
      }

      const page = props?.pagination?.page || pagination.value.page
      const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage

      // 🔍 DEBUG: Mostrar qué se envía desde el frontend
      console.log('🚀 FRONTEND - Enviando filtros al backend:')
      console.log('📋 Filtros completos:', JSON.stringify(filters.value, null, 2))
      console.log('🎯 Filtro activo específico:', {
        valor: filters.value.activo,
        tipo: typeof filters.value.activo,
        esUndefined: filters.value.activo === undefined,
        esNull: filters.value.activo === null,
        esTrue: filters.value.activo === true,
        esFalse: filters.value.activo === false
      })
      
      // Crear objeto de parámetros, incluyendo activo solo si no es undefined
      const params = {
        page,
        limit,
        nombre: filters.value.nombre || undefined,
        email: filters.value.email || undefined,
        telefono: filters.value.telefono || undefined
      }
      
      // Solo agregar activo si tiene un valor definido
      if (filters.value.activo !== undefined) {
        params.activo = filters.value.activo
      }
      
      console.log('📦 Parámetros que se enviarán:', params)

      const response = await usuariosService.getAll(params)

      lista.value = response.data
      total.value = response.total
      pagination.value.page = response.page
      pagination.value.rowsPerPage = response.limit
      pagination.value.rowsNumber = response.total
    } catch (error) {
      console.error('Error fetching usuarios:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 
                 error.message || 
                 'Error al cargar los usuarios'
      })
    } finally {
      loading.value = false
    }
  }

  function seleccionarUsuario(usuario) {
    usuarioActivo.value = { ...usuario }
  }

  function limpiarFormulario() {
    usuarioActivo.value = {
      id: null,
      nombre: '',
      email: '',
      telefono: '',
      clave: '',
      activo: true
    }
  }

  function limpiarFiltros() {
    filters.value = {
      nombre: '',
      email: '',
      telefono: '',
      activo: undefined
    }
  }

  async function guardar(usuario) {
    try {
      loading.value = true
      
      console.log('🏪 Store: Iniciando guardado:', usuario);
      
      if (!authStore.isAuthenticated) {
        $q.notify({
          type: 'negative',
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        })
        router.push('/login')
        return false
      }
      
      if (usuario.id) {
        // Actualizar
        const result = await usuariosService.update(usuario.id, usuario);
        console.log('✅ Usuario actualizado:', result);
        $q.notify({
          type: 'positive',
          message: 'Usuario actualizado exitosamente'
        })
      } else {
        // Crear nuevo
        const result = await usuariosService.create(usuario);
        console.log('✅ Usuario creado:', result);
        $q.notify({
          type: 'positive',
          message: 'Usuario creado exitosamente',
          timeout: 2000
        })
      }
      
      limpiarFormulario()
      
      // Refrescar la lista después de guardar
      setTimeout(async () => {
        await fetchUsuarios();
      }, 200);
      
      return true
    } catch (error) {
      console.error('Error saving usuario:', error)
      
      // Mostrar error más específico
      let errorMessage = 'Error desconocido';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      $q.notify({
        type: 'negative',
        message: `${errorMessage} - ${usuario.id ? 'actualizar' : 'crear'} usuario`
      })
      return false
    } finally {
      loading.value = false
    }
  }

  async function eliminar(id) {
    try {
      await new Promise((resolve, reject) => {
        $q.dialog({
          title: 'Confirmar',
          message: '¿Está seguro que desea eliminar este usuario?',
          cancel: true,
          persistent: true
        }).onOk(resolve).onCancel(reject)
      })
      
      if (!authStore.isAuthenticated) {
        $q.notify({
          type: 'negative',
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        })
        router.push('/login')
        return
      }
      
      await usuariosService.delete(id)
      
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado exitosamente'
      })
      
      await fetchUsuarios()
    } catch (error) {
      if (error === undefined) return // User cancelled
      
      console.error('Error deleting usuario:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 
                 error.message || 
                 'Error al eliminar el usuario'
      })
    }
  }

  return {
    // Estado
    lista,
    total,
    loading,
    pagination,
    filters,
    usuarioActivo,
    
    // Acciones
    fetchUsuarios,
    seleccionarUsuario,
    limpiarFormulario,
    limpiarFiltros,
    guardar,
    eliminar,
  }
})