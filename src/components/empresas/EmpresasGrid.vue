<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps({
  empresas: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
  },
  filters: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['edit', 'delete', 'request', 'filter-change']);
const $q = useQuasar();

// Columnas para la tabla
const columns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'empresa', label: 'Código', field: 'empresa', sortable: true, align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
  { name: 'nit', label: 'NIT', field: 'nit', sortable: true, align: 'left' },
  { name: 'ciudad', label: 'Ciudad', field: 'ciudad', sortable: true, align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', sortable: true, align: 'left' },
  { name: 'correo', label: 'Correo', field: 'correo', sortable: true, align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
];

// Paginación local
const localPagination = ref({
  ...props.pagination
});

// Actualizar paginación local cuando cambia la prop
watch(() => props.pagination, (newVal) => {
  localPagination.value = { ...newVal };
}, { deep: true });

// Métodos
const handleRequest = (props) => {
  const { page, rowsPerPage } = props.pagination;
  localPagination.value.page = page;
  localPagination.value.rowsPerPage = rowsPerPage;
  emit('request', { pagination: localPagination.value });
};

const handleEdit = (empresa) => {
  emit('edit', empresa);
};

const handleDelete = (id) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Está seguro que desea eliminar esta empresa?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('delete', id);
  });
};

const getAvatarColor = (text) => {
  if (!text) return '#667eea';
  const colors = [
    '#667eea', '#764ba2', '#6B8DD6', '#8E85EE', '#8B5CF6',
    '#D946EF', '#EC4899', '#F87171', '#FB923C', '#FBBF24',
    '#A3E635', '#4ADE80', '#2DD4BF', '#22D3EE', '#60A5FA'
  ];
  const hash = text.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
};

const getInitials = (name) => {
  if (!name) return 'E';
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
</script>

<template>
  <div class="empresas-grid">
    <q-table
      :rows="empresas"
      :columns="columns"
      :loading="loading"
      :pagination="localPagination"
      row-key="id"
      @request="handleRequest"
      binary-state-sort
      flat
      bordered
      class="modern-table"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="50px" color="primary" />
        </q-inner-loading>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props" class="table-header">
          <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-header-cell">
            <div class="header-content">
              <q-icon 
                v-if="col.name === 'id'" 
                name="tag" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'empresa'" 
                name="business" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'nombre'" 
                name="apartment" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'nit'" 
                name="badge" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'ciudad'" 
                name="location_city" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'telefono'" 
                name="phone" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'correo'" 
                name="email" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'actions'" 
                name="settings" 
                class="q-mr-xs header-icon" 
              />
              {{ col.label }}
            </div>
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" class="table-row">
          <q-td key="id" :props="props" class="cell-id">
            <div class="id-badge">
              {{ props.row.id }}
            </div>
          </q-td>
          
          <q-td key="empresa" :props="props" class="cell-empresa">
            <div class="empresa-content">
              <q-icon name="business" class="q-mr-xs empresa-icon" />
              {{ props.row.empresa }}
            </div>
          </q-td>
          
          <q-td key="nombre" :props="props" class="cell-nombre">
            <div class="nombre-content">
              <q-avatar size="32px" class="q-mr-sm empresa-avatar">
                <div class="avatar-text">
                  {{ getInitials(props.row.nombre) }}
                </div>
              </q-avatar>
              <span class="nombre-text">{{ props.row.nombre || 'Sin nombre' }}</span>
            </div>
          </q-td>
          
          <q-td key="nit" :props="props" class="cell-nit">
            <div class="nit-content">
              <q-icon name="badge" class="q-mr-xs nit-icon" />
              {{ props.row.nit }}-{{ props.row.dg_verifica }}
            </div>
          </q-td>
          
          <q-td key="ciudad" :props="props" class="cell-ciudad">
            <div class="ciudad-content">
              <q-icon name="location_city" class="q-mr-xs ciudad-icon" />
              {{ props.row.ciudad || 'No especificada' }}
            </div>
          </q-td>
          
          <q-td key="telefono" :props="props" class="cell-telefono">
            <div class="telefono-content">
              <q-icon name="phone" class="q-mr-xs phone-icon" />
              {{ props.row.telefono || 'No especificado' }}
            </div>
          </q-td>
          
          <q-td key="correo" :props="props" class="cell-correo">
            <div class="correo-content">
              <q-icon name="email" class="q-mr-xs email-icon" />
              {{ props.row.correo || 'No especificado' }}
            </div>
          </q-td>
          
          <q-td key="actions" :props="props" class="cell-actions">
            <div class="actions-container">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                size="sm"
                class="action-btn edit-btn"
                @click="handleEdit(props.row)"
              >
                <q-tooltip>Editar Empresa</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                size="sm"
                class="action-btn delete-btn"
                @click="handleDelete(props.row.id)"
              >
                <q-tooltip>Eliminar Empresa</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-lg no-data-container">
          <div class="no-data-content">
            <q-icon name="business_center" size="64px" class="no-data-icon" />
            <div class="no-data-title">No hay empresas disponibles</div>
            <div class="no-data-subtitle">Las empresas aparecerán aquí cuando estén disponibles</div>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
.empresas-grid {
  .filters-card {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
    
    .filters-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }
    
    .modern-filter-input {
      :deep(.q-field__control) {
        border-radius: 8px;
      }
    }
    
    .clear-filters-btn {
      margin-bottom: 0.5rem;
    }
  }
  
  .modern-table {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    
    :deep(.q-table__top),
    :deep(.q-table__bottom) {
      padding: 16px;
    }
    
    :deep(.q-table__card) {
      border-radius: 16px;
    }
    
    .table-header {
      background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
      
      .table-header-cell {
        padding: 12px 16px;
        font-weight: 600;
        color: #334155;
        
        .header-content {
          display: flex;
          align-items: center;
          
          .header-icon {
            color: #667eea;
            margin-right: 8px;
          }
        }
      }
    }
    
    .table-row {
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: #f8fafc;
      }
      
      &:nth-child(even) {
        background-color: #f9fafb;
      }
      
      &:nth-child(odd) {
        background-color: #ffffff;
      }
      
      &:hover {
        background-color: #f1f5f9;
      }
      
      .cell-id {
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

      .cell-nombre {
        .nombre-content {
          display: flex;
          align-items: center;

          .empresa-avatar {
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

      .cell-empresa {
        .empresa-content {
          display: flex;
          align-items: center;
          color: #495057;

          .empresa-icon {
            color: #6366f1;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
          }
        }
      }

      .cell-nit {
        .nit-content {
          display: flex;
          align-items: center;
          color: #495057;

          .nit-icon {
            color: #f59e0b;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
          }
        }
      }

      .cell-ciudad {
        .ciudad-content {
          display: flex;
          align-items: center;
          color: #495057;

          .ciudad-icon {
            color: #10b981;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
          }
        }
      }

      .cell-telefono {
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

      .cell-correo {
        .correo-content {
          display: flex;
          align-items: center;
          color: #495057;

          .email-icon {
            color: #fd7e14;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
          }
        }
      }

      .cell-actions {
        .actions-container {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          
          .action-btn {
            transition: all 0.3s ease;
            
            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            &.edit-btn:hover {
              color: #4f46e5;
            }
            
            &.delete-btn:hover {
              color: #ef4444;
            }
          }
        }
      }
    }
    
    .no-data-container {
      padding: 3rem 0;
      
      .no-data-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .no-data-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }
        
        .no-data-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        
        .no-data-subtitle {
          color: #94a3b8;
        }
      }
    }
  }
}
</style>