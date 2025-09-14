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
  }
});

const emit = defineEmits(['edit', 'delete', 'request']);
const $q = useQuasar();

// Paginación local
const localPagination = ref({
  ...props.pagination
});

// Actualizar paginación local cuando cambia la prop
watch(() => props.pagination, (newVal) => {
  localPagination.value = { ...newVal };
}, { deep: true });

// Métodos
const updateRowsPerPage = (value) => {
  localPagination.value.rowsPerPage = value;
  localPagination.value.page = 1;
  emit('request', { pagination: localPagination.value });
};

const goToPage = (page) => {
  localPagination.value.page = page;
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
  <div class="empresas-tarjetas">
    <!-- Loading Skeletons -->
    <div v-if="loading" class="loading-container">
      <div class="row q-col-gutter-md">
        <div 
          v-for="i in 6" 
          :key="i" 
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="skeleton-card">
            <q-card-section>
              <div class="row items-center q-gutter-md">
                <q-skeleton type="QAvatar" size="60px" />
                <div class="col">
                  <q-skeleton type="text" width="80%" />
                  <q-skeleton type="text" width="60%" />
                </div>
              </div>
            </q-card-section>
            <q-card-section>
              <q-skeleton type="text" />
              <q-skeleton type="text" width="70%" />
            </q-card-section>
            <q-card-actions>
              <q-skeleton type="QBtn" />
              <q-skeleton type="QBtn" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div v-else class="row q-col-gutter-md">
      <div
        v-for="empresa in empresas"
        :key="empresa.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="empresa-card">
          <!-- Header con gradiente -->
          <div class="card-header">
            <div class="header-gradient"></div>
          </div>

          <!-- Contenido principal -->
          <q-card-section class="card-content">
            <div class="empresa-info">
              <div class="empresa-id">
                ID: {{ empresa.id }}
              </div>
              <div class="empresa-name-section">
                <q-avatar 
                  size="32px" 
                  class="empresa-avatar-inline"
                  :style="{ background: `linear-gradient(135deg, ${getAvatarColor(empresa.nombre)}, ${getAvatarColor(empresa.nombre)}dd)` }"
                >
                  <div class="avatar-text">
                    {{ getInitials(empresa.nombre) }}
                  </div>
                </q-avatar>
                <div class="empresa-name">
                  {{ empresa.nombre || 'Sin nombre' }}
                </div>
              </div>
            </div>

            <div class="empresa-details">
              <div class="info-item">
                <q-icon name="business" class="info-icon empresa-icon" />
                <span class="info-text">{{ empresa.empresa }}</span>
              </div>
              
              <div class="info-item">
                <q-icon name="badge" class="info-icon nit-icon" />
                <span class="info-text">{{ empresa.nit }}-{{ empresa.dg_verifica }}</span>
              </div>
              
              <div class="info-item">
                <q-icon name="location_city" class="info-icon ciudad-icon" />
                <span class="info-text">{{ empresa.ciudad }}</span>
              </div>
              
              <div class="info-item">
                <q-icon name="phone" class="info-icon phone-icon" />
                <span class="info-text">{{ empresa.telefono }}</span>
              </div>
              
              <div class="info-item">
                <q-icon name="email" class="info-icon email-icon" />
                <span class="info-text">{{ empresa.correo }}</span>
              </div>
            </div>
          </q-card-section>

          <!-- Acciones -->
          <q-card-actions class="card-actions">
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              class="action-btn edit-btn"
              @click="handleEdit(empresa)"
            >
              <q-tooltip>Editar Empresa</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              class="action-btn delete-btn"
              @click="handleDelete(empresa.id)"
            >
              <q-tooltip>Eliminar Empresa</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination-wrapper q-mt-md">
      <q-card class="pagination-card">
        <q-card-section class="pagination-section">
          <!-- Pagination Controls -->
          <div class="pagination-controls">
            <!-- Pagination Info -->
            <div class="pagination-info">
              <div class="info-text">
                Mostrando {{ ((pagination.page - 1) * pagination.rowsPerPage) + 1 }}-{{ Math.min(pagination.page * pagination.rowsPerPage, pagination.rowsNumber) }} de {{ pagination.rowsNumber }} empresas
              </div>
            </div>
            
            <!-- Rows per page selector -->
            <div class="rows-per-page">
              <span class="rows-label">Filas por página:</span>
              <q-select
                :model-value="pagination.rowsPerPage"
                :options="[5, 10, 15, 20, 25]"
                dense
                outlined
                class="rows-select"
                @update:model-value="updateRowsPerPage"
              />
            </div>
            
            <!-- Page navigation -->
            <div class="page-navigation">
              <q-btn
                flat
                round
                dense
                icon="first_page"
                class="nav-btn"
                :class="{ disabled: pagination.page === 1 }"
                :disable="pagination.page === 1"
                @click="goToPage(1)"
              >
                <q-tooltip>Primera página</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                round
                dense
                icon="chevron_left"
                class="nav-btn"
                :class="{ disabled: pagination.page === 1 }"
                :disable="pagination.page === 1"
                @click="goToPage(pagination.page - 1)"
              >
                <q-tooltip>Página anterior</q-tooltip>
              </q-btn>
              
              <div class="page-indicator">
                <span class="current-page">{{ pagination.page }}</span>
                <span class="page-separator">/</span>
                <span class="total-pages">{{ Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) || 1 }}</span>
              </div>
              
              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                class="nav-btn"
                :class="{ disabled: pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) }"
                :disable="pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                @click="goToPage(pagination.page + 1)"
              >
                <q-tooltip>Página siguiente</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                round
                dense
                icon="last_page"
                class="nav-btn"
                :class="{ disabled: pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) }"
                :disable="pagination.page >= Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
                @click="goToPage(Math.ceil(pagination.rowsNumber / pagination.rowsPerPage))"
              >
                <q-tooltip>Última página</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empresas-tarjetas {
  .loading-container {
    .skeleton-card {
      border-radius: 20px;
      height: 280px;
    }
  }

  .empresa-card {
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);

    &:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      border: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #f093fb, #f5576c, #667eea, #764ba2) border-box;

      .card-header .header-gradient {
        background: linear-gradient(135deg, #f093fb, #f5576c, #20c997, #fd7e14);
      }

      .empresa-avatar {
        transform: scale(1.1);
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      }

      .action-btn {
        transform: translateY(-2px);
      }
    }

    .card-header {
      position: relative;
      padding: 0;
      height: 4px;

      .header-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #20c997, #fd7e14);
        transition: all 0.3s ease;
      }
    }

    .card-content {
      padding: 1.5rem;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 0.75rem 1.5rem 1.5rem;
      
      .action-btn {
        margin-left: 0.5rem;
        transition: all 0.3s ease;
        
        &.edit-btn {
          background: rgba(102, 126, 234, 0.1);
          
          &:hover {
            background: rgba(102, 126, 234, 0.2);
          }
        }
        
        &.delete-btn {
          background: rgba(239, 68, 68, 0.1);
          
          &:hover {
            background: rgba(239, 68, 68, 0.2);
          }
        }
      }
    }

    .empresa-info {
      margin-bottom: 1.5rem;
      
      .empresa-id {
        display: inline-block;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.8rem;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        margin-bottom: 0.75rem;
      }

      .empresa-name-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .empresa-avatar-inline {
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          flex-shrink: 0;

          .avatar-text {
            font-weight: 700;
            font-size: 0.9rem;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
        }
      }

      .empresa-name {
        font-size: 1.3rem;
        font-weight: 700;
        color: #2c3e50;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        flex: 1;
      }
    }

    .empresa-details {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
        padding: 0.5rem;
        border-radius: 10px;
        background: rgba(102, 126, 234, 0.05);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateX(4px);
        }

        .info-icon {
          margin-right: 0.75rem;
          font-size: 1.2rem;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));

          &.empresa-icon {
            color: #6366f1;
          }

          &.nit-icon {
            color: #f59e0b;
          }

          &.ciudad-icon {
            color: #10b981;
          }

          &.phone-icon {
            color: #6f42c1;
          }

          &.email-icon {
            color: #fd7e14;
          }
        }

        .info-text {
          font-size: 0.95rem;
          color: #4b5563;
          font-weight: 500;
        }
      }
    }
  }

  .pagination-wrapper {
    margin-top: 2rem;
    
    .pagination-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      
      .pagination-section {
        padding: 1rem;
      }
      
      .pagination-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        
        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .pagination-info {
          .info-text {
            font-size: 0.9rem;
            color: #64748b;
          }
        }
        
        .rows-per-page {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          
          .rows-label {
            font-size: 0.9rem;
            color: #64748b;
          }
          
          .rows-select {
            width: 80px;
            
            :deep(.q-field__control) {
              border-radius: 8px;
            }
          }
        }
        
        .page-navigation {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          
          .nav-btn {
            transition: all 0.3s ease;
            
            &:hover:not(.disabled) {
              background: rgba(102, 126, 234, 0.1);
              transform: translateY(-2px);
            }
            
            &.disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
          
          .page-indicator {
            margin: 0 0.5rem;
            font-size: 0.9rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            
            .current-page {
              font-weight: 700;
              color: #334155;
              background: rgba(102, 126, 234, 0.1);
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
            }
            
            .page-separator {
              margin: 0 0.25rem;
            }
          }
        }
      }
    }
  }
}
</style>