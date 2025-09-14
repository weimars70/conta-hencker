<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import GenericForm from "../components/generic/GenericForm.vue";
import GenericGrid from "../components/generic/GenericGrid.vue";
import GenericCards from "../components/generic/GenericCards.vue";
import ViewToggle from "../components/ViewToggle.vue";
import { useQuasar } from 'quasar';
import { useGenericStore } from '../stores/useGenericStore';
import { genericCrudConfigs } from '../router/genericCrudConfigs';

const $q = useQuasar();
const route = useRoute();
const genericStore = useGenericStore();

const showForm = ref(false);
const editMode = ref(false);
const initialData = ref<any>(null);
const viewMode = ref<'grid' | 'list'>('list');
const filter = ref('');

const tableName = computed(() => route.meta.tableName as string);
const pageTitle = computed(() => route.meta.title as string);
const pageTitleSingular = computed(() => route.meta.titleSingular as string || pageTitle.value.slice(0, -1));
const formFields = computed(() => route.meta.formFields as any[]);
const gridColumns = computed(() => {
  if (!tableName.value) return [];
  const config = genericCrudConfigs[tableName.value];
  if (!config) return [];

  return [
    ...config.gridColumns,
    {
      name: 'actions',
      label: 'Acciones',
      field: 'actions',
      align: 'center',
      sortable: false
    }
  ];
});

const genericGridRef = ref<typeof GenericGrid | null>(null);
const records = ref<any[]>([]);

// Debugging: Log records when they are updated, before being passed to child components
watch(records, (newRecords) => {
  console.log('Records updated and passed to GenericGrid/Cards:', newRecords);
}, { deep: true });

const fetchRecords = async (filterValue: string = '') => {
  if (!tableName.value) return;
  try {
    const fetchedData = await genericStore.fetchRecords(tableName.value, filterValue);
    records.value = fetchedData;
    console.log('Records updated and passed to GenericGrid/Cards:', records.value);
  } catch (error) {
    console.error('Error fetching records:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los registros.',
      position: 'top'
    });
  }
};

const openCreateForm = () => {
  editMode.value = false;
  initialData.value = null;
  showForm.value = true;
};

const openEditForm = (record: any) => {
  editMode.value = true;
  initialData.value = { ...record };
  showForm.value = true;
};

const handleSaved = async () => {
  showForm.value = false;
  await fetchRecords();
};

const handleCancelled = () => {
  showForm.value = false;
};

const handleFilterChange = async () => {
  await fetchRecords(filter.value);
};

onMounted(async () => {
  console.log('onMounted: tableName', tableName.value);
  console.log('onMounted: pageTitle', pageTitle.value);
  console.log('onMounted: formFields', formFields.value);
  console.log('onMounted: gridColumns', gridColumns.value);

  if (!tableName.value || !pageTitle.value || !formFields.value || !gridColumns.value) {
    $q.notify({
      type: 'negative',
      message: 'Configuración de ruta incompleta para CRUD genérico.',
      position: 'top'
    });
  } else {
    await fetchRecords(filter.value); // Pasar el filtro inicial
  }
});

watch(tableName, async (newTableName, oldTableName) => {
  if (newTableName !== oldTableName) {
    console.log(`tableName changed from ${oldTableName} to ${newTableName}. Fetching records...`);
    await fetchRecords(filter.value); // Pasar el filtro al cambiar la tabla
  }
});
</script>

<template>
  <div class="generic-crud-view">
    <!-- Header con controles -->
    <div class="view-header">
      <div class="header-content">
        <div class="title-section">
          <h5 class="page-title">{{ pageTitle }}</h5>
          <div class="title-decoration"></div>
        </div>

        <div class="filters-section">
          <div class="row q-col-gutter-md items-end">
            <div class="col-12 col-md-3">
              <q-input
                v-model="filter"
                label="Buscar..."
                outlined
                dense
                clearable
                class="modern-filter-input"
                @update:model-value="handleFilterChange"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-9 flex items-end justify-end">
              <div class="controls-section">
                <ViewToggle v-model="viewMode" />
                <q-btn
                  color="primary"
                  icon="add"
                  :label="`Nuevo ${pageTitleSingular}`"
                  class="new-record-btn"
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
      <GenericGrid
          v-if="viewMode === 'list'"
          :key="tableName"
          ref="genericGridRef"
          :table-name="tableName"
          :grid-columns="gridColumns"

          :dialog-title="pageTitle"
          :form-fields="formFields"
          :records="records"
          @edit="openEditForm"
          @filter-change="handleFilterChange"
        />

      <!-- Vista de tarjetas/grid -->
      <GenericCards
          v-else
          :key="tableName"
          :table-name="tableName"
          :grid-columns="gridColumns"

          :dialog-title="pageTitle"
          :form-fields="formFields"
          :records="records"
          @edit="openEditForm"
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
              :name="editMode ? 'edit' : 'add'"
              class="dialog-icon"
            />
            {{ editMode ? `Editar ${pageTitleSingular}` : `Nuevo ${pageTitleSingular}` }}
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="handleCancelled"
          />
        </q-card-section>

        <q-card-section class="dialog-content">
          <GenericForm
            :edit-mode="editMode"
            :initial-data="initialData"
            :table-name="tableName"
            :form-fields="formFields"
            :title="editMode ? `Editar ${pageTitle}` : `Crear ${pageTitle}`"
            @saved="handleSaved"
            @cancelled="handleCancelled"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
.generic-crud-view {
  padding: 0.5rem 1rem; // Aplicando padding general a la vista, similar a UsuariosView.vue

  .view-header {
    margin-bottom: 2rem;

    .header-content {
        padding: 1.5rem 1.5%;
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

        .new-record-btn {
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
    padding: 0 0 1rem 0; // Padding del contenido, replicando UsuariosView.vue
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
  .generic-crud-view {
    .view-header .header-content {
      text-align: center;
      padding: 0.5rem;

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