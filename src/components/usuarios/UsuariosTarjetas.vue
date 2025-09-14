<script setup lang="ts">
// Props para las tarjetas
const props = defineProps<{
  usuarios: any[];
  loading?: boolean;
  pagination?: any;
}>();

const emit = defineEmits<{
  (e: 'edit', usuario: any): void;
  (e: 'delete', id: number): void;
  (e: 'request', props: any): void;
}>();

// Métodos
const handleEdit = (usuario: any) => {
  emit('edit', usuario);
};

const handleDelete = (id: number) => {
  emit('delete', id);
};

// Pagination methods
const updateRowsPerPage = (newRowsPerPage: number) => {
  const newPagination = {
    ...props.pagination,
    page: 1,
    rowsPerPage: newRowsPerPage
  };
  emit('request', { pagination: newPagination });
};

const goToPage = (page: number) => {
  const newPagination = {
    ...props.pagination,
    page: page
  };
  emit('request', { pagination: newPagination });
};
// Función para obtener las iniciales del nombre
const getInitials = (nombre: string) => {
  if (!nombre) return 'U';
  return nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

// Función para generar color del avatar basado en el nombre
const getAvatarColor = (nombre: string) => {
  if (!nombre) return '#667eea';
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#20c997', '#fd7e14', '#6f42c1', '#e83e8c',
    '#17a2b8', '#28a745', '#ffc107', '#dc3545'
  ];
  const index = nombre.length % colors.length;
  return colors[index];
};
</script>

