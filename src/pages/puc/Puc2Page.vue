<template>
  <q-page class="q-pa-md">
    <q-card class="accounting-card">
      <!-- Botón para mostrar/ocultar formulario -->
      <q-card-section class="q-pb-none">
        <div class="row justify-between items-center">
          <div class="text-h6">Plan Único de Cuentas (PUC2)</div>
          <q-btn
            :icon="showForm ? 'visibility_off' : 'visibility'"
            :label="showForm ? 'Ocultar Formulario' : 'Mostrar Formulario'"
            color="primary"
            outline
            dense
            @click="toggleForm"
          />
        </div>
      </q-card-section>
      
      <!-- Formulario Principal -->
      <q-card-section v-show="showForm">
        <q-form @submit="onSubmit" @reset="onReset" class="accounting-form">
          <!-- Primera fila: Cuenta y Nombre -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-md-2">
              <q-input
                v-model="form.cuenta"
                label="Cuenta"
                outlined
                dense
                class="form-input"
                @keyup.enter="validateAccountLength"
                @blur="validateAccountLength"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.nombre"
                label="Nombre"
                outlined
                dense
                class="form-input"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.naturaleza"
                label="Naturaleza"
                outlined
                dense
                :options="naturalezaOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="form-select"
              />
            </div>
          </div>

          <!-- Segunda fila: Secciones principales -->
          <div class="row q-col-gutter-sm">
            <!-- Clasificación DIAN -->
            <div class="col-12 col-md-6 col-lg-2">
              <div class="section-title">Clasificación DIAN</div>
              <div class="q-gutter-xs">
                <q-input
                  v-model="form.codigo"
                  label="Código"
                  outlined
                  dense
                  type="number"
                  class="form-input-small"
                  :disable="!isAdvancedFieldsEnabled"
                />
                <q-input
                  v-model="form.subcodigo"
                  label="Subcódigo"
                  outlined
                  dense
                  type="number"
                  class="form-input-small"
                  :disable="!isAdvancedFieldsEnabled"
                />
                <q-input
                  v-model="form.columna"
                  label="Columna"
                  outlined
                  dense
                  type="number"
                  class="form-input-small"
                  :disable="!isAdvancedFieldsEnabled"
                />
              </div>
            </div>

            <!-- Configuración de captura -->
            <div class="col-12 col-md-6 col-lg-3">
              <div class="section-title">Configuración de captura</div>
              <div class="checkbox-grid">
                <div class="checkbox-row q-mb-sm">
                  <q-checkbox 
                    v-model="form.fuente" 
                    label="Fuente" 
                    dense 
                    class="form-checkbox q-mb-xs"
                    :disable="!isAdvancedFieldsEnabled"
                  />
                  <q-select
                    v-model="form.fuenteSelect"
                    outlined
                    dense
                    :options="fuenteOptions"
                    option-value="codigo"
                    option-label="nombre"
                    emit-value
                    map-options
                    class="form-select-small"
                    :disable="!isAdvancedFieldsEnabled"
                  />
                </div>
                <div class="checkbox-row q-mb-sm">
                  <q-checkbox 
                    v-model="form.centroCostos" 
                    label="Centro de costos" 
                    dense 
                    class="form-checkbox q-mb-xs"
                    :disable="!isAdvancedFieldsEnabled"
                  />
                  <q-select
                    v-model="form.centroCostosSelect"
                    outlined
                    dense
                    :options="centroCostosOptions"
                    option-value="codigo"
                    option-label="nombre"
                    emit-value
                    map-options
                    class="form-select-small"
                    :disable="!isAdvancedFieldsEnabled"
                  />
                </div>
                <div class="checkbox-row">
                  <q-checkbox 
                    v-model="form.requiereNit" 
                    label="Requiere Nit" 
                    dense 
                    class="form-checkbox q-mb-xs"
                    :disable="!isAdvancedFieldsEnabled"
                  />
                  <q-select
                    v-model="form.requiereNitSelect"
                    outlined
                    dense
                    :options="filteredNitOptions"
                    class="form-select-small"
                    :disable="!form.requiereNit"
                    use-input
                    input-debounce="300"
                    @filter="filterNitOptions"
                    option-label="label"
                    option-value="value"
                    emit-value
                    map-options
                    clearable
                    placeholder="Buscar por NIT o nombre..."
                  />
                </div>
              </div>
            </div>

            <!-- Requerimientos en retenciones -->
            <div class="col-12 col-md-6 col-lg-3">
              <div class="section-title">Requerimientos en retenciones</div>
              <div class="retention-fields">
                <div class="q-mb-sm">
                  <q-checkbox 
                    v-model="form.retencion" 
                    label="Retención" 
                    dense 
                    class="form-checkbox-simple"
                  />
                </div>
                <div class="q-mb-xs">
                  <q-input
                    v-model="form.porcentajeRetencion"
                    label="% Retención"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    class="form-input-small"
                    :disable="!isRetentionFieldsEnabled"
                  />
                </div>
                <div class="q-mb-sm">
                  <q-input
                    v-model="form.baseMinimaRetencion"
                    label="Base mínima"
                    outlined
                    dense
                    type="number"
                    class="form-input-small"
                    :disable="!isRetentionFieldsEnabled"
                  />
                </div>
              </div>
            </div>

            <!-- Opciones adicionales -->
            <div class="col-12 col-md-6 col-lg-2">
              <div class="section-title">Opciones adicionales</div>
              <div class="additional-options">
                <q-checkbox v-model="form.cheque" label="Cheque" dense class="form-checkbox-simple q-mb-xs" :disable="!isAdvancedFieldsEnabled" />
                <q-checkbox v-model="form.requiereFactura" label="Requiere Factura" dense class="form-checkbox-simple q-mb-xs" :disable="!isAdvancedFieldsEnabled" />
                <q-checkbox v-model="form.saldoFacturaCierre" label="Saldo por Factura en Cierre" dense class="form-checkbox-simple q-mb-xs" :disable="!isAdvancedFieldsEnabled" />
                <q-checkbox v-model="form.comentarios" label="Comentarios" dense class="form-checkbox-simple q-mb-xs" :disable="!isAdvancedFieldsEnabled" />
                <q-checkbox v-model="form.concepto" label="Concepto" dense class="form-checkbox-simple q-mb-xs" :disable="!isAdvancedFieldsEnabled" />
              </div>
            </div>
          </div>



          <!-- Botones de acción -->
          <div class="action-buttons q-mt-md">
            <div class="row q-col-gutter-sm justify-end">
              <div class="col-auto">
                <q-btn
                  v-if="!isEditing"
                  type="submit"
                  color="primary"
                  icon="save"
                  label="Guardar"
                  class="action-btn"
                  :disable="!form.cuenta || !form.nombre"
                />
                <q-btn
                  v-if="isEditing"
                  @click="updateRecord"
                  color="positive"
                  icon="update"
                  label="Actualizar"
                  class="action-btn"
                  :disable="!form.cuenta || !form.nombre"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  @click="onReset"
                  color="secondary"
                  icon="refresh"
                  label="Nuevo"
                  class="action-btn"
                />
              </div>
              <div class="col-auto" v-if="isEditing">
                <q-btn
                  @click="cancelEdit"
                  color="warning"
                  icon="cancel"
                  label="Cancelar"
                  class="action-btn"
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <!-- Tabla de resultados -->
      <q-card-section class="q-pt-none">
        <div class="table-container">
          <q-table
            :rows="filteredCuentas"
            :columns="columns"
            row-key="cuenta"
            dense
            flat
            bordered
            class="accounts-table"
            :pagination="{ rowsPerPage: 10 }"
            selection="single"
            v-model:selected="selected"
            :grid="$q.screen.lt.md"
            :card-class="'q-ma-sm'"
          >
            <!-- Slot para filtros en el header -->
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width></q-th>
                <q-th
                  v-for="col in props.cols.filter(c => c.name !== 'acciones')"
                  :key="col.name"
                  :props="props"
                  :style="col.style"
                >
                  <div class="column-header">
                    <div class="column-title">{{ col.label }}</div>
                    <q-input
                      v-model="filters[col.name]"
                      dense
                      outlined
                      placeholder="Buscar..."
                      :class="[
                        'filter-input',
                        col.name === 'descripcion' ? 'descripcion-filter' : '',
                        col.name === 'cuenta' ? 'cuenta-filter' : '',
                        col.name === 'fuente' ? 'fuente-filter' : '',
                        col.name === 'centroCostos' ? 'centro-costos-filter' : ''
                      ]"
                      clearable
                    />
                  </div>
                </q-th>
                <q-th
                  v-for="col in props.cols.filter(c => c.name === 'acciones')"
                  :key="col.name"
                  :props="props"
                  :style="col.style"
                >
                  <div class="column-header">
                    <div class="column-title">{{ col.label }}</div>
                  </div>
                </q-th>
              </q-tr>
            </template>

            <!-- Vista de tabla normal -->
            <template v-slot:body="props">
              <q-tr 
                :props="props" 
                :class="{ 'selected-row': isSelected(props.row) }"
                @click="selectRow(props.row)"
              >
                <q-td auto-width>
                  <q-checkbox v-model="props.selected" />
                </q-td>
                <q-td key="cuenta" :props="props">
                  {{ props.row.cuenta }}
                </q-td>
                <q-td key="descripcion" :props="props">
                  {{ props.row.descripcion }}
                </q-td>
                <q-td key="fuente" :props="props" class="text-center">
                  {{ props.row.fuente }}
                </q-td>
                <q-td key="centroCostos" :props="props" class="text-center">
                  {{ props.row.centroCostos }}
                </q-td>
                <q-td key="acciones" :props="props" class="text-center">
                  <div class="action-buttons-container">
                    <q-btn 
                      size="sm" 
                      color="primary" 
                      icon="edit" 
                      dense 
                      flat
                      round
                      @click.stop="editAccount(props.row)"
                      class="action-btn-table"
                    />
                    <q-btn 
                      size="sm" 
                      color="negative" 
                      icon="delete" 
                      dense 
                      flat
                      round
                      @click.stop="deleteAccount(props.row)"
                      class="action-btn-table"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>

            <!-- Vista de tarjetas para móvil -->
            <template v-slot:item="props">
              <div class="col-12 col-sm-6 col-md-4">
                <q-card 
                  class="account-card" 
                  :class="{ 'selected-card': isSelected(props.row) }"
                  @click="selectRow(props.row)"
                  clickable
                >
                  <q-card-section class="q-pa-md">
                    <div class="row items-center q-mb-sm">
                      <div class="col">
                        <div class="text-h6 text-primary">{{ props.row.cuenta }}</div>
                      </div>
                      <div class="col-auto">
                        <q-checkbox 
                          v-model="props.selected" 
                          @click.stop
                        />
                      </div>
                    </div>
                    
                    <div class="text-subtitle2 q-mb-sm text-grey-8">
                      {{ props.row.descripcion }}
                    </div>
                    
                    <div class="row q-col-gutter-sm q-mb-sm">
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Fuente</div>
                        <div class="text-body2">{{ props.row.fuente || 'N/A' }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-caption text-grey-6">Centro de Costos</div>
                        <div class="text-body2">{{ props.row.centroCostos || 'N/A' }}</div>
                      </div>
                    </div>
                    
                    <div class="row justify-start q-gutter-xs">
                      <q-btn 
                        size="sm" 
                        color="primary" 
                        icon="edit" 
                        dense 
                        round
                        @click.stop="editAccount(props.row)"
                        class="action-btn-card"
                      >
                        <q-tooltip>Editar</q-tooltip>
                      </q-btn>
                      <q-btn 
                        size="sm" 
                        color="negative" 
                        icon="delete" 
                        dense 
                        round
                        @click.stop="deleteAccount(props.row)"
                        class="action-btn-card"
                      >
                        <q-tooltip>Eliminar</q-tooltip>
                      </q-btn>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useCuentasStore } from '../../stores/cuentas'
