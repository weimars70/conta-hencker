<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEmpresasStore } from '../../stores/useEmpresasStore';
import EmpresasForm from './EmpresasForm.vue';
import EmpresasGrid from './EmpresasGrid.vue';
import EmpresasTarjetas from './EmpresasTarjetas.vue';
import ViewToggle from '../ViewToggle.vue';

const empresasStore = useEmpresasStore();

// Estado de la vista
const viewMode = ref<'grid' | 'list'>('list');
const showForm = ref(false);
const editMode = ref(false);
const selectedEmpresa = ref(null);

// Métodos para manejar el formulario
const openCreateForm = () => {
  selectedEmpresa.value = null;
  editMode.value = false;
  showForm.value = true;
  empresasStore.limpiarFormulario();
};

const openEditForm = (empresa: any) => {
  selectedEmpresa.value = empresa;
  editMode.value = true;
  showForm.value = true;
  empresasStore.seleccionarEmpresa(empresa);
};

const closeForm = () => {
  showForm.value = false;
  editMode.value = false;
  selectedEmpresa.value = null;
  empresasStore.limpiarFormulario();
};

const handleFormSaved = () => {
  console.log('📝 Formulario guardado, cerrando dialog');
  closeForm();
  // Refrescar datos después de guardar con un pequeño delay
  setTimeout(() => {
    empresasStore.fetchEmpresas();
  }, 100);
};

// Métodos para manejar acciones de la tabla/grid
const handleEdit = (empresa: any) => {
  openEditForm(empresa);
};

const handleDelete = async (id: number) => {
  await empresasStore.eliminar(id);
};

// Métodos para manejar la paginación y filtros
const handleRequest = ({ pagination }: any) => {
  empresasStore.pagination.page = pagination.page;
  empresasStore.pagination.rowsPerPage = pagination.rowsPerPage;
  empresasStore.fetchEmpresas();
};

const handleFilterChange = () => {
  empresasStore.pagination.page = 1;
  empresasStore.fetchEmpresas();
};

const clearFilters = () => {
  empresasStore.limpiarFiltros();
  empresasStore.fetchEmpresas();
};

// Cargar datos iniciales
onMounted(() => {
  empresasStore.fetchEmpresas();
});
</script>

<template>
  <div class="empresas-view">
    <!-- Cabecera con filtros -->
    <div class="view-header">
      <div class="header-content">
        <div class="header-title">
          <h3 class="title">Gestión de Empresas</h3>
        </div>
        
        <div class="filters-section">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-2">
              <q-input
                v-model="empresasStore.filters.empresa"
                label="Filtrar por código"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => empresasStore.fetchEmpresas()"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="empresasStore.filters.nombre"
                label="Filtrar por nombre"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => empresasStore.fetchEmpresas()"
              >
                <template v-slot:prepend>
                  <q-icon name="apartment" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="empresasStore.filters.nit"
                label="Filtrar por NIT"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => empresasStore.fetchEmpresas()"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="empresasStore.filters.ciudad"
                label="Filtrar por ciudad"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => empresasStore.fetchEmpresas()"
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-1 flex items-end">
              <q-btn
                color="negative"
                icon="clear_all"
                dense
                round
                class="clear-filters-btn"
                @click="clearFilters"
              >
                <q-tooltip>Limpiar Filtros</q-tooltip>
              </q-btn>
            </div>
            
            <div class="col-12 col-md-3 flex items-end justify-end">
              <div class="controls-section">
                <ViewToggle v-model="viewMode" />
                <q-btn
                  color="primary"
                  icon="add"
                  label="Nueva Empresa"
                  class="new-empresa-btn"
                  @click="openCreateForm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="view-content">
      <!-- Vista de tabla/lista -->
      <EmpresasGrid 
        v-if="viewMode === 'list'"
        :empresas="empresasStore.lista"
        :loading="empresasStore.loading"
        :pagination="empresasStore.pagination"
        :filters="empresasStore.filters"
        @edit="handleEdit"
        @delete="handleDelete"
        @request="handleRequest"
        @filter-change="handleFilterChange"
      />
      
      <!-- Vista de tarjetas/grid -->
      <EmpresasTarjetas 
        v-else
        :empresas="empresasStore.lista"
        :loading="empresasStore.loading"
        :pagination="empresasStore.pagination"
        @edit="handleEdit"
        @delete="handleDelete"
        @request="handleRequest"
      />
    </div>

    <!-- Dialog del formulario -->
    <q-dialog 
      v-model="showForm" 
      persistent 
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      class="form-dialog"
    >
      <q-card class="form-dialog-card">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon 
              :name="editMode ? 'edit' : 'business_center'" 
              class="dialog-icon" 
            />
            {{ editMode ? 'Editar Empresa' : 'Nueva Empresa' }}
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="closeForm"
          />
        </q-card-section>

        <q-card-section class="dialog-content">
          <EmpresasForm
            :edit-mode="editMode"
            :initial-data="selectedEmpresa"
            @saved="handleFormSaved"
            @cancelled="closeForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.empresas-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  .view-header {
    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    
    .header-content {
      padding: 1.5rem 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      .header-title {
        margin-bottom: 1.5rem;
        
        .title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .subtitle {
          font-size: 1rem;
          color: #64748b;
          margin: 0;
        }
      }
      
      .filters-section {
        .modern-filter-input {
          :deep(.q-field__control) {
            border-radius: 8px;
          }
        }
        
        .clear-filters-btn {
          transition: all 0.3s ease;
          
          &:hover {
            transform: rotate(90deg);
          }
        }
        
        .controls-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          
          .new-empresa-btn {
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
          }
        }
      }
    }
  }
  
  .view-content {
    flex: 1;
    overflow: auto;
  }
  
  .form-dialog {
    .form-dialog-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
        border-bottom: 1px solid #e2e8f0;
        
        .dialog-title {
          display: flex;
          align-items: center;
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
          
          .dialog-icon {
            margin-right: 0.75rem;
            font-size: 1.5rem;
            color: #667eea;
          }
        }
        
        .close-btn {
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            transform: rotate(90deg);
          }
        }
      }
      
      .dialog-content {
        flex: 1;
        overflow: auto;
        padding: 1.5rem;
      }
    }
  }
}
</style>