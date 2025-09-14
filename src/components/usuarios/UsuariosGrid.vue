<script setup lang="ts">
import { ref, computed } from 'vue';

// Props para la tabla/grid
const props = defineProps<{
  usuarios: any[];
  loading?: boolean;
  pagination?: any;
  filters?: any;
}>();

const emit = defineEmits<{
  (e: 'edit', usuario: any): void;
  (e: 'delete', id: number): void;
  (e: 'request', props: any): void;
  (e: 'filter-change', filters: any): void;
}>();

// Filtros locales
const localFilters = ref({
  nombre: '',
  email: '',
  telefono: '',
  activo: undefined
});

// Columnas de la tabla
const columns = [
  { 
    name: 'id', 
    label: 'ID', 
    field: 'id', 
    sortable: true, 
    align: 'left',
    style: 'width: 80px'
  },
  { 
    name: 'nombre', 
    label: 'Nombre', 
    field: 'nombre', 
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'email', 
    label: 'Email', 
    field: 'email', 
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'telefono', 
    label: 'Teléfono', 
    field: 'telefono', 
    sortable: true, 
    align: 'left' 
  },
  { 
    name: 'activo', 
    label: 'Estado', 
    field: 'activo', 
    sortable: true, 
    align: 'center',
    style: 'width: 120px'
  },
  { 
    name: 'actions', 
    label: 'Acciones', 
    field: 'actions', 
    align: 'center',
    style: 'width: 120px'
  }
];

// Métodos
const handleRequest = (props) => {
  emit('request', props);
};

const handleEdit = (usuario) => {
  emit('edit', usuario);
};

const handleDelete = (id) => {
  emit('delete', id);
};

const applyFilters = () => {
  emit('filter-change', { ...localFilters.value });
};

const clearFilters = () => {
  localFilters.value = {
    nombre: '',
    email: '',
    telefono: '',
    activo: undefined
  };
  emit('filter-change', { ...localFilters.value });
};

// Opciones para el select de estado
const estadoOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false }
];
</script>

<template>
  <div class="usuarios-grid">
    <!-- Tabla principal -->
    <q-table
      :rows="usuarios"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @request="handleRequest"
      @update:pagination="val => pagination = val"
      flat
      bordered
      class="usuarios-table-styled"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" class="modern-loading">
          <div class="loading-content">
            <q-spinner-dots size="50px" color="primary" />
            <div class="loading-text">Cargando usuarios...</div>
          </div>
        </q-inner-loading>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props" class="table-header">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :class="`header-${col.name}`"
          >
            <div class="header-content">
              <q-icon 
                v-if="col.name === 'id'" 
                name="tag" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'nombre'" 
                name="person" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'email'" 
                name="email" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'telefono'" 
                name="phone" 
                class="q-mr-xs header-icon" 
              />
              <q-icon 
                v-else-if="col.name === 'activo'" 
                name="toggle_on" 
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
          
          <q-td key="nombre" :props="props" class="cell-nombre">
            <div class="nombre-content">
              <q-avatar size="32px" class="q-mr-sm user-avatar">
                <div class="avatar-text">
                  {{ (props.row.nombre || 'U').charAt(0).toUpperCase() }}
                </div>
              </q-avatar>
              <span class="nombre-text">{{ props.row.nombre || 'Sin nombre' }}</span>
            </div>
          </q-td>
          
          <q-td key="email" :props="props" class="cell-email">
            <div class="email-content">
              <q-icon name="email" class="q-mr-xs email-icon" />
              {{ props.row.email }}
            </div>
          </q-td>
          
          <q-td key="telefono" :props="props" class="cell-telefono">
            <div class="telefono-content">
              <q-icon name="phone" class="q-mr-xs phone-icon" />
              {{ props.row.telefono || 'No especificado' }}
            </div>
          </q-td>
          
          <q-td key="activo" :props="props" class="cell-activo">
            <q-chip
              :color="props.row.activo ? 'positive' : 'negative'"
              text-color="white"
              :label="props.row.activo ? 'Activo' : 'Inactivo'"
              size="sm"
              class="status-chip"
            >
              <template v-slot:avatar>
                <q-icon 
                  :name="props.row.activo ? 'check_circle' : 'cancel'" 
                  class="chip-icon"
                />
              </template>
            </q-chip>
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
                <q-tooltip>Editar Usuario</q-tooltip>
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
                <q-tooltip>Eliminar Usuario</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-lg no-data-container">
          <div class="no-data-content">
            <q-icon name="people_outline" size="64px" class="no-data-icon" />
            <div class="no-data-title">No hay usuarios disponibles</div>
            <div class="no-data-subtitle">Los usuarios aparecerán aquí cuando estén disponibles</div>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>

<style lang="scss" scoped>
.usuarios-grid {
  .filters-card {
    border-radius: 16px;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);

    .filters-title {
      font-size: 1.1rem;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
    }

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
  
  .view-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .new-user-btn {
      border-radius: 8px;
      font-weight: 600;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

      &:hover {
        background: linear-gradient(135deg, #764ba2, #f093fb);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
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
  .usuarios-grid {
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