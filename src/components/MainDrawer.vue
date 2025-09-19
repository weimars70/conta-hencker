<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, Loading } from 'quasar';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';

const props = defineProps<{
  modelValue: boolean
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>();

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const tabsStore = useTabsStore();
const miniState = ref(false);
const searchQuery = ref('');

const menuItems = [

  {
    icon: 'settings',
    label: 'Configuración',
    category: 'configuracion',
    children: [
      {
        icon: 'people',
        label: 'Accesos',
        route: '/accesos',
        closable: true,
        category: 'configuracion'
      },
      {
        icon: 'person',
        label: 'Usuarios',
        route: '/usuarios',
        closable: true,
        category: 'configuracion'
      },
      {
        icon: 'business',
        label: 'Empresas',
        route: '/empresas',
        closable: true,
        category: 'configuracion'
      },

      {
        icon: 'account_tree',
        label: 'PUC',
        route: '/puc2',
        closable: true,
        category: 'configuracion'
      }
    ]
  },

  {
    icon: 'menu_book',
    label: 'Maestros',
    category: 'maestros',
    children: [
      {
        icon: 'warehouse',
        label: 'Bodegas',
        route: '/bodegas',
        closable: true,
        category: 'maestros'
      },
      {
        icon: 'star_half',
        label: 'Calificación Cliente',
        route: '/califica_cliente',
        closable: true,
        category: 'maestros'
      },
      {
        icon: 'work',
        label: 'Cargos',
        route: '/cargos',
        closable: true,
        category: 'maestros'
      },
      {
        icon: 'account_balance',
        label: 'Fuente Contable',
        route: '/fuente_contable',
        closable: true,
        category: 'maestros'
      },
      {
        icon: 'business_center',
        label: 'Centro de Costos',
        route: '/centro_costos',
        closable: true,
        category: 'maestros'
      }
    ]
  }
];

// Filtrar elementos del menú basado en la búsqueda
const filteredMenuItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return menuItems;
  }

  const query = searchQuery.value.toLowerCase().trim();
  
  const result = [];
  
  menuItems.forEach(item => {
    // Buscar en el item principal
    const matchesMain = item.label.toLowerCase().includes(query);
    
    // Si tiene hijos, buscar en ellos
    let matchingChildren = [];
    if (item.children) {
      matchingChildren = item.children.filter(child => 
        child.label.toLowerCase().includes(query)
      );
    }
    
    // Si el item principal coincide, incluir todo el item
    if (matchesMain) {
      result.push(item);
    }
    // Si hay hijos que coinciden, crear un item solo con esos hijos
    else if (matchingChildren.length > 0) {
      result.push({
        ...item,
        children: matchingChildren
      });
    }
    // Si no tiene hijos y coincide, agregarlo directamente
    else if (!item.children && matchesMain) {
      result.push(item);
    }
  });
  
  return result;
});

const navigateTo = (item: any) => {
  tabsStore.addTab({
    name: item.label,
    route: item.route,
    icon: item.icon,
    closable: item.closable,
  });
  router.push(item.route);
  emit('update:modelValue', false);
};

const toggleMiniState = () => {
  miniState.value = !miniState.value;
};



const clearSearch = () => {
  searchQuery.value = '';
};

</script>

