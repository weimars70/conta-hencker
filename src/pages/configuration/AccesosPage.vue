<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { accesosService, type Acceso, type AccesosFilters } from '../../services/api/accesos.service';
import ViewToggle from '../../components/ViewToggle.vue';
import { useScreenSize } from '../../composables/useScreenSize';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const { isMobile } = useScreenSize();

const loading = ref(false);
const accesos = ref<Acceso[]>([]);
const total = ref(0);
const viewMode = ref<'grid' | 'list'>('list');

// Pagination
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

// Filters
const filters = ref<AccesosFilters>({
  empresa: '',
  usuario: '',
  nombre: '',
  email: '',
  activo: undefined
});

// Form for create/edit
const showForm = ref(false);
const editMode = ref(false);
const formData = ref({
  empresa: '01',
  usuario_id: null,
  nivel: 'user',
  codigo: 0,
  bodega: 0,
  centro_costos: 0,
  activo: true
});

const columns = [
  { name: 'empresa', label: 'Empresa', field: 'empresa', sortable: true, align: 'left' },
  { name: 'nombre_empresa', label: 'Nombre Empresa', field: 'nombre_empresa', sortable: true, align: 'left' },
  { name: 'usuario_id', label: 'Usuario ID', field: 'usuario_id', sortable: true, align: 'center' },
  { name: 'nombre_usuario', label: 'Nombre Usuario', field: 'nombre_usuario', sortable: true, align: 'left' },
  { name: 'nivel', label: 'Nivel', field: 'nivel', sortable: true, align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', sortable: true, align: 'center' },
  { name: 'bodega', label: 'Bodega', field: 'bodega', sortable: true, align: 'center' },
  { name: 'centro_costos', label: 'Centro Costos', field: 'centro_costos', sortable: true, align: 'center' },
  { name: 'activo', label: 'Activo', field: 'activo', sortable: true, align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

const filteredAccesos = computed(() => {
  return accesos.value.filter(acceso => {
    return (!filters.value.empresa || acceso.empresa.toLowerCase().includes(filters.value.empresa.toLowerCase())) &&
           (!filters.value.usuario || acceso.usuario_id.toString().includes(filters.value.usuario)) &&
           (!filters.value.nombre || acceso.nombre_usuario?.toLowerCase().includes(filters.value.nombre.toLowerCase())) &&
           (!filters.value.email || acceso.nombre_empresa?.toLowerCase().includes(filters.value.email.toLowerCase())) &&
           (filters.value.activo === undefined || acceso.activo === filters.value.activo);
  });
});

const fetchAccesos = async (props?: any) => {
  try {
    loading.value = true;
    
    if (!authStore.isAuthenticated) {
      $q.notify({
        type: 'negative',
        message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      });
      router.push('/login');
      return;
    }

    const page = props?.pagination?.page || pagination.value.page;
    const limit = props?.pagination?.rowsPerPage || pagination.value.rowsPerPage;

    try {
      console.log('🔍 Intentando cargar accesos con parámetros:', {
        page,
        limit,
        filters: filters.value
      });
      
      const response = await accesosService.getAll({
        page,
        limit,
        ...filters.value
      });

      console.log('✅ Respuesta del servicio:', response);
      console.log('📊 Datos recibidos:', response.data);
      console.log('📈 Total de registros:', response.total);

      accesos.value = response.data;
      total.value = response.total;
      pagination.value.page = response.page;
      pagination.value.rowsPerPage = response.limit;
      pagination.value.rowsNumber = response.total;

      $q.notify({
        type: 'positive',
        message: `Se cargaron ${response.data.length} accesos de la base de datos`
      });
    } catch (serviceError) {
      console.warn('Error al cargar desde el servicio, usando datos de prueba:', serviceError);
      
      // Datos de prueba mientras se configura la base de datos
      const datosEjemplo = [
        {
          empresa: '01',
          usuario_id: 1,
          nombre_usuario: 'Administrador',
          nombre_empresa: 'HENCKER S.A.S.',
          nivel: 'admin',
          codigo: 1,
          bodega: 1,
          centro_costos: 1,
          activo: true
        },
        {
          empresa: '01',
          usuario_id: 2,
          nombre_usuario: 'Usuario Demo',
          nombre_empresa: 'HENCKER S.A.S.',
          nivel: 'user',
          codigo: 2,
          bodega: 1,
          centro_costos: 2,
          activo: true
        },
        {
          empresa: '02',
          usuario_id: 3,
          nombre_usuario: 'Contador',
          nombre_empresa: 'Empresa Demo',
          nivel: 'user',
          codigo: 3,
          bodega: 2,
          centro_costos: 1,
          activo: false
        }
      ];

      accesos.value = datosEjemplo;
      total.value = datosEjemplo.length;
      pagination.value.page = 1;
      pagination.value.rowsPerPage = limit;
      pagination.value.rowsNumber = datosEjemplo.length;

      $q.notify({
        type: 'info',
        message: 'Mostrando datos de ejemplo. Configure la base de datos para datos reales.'
      });
    }
  } catch (error) {
    console.error('Error general en fetchAccesos:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los accesos'
    });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    empresa: '01',
    usuario_id: null,
    nivel: 'user',
    codigo: 0,
    bodega: 0,
    centro_costos: 0,
    activo: true
  };
  editMode.value = false;
  showForm.value = false;
};

const editAcceso = (acceso) => {
  formData.value = { ...acceso };
  editMode.value = true;
  showForm.value = true;
};

const deleteAcceso = async (usuario_id: number) => {
  try {
    $q.dialog({
      title: 'Confirmar',
      message: '¿Está seguro que desea eliminar este acceso?',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      if (!authStore.isAuthenticated) {
        $q.notify({
          type: 'negative',
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        });
        router.push('/login');
        return;
      }
      
      // Mock para eliminar accesos temporalmente
      const index = accesos.value.findIndex(a => a.usuario_id === usuario_id);
      if (index !== -1) {
        accesos.value.splice(index, 1);
        total.value = accesos.value.length;
        pagination.value.rowsNumber = accesos.value.length;
      }
      
      $q.notify({
        type: 'positive',
        message: 'Acceso eliminado exitosamente'
      });

      /* Código original para cuando el backend esté listo:
      await accesosService.delete(usuario_id);
      
      $q.notify({
        type: 'positive',
        message: 'Acceso eliminado exitosamente'
      });
      
      fetchAccesos();
      */
    });
  } catch (error) {
    console.error('Error deleting acceso:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               'Error al eliminar el acceso'
    });
  }
};

const saveAcceso = async () => {
  try {
    loading.value = true;
    
    if (!authStore.isAuthenticated) {
      $q.notify({
        type: 'negative',
        message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      });
      router.push('/login');
      return;
    }
    
    if (editMode.value) {
      await accesosService.update(formData.value.usuario!, formData.value);
      $q.notify({
        type: 'positive',
        message: 'Acceso actualizado exitosamente'
      });
    } else {
      await accesosService.create(formData.value);
      $q.notify({
        type: 'positive',
        message: 'Acceso creado exitosamente'
      });
    }
    
    resetForm();
    fetchAccesos();
  } catch (error) {
    console.error('Error saving acceso:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 
               error.message || 
               `Error al ${editMode.value ? 'actualizar' : 'crear'} el acceso`
    });
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    empresa: '',
    usuario: '',
    nombre: '',
    email: '',
    activo: undefined
  };
  fetchAccesos();
};