import { useAuthStore } from '../../stores/auth'
import { api } from '../../services/api'

// Store de Pinia
const cuentasStore = useCuentasStore()
const authStore = useAuthStore()

// Formulario reactivo
const form = reactive({
  cuenta: '',
  nombre: '',
  naturaleza: '',
  codigo: '' as string,
  subcodigo: '' as string,
  columna: 1 as number | null,
  fuente: false,
  fuenteSelect: null as number | null,
  centroCostos: false,
  centroCostosSelect: null as number | null,
  requiereNit: false,
  requiereNitSelect: '',
  cheque: false,
  requiereFactura: false,
  saldoFacturaCierre: false,
  comentarios: false,
  concepto: false,
  retencion: false,
  porcentajeRetencion: null as number | null,
  baseMinimaRetencion: null as number | null
})

// Selección de fila
const selected = ref([])

// Control de visibilidad del formulario
const showForm = ref(true)

// Filtros de búsqueda para cada columna
const filters = reactive({
  cuenta: '',
  descripcion: '',
  fuente: '',
  centroCostos: ''
})

// Opciones para los selects
const naturalezaOptions = [
  { label: 'Débito', value: 1 },
  { label: 'Crédito', value: 2 }
]
const fuenteOptions = ref([])
const centroCostosOptions = ref([])
const nitOptions = ref([])
const filteredNitOptions = ref([])