<template>
  <div class="usuarios-tarjetas">
    <!-- Loading State -->
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
        v-for="usuario in usuarios"
        :key="usuario.id"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >
        <q-card class="usuario-card">
          <!-- Header con gradiente -->
      

          <!-- Contenido principal -->
          <q-card-section class="card-content">
            <div class="user-info">
              <div class="user-id">
                ID: {{ usuario.id }}
              </div>
              <div class="user-name-section">
                <q-avatar 
                  size="32px" 
                  class="user-avatar-inline"
                  :style="{ background: `linear-gradient(135deg, ${getAvatarColor(usuario.nombre)}, ${getAvatarColor(usuario.nombre)}dd)` }"
                >
                  <div class="avatar-text">
                    {{ getInitials(usuario.nombre) }}
                  </div>
                </q-avatar>
                <div class="user-name">
                  {{ usuario.nombre || 'Sin nombre' }}
                </div>
              </div>
            </div>

            <div class="contact-info">
              <div class="info-item">
                <q-icon name="email" class="info-icon email-icon" />
                <span class="info-text">{{ usuario.email }}</span>
              </div>
              
              <div class="info-item" v-if="usuario.telefono">
                <q-icon name="phone" class="info-icon phone-icon" />
                <span class="info-text">{{ usuario.telefono }}</span>
              </div>
              
              <div class="info-item" v-else>
                <q-icon name="phone_disabled" class="info-icon phone-disabled-icon" />
                <span class="info-text no-phone">Sin teléfono</span>
              </div>
            </div>
          </q-card-section>

          <!-- Acciones -->
          <q-card-actions class="card-actions">
            <q-btn
              flat
              color="primary"
              icon="edit"
              label="Editar"
              class="action-btn edit-btn"
              @click="handleEdit(usuario)"
            />
            <q-space />
            <q-btn
              flat
              color="negative"
              icon="delete"
              label="Eliminar"
              class="action-btn delete-btn"
              @click="handleDelete(usuario.id)"
            />
          </q-card-actions>

          <!-- Decoración inferior -->
          <div class="card-footer-decoration"></div>
        </q-card>
      </div>

      <!-- Empty State -->
      <div v-if="usuarios.length === 0" class="col-12">
        <q-card class="empty-state-card">
          <q-card-section class="text-center q-pa-xl">
            <div class="empty-state-content">
              <q-icon name="people_outline" size="80px" class="empty-icon" />
              <div class="empty-title">No hay usuarios disponibles</div>
              <div class="empty-subtitle">
                Los usuarios aparecerán aquí cuando estén disponibles
              </div>
              <div class="empty-decoration">
                <div class="decoration-dot"></div>
                <div class="decoration-dot"></div>
                <div class="decoration-dot"></div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Pagination Section -->
    <div class="pagination-container">
      <q-card class="pagination-card">
        <q-card-section class="pagination-section">
          <!-- Pagination Controls -->
          <div class="pagination-controls">
            <!-- Pagination Info -->
            <div class="pagination-info">
              <div class="info-text">
                Mostrando {{ ((pagination.page - 1) * pagination.rowsPerPage) + 1 }}-{{ Math.min(pagination.page * pagination.rowsPerPage, pagination.rowsNumber) }} de {{ pagination.rowsNumber }} usuarios
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
              
              <div class="page-info">
                <span class="current-page">{{ pagination.page }}</span>
                <span class="page-separator">de</span>
                <span class="total-pages">{{ Math.ceil(pagination.rowsNumber / pagination.rowsPerPage) }}</span>
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
.usuarios-tarjetas {
  .tarjetas-controls {
    .controls-card {
      border-radius: 12px;
      border: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      
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
  }
  
  .loading-container {
    .skeleton-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      height: 280px;
    }
  }

  .usuario-card {
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

      .user-avatar {
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
      height: 100px;

      .header-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #20c997, #fd7e14);
        transition: all 0.3s ease;
      }

      .user-avatar-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.5rem 1.5rem 1rem;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));

        .user-avatar {
          border: 3px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

          .avatar-text {
            font-weight: 700;
            font-size: 1.2rem;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
        }

        .status-badge {
          .status-chip {
            font-weight: 600;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            animation: pulse 3s infinite;

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
      }
    }

    .card-content {
      padding: 1.5rem;
      flex-grow: 1;

      .user-info {
        margin-bottom: 1.5rem;

        .user-id {
          font-size: 0.85rem;
          color: #6c757d;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          display: inline-block;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          margin-bottom: 0.75rem;
        }

        .user-name-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .user-avatar-inline {
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

        .user-name {
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

      .contact-info {
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

            &.email-icon {
              color: #fd7e14;
            }

            &.phone-icon {
              color: #6f42c1;
            }

            &.phone-disabled-icon {
              color: #6c757d;
            }
          }

          .info-text {
            font-size: 0.9rem;
            color: #495057;
            font-weight: 500;
            word-break: break-all;

            &.no-phone {
              color: #6c757d;
              font-style: italic;
            }
          }
        }
      }
    }

    .card-actions {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(240, 147, 251, 0.02));
      border-top: 1px solid rgba(0,0,0,0.05);

      .action-btn {
        border-radius: 10px;
        font-weight: 600;
        padding: 0.5rem 1rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &.edit-btn {
          background: linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(32, 201, 151, 0.1));
          color: #17a2b8;

          &:hover {
            background: linear-gradient(135deg, #17a2b8, #20c997);
            color: white;
            box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
          }
        }

        &.delete-btn {
          background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(232, 62, 140, 0.1));
          color: #dc3545;

          &:hover {
            background: linear-gradient(135deg, #dc3545, #e83e8c);
            color: white;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
          }
        }
      }
    }

    .card-footer-decoration {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
    }
  }

  .empty-state-card {
    border-radius: 20px;
    border: 2px dashed #dee2e6;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.02), rgba(240, 147, 251, 0.02));

    .empty-state-content {
      .empty-icon {
        color: #dee2e6;
        margin-bottom: 1.5rem;
        animation: float 3s ease-in-out infinite;
      }

      .empty-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #6c757d;
        margin-bottom: 0.5rem;
      }

      .empty-subtitle {
        font-size: 1rem;
        color: #adb5bd;
        margin-bottom: 2rem;
      }

      .empty-decoration {
        display: flex;
        justify-content: center;
        gap: 0.5rem;

        .decoration-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          animation: bounce 1.5s ease-in-out infinite;

          &:nth-child(2) {
            animation-delay: 0.2s;
          }

          &:nth-child(3) {
            animation-delay: 0.4s;
          }
        }
      }
    }
  }

  .pagination-container {
    margin-top: 2rem;
    
    .pagination-card {
      border-radius: 16px;
      border: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      
      .pagination-section {
        padding: 1rem 1.5rem;
        
        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          
          @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
          }
          
          .pagination-info {
            margin-bottom: 1rem;
            text-align: center;
            
            .info-text {
              font-size: 0.9rem;
              color: #6c757d;
              font-weight: 500;
            }
          }
          
          .rows-per-page {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            .rows-label {
              font-size: 0.9rem;
              color: #495057;
              font-weight: 500;
              white-space: nowrap;
            }
            
            .rows-select {
              min-width: 80px;
              
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
            }
          }
          
          .page-navigation {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            .nav-btn {
              width: 36px;
              height: 36px;
              border-radius: 8px;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(240, 147, 251, 0.1));
              color: #667eea;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              
              &:hover:not(.disabled) {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
              }
              
              &.disabled {
                opacity: 0.4;
                cursor: not-allowed;
              }
            }
            
            .page-info {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin: 0 1rem;
              padding: 0.5rem 1rem;
              border-radius: 12px;
              background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(240, 147, 251, 0.05));
              border: 1px solid rgba(102, 126, 234, 0.2);
              
              .current-page {
                font-weight: 700;
                color: #667eea;
                font-size: 1rem;
              }
              
              .page-separator {
                font-size: 0.8rem;
                color: #6c757d;
                font-weight: 500;
              }
              
              .total-pages {
                font-weight: 600;
                color: #495057;
                font-size: 0.9rem;
              }
            }
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@media (max-width: 768px) {
  .usuarios-tarjetas {
    .usuario-card {
      &:hover {
        transform: translateY(-4px) scale(1.01);
      }

      .card-content {
        padding: 1rem;

        .contact-info .info-item .info-text {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>