const testConnection = async () => {
  try {
    console.log('🧪 Iniciando prueba de conexión directa...');
    
    // Importar supabase directamente
    const { supabase } = await import('../../config/supabase');
    
    console.log('🔍 Cliente Supabase:', supabase);
    
    // Probar consulta simple
    console.log('🔍 Probando consulta simple a tabla accesos...');
    const { data, error, count } = await supabase
      .from('accesos')
      .select('*', { count: 'exact' })
      .limit(5);
    
    console.log('📊 Resultado de prueba:', { data, error, count });
    
    if (error) {
      console.error('❌ Error en prueba:', error);
      $q.notify({
        type: 'negative',
        message: `Error de conexión: ${error.message}`
      });
    } else {
      console.log('✅ Conexión exitosa!');
      $q.notify({
        type: 'positive',
        message: `Conexión exitosa! Encontrados ${count || 0} registros. Ver consola para detalles.`
      });
    }
  } catch (error) {
    console.error('❌ Error en testConnection:', error);
    $q.notify({
      type: 'negative',
      message: `Error: ${error.message}`
    });
  }
};

onMounted(() => {
  fetchAccesos();
});

</script>

<template>
  <q-page padding>
    <div class="q-pa-md">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <h5 class="q-mt-none q-mb-none">Gestión de Accesos</h5>
        <div class="row q-gutter-sm">
          <ViewToggle v-model="viewMode" />
          <q-btn
            color="orange"
            icon="bug_report"
            label="Probar Conexión"
            @click="testConnection"
          />
          <q-btn
            color="primary"
            icon="add"
            label="Nuevo Acceso"
            @click="showForm = true"
          />
        </div>
      </div>

      <!-- Filters -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Filtros</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.empresa"
                label="Empresa"
                outlined
                dense
                clearable
                @update:model-value="fetchAccesos"
              />
            </div>
            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.usuario"
                label="Usuario ID"
                outlined
                dense
                clearable
                @update:model-value="fetchAccesos"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.nombre"
                label="Nombre Usuario"
                outlined
                dense
                clearable
                @update:model-value="fetchAccesos"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.email"
                label="Nombre Empresa"
                outlined
                dense
                clearable
                @update:model-value="fetchAccesos"
              />
            </div>
            <div class="col-12 col-md-1">
              <q-select
                v-model="filters.activo"
                :options="[
                  { label: 'Todos', value: undefined },
                  { label: 'Activos', value: true },
                  { label: 'Inactivos', value: false }
                ]"
                label="Estado"
                outlined
                dense
                emit-value
                map-options
                @update:model-value="fetchAccesos"
              />
            </div>
            <div class="col-12 col-md-1 flex items-end q-gutter-xs">
              <q-btn
                color="primary"
                icon="search"
                dense
                @click="fetchAccesos"
              >
                <q-tooltip>Aplicar Filtros</q-tooltip>
              </q-btn>
              <q-btn
                flat
                color="grey"
                icon="clear"
                dense
                @click="clearFilters"
              >
                <q-tooltip>Limpiar Filtros</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- List View -->
      <q-table
        v-if="viewMode === 'list'"
        :rows="filteredAccesos"
        :columns="columns"
        row-key="usuario"
        :loading="loading"
        :pagination="pagination"
        @request="fetchAccesos"
        flat
        bordered
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary">
            <q-spinner size="50px" color="primary" />
          </q-inner-loading>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-chip
              :color="props.value ? 'positive' : 'negative'"
              text-color="white"
              :label="props.value ? 'Activo' : 'Inactivo'"
              size="sm"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="editAcceso(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="deleteAcceso(props.row.usuario_id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-md text-grey-8">
            No hay accesos disponibles
          </div>
        </template>
      </q-table>

      <!-- Grid View -->
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="acceso in filteredAccesos"
          :key="acceso.usuario"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="acceso-card">
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-h6">{{ acceso.nombre_usuario || `Usuario ${acceso.usuario_id}` }}</div>
                <q-chip
                  :color="acceso.activo ? 'positive' : 'negative'"
                  text-color="white"
                  :label="acceso.activo ? 'Activo' : 'Inactivo'"
                  size="sm"
                />
              </div>
              <div class="text-subtitle2 text-grey-6">{{ acceso.empresa }} - {{ acceso.nombre_empresa }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-body2 q-mb-xs">
                <strong>Usuario ID:</strong> {{ acceso.usuario_id }}
              </div>
              <div class="text-body2 q-mb-xs">
                <strong>Empresa:</strong> {{ acceso.nombre_empresa || 'N/A' }}
              </div>
              <div class="text-body2 q-mb-xs">
                <strong>Nivel:</strong> {{ acceso.nivel || 'N/A' }}
              </div>
              <div class="text-body2 q-mb-xs">
                <strong>Código:</strong> {{ acceso.codigo || 'N/A' }}
              </div>
              <div class="text-body2 q-mb-xs">
                <strong>Bodega:</strong> {{ acceso.bodega || 'N/A' }}
              </div>
              <div class="text-body2">
                <strong>Centro Costos:</strong> {{ acceso.centro_costos || 'N/A' }}
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                color="primary"
                icon="edit"
                @click="editAcceso(acceso)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>
              <q-btn
                flat
                color="negative"
                icon="delete"
                @click="deleteAcceso(acceso.usuario_id)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>

        <div v-if="filteredAccesos.length === 0" class="col-12">
          <q-card>
            <q-card-section class="text-center text-grey-6">
              <q-icon name="people" size="64px" class="q-mb-md" />
              <div class="text-h6">No hay accesos disponibles</div>
              <div class="text-body2">Los accesos aparecerán aquí cuando estén disponibles</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Form Dialog -->
      <q-dialog v-model="showForm" persistent>
        <q-card style="min-width: 500px">
          <q-card-section>
            <div class="text-h6">{{ editMode ? 'Editar Acceso' : 'Nuevo Acceso' }}</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit.prevent="saveAcceso" class="q-gutter-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.empresa"
                    label="Empresa"
                    outlined
                    dense
                    :rules="[val => !!val || 'Campo requerido']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.usuario_id"
                    label="Usuario ID"
                    type="number"
                    outlined
                    dense
                    :rules="[val => !!val || 'Campo requerido']"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="formData.nombre"
                    label="Nombre"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="formData.email"
                    label="Email"
                    type="email"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.clave"
                    label="Contraseña"
                    type="password"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="formData.nivel"
                    :options="['admin', 'user', 'viewer']"
                    label="Nivel"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="formData.codigo"
                    label="Código"
                    type="number"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="formData.bodega"
                    label="Bodega"
                    type="number"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="formData.centro_costos"
                    label="Centro Costos"
                    type="number"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12">
                  <q-checkbox
                    v-model="formData.activo"
                    label="Activo"
                  />
                </div>
              </div>
            </q-form>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              color="grey"
              @click="resetForm"
            />
            <q-btn
              :label="editMode ? 'Actualizar' : 'Crear'"
              color="primary"
              :loading="loading"
              @click="saveAcceso"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.acceso-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.q-table {
  .q-td {
    white-space: nowrap;
  }
}

@media (max-width: 768px) {
  .q-table {
    .q-td {
      white-space: normal;
      word-break: break-word;
    }
  }
}
</style>