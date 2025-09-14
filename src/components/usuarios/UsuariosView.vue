<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUsuariosStore } from '../../stores/useUsuariosStore';
import UsuariosForm from './UsuariosForm.vue';
import UsuariosGrid from './UsuariosGrid.vue';
import UsuariosTarjetas from './UsuariosTarjetas.vue';
import ViewToggle from '../ViewToggle.vue';

const usuariosStore = useUsuariosStore();

// Estado de la vista
const viewMode = ref<'grid' | 'list'>('list');
const showForm = ref(false);
const editMode = ref(false);
const selectedUser = ref(null);

// Métodos para manejar el formulario
const openCreateForm = () => {
  selectedUser.value = null;
  editMode.value = false;
  showForm.value = true;
  usuariosStore.limpiarFormulario();
};

const openEditForm = (usuario: any) => {
  selectedUser.value = usuario;
  editMode.value = true;
  showForm.value = true;
  usuariosStore.seleccionarUsuario(usuario);
};

const closeForm = () => {
  showForm.value = false;
  editMode.value = false;
  selectedUser.value = null;
  usuariosStore.limpiarFormulario();
};

const handleFormSaved = () => {
  console.log('📝 Formulario guardado, cerrando dialog');
  closeForm();
  // Refrescar datos después de guardar con un pequeño delay
  setTimeout(() => {
    usuariosStore.fetchUsuarios();
  }, 100);
};

// Métodos para manejar acciones de la tabla/grid
const handleEdit = (usuario: any) => {
  openEditForm(usuario);
};

const handleDelete = async (id: number) => {
  await usuariosStore.eliminar(id);
};

const handleRequest = (props: any) => {
  usuariosStore.fetchUsuarios(props);
};


const clearFilters = () => {
  usuariosStore.filters = {
    nombre: '',
    email: '',
    telefono: '',
    activo: undefined
  };
  usuariosStore.fetchUsuarios();
};

// Inicialización
onMounted(() => {
  usuariosStore.fetchUsuarios();
});
</script>

<template>
  <div class="usuarios-view">
    <!-- Header con controles -->
    <div class="view-header">
      <div class="header-content">
        <div class="title-section">
          <h5 class="page-title">Gestión de Usuarios</h5>
          <div class="title-decoration"></div>
        </div>
        
        <!-- Filtros integrados en el header -->
        <div class="filters-section">
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-2">
              <q-input
                v-model="usuariosStore.filters.nombre"
                label="Filtrar por nombre"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => usuariosStore.fetchUsuarios()"
              >
                <template v-slot:prepend>
                  <q-icon name="person_search" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="usuariosStore.filters.email"
                label="Filtrar por email"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => usuariosStore.fetchUsuarios()"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="usuariosStore.filters.telefono"
                label="Filtrar por teléfono"
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="() => usuariosStore.fetchUsuarios()"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-select
                v-model="usuariosStore.filters.activo"
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
                class="modern-filter-input"
                @update:model-value="() => usuariosStore.fetchUsuarios()"
              >
                <template v-slot:prepend>
                  <q-icon name="toggle_on" color="primary" />
                </template>
              </q-select>
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
                  label="Nuevo Usuario"
                  class="new-user-btn"
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
      <UsuariosGrid 
        v-if="viewMode === 'list'"
        :usuarios="usuariosStore.lista"
        :loading="usuariosStore.loading"
        :pagination="usuariosStore.pagination"
        :filters="usuariosStore.filters"
        @edit="handleEdit"
        @delete="handleDelete"
        @request="handleRequest"
        @filter-change="handleFilterChange"
      />
      
      <!-- Vista de tarjetas/grid -->
      <UsuariosTarjetas 
        v-else
        :usuarios="usuariosStore.lista"
        :loading="usuariosStore.loading"
        :pagination="usuariosStore.pagination"
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
              :name="editMode ? 'edit' : 'person_add'" 
              class="dialog-icon" 
            />
            {{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
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
          <UsuariosForm
            :edit-mode="editMode"
            :initial-data="selectedUser"
            @saved="handleFormSaved"
            @cancelled="closeForm"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
.usuarios-view {
  .view-header {
    margin-bottom: 2rem;
    
    .header-content {
      padding: 1.5rem 2rem;
      border-bottom: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);


      .title-section {
        position: relative;
        margin-bottom: 1.5rem;

        .page-title {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .title-decoration {
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
          border-radius: 2px;
        }
      }

      .filters-section {
        .modern-filter-input {
          :deep(.q-field__control) {
            border: 2px solid transparent;
            background: linear-gradient(white, white) padding-box,
                        linear-gradient(135deg, #667eea, #764ba2) border-box;
            border-radius: 8px;
            transition: all 0.3s ease;

            &:hover {
              background: linear-gradient(white, white) padding-box,
                          linear-gradient(135deg, #764ba2, #f093fb) border-box;
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            }
          }

          :deep(.q-field--focused .q-field__control) {
            background: linear-gradient(white, white) padding-box,
                        linear-gradient(135deg, #f093fb, #f5576c) border-box;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
        }

        .clear-filters-btn {
          background: linear-gradient(135deg, #f5576c, #f093fb);
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            transform: scale(1.1) rotate(180deg);
            box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
          }
        }
      }

      .controls-section {
        display: flex;
        align-items: center;
        gap: 1rem;

        .new-user-btn {
          border-radius: 12px;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

          &:hover {
            background: linear-gradient(135deg, #764ba2, #f093fb);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }

  .view-content {
    min-height: 400px;
  }

  .form-dialog {
    :deep(.q-dialog__inner) {
      padding: 0;
    }

    .form-dialog-card {
      width: 100%;
      height: 100%;
      max-width: none;
      border-radius: 0;
      display: flex;
      flex-direction: column;

      .dialog-header {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1.5rem 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        .dialog-title {
          font-size: 1.5rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .dialog-icon {
            font-size: 1.8rem;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
        }

        .close-btn {
          background: rgba(255,255,255,0.1);
          color: white;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255,255,255,0.2);
            transform: scale(1.1);
          }
        }
      }

      .dialog-content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(240, 147, 251, 0.02));
      }
    }
  }
}

@media (max-width: 768px) {
  .usuarios-view {
    .view-header .header-content {
      text-align: center;
      padding: 1rem;

      .title-section .page-title {
        font-size: 1.5rem;
      }
    }

    .form-dialog .form-dialog-card .dialog-header {
      padding: 1rem;

      .dialog-title {
        font-size: 1.2rem;
      }
    }
  }
}
</style>

