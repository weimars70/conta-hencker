<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useEmpresasStore } from '../../stores/useEmpresasStore';

// Props y emits para el formulario
const props = defineProps<{
  editMode?: boolean;
  initialData?: any;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancelled'): void;
}>();

const empresasStore = useEmpresasStore();
const $q = useQuasar();
const loading = ref(false);
const formSubmitted = ref(false);

// Datos del formulario
const formData = ref({
  id: null,
  empresa: '',
  nombre: '',
  abreviado: '',
  nit: '',
  dg_verifica: '',
  direccion: '',
  telefono: '',
  ciudad: '',
  correo: '',
  niveles: ''
});

// Validación del formulario
const isFormValid = computed(() => {
  const emailPattern = /.+@.+\..+/;
  return !!formData.value.empresa && 
         !!formData.value.nombre && 
         !!formData.value.nit && 
         !!formData.value.dg_verifica &&
         !!formData.value.direccion && 
         !!formData.value.ciudad && 
         !!formData.value.telefono &&
         !!formData.value.correo && 
         emailPattern.test(formData.value.correo) && 
         !!formData.value.niveles;
});

// Watchers
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = { ...newData };
  }
}, { immediate: true });

// Métodos
const resetForm = () => {
  formData.value = {
    id: null,
    empresa: '',
    nombre: '',
    abreviado: '',
    nit: '',
    dg_verifica: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    correo: '',
    niveles: ''
  };
  formSubmitted.value = false;
};

const saveEmpresa = async () => {
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
    const success = await empresasStore.guardar({
      ...formData.value
    });
    
    if (success) {
      $q.notify({
        type: 'positive',
        message: props.editMode ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente',
        position: 'top',
        timeout: 2000
      });
      emit('saved');
      if (!props.editMode) {
        resetForm();
      }
    }
  } catch (error) {
    console.error('Error saving empresa:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar empresa',
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

onMounted(() => {
  if (props.initialData) {
    formData.value = { ...props.initialData };
  }
});
</script>

<template>
  <div class="empresas-form">
    <q-card class="form-card">
      <q-card-section class="form-header">
        <div class="header-content">
          <div class="form-icon">
            <q-icon :name="editMode ? 'edit' : 'add_business'" size="1.5rem" color="white" />
          </div>
          <div class="form-title">
            {{ editMode ? 'Editar Empresa' : 'Nueva Empresa' }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="form-content">
        <q-form @submit="saveEmpresa" class="compact-form">
          
          <!-- Sección: Información Básica -->
          
          <div class="row q-col-gutter-sm">
            <!-- 1. Código Empresa -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-input
                v-model="formData.empresa"
                label="Código Empresa"
                outlined
                dense
                maxlength="10"
                class="compact-input blue-border"
                :error="formSubmitted && !formData.empresa"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <!-- 2. Nombre Empresa -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.nombre"
                label="Nombre Empresa"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && !formData.nombre"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="apartment" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <!-- 3. Abreviado -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.abreviado"
                label="Abreviado"
                outlined
                dense
                class="compact-input blue-border"
              >
                <template v-slot:prepend>
                  <q-icon name="short_text" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <!-- 4. NIT -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-input
                v-model="formData.nit"
                label="NIT"
                outlined
                dense
                maxlength="10"
                class="compact-input blue-border"
                :error="formSubmitted && !formData.nit"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <!-- 5. DV -->
            <div class="col-12 col-sm-6 col-md-4 col-lg-2">
              <q-input
                v-model="formData.dg_verifica"
                label="DV"
                outlined
                dense
                maxlength="10"
                class="compact-input blue-border dv-field"
                :error="formSubmitted && !formData.dg_verifica"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="check_circle" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
          </div>
          
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.direccion"
                label="Dirección"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && !formData.direccion"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="location_on" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.ciudad"
                label="Ciudad"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && !formData.ciudad"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.telefono"
                label="Teléfono"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && !formData.telefono"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
          </div>

          
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.correo"
                label="Correo Electrónico"
                type="email"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && (!formData.correo || !/.+@.+\..+/.test(formData.correo))"
                :error-message="!formData.correo ? 'Requerido' : 'Email inválido'"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <q-input
                v-model="formData.niveles"
                label="Niveles"
                outlined
                dense
                class="compact-input blue-border"
                :error="formSubmitted && !formData.niveles"
                error-message="Requerido"
              >
                <template v-slot:prepend>
                  <q-icon name="layers" color="primary" size="sm" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="form-actions">
            <q-btn
              :label="editMode ? 'Actualizar' : 'Crear Empresa'"
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
.empresas-form {
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
  
  .dv-field {
    :deep(.q-field__control) {
      max-width: 80px;
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
    
    .dv-field {
      :deep(.q-field__control) {
        max-width: 100%;
      }
    }
  }
}
</style>