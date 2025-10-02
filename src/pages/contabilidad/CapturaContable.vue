<template>
  <q-page class="q-pa-md">
    <!-- Encabezado de la página -->
    <div class="text-h5 q-mb-md text-primary">
      <q-icon name="edit_note" class="q-mr-sm" />
      Captura Contable
    </div>

    <!-- Formulario principal -->
    <q-card class="q-mb-md">
      <q-card-section>
        <!-- Primera fila de campos -->
        <div class="row q-gutter-md q-mb-md">
          <div class="col-12 col-md-1">
            <q-input
              v-model="form.fecha"
              label="Fecha"
              type="date"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="form.tipoDocumento"
              :options="tiposDocumento"
              option-label="nombre"
              option-value="codigo"
              emit-value
              map-options
              label="Tipo Documento"
              outlined
              dense
              :loading="loadingTiposDocumento"
              :disable="loadingTiposDocumento"
            />
          </div>
          <div class="col-12 col-md-1">
            <q-input
              v-model="form.documento"
              label="Documento"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="form.cuentaContable"
              :options="cuentasContablesFiltradas"
              option-label="displayText"
              option-value="cuenta"
              emit-value
              map-options
              label="Cuenta Contable"
              outlined
              dense
              use-input
              @filter="filterCuentas"
              :loading="loadingCuentasContables"
              :disable="loadingCuentasContables"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.cuenta }} - {{ scope.opt.nombre }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.cuenta }} - {{ scope.opt.nombre }}</span>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-2">
            <q-input
              v-model="form.concepto"
              label="Concepto"
              outlined
              dense
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="form.tipoMovimiento"
              :options="tiposMovimiento"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Debito Credito"
              outlined
              dense
            />
          </div>
        </div>

        <!-- Segunda fila de campos -->
        <div class="row q-gutter-md q-mb-md">
          <div class="col-12 col-md-2">
            <q-select
              v-model="form.centroCostos"
              :options="centrosCostos"
              option-value="codigo"
              option-label="nombre"
              label="Centro de Costos"
              outlined
              dense
              emit-value
              map-options
              :loading="loadingCentrosCostos"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="form.fuenteContable"
              :options="fuentesContables"
              option-value="codigo"
              option-label="nombre"
              label="Fuente Contable"
              outlined
              dense
              emit-value
              map-options
              :loading="loadingFuentesContables"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="form.nitCedula"
              :options="nitsFiltrados"
              option-value="nit"
              option-label="nombre"
              label="Nit o Cédula del Tercero"
              outlined
              dense
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filtrarNits"
              :loading="loadingNits"
              :disable="!camposHabilitados.nit"
              clearable
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nit }} - {{ scope.opt.nombre }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron resultados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <div class="col-12 col-md-1">
            <q-input
              v-model="form.prefijo"
              label="Prefijo"
              outlined
              dense
              :readonly="!camposHabilitados.prefijo"
            />
          </div>
          <div class="col-12 col-md-1">
            <q-input
              v-model="form.aplicable"
              label="Aplicable"
              type="number"
              outlined
              dense
              :readonly="!camposHabilitados.factura"
            />
          </div>
        </div>

        <!-- Tercera fila de campos -->
         <div class="row q-gutter-md q-mb-md">
            <div class="col-12 col-md-1">
              <q-input
                v-model="form.valor"
                label="Valor"
                type="number"
                outlined
                dense
                step="0.01"
              />
            </div>
           <div class="col-12 col-md-1">
             <q-input
               v-model="form.cheque"
               label="Cheque"
               outlined
               dense
               :readonly="!camposHabilitados.cheque"
             />
           </div>
           <div class="col-12 col-md-1">
             <q-input
               v-model="form.ctaCheque"
               label="Cta. Cheque"
               outlined
               dense
               :readonly="!camposHabilitados.ctaCheque"
             />
           </div>
           <div class="col-12 col-md-1">
             <q-input
               v-model="form.baseRetencion"
               label="Base Retención"
               type="number"
               outlined
               dense
               step="0.01"
               readonly
             />
           </div>
           <div class="col-12 col-md-4">
             <q-input
               v-model="form.comentarios"
               label="Comentarios"
               outlined
               dense
               :readonly="!camposHabilitados.comentarios"
             />
           </div>
         </div>

        <!-- Botones de acción -->
        <div class="row q-gutter-md">
          <q-btn
            color="primary"
            icon="add"
            label="Agregar"
            @click="agregarRegistro"
          />
          <q-btn
            color="secondary"
            icon="edit"
            label="Modificar"
            @click="modificarRegistro"
            :disable="!registroSeleccionado"
          />
          <q-btn
            color="positive"
            icon="save"
            label="Guardar"
            @click="guardarDocumento"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de registros -->
    <q-card>
      <q-card-section>
        <div class="text-h6 q-mb-md">Cuenta de Tercero</div>
        
        <q-table
          :rows="registros"
          :columns="columns"
          row-key="id"
          selection="single"
          v-model:selected="selected"
          :pagination="pagination"
          class="my-sticky-header-table"
          dense
        >
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                size="sm"
                @click="editarRegistro(props.row)"
              />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmarEliminar(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Totales -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div class="col">
            <q-input
              :model-value="totalDebitos.toFixed(2)"
              label="Débitos"
              outlined
              dense
              readonly
              class="text-weight-bold"
            />
          </div>
          <div class="col">
            <q-input
              :model-value="totalCreditos.toFixed(2)"
              label="Créditos"
              outlined
              dense
              readonly
              class="text-weight-bold"
            />
          </div>
          <div class="col">
            <q-input
              :model-value="diferencia.toFixed(2)"
              label="Diferencia"
              outlined
              dense
              readonly
              class="text-weight-bold"
              :class="diferencia !== 0 ? 'text-negative' : 'text-positive'"
            />
          </div>
          <div class="col">
            <q-input
              v-model="form.documento"
              label="Documento"
              outlined
              dense
              readonly
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { ContabilidadService, TipoDocumento, CuentaContable, CentroCosto, FuenteContable, Nit } from '../../services/api/contabilidad.service'
import { useAuthStore } from '../../stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// Estado del formulario
const form = ref({
  fecha: new Date().toISOString().split('T')[0],
  tipoDocumento: '',
  documento: '',
  cuentaContable: '',
  concepto: '',
  debito: 0,
  credito: 0,
  centroCostos: '',
  fuenteContable: '',
  nitCedula: '',
  prefijo: '',
  aplicable: 0,
  valor: 0,
  cheque: '',
  ctaCheque: '',
  baseRetencion: 0,
  comentarios: ''
})

// Estado de habilitación de campos basado en la cuenta contable seleccionada
const camposHabilitados = ref({
  nit: false,
  prefijo: false,
  factura: false,
  cheque: false,
  ctaCheque: false,
  comentarios: false,
  baseRetencion: false
})

// Configuración de la cuenta contable seleccionada
const cuentaSeleccionada = ref<CuentaContable | null>(null)

// Datos para los selects
const tiposDocumento = ref<TipoDocumento[]>([])
const cuentasContables = ref<CuentaContable[]>([])
const cuentasContablesFiltradas = ref<CuentaContable[]>([])
const tiposMovimiento = ref([
  { label: 'Débito', value: 1 },
  { label: 'Crédito', value: 2 }
])
const centrosCostos = ref<CentroCosto[]>([])
const fuentesContables = ref<FuenteContable[]>([])
const nits = ref<Nit[]>([])
const nitsFiltrados = ref<Nit[]>([])

// Estado de carga
const loadingTiposDocumento = ref(false)
const loadingCuentasContables = ref(false)
const loadingCentrosCostos = ref(false)
const loadingFuentesContables = ref(false)
const loadingNits = ref(false)

// Registros de la tabla
const registros = ref([
  {
    id: 1,
    cuenta: '23680101',
    fuente: 'Liney Hernandez Hernandez',
    documento: 'Ajuste',
    valor: 17555.00,
    observaciones: 'Cr. Retelca 10 1000'
  },
  {
    id: 2,
    cuenta: '23680101',
    fuente: 'Liney Hernandez Hernandez',
    documento: 'Ajuste',
    valor: 199431.00,
    observaciones: 'Cr. Retelca 10 1000'
  },
  {
    id: 3,
    cuenta: '23680101',
    fuente: 'Liney Hernandez Hernandez',
    documento: 'Provisión',
    valor: 8500.00,
    observaciones: 'Cr. Retelca 10 1000'
  },
  {
    id: 4,
    cuenta: '23680101',
    fuente: 'Liney Hernandez Hernandez',
    documento: 'Provisión',
    valor: 75107.00,
    observaciones: 'Cr. Retelca 10 1000'
  },
  {
    id: 5,
    cuenta: '23680101',
    fuente: 'Juan Alez Lopez Ochoa',
    documento: 'Ajuste',
    valor: 195742.00,
    observaciones: 'Cr. Retelca 10 1000'
  },
  {
    id: 6,
    cuenta: '23680101',
    fuente: 'Juan Alez Lopez Ochoa',
    documento: 'Compras',
    valor: 184656.00,
    observaciones: 'Cr. Retelca 10 1000'
  },
  {
    id: 7,
    cuenta: '23809501',
    fuente: 'Beatriz de los Dolores Osorio Marin',
    documento: 'Ajuste',
    valor: 1458114.00,
    observaciones: 'Cr. Abono'
  },
  {
    id: 8,
    cuenta: '23809501',
    fuente: 'Inversiones Shnos S.A.S',
    documento: 'Ajuste',
    valor: 1458114.00,
    observaciones: 'Cr. Abono'
  },
  {
    id: 9,
    cuenta: '23809501',
    fuente: 'Inversiones Shnos S.A.S',
    documento: 'Ajuste',
    valor: 15788648.00,
    observaciones: 'Cr. Abono'
  }
])

// Configuración de la tabla
const columns = [
  {
    name: 'cuenta',
    required: true,
    label: 'Cuenta de Tercero',
    align: 'left',
    field: 'cuenta',
    sortable: true
  },
  {
    name: 'fuente',
    required: true,
    label: 'Fuente',
    align: 'left',
    field: 'fuente',
    sortable: true
  },
  {
    name: 'documento',
    required: true,
    label: 'Documento',
    align: 'left',
    field: 'documento',
    sortable: true
  },
  {
    name: 'tipo',
    required: true,
    label: 'Tipo',
    align: 'center',
    field: 'tipo',
    sortable: true
  },
  {
    name: 'valor',
    required: true,
    label: 'Valor',
    align: 'right',
    field: 'valor',
    sortable: true,
    format: (val: number) => `${val.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
  },
  {
    name: 'observaciones',
    required: true,
    label: 'Observaciones',
    align: 'left',
    field: 'observaciones',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center',
    field: 'acciones'
  }
]

const pagination = ref({
  sortBy: 'cuenta',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

const selected = ref([])
const registroSeleccionado = computed(() => selected.value.length > 0)

// Cálculos de totales por documento seleccionado
const documentoSeleccionado = computed(() => {
  if (selected.value.length > 0) {
    return selected.value[0].documento
  }
  return null
})

const registrosPorDocumento = computed(() => {
  if (!documentoSeleccionado.value) {
    return registros.value
  }
  return registros.value.filter(registro => registro.documento === documentoSeleccionado.value)
})

const totalDebitos = computed(() => {
  return registrosPorDocumento.value
    .filter(registro => registro.tipo === 'Débito')
    .reduce((sum, registro) => sum + (registro.valor || 0), 0)
})

const totalCreditos = computed(() => {
  return registrosPorDocumento.value
    .filter(registro => registro.tipo === 'Crédito')
    .reduce((sum, registro) => sum + (registro.valor || 0), 0)
})

const diferencia = computed(() => {
  return totalDebitos.value - totalCreditos.value
})

// Métodos
const filterCuentas = (val: string, update: Function) => {
  update(() => {
    if (val === '') {
      cuentasContablesFiltradas.value = cuentasContables.value
    } else {
      const needle = val.toLowerCase()
      cuentasContablesFiltradas.value = cuentasContables.value.filter(
        cuenta => cuenta.cuenta.toLowerCase().indexOf(needle) > -1 || 
                 cuenta.nombre.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const agregarRegistro = () => {
  if (!form.value.cuentaContable || !form.value.valor || !form.value.tipoMovimiento) {
    $q.notify({
      type: 'negative',
      message: 'Por favor complete los campos requeridos (Cuenta, Tipo y Valor)'
    })
    return
  }

  const nuevoRegistro = {
    id: Date.now(),
    cuenta: form.value.cuentaContable,
    fuente: form.value.concepto,
    documento: form.value.tipoDocumento,
    valor: Number(form.value.valor),
    tipo: form.value.tipoMovimiento === 1 ? 'Débito' : 'Crédito',
    observaciones: form.value.comentarios
  }

  registros.value.push(nuevoRegistro)
  limpiarFormulario()
  
  $q.notify({
    type: 'positive',
    message: 'Registro agregado exitosamente'
  })
}

const modificarRegistro = () => {
  if (selected.value.length === 0) return
  
  const registro = selected.value[0]
  const index = registros.value.findIndex(r => r.id === registro.id)
  
  if (index !== -1) {
    registros.value[index] = {
      ...registro,
      cuenta: form.value.cuentaContable,
      fuente: form.value.concepto,
      documento: form.value.tipoDocumento,
      valor: Number(form.value.valor),
      observaciones: form.value.comentarios
    }
    
    selected.value = []
    limpiarFormulario()
    
    $q.notify({
      type: 'positive',
      message: 'Registro modificado exitosamente'
    })
  }
}

const eliminarRegistro = () => {
  if (selected.value.length === 0) return
  
  const registro = selected.value[0]
  const index = registros.value.findIndex(r => r.id === registro.id)
  
  if (index !== -1) {
    registros.value.splice(index, 1)
    selected.value = []
    
    $q.notify({
      type: 'positive',
      message: 'Registro eliminado exitosamente'
    })
  }
}

const editarRegistro = (registro: any) => {
  form.value.cuentaContable = registro.cuenta
  form.value.concepto = registro.fuente
  form.value.tipoDocumento = registro.documento
  form.value.valor = registro.valor
  form.value.comentarios = registro.observaciones
  
  selected.value = [registro]
}

const confirmarEliminar = (registro: any) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro de que desea eliminar este registro?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = registros.value.findIndex(r => r.id === registro.id)
    if (index !== -1) {
      registros.value.splice(index, 1)
      $q.notify({
        type: 'positive',
        message: 'Registro eliminado exitosamente'
      })
    }
  })
}

const guardarDocumento = () => {
  if (diferencia.value !== 0) {
    $q.notify({
      type: 'negative',
      message: 'El documento no está balanceado. La diferencia debe ser 0.'
    })
    return
  }
  
  $q.notify({
    type: 'positive',
    message: 'Documento guardado exitosamente'
  })
}

const limpiarFormulario = () => {
  form.value = {
    fecha: new Date().toISOString().split('T')[0],
    tipoDocumento: '',
    documento: '',
    cuentaContable: '',
    concepto: '',
    tipoMovimiento: '',
    valor: 0,
    centroCostos: '',
    fuenteContable: '',
    nitCedula: '',
    prefijo: '',
    aplicable: 0,
    cheque: '',
    ctaCheque: '',
    baseRetencion: 0,
    comentarios: ''
  }
}

// Función para cargar tipos de documento
const cargarTiposDocumento = async () => {
  if (!authStore.user?.empresa) {
    console.warn('No hay empresa definida en el usuario')
    return
  }

  try {
    loadingTiposDocumento.value = true
    const tipos = await ContabilidadService.getTiposDocumento(authStore.user.empresa)
    tiposDocumento.value = tipos
  } catch (error) {
    console.error('Error al cargar tipos de documento:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar tipos de documento'
    })
  } finally {
    loadingTiposDocumento.value = false
  }
}

// Función para cargar cuentas contables
const cargarCuentasContables = async () => {
  if (!authStore.user?.empresa) {
    console.warn('No hay empresa definida en el usuario')
    return
  }

  try {
    loadingCuentasContables.value = true
    const cuentas = await ContabilidadService.getCuentasContables(authStore.user.empresa)
    // Agregar displayText para mostrar código y nombre
    const cuentasConDisplay = cuentas.map(cuenta => ({
      ...cuenta,
      displayText: `${cuenta.cuenta} - ${cuenta.nombre}`
    }))
    cuentasContables.value = cuentasConDisplay
    cuentasContablesFiltradas.value = cuentasConDisplay
  } catch (error) {
    console.error('Error al cargar cuentas contables:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar cuentas contables'
    })
  } finally {
    loadingCuentasContables.value = false
  }
}

// Función para cargar centros de costos
const cargarCentrosCostos = async () => {
  if (!authStore.user?.empresa) {
    console.warn('No hay empresa definida en el usuario')
    return
  }

  try {
    loadingCentrosCostos.value = true
    const centros = await ContabilidadService.getCentrosCostos(authStore.user.empresa)
    centrosCostos.value = centros
  } catch (error) {
    console.error('Error al cargar centros de costos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar centros de costos'
    })
  } finally {
    loadingCentrosCostos.value = false
  }
}

// Función para cargar fuentes contables
const cargarFuentesContables = async () => {
  if (!authStore.user?.empresa) {
    console.warn('No hay empresa definida en el usuario')
    return
  }

  try {
    loadingFuentesContables.value = true
    const fuentes = await ContabilidadService.getFuentesContables(authStore.user.empresa)
    fuentesContables.value = fuentes
  } catch (error) {
    console.error('Error al cargar fuentes contables:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar fuentes contables'
    })
  } finally {
    loadingFuentesContables.value = false
  }
}

// Función para cargar nits
const cargarNits = async (filtro?: string) => {
  if (!authStore.user?.empresa) {
    console.warn('No hay empresa definida en el usuario')
    return
  }

  try {
    loadingNits.value = true
    const nitsData = await ContabilidadService.getNits(authStore.user.empresa, filtro)
    nits.value = nitsData
    nitsFiltrados.value = nitsData
  } catch (error) {
    console.error('Error al cargar nits:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar nits'
    })
  } finally {
    loadingNits.value = false
  }
}

// Función para filtrar nits
const filtrarNits = (val: string, update: (fn: () => void) => void) => {
  update(async () => {
    if (val === '') {
      nitsFiltrados.value = nits.value
    } else {
      await cargarNits(val)
    }
  })
}

// Watcher para la cuenta contable seleccionada
watch(() => form.value.cuentaContable, async (nuevaCuenta) => {
  if (nuevaCuenta) {
    // Buscar la cuenta completa con sus configuraciones
    const cuenta = cuentasContables.value.find(c => c.cuenta === nuevaCuenta)
    if (cuenta) {
      cuentaSeleccionada.value = cuenta
      
      // Actualizar habilitación de campos basado en la configuración de la cuenta
      camposHabilitados.value = {
        nit: cuenta.con_nit || false,
        prefijo: cuenta.con_aplica || false,
        factura: cuenta.con_aplica || false,
        cheque: cuenta.con_cheque || false,
        ctaCheque: cuenta.con_cheque || false,
        comentarios: cuenta.con_comen || false,
        baseRetencion: cuenta.con_rete || false
      }
      
      // Limpiar campos que se deshabilitan
      if (!camposHabilitados.value.nit) form.value.nitCedula = ''
      if (!camposHabilitados.value.prefijo) form.value.prefijo = ''
      if (!camposHabilitados.value.factura) form.value.aplicable = 0
      if (!camposHabilitados.value.cheque) form.value.cheque = ''
      if (!camposHabilitados.value.ctaCheque) form.value.ctaCheque = ''
      if (!camposHabilitados.value.comentarios) form.value.comentarios = ''
      if (!camposHabilitados.value.baseRetencion) form.value.baseRetencion = 0
    }
  } else {
    // Si no hay cuenta seleccionada, deshabilitar todos los campos
    cuentaSeleccionada.value = null
    camposHabilitados.value = {
      nit: false,
      prefijo: false,
      factura: false,
      cheque: false,
      ctaCheque: false,
      comentarios: false,
      baseRetencion: false
    }
  }
})

// Watcher para calcular base de retención automáticamente
watch(() => form.value.valor, (nuevoValor) => {
  if (cuentaSeleccionada.value && cuentaSeleccionada.value.con_rete && nuevoValor) {
    const valor = Number(nuevoValor)
    const baseMinima = cuentaSeleccionada.value.baseminima || 0
    const porcentaje = cuentaSeleccionada.value.porcentaje || 0
    
    if (valor >= baseMinima) {
      form.value.baseRetencion = Number((valor * porcentaje / 100).toFixed(2))
    } else {
      form.value.baseRetencion = 0
    }
  }
})

onMounted(() => {
  cargarTiposDocumento()
  cargarCuentasContables()
  cargarCentrosCostos()
  cargarFuentesContables()
  cargarNits()
})
</script>

<style scoped>
.my-sticky-header-table {
  /* height or max-height is important */
  height: 400px;
}

.my-sticky-header-table .q-table__top,
.my-sticky-header-table .q-table__bottom,
.my-sticky-header-table thead tr:first-child th {
  /* bg color is important for th; just specify one */
  background-color: #f5f5f5;
}

.my-sticky-header-table thead tr th {
  position: sticky;
  z-index: 1;
}

.my-sticky-header-table thead tr:first-child th {
  top: 0;
}

.my-sticky-header-table.q-table--loading thead tr:last-child th {
  /* height of all previous header rows */
  top: 48px;
}
</style>