// Computed properties para validaciones
const isAdvancedFieldsEnabled = computed(() => {
  return form.cuenta && form.cuenta.length > 7
})

const isRetentionFieldsEnabled = computed(() => {
  return form.retencion
})

// Funciones para cargar datos dinámicamente
const loadFuenteOptions = async () => {
  try {
    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }
    const response = await api.get(`/generic-capture?tabla=fuente_contable&empresa=${empresa}`)
    
    console.log('Respuesta fuentes contables:', response.data)
    console.log('Tipo de data:', typeof response.data)
    console.log('Es array:', Array.isArray(response.data))
    
    if (!Array.isArray(response.data)) {
      console.error('La respuesta de fuentes contables no es un array:', response.data)
      return
    }
    
    fuenteOptions.value = response.data.map(item => ({
      nombre: item.nombre,
      codigo: item.codigo
    }))
  } catch (error) {
    console.error('Error cargando fuentes contables:', error)
  }
}

const loadCentroCostosOptions = async () => {
  try {
    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }
    const response = await api.get(`/generic-capture?tabla=centro_costos&empresa=${empresa}`)
    
    console.log('Respuesta centros de costos:', response.data)
    console.log('Tipo de data:', typeof response.data)
    console.log('Es array:', Array.isArray(response.data))
    
    if (!Array.isArray(response.data)) {
      console.error('La respuesta de centros de costos no es un array:', response.data)
      return
    }
    
    centroCostosOptions.value = response.data.map(item => ({
      nombre: item.nombre,
      codigo: item.codigo
    }))
  } catch (error) {
    console.error('Error cargando centros de costos:', error)
  }
}

