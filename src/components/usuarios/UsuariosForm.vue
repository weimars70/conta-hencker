<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useUsuariosStore } from '../../stores/useUsuariosStore';

// Props y emits para el formulario
const props = defineProps<{
  editMode?: boolean;
  initialData?: any;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancelled'): void;
}>();

const usuariosStore = useUsuariosStore();
const $q = useQuasar();
const loading = ref(false);

// Datos del formulario
const formData = ref({
  id: null,
  nombre: '',
  email: '',
  telefono: '',
  clave: '',
  activo: true
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
    nombre: '',
    email: '',
    telefono: '',
    clave: '',
    activo: true
  };
};

const saveUsuario = async () => {
  try {
    loading.value = true;
    const success = await usuariosStore.guardar({
      ...formData.value,
      clave: formData.value.clave // Asegurar que la contraseña se envíe
    });
    
    if (success) {
      emit('saved');
      if (!props.editMode) {
        resetForm();
      }
    }
  } catch (error) {
    console.error('Error saving usuario:', error);
    // Mostrar error específico
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message || 'Error al guardar usuario'
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
  <div class="usuarios-form">
    <q-card>
      <q-card-section>
        <div class="form-title">
          {{ editMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="saveUsuario" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.nombre"
                label="Nombre"
                outlined
                dense
                class="modern-input"
                :rules="[val => !!val || 'Campo requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.email"
                label="Email"
                type="email"
                outlined
                dense
                class="modern-input"
                :rules="[
                  val => !!val || 'Campo requerido',
                  val => /.+@.+\..+/.test(val) || 'Email inválido'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.telefono"
                label="Teléfono"
                outlined
                dense
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.clave"
                label="Contraseña"
                type="password"
                outlined
                dense
                class="modern-input"
                :rules="!editMode ? [val => !!val || 'Campo requerido'] : []"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="primary" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12">
              <q-checkbox
                v-model="formData.activo"
                label="Usuario activo"
                color="primary"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey"
          @click="cancel"
          :disable="loading"
        />
        <q-btn
          :label="editMode ? 'Actualizar' : 'Crear'"
          color="primary"
          :loading="loading"
          @click="saveUsuario"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<style lang="scss" scoped>
.usuarios-form {
  .form-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .modern-input {
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

    :deep(.q-icon) {
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
    }
  }

  .q-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c) border-box;
  }

  .q-btn {
    border-radius: 8px;
    font-weight: 600;
    padding: 8px 24px;
    transition: all 0.3s ease;

    &.q-btn--flat {
      &:hover {
        background: rgba(158, 158, 158, 0.1);
        transform: translateY(-1px);
      }
    }

    &:not(.q-btn--flat) {
      background: linear-gradient(135deg, #667eea, #764ba2);
      
      &:hover {
        background: linear-gradient(135deg, #764ba2, #f093fb);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
      }
    }
  }
}
</style>