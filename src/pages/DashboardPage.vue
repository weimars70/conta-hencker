<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useRouter } from 'vue-router';
import MainDrawer from '../components/MainDrawer.vue';
import TabsBar from '../components/TabsBar.vue';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { hashPassword } from '../utils/crypto';
import ThemeSelector from '../components/generic/ThemeSelector.vue';

const authStore = useAuthStore();
const menuStore = useMenuStore();
const router = useRouter();
const $q = useQuasar();
const leftDrawerOpen = ref(true);
const showCompanySwitcher = ref(false);
const switchingCompany = ref(false);
const selectedCompany = ref('');
const passwordConfirmation = ref('');

// Módulos del sistema
const modules = ref([
  {
    name: 'Compras',
    icon: 'shopping_cart',
    color: 'blue',
    route: '/compras',
    description: 'Gestión de compras y proveedores'
  },
  {
    name: 'Facturación Electrónica',
    icon: 'receipt_long',
    color: 'green',
    route: '/facturacion',
    description: 'Facturación electrónica DIAN'
  },
  {
    name: 'Cartera',
    icon: 'account_balance_wallet',
    color: 'orange',
    route: '/cartera',
    description: 'Gestión de cartera y cobros'
  },
  {
    name: 'Contabilidad',
    icon: 'calculate',
    color: 'purple',
    route: '/contabilidad',
    description: 'Contabilidad y estados financieros'
  },
  {
    name: 'Inventario',
    icon: 'inventory_2',
    color: 'teal',
    route: '/inventario',
    description: 'Control de inventarios y productos'
  },
  {
    name: 'Tesorería',
    icon: 'account_balance',
    color: 'indigo',
    route: '/tesoreria',
    description: 'Gestión de tesorería y bancos'
  },
  {
    name: 'Nómina Electrónica',
    icon: 'groups',
    color: 'pink',
    route: '/nomina',
    description: 'Nómina electrónica y RRHH'
  }
]);
// Empresas disponibles para el usuario (simuladas por ahora)
const availableCompanies = ref([
  { empresa: '01', nombre: 'Corporación Empresarial del Norte S.A.S.' },
  { empresa: '02', nombre: 'Industrias del Pacífico Ltda.' },
  { empresa: '03', nombre: 'Comercializadora Antioqueña S.A.' },
  { empresa: '04', nombre: 'Distribuidora Costeña S.A.S.' },
  { empresa: '05', nombre: 'Servicios Integrales del Oriente Ltda.' }
]);

const userInfo = computed(() => {
  const user = authStore.user;
  if (!user) return null;
  
  return {
    nombre: user.nombre || user.email || 'Usuario',
    empresa: user.empresa || 'N/A',
    empresaNombre: user.empresaData?.nombre || `Empresa ${user.empresa}` || 'Sin empresa'
  };
});

const openCompanySwitcher = () => {
  selectedCompany.value = authStore.user?.empresa || '';
  passwordConfirmation.value = '';
  showCompanySwitcher.value = true;
};

const cancelCompanySwitch = () => {
  showCompanySwitcher.value = false;
  selectedCompany.value = '';
  passwordConfirmation.value = '';
  switchingCompany.value = false;
};

const switchCompany = async () => {
  if (!selectedCompany.value) {
    $q.notify({
      type: 'negative',
      message: 'Debe seleccionar una empresa'
    });
    return;
  }

  if (!passwordConfirmation.value) {
    $q.notify({
      type: 'negative',
      message: 'Debe ingresar su contraseña para confirmar'
    });
    return;
  }

  if (selectedCompany.value === authStore.user?.empresa) {
    $q.notify({
      type: 'info',
      message: 'Ya está trabajando en esa empresa'
    });
    cancelCompanySwitch();
    return;
  }

  try {
    switchingCompany.value = true;

    // Aquí validarías la contraseña con el backend
    // Por ahora simulamos la validación
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Actualizar la empresa del usuario
    const selectedCompanyData = availableCompanies.value.find(c => c.empresa === selectedCompany.value);
    const updatedUser = {
      ...authStore.user,
      empresa: selectedCompany.value,
      empresaData: selectedCompanyData
    };

    authStore.setSession(authStore.token, updatedUser);

    $q.notify({
      type: 'positive',
      message: `Cambiado exitosamente a ${selectedCompanyData?.nombre}`,
      timeout: 3000
    });

    cancelCompanySwitch();
    
    // Opcional: recargar la página para refrescar datos
    window.location.reload();

  } catch (error) {
    console.error('Error switching company:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar de empresa. Verifique su contraseña.'
    });
  } finally {
    switchingCompany.value = false;
  }
};

