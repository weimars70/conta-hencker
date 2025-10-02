import { defineStore } from 'pinia'
import { ref } from 'vue'

interface MenuItem {
  icon: string
  label: string
  route: string
  closable: boolean
  category: string
}

interface MenuSection {
  icon: string
  label: string
  category: string
  children: MenuItem[]
}

export const useMenuStore = defineStore('menu', () => {
  // Estado del menú dinámico
  const dynamicMenuItems = ref<MenuSection[]>([])
  const activeModule = ref<string | null>(null)

  // Menú base que siempre está presente
  const baseMenuItems: MenuSection[] = [
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
  ]

  // Definir menús específicos por módulo
  const moduleMenus: Record<string, MenuSection[]> = {
    'Contabilidad': [
      {
        icon: 'home',
        label: 'Menú Principal',
        category: 'navigation',
        children: [
          {
            icon: 'arrow_back',
            label: 'Volver al Menú Principal',
            route: '/dashboard',
            closable: false,
            category: 'navigation'
          }
        ]
      },
      {
        icon: 'calculate',
        label: 'Contabilidad',
        category: 'contabilidad',
        children: [
          {
            icon: 'edit_note',
            label: 'Captura Contable',
            route: '/captura-contable',
            closable: true,
            category: 'contabilidad'
          }
        ]
      }
    ]
  }

  // Función para activar un módulo y actualizar el menú
  const activateModule = (moduleName: string) => {
    activeModule.value = moduleName
    
    // Limpiar menús dinámicos anteriores
    dynamicMenuItems.value = []
    
    // Reemplazar completamente el menú con las opciones del módulo
    if (moduleMenus[moduleName]) {
      dynamicMenuItems.value = [...moduleMenus[moduleName]]
    }
  }

  // Función para desactivar el módulo y volver al menú principal
  const deactivateModule = () => {
    activeModule.value = null
    dynamicMenuItems.value = []
  }

  // Función para obtener todos los elementos del menú
  const getAllMenuItems = () => {
    // Si hay un módulo activo, solo mostrar sus opciones
    if (activeModule.value && dynamicMenuItems.value.length > 0) {
      return dynamicMenuItems.value
    }
    // Si no hay módulo activo, mostrar el menú base
    return baseMenuItems
  }

  // Función para limpiar el menú dinámico
  const clearDynamicMenu = () => {
    dynamicMenuItems.value = []
    activeModule.value = null
  }

  return {
    dynamicMenuItems,
    activeModule,
    baseMenuItems,
    activateModule,
    deactivateModule,
    getAllMenuItems,
    clearDynamicMenu
  }
})