const loadNitOptions = async () => {
  try {
    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }
    const response = await api.get(`/generic-capture?tabla=nits&empresa=${empresa}`)
    
    console.log('Respuesta NITs:', response.data)
    console.log('Tipo de data:', typeof response.data)
    console.log('Es array:', Array.isArray(response.data))
    
    if (!Array.isArray(response.data)) {
      console.error('La respuesta de NITs no es un array:', response.data)
      return
    }
    
    nitOptions.value = response.data.map(item => ({
      label: `${item.nit} - ${item.nombre}`,
      value: item.nit,
      nit: item.nit,
      nombre: item.nombre
    }))
    filteredNitOptions.value = nitOptions.value
  } catch (error) {
    console.error('Error cargando NITs:', error)
  }
}

// Función para filtrar NITs después de 3 dígitos con búsqueda en backend
const filterNitOptions = async (val, update) => {
  if (val === '' || val.length < 3) {
    update(() => {
      filteredNitOptions.value = []
    })
    return
  }

  try {
    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }
    
    // Hacer búsqueda dinámica al backend
    const response = await api.get(`/generic-capture?tabla=nits&empresa=${empresa}&search=${encodeURIComponent(val)}`)
    
    update(() => {
      filteredNitOptions.value = response.data.map(item => ({
        label: `${item.nit} - ${item.nombre}`,
        value: item.nit,
        nit: item.nit,
        nombre: item.nombre
      }))
    })
  } catch (error) {
    console.error('Error buscando NITs:', error)
    update(() => {
      filteredNitOptions.value = []
    })
  }
}

// Función computed para filtrar las cuentas
const filteredCuentas = computed(() => {
  return cuentasStore.cuentas.filter(cuenta => {
    const cuentaFilter = filters.cuenta || ''
    const descripcionFilter = filters.descripcion || ''
    const fuenteFilter = filters.fuente || ''
    const centroCostosFilter = filters.centroCostos || ''
    
    return (
      cuenta.cuenta.toLowerCase().includes(cuentaFilter.toLowerCase()) &&
      cuenta.descripcion.toLowerCase().includes(descripcionFilter.toLowerCase()) &&
      cuenta.fuente.toString().toLowerCase().includes(fuenteFilter.toLowerCase()) &&
      cuenta.centroCostos.toString().toLowerCase().includes(centroCostosFilter.toLowerCase())
    )
  })
})

// Función para alternar la visibilidad del formulario
const toggleForm = () => {
  showForm.value = !showForm.value
}

// Columnas de la tabla
const columns = [
  {
    name: 'cuenta',
    required: true,
    label: 'Cuenta',
    align: 'left',
    field: 'cuenta',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'descripcion',
    required: true,
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
    sortable: true,
    style: 'min-width: 250px'
  },
  {
    name: 'fuente',
    label: 'Fuente',
    align: 'center',
    field: 'fuente',
    style: 'width: 100px'
  },
  {
    name: 'centroCostos',
    label: 'C. Costos',
    align: 'center',
    field: 'centroCostos',
    style: 'width: 120px'
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    style: 'width: 140px'
  }
]

// Función para validar longitud de cuenta
const validateAccountLength = () => {
  // Esta función se ejecuta cuando el usuario presiona Enter o sale del campo cuenta
  // La validación se maneja automáticamente por el computed property isAdvancedFieldsEnabled
}