const navigateToModule = (module) => {
  // Activar el módulo en el store del menú
  menuStore.activateModule(module.name);
  
  $q.notify({
    type: 'info',
    message: `Módulo ${module.name} activado. Menú actualizado.`,
    timeout: 2000
  });
  
  // Aquí puedes agregar la lógica de navegación cuando tengas las rutas
  // router.push(module.route);
};
function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <q-layout view="hHh LpR fFf" class="dashboard-layout">
    <q-header elevated class="header-gradient text-white shadow-2">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="menu-btn"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        
        <q-toolbar-title class="row items-center title-section">
          <q-icon name="business_center" size="28px" class="q-mr-sm title-icon" />
          <div class="q-ml-sm system-title-container">
            <div class="system-title">Sistema ERP Hencker</div>
            <div class="system-subtitle">Gestión Empresarial</div>
          </div>
        </q-toolbar-title>

        <!-- Modules Icons in Toolbar -->
        <div class="modules-toolbar">
          <div
            v-for="module in modules"
            :key="module.name"
            class="module-toolbar-item"
            :class="`module-toolbar-item--${module.color}`"
            @click="navigateToModule(module)"
          >
            <div class="module-toolbar-icon">
              <q-icon :name="module.icon" />
            </div>
            <div class="module-toolbar-name">{{ module.name }}</div>
            <q-tooltip class="bg-grey-8" :offset="[10, 10]">
              {{ module.description }}
            </q-tooltip>
          </div>
        </div>

        <!-- User Info Section -->
        <div v-if="userInfo" class="user-info-section">
          <div class="user-details">
            <div class="user-name">{{ userInfo.nombre }}</div>
            <div class="user-company">{{ userInfo.empresaNombre }}</div>
          </div>
          <q-avatar size="40px" class="user-avatar">
            <img v-if="false" src="" alt="User Avatar" />
            <div v-else class="avatar-initials">
              {{ userInfo.nombre.charAt(0).toUpperCase() }}
            </div>
          </q-avatar>
          
          <!-- Company Switcher Button -->
          <q-btn
            flat
            round
            dense
            icon="swap_horiz"
            class="company-switch-btn"
            @click="openCompanySwitcher"
          >
            <q-tooltip class="bg-grey-8">Cambiar Empresa</q-tooltip>
          </q-btn>
        </div>

        <q-separator vertical inset class="q-mx-md separator" />

        <q-btn
          flat
          round
          dense
          icon="logout"
          class="logout-btn"
          @click="handleLogout"
        >
          <q-tooltip class="bg-grey-8">Cerrar Sesión</q-tooltip>
        </q-btn>
        <ThemeSelector />
      </q-toolbar>
      <TabsBar />
    </q-header>

    <MainDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Company Switcher Dialog -->
    <q-dialog v-model="showCompanySwitcher" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="swap_horiz" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-h6">Cambiar Empresa</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="cancelCompanySwitch" />
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <div class="text-body2 text-grey-7 q-mb-sm">Empresa actual:</div>
            <div class="text-body1 text-weight-medium text-primary">
              {{ userInfo?.empresaNombre }}
            </div>
          </div>

          <q-select
            v-model="selectedCompany"
            :options="availableCompanies"
            option-value="empresa"
            option-label="nombre"
            emit-value
            map-options
            label="Seleccionar nueva empresa"
            outlined
            dense
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="business" />
            </template>
          </q-select>

          <q-input
            v-model="passwordConfirmation"
            type="password"
            label="Confirme su contraseña"
            outlined
            dense
            :rules="[val => !!val || 'Contraseña requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            color="grey"
            @click="cancelCompanySwitch"
            :disable="switchingCompany"
          />
          <q-btn
            label="Cambiar Empresa"
            color="primary"
            :loading="switchingCompany"
            @click="switchCompany"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style lang="scss" scoped>
