// stores/cuentas.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'

export const useCuentasStore = defineStore('cuentas', () => {
  // Estado
  const cuentas = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const cuentasCount = computed(() => cuentas.value.length)
  
  const cuentasBanco = computed(() => 
    cuentas.value.filter(cuenta => cuenta.cuenta.startsWith('11'))
  )

  // Actions
  const addCuenta = (cuenta) => {
    // Verificar si la cuenta ya existe
    const existingIndex = cuentas.value.findIndex(c => c.cuenta === cuenta.cuenta)
    
    if (existingIndex !== -1) {
      // Actualizar cuenta existente
      cuentas.value[existingIndex] = { ...cuenta }
    } else {
      // Agregar nueva cuenta
      cuentas.value.push({ ...cuenta })
    }
  }

  const deleteCuenta = (cuentaId) => {
    const index = cuentas.value.findIndex(c => c.cuenta === cuentaId)
    if (index !== -1) {
      cuentas.value.splice(index, 1)
    }
  }

  const updateCuenta = (cuentaId, updatedData) => {
    const index = cuentas.value.findIndex(c => c.cuenta === cuentaId)
    if (index !== -1) {
      cuentas.value[index] = { ...cuentas.value[index], ...updatedData }
    }
  }

  const getCuentaById = (cuentaId) => {
    return cuentas.value.find(c => c.cuenta === cuentaId)
  }

  const searchCuentas = (query) => {
    if (!query) return cuentas.value
    
    return cuentas.value.filter(cuenta => 
      cuenta.cuenta.toLowerCase().includes(query.toLowerCase()) ||
      cuenta.descripcion.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Cargar datos del plan contable desde la base de datos
  const loadPlanContable = async (empresa) => {
    if (!empresa) {
      console.error('No hay empresa especificada')
      return
    }
    
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get(`/plan-contable?empresa=${empresa}`)
      const data = response.data
      
      cuentas.value = data.map(item => ({
        cuenta: item.cuenta,
        descripcion: item.descripcion,
        fuente: item.fuente || '0',
        centroCostos: item.centrocostos || '0'
      }))
      console.log('Cuentas:', cuentas.value)
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Error al cargar el plan contable'
      console.error('Error cargando plan contable:', err)
    } finally {
      loading.value = false
    }
  }

  const getCuentaCompleta = async (empresa, cuenta) => {
    try {
      const response = await api.get(`/plan-contable/${cuenta}?empresa=${empresa}`)
      console.log('Respuesta getCuentaCompleta:', response.data)
      console.log('Tipo de respuesta:', typeof response.data)
      return response.data
    } catch (err) {
      console.error('Error obteniendo cuenta completa:', err)
      throw err
    }
  }


  const saveCuenta = async (cuenta) => {
    loading.value = true
    error.value = null
    
    try {
      // Aquí harías la llamada a tu API
      // const response = await api.saveCuenta(cuenta)
      // addCuenta(response.data)
      
      // Por ahora, solo agregamos localmente
      addCuenta(cuenta)
      
      return { success: true, data: cuenta }
    } catch (err) {
      error.value = err.message || 'Error al guardar cuenta'
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const removeCuenta = async (cuentaId) => {
    loading.value = true
    error.value = null
    
    try {
      // Aquí harías la llamada a tu API
      // await api.deleteCuenta(cuentaId)
      
      deleteCuenta(cuentaId)
      
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Error al eliminar cuenta'
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Limpiar errores
  const clearError = () => {
    error.value = null
  }

  // Reset store
  const $reset = () => {
    cuentas.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    cuentas,
    loading,
    error,
    
    // Getters
    cuentasCount,
    cuentasBanco,
    
    // Actions
    addCuenta,
    deleteCuenta,
    updateCuenta,
    getCuentaById,
    searchCuentas,
    loadPlanContable,
    getCuentaCompleta,
    saveCuenta,
    removeCuenta,
    clearError,
    $reset
  }
})