// Watchers para limpiar campos cuando se deshabilitan
watch(() => isAdvancedFieldsEnabled.value, (newValue) => {
  if (!newValue) {
    // Limpiar campos avanzados cuando se deshabilitan
    form.codigo = ''
    form.subcodigo = ''
    form.columna = null
    form.fuente = false
    form.fuenteSelect = null
    form.centroCostos = false
    form.centroCostosSelect = null
    form.requiereNit = false
    form.requiereNitSelect = ''
    form.cheque = false
    form.requiereFactura = false
    form.saldoFacturaCierre = false
    form.comentarios = false
    form.concepto = false
  }
})

watch(() => isRetentionFieldsEnabled.value, (newValue) => {
  if (!newValue) {
    // Limpiar campos de retención cuando se deshabilitan
    form.porcentajeRetencion = null
    form.baseMinimaRetencion = null
  }
})

// Variables de estado
const isEditing = ref(false)
const currentEditingAccount = ref(null)

// Métodos CRUD
const saveRecord = async () => {
  try {
    // Validar formulario
    if (!form.cuenta || !form.nombre) {
      console.error('Cuenta y nombre son requeridos')
      return
    }

    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }

    const cuentaData = {
      periodo: new Date().getFullYear().toString(),
      cuenta: form.cuenta,
      naturaleza: form.naturaleza || 1,
      nombre: form.nombre,
      codigo: form.codigo || '',
      subcodigo: form.subcodigo || '',
      columna: form.columna || 1,
      requiereNit: form.requiereNit,
      nit: form.requiereNitSelect || '',
      fuente: form.fuente,
      fuenteSelect: form.fuenteSelect,
      centroCostos: form.centroCostos,
      centroCostosSelect: form.centroCostosSelect,
      requiereFactura: form.requiereFactura,
      saldoFacturaCierre: form.saldoFacturaCierre,
      cheque: form.cheque,
      retencion: form.retencion,
      porcentajeRetencion: form.porcentajeRetencion,
      comentarios: form.comentarios,
      concepto: form.concepto,
      baseMinimaRetencion: form.baseMinimaRetencion,
      actividad: 'N' // Nuevo registro
    }

    console.log('Guardando cuenta:', cuentaData)
    
    const response = await api.post(`/plan-contable/registrar?empresa=${empresa}`, cuentaData)
    
    console.log('Cuenta guardada exitosamente:', response.data)
    
    // Recargar datos
    await cuentasStore.loadPlanContable(empresa)
    
    // Resetear formulario
    onReset()
    
  } catch (error) {
    console.error('Error guardando cuenta:', error)
  }
}

const updateRecord = async () => {
  try {
    // Validar formulario
    if (!form.cuenta || !form.nombre) {
      console.error('Cuenta y nombre son requeridos')
      return
    }

    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }

    const cuentaData = {
      periodo: new Date().getFullYear().toString(),
      cuenta: form.cuenta,
      naturaleza: form.naturaleza || 1,
      nombre: form.nombre,
      codigo: form.codigo || '',
      subcodigo: form.subcodigo || '',
      columna: form.columna || 1,
      requiereNit: form.requiereNit,
      nit: form.requiereNitSelect || '',
      fuente: form.fuente,
      fuenteSelect: form.fuenteSelect,
      centroCostos: form.centroCostos,
      centroCostosSelect: form.centroCostosSelect,
      requiereFactura: form.requiereFactura,
      saldoFacturaCierre: form.saldoFacturaCierre,
      cheque: form.cheque,
      retencion: form.retencion,
      porcentajeRetencion: form.porcentajeRetencion,
      comentarios: form.comentarios,
      concepto: form.concepto,
      baseMinimaRetencion: form.baseMinimaRetencion,
      actividad: 'E' // Editar registro
    }

    await api.post(`/plan-contable/registrar?empresa=${empresa}`, cuentaData)
    
    // Recargar datos
    await cuentasStore.loadPlanContable(empresa)
    
    // Resetear formulario y estado de edición
    onReset()
    isEditing.value = false
    currentEditingAccount.value = null
    
  } catch (error) {
    console.error('Error actualizando cuenta:', error)
  }
}

