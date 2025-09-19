<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useGenericStore } from '../../stores/useGenericStore';

const props = defineProps<{
  tableName: string;
  gridColumns: Array<{
    name: string;
    label: string;
    field: string | ((row: any) => any);
    align?: 'left' | 'right' | 'center';
    sortable?: boolean;
  }>;
  title: string;
  dialogTitle: string;
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    default?: any;
    icon?: string;
    maxLength?: number;
    options?: Array<{ label: string; value: any }>;
  }>;
}>();

const emit = defineEmits<{
  (e: 'edit', record: any): void;
  (e: 'delete', record: any): void;
}>();

const $q = useQuasar();
const genericStore = useGenericStore();

const records = ref<any[]>([]);
const loading = ref(false);
const filter = ref('');
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const fetchRecords = async (currentFilter: string = filter.value) => {
  loading.value = true;
  try {
    await genericStore.fetchRecords(props.tableName, currentFilter);
    // records.value = genericStore.records[props.tableName] || []; // Eliminamos esta línea
    pagination.value.rowsNumber = genericStore.records[props.tableName]?.length || 0;
    return genericStore.records[props.tableName] || []; // Retornamos directamente los registros del store
  } catch (error) {
    console.error('Error fetching records:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los registros',
      position: 'top'
    });
    return [];
  } finally {
    loading.value = false;
  }
};

const onRequest = async (requestProps: any) => {
  const { page, rowsPerPage, sortBy, descending } = requestProps.pagination;
  loading.value = true;

  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;

  await fetchRecords();
  loading.value = false;
};

const editRecord = (record: any) => {
  emit('edit', record);
};

const deleteRecord = (record: any) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el registro con ID: ${record.id}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    loading.value = true;
    try {
      const success = await genericStore.deleteRecord(props.tableName, record.id);
      if (success) {
        $q.notify({
          type: 'positive',
          message: 'Registro eliminado correctamente',
          position: 'top',
          timeout: 2000
        });
        await fetchRecords();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || error.message || 'Error al eliminar registro',
        position: 'top'
      });
    } finally {
      loading.value = false;
    }
  });
};

onMounted(() => {
  fetchRecords();
});

watch(() => props.tableName, () => {
  fetchRecords();
});

// Añadimos un watcher para que records.value reaccione a los cambios en genericStore.records[props.tableName]
watch(() => genericStore.records[props.tableName], (newRecords) => {
  records.value = newRecords || [];
  pagination.value.rowsNumber = newRecords?.length || 0;
}, { deep: true });

defineExpose({
  fetchRecords
});
</script>

<template>
  <div class="generic-grid">
    <q-card class="grid-card">
      <q-card-section class="grid-header">
        <div class="header-content">
          <div class="grid-title">
            {{ title }}
          </div>
          <q-space />

        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          :rows="records"
          :columns="gridColumns"
          row-key="codigo"
          v-model:pagination="pagination"
          :loading="loading"
          :filter="filter"
          @request="onRequest"
          binary-state-sort
          flat
          bordered
         
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="edit" flat round dense @click="editRecord(props.row)" color="teal" />
              <q-btn icon="delete" flat round dense @click="confirmDeleteRecord(props.row)" color="red" />
            </q-td>
          </template>

           <template v-slot:body-cell-codigo="props">
             <q-td :props="props">
               <div class="id-badge">
                 <q-icon name="tag" class="q-mr-xs" color="purple" size="sm" />
                 {{ props.row.codigo }}
               </div>
             </q-td>
           </template>

           <template v-slot:body-cell-nombre="props">
             <q-td :props="props">
               <div class="nombre-content">
                 <q-icon name="person" class="q-mr-xs" color="blue" size="sm" />
                 {{ props.row.nombre }}
               </div>
             </q-td>
           </template>

           <template v-slot:body-cell-abreviado="props">
             <q-td :props="props">
               <div class="abreviado-content">
                 <q-icon name="filter_list" class="q-mr-xs" color="orange" size="sm" />
                 {{ props.row.abreviado }}
               </div>
             </q-td>
           </template>

           <template v-slot:body-cell-email="props">
             <q-td :props="props">
               <div class="email-content">
                 <q-icon name="email" class="q-mr-xs" color="blue" size="sm" />
                 {{ props.row.email }}
               </div>
             </q-td>
           </template>

           <template v-slot:body-cell-telefono="props">
             <q-td :props="props">
               <div class="telefono-content">
                 <q-icon name="phone" class="q-mr-xs" color="green" size="sm" />
                 {{ props.row.telefono }}
               </div>
             </q-td>
           </template>

           <template v-slot:body-cell-activo="props">
             <q-td :props="props">
               <q-chip
                 :color="props.row.activo ? 'positive' : 'grey'"
                 text-color="white"
                 :label="props.row.activo ? 'Activo' : 'Inactivo'"
                 size="sm"
                 class="status-chip"
               >
                 <template v-slot:avatar>
                   <q-icon
                     :name="props.row.activo ? 'check_circle' : 'cancel'"
                     class="chip-icon"
                     size="sm"
                   />
                 </template>
               </q-chip>
             </q-td>
           </template>
         </q-table>
       </q-card-section>
     </q-card>
   </div>
