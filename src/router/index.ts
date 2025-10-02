import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useTabsStore } from '../stores/tabs';
import { genericCrudConfigs } from './genericCrudConfigs';

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        component: () => import('../components/DashboardHome.vue')
      },
      // {
      //   path: '/sectores',
      //   component: () => import('../pages/generic-capture/SectorsPage.vue')
      // },
      // {
      //   path: '/tarifas',
      //   component: () => import('../pages/generic-capture/TarifasPage.vue')
      // },
      // {
      //   path: '/estratos',
      //   component: () => import('../pages/generic-capture/EstratosPage.vue')
      // },
      {
        path: '/accesos',
        component: () => import('../pages/configuration/AccesosPage.vue')
      },
      {
        path: '/usuarios',
        component: () => import('../pages/configuration/UsuariosPage.vue')
      },
      {
        path: '/empresas',
        component: () => import('../pages/configuration/EmpresasPage.vue')
      },
      {
        path: '/bodegas',
        component: () => import('../pages/GenericCrudPage.vue'),
        meta: {
          requiresAuth: true,
          tableName: 'bodegas',
          title: genericCrudConfigs.bodegas.title,
          icon: genericCrudConfigs.bodegas.icon,
          formFields: genericCrudConfigs.bodegas.formFields,
          gridColumns: genericCrudConfigs.bodegas.gridColumns
        }
      },
      {
        path: '/califica_cliente',
        component: () => import('../pages/GenericCrudPage.vue'),
        meta: {
          requiresAuth: true,
          tableName: 'califica_cliente',
          title: genericCrudConfigs.califica_cliente.title,
          icon: genericCrudConfigs.califica_cliente.icon,
          formFields: genericCrudConfigs.califica_cliente.formFields,
          gridColumns: genericCrudConfigs.califica_cliente.gridColumns
        }
      },
      {
        path: '/cargos',
        component: () => import('../pages/GenericCrudPage.vue'),
        meta: {
          requiresAuth: true,
          tableName: 'cargos',
          title: genericCrudConfigs.cargos.title,
          icon: genericCrudConfigs.cargos.icon,
          formFields: genericCrudConfigs.cargos.formFields,
          gridColumns: genericCrudConfigs.cargos.gridColumns
        }
      },
      {
        path: '/fuente_contable',
        component: () => import('../pages/GenericCrudPage.vue'),
        meta: {
          requiresAuth: true,
          tableName: 'fuente_contable',
          title: genericCrudConfigs.fuente_contable.title,
          icon: genericCrudConfigs.fuente_contable.icon,
          formFields: genericCrudConfigs.fuente_contable.formFields,
          gridColumns: genericCrudConfigs.fuente_contable.gridColumns
        }
      },
      {
        path: '/centro_costos',
        component: () => import('../pages/GenericCrudPage.vue'),
        meta: {
          requiresAuth: true,
          tableName: 'centro_costos',
          title: genericCrudConfigs.centro_costos.title,
          icon: genericCrudConfigs.centro_costos.icon,
          formFields: genericCrudConfigs.centro_costos.formFields,
          gridColumns: genericCrudConfigs.centro_costos.gridColumns
        }
      },

      {
        path: '/puc2',
        component: () => import('../pages/puc/Puc2Page.vue'),
        meta: { requiresAuth: true, title: 'Plan Único de Cuentas 2', icon: 'account_tree' }
      },
      {
        path: '/captura-contable',
        component: () => import('../pages/contabilidad/CapturaContable.vue'),
        meta: { requiresAuth: true, title: 'Captura Contable', icon: 'edit_note' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const tabsStore = useTabsStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  if (to.path === '/login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Add tab when navigating to a route
  if (to.path !== '/login' && to.path !== '/dashboard' && to.path !== '/') {
    const routeConfig = routes[2].children?.find(route => route.path === to.path);
    if (routeConfig) {
      // Get the menu item that corresponds to this route
      const menuItems = [
        { icon: 'dashboard', label: 'Dashboard', route: '/dashboard', closable: false },
        { icon: 'location_city', label: 'Sectores', route: '/sectores', closable: true },
        { icon: 'payments', label: 'Tarifas', route: '/tarifas', closable: true },
        { icon: 'group_work', label: 'Estratos', route: '/estratos', closable: true },
        { icon: 'people', label: 'Accesos', route: '/accesos', closable: true },
        { icon: 'person', label: 'Usuarios', route: '/usuarios', closable: true },
        { icon: 'business', label: 'Empresas', route: '/empresas', closable: true },
        // New generic routes
        { icon: 'warehouse', label: 'Bodegas', route: '/bodegas', closable: true },
        { icon: 'star_half', label: 'Calificación Cliente', route: '/califica_cliente', closable: true },
        { icon: 'work', label: 'Cargos', route: '/cargos', closable: true },
        { icon: 'account_balance', label: 'Fuente Contable', route: '/fuente_contable', closable: true },

        { icon: 'account_tree', label: 'PUC 2', route: '/puc2', closable: true }
      ];
      
      const menuItem = menuItems.find(item => item.route === to.path);
      
      if (menuItem) {
        tabsStore.addTab({
          name: menuItem.label,
          route: menuItem.route,
          icon: menuItem.icon,
          closable: menuItem.closable
        });
      }
    }
  }

  next();
});

export default router;
