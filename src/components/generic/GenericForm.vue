<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useGenericStore } from '../../stores/useGenericStore';

const props = defineProps<{
  editMode?: boolean;
  initialData?: any;
  tableName: string;
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
  title: string;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancelled'): void;
}>();

const genericStore = useGenericStore();
const $q = useQuasar();
const loading = ref(false);
const formSubmitted = ref(false);

const formData = ref<any>({});

const initializeFormData = () => {
  if (props.editMode && props.initialData) {
    formData.value = { ...props.initialData };
    // Ensure 'codigo' is present in formData even if not in formFields
    if (props.initialData.codigo && !formData.value.codigo) {
      formData.value.codigo = props.initialData.codigo;
    }
  } else {
    formData.value = {};
  }
};

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    initializeFormData();
  }
}, { immediate: true });

watch(() => props.formFields, () => {
  initializeFormData();
}, { immediate: true, deep: true });

onMounted(() => {
  initializeFormData();
});

const isFormValid = computed(() => {
  return props.formFields.every(field => {
    if (field.required) {
      const value = formData.value[field.name];
      if (field.type === 'email') {
        const emailPattern = /.+@.+\..+/;
        return !!value && emailPattern.test(value);
      }
      return !!value;
    }
    return true;
  });
});

const resetForm = () => {
  initializeFormData();
  formSubmitted.value = false;
};

const saveRecord = async () => {
  formSubmitted.value = true;
  
  if (!isFormValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos requeridos',
      position: 'top',
      timeout: 2000
    });
    return;
  }
  
  try {
    loading.value = true;
    const payload = { tabla: props.tableName, ...formData.value };
    let success = false;

    console.log('Edit Mode:', props.editMode);
    console.log('Form Data CODIGO:', formData.value.codigo);

    if (props.editMode && formData.value.codigo) {
      success = await genericStore.updateRecord(props.tableName, formData.value.codigo, payload);
    } else {
      success = await genericStore.createRecord(props.tableName, payload);
    }
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: props.editMode ? 'Registro actualizado correctamente' : 'Registro creado correctamente',
        position: 'top',
        timeout: 2000
      });
      emit('saved');
      if (!props.editMode) {
        resetForm();
      }
    }
  } catch (error) {
    console.error('Error saving record:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar registro',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  resetForm();
  emit('cancelled');
};
</script>

<template>
  <div class="generic-form">
    <q-card class="form-card">
      <q-card-section class="form-header">
        <div class="header-content">
          <div class="form-icon">
            <q-icon :name="editMode ? 'edit' : 'add'" size="1.5rem" color="white" />
          </div>
          <div class="form-title">
            {{ title }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="form-content">
        <q-form @submit="saveRecord" class="compact-form">
          <div class="row q-col-gutter-sm">
            <div 
              v-for="field in formFields"
              :key="field.name"
              :class="`col-12 col-sm-6 col-md-4 col-lg-${field.name === 'nombre' ? 3 : 2}`"
            >
              <q-input
                v-if="field.type === 'text' || field.type === 'email' || field.type === 'number'"
                v-model="formData[field.name]"
                :label="field.label"
                :type="field.type"
                outlined
                dense
                :disable="editMode && field.name === 'codigo'"

                class="compact-input blue-border"
                :maxlength="field.maxLength"
                :error="formSubmitted && field.required && (!formData[field.name] || (field.type === 'email' && !/.+@.+\..+/.test(formData[field.name])))"
                :error-message="field.required ? (field.type === 'email' && !formData[field.name] ? 'Requerido' : (field.type === 'email' && !/.+@.+\..+/.test(formData[field.name]) ? 'Email inválido' : 'Requerido')) : ''"
              >
                <template v-slot:prepend v-if="field.icon">
                  <q-icon :name="field.icon" color="primary" size="sm" />
                </template>
              </q-input>

              <q-checkbox
                v-else-if="field.type === 'boolean'"
                v-model="formData[field.name]"
                :label="field.label"
                color="primary"
                class="q-mt-sm"
              />

              <q-select
                v-else-if="field.type === 'select'"
                v-model="formData[field.name]"
                :options="field.options"
                :label="field.label"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && field.required && !formData[field.name]"
                error-message="Requerido"
              >
                <template v-slot:prepend v-if="field.icon">
                  <q-icon :name="field.icon" color="primary" size="sm" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <q-btn
              :label="editMode ? 'Actualizar' : 'Crear Registro'"
              color="primary"
              :loading="loading"
              type="submit"
              icon-right="save"
              class="action-btn"
            />
            <q-btn
              flat
              color="negative"
              label="Cancelar"
              @click="cancel"
              :disable="loading"
              class="action-btn"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.generic-form {
  .form-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .form-header {
    background: linear-gradient(135deg, #4a6cf7 0%, #6a3de8 100%);
    padding: 1rem;
    
    .header-content {
      display: flex;
      align-items: center;
    }
    
    .form-icon {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
    }
    
    .form-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: white;
      margin: 0;
    }
  }
  
  .form-content {
    padding: 1rem;
  }
  
  .compact-form {
    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      margin-top: 1rem;
      padding: 0.25rem 0;
      
      &:first-child {
        margin-top: 0;
      }
      
      .section-title {
        font-size: 1rem;
        font-weight: 600;
        color: #4a6cf7;
        margin-left: 0.5rem;
      }
    }
  }
  
  .compact-input {
    margin-bottom: 0.5rem;
    
    :deep(.q-field__control) {
      border-radius: 6px;
      min-height: 40px;
    }
    
    :deep(.q-field__label) {
      font-weight: 500;
      font-size: 0.875rem;
    }
    
    :deep(.q-field--outlined .q-field__control:hover) {
      border-color: #4a6cf7;
    }
    
    :deep(.q-field--focused .q-field__control) {
      border-color: #4a6cf7;
      box-shadow: 0 0 0 1px rgba(74, 108, 247, 0.2);
    }
    
    :deep(.q-field__prepend) {
      padding-right: 6px;
    }
    
    :deep(.q-field__messages) {
      font-size: 0.75rem;
      min-height: 16px;
    }
  }
  
  .blue-border {
    :deep(.q-field__control) {
      border: 2px solid #4a6cf7 !important;
    }
    
    :deep(.q-field--error .q-field__control) {
      border: 2px solid #C10015 !important;
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem 0 0.5rem 0;
    margin-top: 1rem;
    border-top: 1px solid #e0e0e0;
    
    .action-btn {
      min-width: 120px;
    }
  }
  
  @media (max-width: 768px) {
    .form-header {
      padding: 0.75rem;
      
      .form-icon {
        width: 35px;
        height: 35px;
      }
      
      .form-title {
        font-size: 1.1rem;
      }
    }
    
    .form-content {
      padding: 0.75rem;
    }
    
    .form-actions {
      flex-direction: column;
      align-items: stretch;
      
      .action-btn {
        margin: 0.25rem 0;
      }
    }
  }
}
</style>