</template>

<style lang="scss" scoped>
.generic-grid {
  .grid-card {
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  .grid-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-content {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .grid-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      margin: 0;
    }

    .search-input {
      width: 250px;
      .q-field__control {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 6px;
      }
      .q-field__native, .q-field__input {
        color: white;
      }
      .q-icon {
        color: white;
      }
      .q-placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .usuarios-table-styled {
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);

    // Barra superior colorida
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #20c997, #fd7e14);
      z-index: 10;
    }

    :deep(.q-table__top) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .table-header {
      background: #e3f2fd;
      
      .q-th {
        color: #1565c0;
        font-weight: 700;
        font-size: 0.9rem;
        padding: 1rem 0.75rem;
        text-shadow: none;
        border-bottom: 3px solid rgba(255,255,255,0.3);
        position: relative;

        background: #e3f2fd;

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon {
          color: #1976d2;
        }
      }
    }

    .table-row {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;

      &:nth-child(even) {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(118, 75, 162, 0.02));
      }

      &:nth-child(odd) {
        background: linear-gradient(135deg, rgba(240, 147, 251, 0.02), rgba(245, 87, 108, 0.02));
      }

      &:hover {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));
        border-left: 4px solid #667eea;
        border-right: 4px solid #f093fb;
      }

      .q-td {
        padding: 1rem 0.75rem;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        vertical-align: middle;

        &.cell-id {
          .id-badge {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-weight: 800;
            font-size: 0.8rem;
            text-align: center;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
        }

        &.cell-nombre {
          .nombre-content {
            display: flex;
            align-items: center;

            .user-avatar {
              background: linear-gradient(135deg, #20c997, #17a2b8);
              color: white;
              font-weight: 700;
              box-shadow: 0 2px 8px rgba(32, 201, 151, 0.3);

              .avatar-text {
                font-size: 0.9rem;
              }
            }

            .nombre-text {
              font-weight: 600;
              color: #2c3e50;
            }
          }
        }

        &.cell-email {
          .email-content {
            display: flex;
            align-items: center;
            color: #495057;

            .email-icon {
              color: #fd7e14;
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
            }
          }
        }

        &.cell-telefono {
          .telefono-content {
            display: flex;
            align-items: center;
            color: #495057;

            .phone-icon {
              color: #6f42c1;
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
            }
          }
        }

        &.cell-activo {
          .status-chip {
            font-weight: 600;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: pulse 2s infinite;

            .chip-icon {
              filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            }

            &.bg-positive {
              background: linear-gradient(135deg, #28a745, #20c997) !important;
            }

            &.bg-negative {
              background: linear-gradient(135deg, #dc3545, #e83e8c) !important;
            }
          }
        }

        &.cell-actions {
          .actions-container {
            display: flex;
            gap: 0.5rem;
            justify-content: center;

            .action-btn {
              width: 32px;
              height: 32px;
              border-radius: 8px;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              margin: 0 2px;
             background: #f5f5f5;
             color: #666;

              &.edit-btn {

                &:hover {
                 background: #e0e0e0;
                  transform: scale(1.1) rotate(5deg);
                 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                 color: #1976d2;
                }
              }

              &.delete-btn {

                &:hover {
                 background: #e0e0e0;
                  transform: scale(1.1) rotate(-5deg);
                 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                 color: #d32f2f;
                }
              }
            }
          }
        }
      }
    }

    .modern-loading {
      backdrop-filter: blur(8px);
      background: rgba(255,255,255,0.9);

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;

        .loading-text {
          font-weight: 600;
          color: #667eea;
          font-size: 1.1rem;
        }
      }
    }

    .no-data-container {
      .no-data-content {
        text-align: center;
        color: #6c757d;

        .no-data-icon {
          color: #dee2e6;
          margin-bottom: 1rem;
        }

        .no-data-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .no-data-subtitle {
          font-size: 0.9rem;
          opacity: 0.8;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@media (max-width: 768px) {
  .generic-grid {
    .usuarios-table-styled {
      .table-row {
        &:hover {
          transform: none;
          scale: none;
        }
      }
    }
  }
}
</style>