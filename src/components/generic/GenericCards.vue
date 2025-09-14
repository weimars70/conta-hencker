<template>
  <div class="generic-cards-container">
    <q-card v-for="record in records" :key="record.id" class="q-mb-md generic-card">
      <!-- Header con gradiente -->
      <div class="card-header">
        <div class="header-gradient"></div>
      </div>

      <!-- Contenido principal -->
      <q-card-section class="card-content">
        <div class="record-info">
        
          <div class="record-name-section">
            <q-avatar 
              size="32px" 
              class="record-avatar-inline"
              :style="{ background: `linear-gradient(135deg, ${getAvatarColor(getCardTitle(record))}, ${getAvatarColor(getCardTitle(record))}dd)` }"
            >
              <div class="avatar-text">
                {{ getInitials(getCardTitle(record)) }}
              </div>
            </q-avatar>
            <div class="record-name">
              {{ getCardTitle(record) || 'Sin nombre' }}
            </div>
          </div>
        </div>

        <div v-for="column in visibleColumns" :key="column.name" class="q-mb-sm">
          <span class="text-weight-bold">{{ column.label || column.name }}: </span>
          <span>{{ getColumnValue(record, column) }}</span>
        </div>
      </q-card-section>

      <!-- Acciones -->
      <q-card-actions class="card-actions">
        <q-btn flat color="primary" icon="edit" label="Editar" class="action-btn edit-btn" @click="editRecord(record)" />
        <q-space />
        <q-btn flat color="negative" icon="delete" label="Eliminar" class="action-btn delete-btn" @click="deleteRecord(record.id)" />
      </q-card-actions>

      <!-- Decoración inferior -->
      <div class="card-footer-decoration"></div>
    </q-card>
    <div v-if="records.length === 0" class="no-records-message">
      No hay registros para mostrar.
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  tableName: { type: String, required: true },
  gridColumns: { type: Array, required: true },
  title: { type: String, required: true },
  dialogTitle: { type: String, required: true },
  formFields: { type: Array, required: true },
  records: { type: Array, required: true },
});

console.log('GenericCards received props.gridColumns:', props.gridColumns); // Add this line

const emit = defineEmits(['edit', 'delete']);

const visibleColumns = computed(() => {
  return props.gridColumns.filter(column => column.name !== 'actions' && column.cardVisible !== false);
});

const getCardTitle = (record: any) => {
  const titleColumn = props.gridColumns.find(col => col.name === 'name' || col.name === 'description' || col.name === 'nombre');
  if (titleColumn) {
    return typeof titleColumn.field === 'function' ? titleColumn.field(record) : record[titleColumn.field];
  }
  return record.id;
};

const getColumnValue = (record: any, column: any) => {
  if (column.field !== undefined) {
    if (typeof column.field === 'function') {
      return column.field(record);
    }
    return record[column.field];
  }
  // Fallback to column.name if column.field is not defined
  if (column.name !== undefined) {
    return record[column.name];
  }
  return ''; // Return empty string if no valid field or name is found
};

const getColumnIcon = (columnName: string) => {
  switch (columnName) {
    case 'email':
      return 'email';
    case 'phone':
    case 'telefono':
      return 'phone';
    case 'address':
      return 'location_on';
    default:
      return 'info';
  }
};

const getInitials = (name: string) => {
  if (!name) return 'G';
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name: string) => {
  if (!name) return '#667eea';
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#20c997', '#fd7e14', '#6f42c1', '#e83e8c',
    '#17a2b8', '#28a745', '#ffc107', '#dc3545'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const editRecord = (record: any) => {
  emit('edit', record);
};

const deleteRecord = (id: string) => {
  emit('delete', id);
};
</script>

<style lang="scss" scoped>
.generic-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.generic-card {
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

    .record-avatar {
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
    flex-grow: 1;

    .record-info {
      margin-bottom: 1.5rem;

      .record-id {
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

      .record-name-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .record-avatar-inline {
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

      .record-name {
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

    .details-info {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #555;

        .info-icon {
          margin-right: 0.5rem;
          color: #667eea;
          font-size: 1.2rem;
          filter: drop-shadow(0 2px 5px rgba(102, 126, 234, 0.2));
        }

        .info-text {
          font-weight: 500;
          word-break: break-all;
        }

        &:hover {
          color: #667eea;
          .info-icon {
            filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4));
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

.no-records-message {
  grid-column: 1 / -1;
  text-align: center;
  color: #888;
  font-size: 1.1rem;
  padding: 2rem;
}

@media (max-width: 768px) {
  .generic-cards-container {
    .generic-card {
      &:hover {
        transform: translateY(-4px) scale(1.01);
      }

      .card-content {
        padding: 1rem;

        .details-info .info-item .info-text {
          font-size: 0.8rem;
        }
      }
    }
  }
}
</style>