const deleteRecord = async (cuenta: string) => {
  try {
    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }

    const cuentaData = {
      periodo: new Date().getFullYear().toString(),
      cuenta: cuenta,
      naturaleza: 1,
      nombre: '',
      codigo: '',
      subcodigo: '',
      columna: 1,
      requiereNit: false,
      nit: '',
      fuente: false,
      fuenteSelect: null,
      centroCostos: false,
      centroCostosSelect: null,
      requiereFactura: false,
      saldoFacturaCierre: false,
      cheque: false,
      retencion: false,
      porcentajeRetencion: null,
      comentarios: false,
      concepto: false,
      baseMinimaRetencion: null,
      actividad: 'B' // Borrar registro
    }

    console.log('Borrando cuenta:', cuentaData)
    
    const response = await api.post(`/plan-contable/registrar?empresa=${empresa}`, cuentaData)
    
    console.log('Cuenta borrada exitosamente:', response.data)
    
    // Recargar datos
    await cuentasStore.loadPlanContable(empresa)
    
    // Si estamos editando esta cuenta, resetear formulario
    if (form.cuenta === cuenta) {
      onReset()
      isEditing.value = false
      currentEditingAccount.value = null
    }
    
  } catch (error) {
    console.error('Error borrando cuenta:', error)
  }
}

const onSubmit = () => {
  if (isEditing.value) {
    updateRecord()
  } else {
    saveRecord()
  }
}

const onReset = () => {
  Object.assign(form, {
    cuenta: '',
    nombre: '',
    naturaleza: '',
    codigo: '',
    subcodigo: '',
    columna: 1,
    fuente: false,
    fuenteSelect: null,
    centroCostos: false,
    centroCostosSelect: null,
    requiereNit: false,
    requiereNitSelect: '',
    cheque: false,
    requiereFactura: false,
    saldoFacturaCierre: false,
    comentarios: false,
    concepto: false,
    retencion: false,
    porcentajeRetencion: null,
    baseMinimaRetencion: null
  })
  
  // Resetear estado de edición
  isEditing.value = false
  currentEditingAccount.value = null
}

const cancelEdit = () => {
  onReset()
}

const selectRow = (row: any) => {
  // Llenar formulario con datos de la fila seleccionada
  Object.assign(form, {
    cuenta: row.cuenta,
    nombre: row.descripcion,
    fuente: row.fuente === '1',
    centroCostos: row.centroCostos === '1',
    // ... otros campos según sea necesario
  })
}

const isSelected = (row: any) => {
  return form.cuenta === row.cuenta && form.cuenta !== ''
}

const editAccount = async (row: any) => {
  try {
    // Si el formulario está oculto, abrirlo automáticamente
    if (!showForm.value) {
      showForm.value = true
    }
    
    const empresa = authStore.user?.empresa
    if (!empresa) {
      console.error('No hay empresa seleccionada')
      return
    }
    
    // Obtener los datos completos de la cuenta desde la API
    const cuentaCompleta = await cuentasStore.getCuentaCompleta(empresa, row.cuenta)
    
    if (cuentaCompleta) {
      // Mapear todos los campos del formulario con los datos de la API
      Object.assign(form, {
        cuenta: cuentaCompleta.cuenta || '',
        nombre: cuentaCompleta.nombre || '',
        naturaleza: cuentaCompleta.deb_cre || '',
        codigo: cuentaCompleta.codigo || '',
        subcodigo: cuentaCompleta.subcodigo || '',
        columna: cuentaCompleta.columna || 1,
        fuente: cuentaCompleta.con_fuente || false,
        fuenteSelect: cuentaCompleta.fuente || null,
        centroCostos: cuentaCompleta.con_ctrc || false,
        centroCostosSelect: cuentaCompleta.centro_costos || null,
        requiereNit: cuentaCompleta.con_nit || false,
        requiereNitSelect: cuentaCompleta.nit || '',
        cheque: cuentaCompleta.con_cheque || false,
        requiereFactura: cuentaCompleta.con_aplica || false,
        saldoFacturaCierre: cuentaCompleta.sdo_aplica || false,
        comentarios: cuentaCompleta.con_comen || false,
        concepto: cuentaCompleta.con_concepto || false,
        retencion: cuentaCompleta.con_rete || false,
        porcentajeRetencion: cuentaCompleta.porcentaje || null,
        baseMinimaRetencion: cuentaCompleta.baseminima || null
      })
      
      isEditing.value = true
      currentEditingAccount.value = cuentaCompleta
    }
  } catch (error) {
    console.error('Error al cargar los datos de la cuenta:', error)
    // Fallback al método anterior si hay error
    selectRow(row)
    isEditing.value = true
    currentEditingAccount.value = row
  }
}

const deleteAccount = (row: any) => {
  // Confirmar antes de borrar
  if (confirm(`¿Está seguro de que desea eliminar la cuenta ${row.cuenta}?`)) {
    deleteRecord(row.cuenta)
  }
}

const addSubAccount = (row: any) => {
  // Lógica para agregar subcuenta
  console.log('Agregar subcuenta para:', row.cuenta)
}

const copyAccount = (row: any) => {
  // Lógica para copiar cuenta
  selectRow({ ...row, cuenta: '' })
}