<template>
  <q-drawer
    :model-value="modelValue"
    :mini="miniState"
    :width="280"
    :breakpoint="500"
    bordered
    class="drawer-elegant"
    show-if-above
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Header con gradiente -->
    <div class="drawer-header">
   
      <!-- Barra de búsqueda -->
      <div v-if="!miniState" class="search-section">
        <q-input
          v-model="searchQuery"
          placeholder="Buscar en el menú..."
          dense
          outlined
          class="search-input"
          bg-color="rgba(255,255,255,0.1)"
          color="white"
          input-style="color: white"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="rgba(255,255,255,0.7)" />
          </template>
          <template v-slot:append>
            <q-btn
              v-if="searchQuery"
              flat
              round
              dense
              icon="clear"
              size="sm"
              color="rgba(255,255,255,0.7)"
              @click="clearSearch"
            />
          </template>
        </q-input>
      </div>
    </div>


    <!-- Menu Items -->
    <q-scroll-area class="menu-scroll-area">
      <q-list class="menu-list">
        <!-- Mostrar mensaje si no hay resultados -->
        <div v-if="searchQuery && filteredMenuItems.length === 0" class="no-results">
          <q-icon name="search_off" size="32px" class="q-mb-sm" />
          <div class="text-caption">No se encontraron resultados</div>
        </div>

        <template v-for="item in filteredMenuItems" :key="item.route || item.label">
          <!-- Menu item with children (expandable) -->
          <q-expansion-item
            v-if="item.children && item.children.length > 0"
            :icon="item.icon"
            :label="item.label"
            class="menu-expansion-item"
            header-class="menu-expansion-header"
            :default-opened="!!searchQuery"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon :name="item.icon" class="menu-icon" />
              </q-item-section>
              <q-item-section v-if="!miniState">
                <q-item-label class="menu-label">{{ item.label }}</q-item-label>
              </q-item-section>
            </template>

            <q-item
              v-for="child in item.children"
              :key="child.route"
              clickable
              v-ripple
              :active="router.currentRoute.value.path === child.route"
              active-class="menu-item-active"
              class="menu-child-item"
              @click="navigateTo(child)"
            >
              <q-item-section avatar>
                <q-icon :name="child.icon" class="child-icon" />
              </q-item-section>
              <q-item-section v-if="!miniState">
                <q-item-label class="child-label">{{ child.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- Regular menu item -->
          <q-item
            v-else
            clickable
            v-ripple
            :active="router.currentRoute.value.path === item.route"
            active-class="menu-item-active"
            class="menu-item"
            @click="navigateTo(item)"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" class="menu-icon" />
            </q-item-section>
            <q-item-section v-if="!miniState">
              <q-item-label class="menu-label">{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>

      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<style lang="scss" scoped>
.drawer-elegant {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  .drawer-header {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding: 1rem;
    
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
      
      .logo-section {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        .logo-avatar {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .logo-text {
          .app-name {
            font-size: 1.1rem;
            font-weight: 700;
            line-height: 1.2;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }
          
          .app-subtitle {
            font-size: 0.75rem;
            opacity: 0.8;
            font-weight: 400;
          }
        }
      }
      
      .mini-toggle-btn {
        background: rgba(255,255,255,0.1);
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.05);
        }
        
        &.rotated {
          transform: rotate(180deg);
        }
      }
    }
    
    .search-section {
      .search-input {
        :deep(.q-field__control) {
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          
          &:hover {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.3);
          }
        }
        
        :deep(.q-field__native) {
          color: #2196f3 !important;
          
          &::placeholder {
            color: rgba(255,255,255,0.7) !important;
          }
        }
      }
    }
  }
  
  .menu-scroll-area {
    height: calc(100vh - 200px);
    
    .menu-list {
      padding: 0.5rem;
      
      .no-results {
        text-align: center;
        padding: 2rem 1rem;
        color: rgba(255,255,255,0.6);
      }
      
      .menu-item, .menu-child-item {
        border-radius: 10px;
        margin: 0.25rem 0;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255,255,255,0.1);
          transform: translateX(4px);
        }
        
        &.menu-item-active {
          background: rgba(255,255,255,0.2);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          
          .menu-icon, .child-icon {
            color: #ffd700;
          }
          
          .menu-label, .child-label {
            font-weight: 600;
          }
        }
        
        .menu-icon, .child-icon {
          color: #64b5f6;
          transition: color 0.3s ease;
        }
        
        .menu-label, .child-label {
          color: #1976d2;
          font-weight: 500;
        }
      }
      
      .menu-child-item {
        margin-left: 1rem;
        
        .child-icon {
          font-size: 1.2rem;
          color: #42a5f5;
        }
        
        .child-label {
          font-size: 0.85rem;
          color: #1976d2;
        }
      }
      
      .menu-expansion-item {
        border-radius: 10px;
        margin: 0.25rem 0;
            
        &:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .menu-icon {
          color: #64b5f6;
        }
        
        .menu-label {
          color: #1976d2;
          font-weight: 500;
        }
      }
      
      .sync-separator {
        background: rgba(255,255,255,0.2);
        margin: 1rem 0;
      }
      
      .sync-item {
        border-radius: 10px;
        margin: 0.25rem 0;
        transition: all 0.3s ease;
        
        &:hover:not(.disabled) {
          background: rgba(255,255,255,0.1);
          transform: translateX(4px);
        }
        
        .sync-icon {
          color: #29b6f6;
          
          &.spinning {
            animation: spin 1s linear infinite;
          }
        }
        
        .sync-label {
          color: #1976d2;
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// Responsive adjustments
@media (max-width: 768px) {
  .drawer-elegant {
    .drawer-header {
      padding: 0.75rem;
      
      .header-content {
        margin-bottom: 0.75rem;
      }
    }
    
    .menu-scroll-area {
      height: calc(100vh - 180px);
    }
  }
}
</style>