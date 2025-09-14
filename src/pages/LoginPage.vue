<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { hashPassword } from '../utils/crypto';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const password = ref('');
const email = ref('admin@test.com'); // Pre-llenar para testing
const empresa = ref('');
const loading = ref(false);
const validatingUser = ref(false);
const showEmpresaField = ref(false);
const isPwd = ref(false); // Mostrar contraseña por defecto para debug

const empresas = ref([]);
const userValidated = ref(null);

// Pre-llenar contraseña para testing
password.value = 'Zxcasd16#';

async function validateUser() {
  if (!email.value || !password.value) {
    $q.notify({
      color: 'negative',
      message: 'Por favor ingrese email y contraseña',
      icon: 'warning'
    });
    return;
  }

  try {
    validatingUser.value = true;
    
    // Llamar al backend para validar usuario y obtener empresas
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log('🌐 Intentando conectar a:', `${apiUrl}/auth/login`);
    console.log('📧 Email:', email.value);
    console.log('🔐 Password:', password.value);
    
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    console.log('📡 Respuesta del servidor:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      
      // Si es 401, mostrar información adicional
      if (response.status === 401) {
        console.log('🔍 Error 401 - Credenciales inválidas');
        console.log('🔍 Verificando datos en backend...');
        
        // Hacer una llamada de debug para ver qué hay en la base de datos
        try {
          const debugResponse = await fetch(`${apiUrl}/database/debug/test-login`);
          const debugData = await debugResponse.json();
          console.log('🔍 Debug data:', debugData);
        } catch (debugError) {
          console.log('❌ No se pudo obtener debug data:', debugError);
        }
      }
      
      throw new Error(errorData.message || 'Credenciales inválidas');
    }

    const data = await response.json();
    console.log('✅ Datos recibidos del backend:', data);
    
    // Guardar datos del usuario validado
    userValidated.value = data;
    
    // Mapear empresas para el select
    empresas.value = data.empresas.map(emp => ({
      label: `${emp.empresa} - ${emp.nombre || 'Sin nombre'}`,
      value: emp.empresa,
      data: emp
    }));
    
    console.log('🏢 Empresas mapeadas para select:', empresas.value);
    
    if (empresas.value.length === 0) {
      throw new Error('');
    }
    
    // Si solo tiene una empresa, seleccionarla automáticamente
    if (empresas.value.length === 1) {
      empresa.value = empresas.value[0].value;
    }
    
    showEmpresaField.value = true;
    
    $q.notify({
      color: 'positive',
      message: `Email validado. ${empresas.value.length === 1 ? 'Empresa seleccionada automáticamente.' : 'Seleccione su empresa.'}`,
      icon: 'check'
    });
    
  } catch (error) {
    console.error('❌ Error validando usuario:', error);
    
    // Si es un error de conexión, mostrar mensaje específico
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      $q.notify({
        color: 'negative',
        message: 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.',
        icon: 'error',
        timeout: 5000
      });
    } else {
      $q.notify({
        color: 'negative',
        message: error.message || 'Error al validar usuario',
        icon: 'error'
      });
    }
    $q.notify({
      color: 'negative',
      message: error.message || 'Error al validar usuario',
      icon: 'error'
    });
    resetForm();
  } finally {
    validatingUser.value = false;
  }
}

async function handleLogin() {
  if (!empresa.value) {
    $q.notify({
      color: 'negative',
      message: 'Por favor seleccione una empresa',
      icon: 'warning'
    });
    return;
  }

  try {
    loading.value = true;
    
    // Usar los datos ya validados del backend
    if (!userValidated.value) {
      throw new Error('Datos de usuario no válidos');
    }
    
    // Encontrar la empresa seleccionada
    const selectedEmpresa = empresas.value.find(emp => emp.value === empresa.value);
    
    // Establecer la sesión con los datos del backend
    authStore.setSession(userValidated.value.access_token, {
      ...userValidated.value.user,
      empresa: empresa.value,
      empresaData: selectedEmpresa?.data
    });

    $q.notify({
      color: 'positive',
      message: 'Inicio de sesión exitoso',
      icon: 'check'
    });
    
    await router.push('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    $q.notify({
      color: 'negative',
      message: error.message || 'Ocurrió un error durante el inicio de sesión',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  showEmpresaField.value = false;
  empresa.value = '';
  empresas.value = [];
  userValidated.value = null;
}
</script>

<template>
  <q-page padding class="flex flex-center">
    <q-card class="login-card">
      <q-card-section class="text-center">
        <h4 class="text-h4 q-mb-md">Iniciar Sesión</h4>
      </q-card-section>

      <q-card-section>
        <!-- Formulario inicial: Usuario y Contraseña -->
        <q-form v-if="!showEmpresaField" @submit.prevent="validateUser" class="q-gutter-md">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            :rules="[val => !!val || 'Email es requerido']"
            autocomplete="email"
            inputmode="email"
            :disable="validatingUser"
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="Contraseña"
            outlined
            :type="isPwd ? 'password' : 'text'"
            :rules="[val => !!val || 'Contraseña es requerida']"
            autocomplete="current-password"
            :disable="validatingUser"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Validar Email"
            :loading="validatingUser"
            class="full-width q-mt-md"
          />
        </q-form>

        <!-- Formulario de empresa (se muestra después de validar usuario) -->
        <div v-else>
          <!-- Información del usuario validado -->
          <q-card flat bordered class="q-mb-md bg-green-1">
            <q-card-section class="q-pa-sm">
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                <div>
                  <div class="text-subtitle2">Email: {{ email }}</div>
                  <div class="text-caption text-positive">Validado correctamente</div>
                </div>
                <q-space />
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  color="primary"
                  @click="resetForm"
                  size="sm"
                >
                  <q-tooltip>Cambiar email</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>

          <!-- Selección de empresa -->
          <q-form @submit.prevent="handleLogin" class="q-gutter-md">
            <q-select
              v-model="empresa"
              :options="empresas"
              label="Seleccione su empresa"
              outlined
              option-value="value"
              option-label="label"
              emit-value
              map-options
              :rules="[val => !!val || 'Empresa es requerida']"
              autofocus
            >
              <template v-slot:prepend>
                <q-icon name="business" />
              </template>
            </q-select>

            <div class="row q-gutter-sm">
              <q-btn
                label="Volver"
                color="grey"
                flat
                @click="resetForm"
                class="col"
              />
              <q-btn
                type="submit"
                color="primary"
                label="Iniciar Sesión"
                :loading="loading"
                class="col"
              />
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin: 10px;
}

.q-page {
  min-height: 100vh !important;
}
</style>