// Inicializar datos del store y cargar opciones dinámicas
onMounted(async () => {
  const empresa = authStore.user?.empresa

  if (empresa) {
    await cuentasStore.loadPlanContable(empresa)
  } 
  await loadFuenteOptions()
  await loadCentroCostosOptions()
  await loadNitOptions()
})
</script>

<style scoped lang="scss">
.accounting-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.accounting-form {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
  border: 2px solid transparent;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: linear-gradient(90deg, #3498db, #2980b9);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  border-left: 3px solid #3498db;
  border-radius: 6px;
  letter-spacing: 0.3px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 1px;
  }
}

.form-input :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #667eea, #764ba2) border-box;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #764ba2, #f093fb) border-box;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
}

.form-input :deep(.q-field--focused .q-field__control) {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #f093fb, #f5576c) border-box;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input-small :deep(.q-field__control) {
  height: 32px;
  min-height: 32px;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #667eea, #764ba2) border-box;
  border: 2px solid transparent;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.form-select :deep(.q-field__control) {
  height: 36px;
  min-height: 36px;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #667eea, #764ba2) border-box;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-select-small {
  min-width: 200px;
  max-width: 300px;
}

.form-select-small :deep(.q-field__control) {
  height: 26px;
  min-height: 26px;
  font-size: 11px;
}

.checkbox-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox {
  min-width: 120px;
}

.form-checkbox :deep(.q-checkbox__label) {
  font-size: 12px;
  color: #34495e;
}

.form-checkbox-simple :deep(.q-checkbox__label) {
  font-size: 12px;
  color: #34495e;
}

.additional-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.retention-section {
  border-top: 1px solid #e9ecef;
  padding-top: 12px;
}

.action-buttons {
  border-top: 1px solid #e9ecef;
  padding-top: 16px;
}

.action-btn {
  min-width: 120px;
  height: 40px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}

.accounts-table {
  background: linear-gradient(white, white) padding-box,
              linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
  border: 2px solid transparent;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Estilos para los filtros en el header */
.column-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 1px 0;
}

.column-title {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  margin-bottom: 1px;
  line-height: 1.2;
}

.filter-input {
  max-width: 120px;
}

.filter-input.descripcion-filter {
  max-width: 200px;
}

.filter-input.cuenta-filter {
  max-width: 100px;
}

.filter-input.fuente-filter {
  max-width: 80px;
}

.filter-input.centro-costos-filter {
  max-width: 100px;
}

.filter-input :deep(.q-field__control) {
  height: 22px;
  min-height: 22px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.filter-input :deep(.q-field__append) {
  padding: 0;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-input :deep(.q-field__append .q-icon) {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
}

.filter-input :deep(.q-field__append .q-icon:hover) {
  color: #333;
}

.filter-input :deep(.q-field__control-container) {
  padding-right: 0;
}

.filter-input :deep(.q-field__native) {
  padding: 0 4px;
  font-size: 11px;
}

.filter-input :deep(.q-icon) {
  color: #667eea;
}

/* Transiciones para mostrar/ocultar formulario */
.q-card-section[v-show] {
  transition: all 0.3s ease-in-out;
}

/* Estilos para el botón toggle */
.text-h6 {
  color: #667eea;
  font-weight: 600;
  margin: 0;
}

.accounts-table {
  min-width: 800px; /* Ancho mínimo para evitar compresión excesiva */
}

.accounts-table :deep(.q-table__top) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1rem;
  border-radius: 12px 12px 0 0;
}

.accounts-table :deep(thead) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.accounts-table :deep(thead th) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 10px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.accounts-table :deep(tbody td) {
  font-size: 12px;
  padding: 10px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.accounts-table :deep(tbody tr:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.selected-row {
  background-color: #3498db !important;
  color: white !important;
}

.selected-row :deep(td) {
  color: white !important;
}

.action-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.action-btn-table {
  width: 28px;
  height: 28px;
  min-height: 28px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

:deep(.q-btn-group) {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

:deep(.q-btn-group .q-btn) {
  min-height: 32px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #764ba2, #f093fb);
    transform: translateY(-1px);
  }
  
  &.q-btn--active {
    background: linear-gradient(135deg, #f093fb, #f5576c);
    box-shadow: 0 0 0 2px rgba(240, 147, 251, 0.3);
  }
}

.form-checkbox :deep(.q-checkbox__inner) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

.form-checkbox :deep(.q-checkbox__inner--truthy) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}

/* Responsividad para resoluciones medianas como 1400x900 */
@media (max-width: 1440px) and (min-width: 1200px) {
  .accounting-card {
    margin: 0 auto;
    max-width: 98%;
  }
  
  .table-container {
    max-height: 400px;
    overflow-y: auto;
  }
  
  .accounts-table {
    font-size: 11px;
    min-width: 750px;
  }
  
  .accounts-table :deep(thead th) {
    font-size: 11px;
    padding: 8px 6px;
    white-space: nowrap;
  }
  
  .accounts-table :deep(tbody td) {
    font-size: 11px;
    padding: 8px 6px;
    white-space: nowrap;
  }
  
  .form-input :deep(.q-field__control),
  .form-select :deep(.q-field__control) {
    height: 36px;
    min-height: 36px;
  }
  
  .section-title {
    font-size: 13px;
    padding: 6px 8px;
  }
  
  .filter-input {
    max-width: 100px;
  }
  
  .filter-input :deep(.q-field__control) {
    height: 24px;
    min-height: 24px;
  }
  
  .column-title {
    font-size: 11px;
  }
}

/* Responsividad para pantallas pequeñas */
@media (max-width: 1199px) {
  .accounting-form {
    padding: 12px;
  }
  
  .table-container {
    max-height: 350px;
    overflow-y: auto;
  }
  
  .accounts-table {
    font-size: 10px;
    min-width: 700px;
  }
  
  .accounts-table :deep(thead th) {
    font-size: 10px;
    padding: 6px 4px;
    white-space: nowrap;
  }
  
  .accounts-table :deep(tbody td) {
    font-size: 10px;
    padding: 6px 4px;
    white-space: nowrap;
  }
  
  :deep(.q-btn-group .q-btn) {
    min-height: 28px;
    padding: 4px 8px;
  }
}

@media (max-width: 768px) {
  .accounting-form {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .row.q-col-gutter-sm {
    margin: 0 -6px;
  }
  
  .row.q-col-gutter-md {
    margin: 0 -8px;
  }
  
  .section-title {
    font-size: 14px;
    padding: 6px 10px;
    margin-bottom: 12px;
  }
  
  .form-input :deep(.q-field__control),
  .form-select :deep(.q-field__control),
  .form-input-small :deep(.q-field__control),
  .form-select-small :deep(.q-field__control) {
    height: 36px;
    min-height: 36px;
  }
  
  .checkbox-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-checkbox {
    margin-bottom: 8px;
  }
  
  .additional-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .retention-fields .row {
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .accounting-form {
    padding: 12px;
  }
  
  .section-title {
    font-size: 13px;
    padding: 4px 8px;
    margin-bottom: 8px;
  }
  
  .form-input :deep(.q-field__control),
  .form-select :deep(.q-field__control),
  .form-input-small :deep(.q-field__control),
  .form-select-small :deep(.q-field__control) {
    height: 40px;
    min-height: 40px;
  }
  
  .form-input :deep(.q-field__label),
  .form-select :deep(.q-field__label),
  .form-input-small :deep(.q-field__label),
  .form-select-small :deep(.q-field__label) {
    font-size: 12px;
  }
  
  .q-checkbox :deep(.q-checkbox__label) {
    font-size: 12px;
  }
  
  .row.q-col-gutter-xs .col-12:not(:last-child) {
    margin-bottom: 8px;
  }
}

/* Estilos para las tarjetas */
.account-card {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.account-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.selected-card {
  border-color: #1976d2;
  background-color: #f3f8ff;
}

.action-btn-card {
  min-width: 36px;
  height: 36px;
  margin: 0 2px;
}

.action-btn-card .q-btn__content {
  font-size: 16px;
}

.action-btn-card:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Responsive grid para tarjetas */
@media (max-width: 768px) {
  .q-table--grid .q-table__grid-content {
    padding: 8px;
  }
  
  .account-card {
    margin-bottom: 12px;
  }
  
  .account-card .text-h6 {
    font-size: 1.1rem;
  }
  
  .account-card .text-subtitle2 {
    font-size: 0.9rem;
    line-height: 1.3;
  }
}

@media (max-width: 480px) {
  .q-table--grid .q-table__grid-content {
    padding: 4px;
  }
  
  .account-card {
    margin-bottom: 8px;
  }
  
  .account-card .q-card-section {
    padding: 12px;
  }
  
  .account-card .text-h6 {
    font-size: 1rem;
  }
  
  .account-card .text-subtitle2 {
    font-size: 0.85rem;
  }
  
  .account-card .text-caption {
    font-size: 0.7rem;
  }
  
  .account-card .text-body2 {
    font-size: 0.8rem;
  }
  
  .action-btn-card {
    min-width: 40px;
    height: 40px;
    margin: 0 4px;
  }
  
  .action-btn-card .q-btn__content {
    font-size: 18px;
  }
  
  .row.justify-start {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e0e0e0;
  }
}
</style>