.dashboard-layout {
  .header-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .q-toolbar {
    height: 70px;
    padding: 0 20px;
    
    .menu-btn {
      transition: all 0.3s ease;
     background: rgba(255, 255, 255, 0.15);
     border: 1px solid rgba(255, 255, 255, 0.2);
     border-radius: 8px;
     padding: 8px;
     backdrop-filter: blur(10px);
     box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
       background: rgba(255, 255, 255, 0.25);
        transform: scale(1.05);
       border-color: rgba(255, 255, 255, 0.3);
       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
     }
     
     &:active {
       transform: scale(0.95);
       background: rgba(255, 255, 255, 0.3);
     }
     
     .q-icon {
       color: white;
       font-size: 20px;
       filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      }
    }
    
    .title-section {
      .title-icon {
        color: #ff9800;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }
      
      .system-title-container {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
        
        .system-title {
          font-size: 1.5rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.5px;
          color: white;
        }
        
        .system-subtitle {
          font-size: 0.9rem;
          font-weight: 400;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.9);
          margin-top: -2px;
        }
      }
    }
    
    .modules-toolbar {
      display: flex;
      gap: 8px;
      margin: 0 20px;
      overflow-x: auto;
      padding: 4px 0;
      
      &::-webkit-scrollbar {
        height: 3px;
      }
      
      &::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        
        &:hover {
          background: rgba(255,255,255,0.5);
        }
      }
      
      .module-toolbar-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 70px;
        padding: 8px 6px;
        border-radius: 10px;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        
        &:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        &:active {
          transform: translateY(0);
        }
        
        .module-toolbar-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          transition: all 0.3s ease;
          
          .q-icon {
            font-size: 18px;
            color: white;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          }
        }
        
        .module-toolbar-name {
          font-size: 9px;
          font-weight: 500;
          color: white;
          text-align: center;
          line-height: 1.1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          max-width: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        // Colores específicos para cada módulo
        &--blue .module-toolbar-icon { background: linear-gradient(135deg, #2196f3, #1976d2); }
        &--green .module-toolbar-icon { background: linear-gradient(135deg, #4caf50, #388e3c); }
        &--orange .module-toolbar-icon { background: linear-gradient(135deg, #ff9800, #f57c00); }
        &--purple .module-toolbar-icon { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }
        &--teal .module-toolbar-icon { background: linear-gradient(135deg, #009688, #00695c); }
        &--indigo .module-toolbar-icon { background: linear-gradient(135deg, #3f51b5, #303f9f); }
        &--pink .module-toolbar-icon { background: linear-gradient(135deg, #e91e63, #c2185b); }
        
        &:hover {
          &.module-toolbar-item--blue { border-color: #2196f3; }
          &.module-toolbar-item--green { border-color: #4caf50; }
          &.module-toolbar-item--orange { border-color: #ff9800; }
          &.module-toolbar-item--purple { border-color: #9c27b0; }
          &.module-toolbar-item--teal { border-color: #009688; }
          &.module-toolbar-item--indigo { border-color: #3f51b5; }
          &.module-toolbar-item--pink { border-color: #e91e63; }
        }
      }
    }
    
    .user-info-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      .user-details {
        text-align: right;
        
        .user-name {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.2;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .user-company {
          font-size: 11px;
          opacity: 0.85;
          line-height: 1.2;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }
      }
      
      .user-avatar {
        border: 2px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        
        .avatar-initials {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
      }
    }
    
    .separator {
      height: 30px;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .company-switch-btn {
      margin-left: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
        color: #81c784;
      }
    }
    
    .logout-btn {
      transition: all 0.3s ease;
      background: rgba(244, 67, 54, 0.2);
      border: 1px solid rgba(244, 67, 54, 0.3);
      border-radius: 8px;
      padding: 8px;
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
      color: white;
      
      &:hover {
        background: rgba(244, 67, 54, 0.4);
        border-color: rgba(244, 67, 54, 0.6);
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        color: #ff5252;
      }
      
      &:active {
        transform: scale(0.95);
        background: rgba(244, 67, 54, 0.5);
      }
      
      .q-icon {
        color: white;
        font-size: 20px;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-layout .q-toolbar {
    padding: 0 12px;
    
    .modules-toolbar {
      margin: 0 8px;
      gap: 6px;
      
      .module-toolbar-item {
        min-width: 60px;
        padding: 6px 4px;
        
        .module-toolbar-icon {
          width: 28px;
          height: 28px;
          
          .q-icon {
            font-size: 16px;
          }
        }
        
        .module-toolbar-name {
          font-size: 8px;
          max-width: 50px;
        }
      }
    }
    
    .user-info-section {
      .user-details {
        display: none;
      }
    }
    
    .system-title {
      font-size: 1.1rem;
    }
    
    .system-title-container {
      .system-title {
        font-size: 1.2rem;
      }
      
      .system-subtitle {
        font-size: 0.8rem;
      }
    }
  }
}
</style>