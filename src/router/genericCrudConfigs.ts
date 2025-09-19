const baseFormFields = [
  { name: 'codigo', label: 'Código', type: 'number', default: 0, required: true, maxLength: 10 },
  { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
  { name: 'abreviado', label: 'Abreviado', type: 'text', required: false, maxLength: 20 },
  { name: 'activo', label: 'Activo', type: 'boolean', default: true, required: false }
];

const baseGridColumns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'abreviado', label: 'Abreviado', field: 'abreviado', align: 'left', sortable: true },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'left', sortable: true, format: (val: boolean) => (val ? 'Sí' : 'No') }
];

export const genericCrudConfigs = {
  bodegas: {
    title: 'Bodegas',
    icon: 'warehouse',
    formFields: baseFormFields,
    gridColumns: baseGridColumns
  },
  califica_cliente: {
    title: 'Calificación Cliente',
    icon: 'star_half',
    formFields: baseFormFields,
    gridColumns: baseGridColumns
  },
  cargos: {
    title: 'Cargos',
    icon: 'work',
    formFields: baseFormFields,
    gridColumns: baseGridColumns
  },
  fuente_contable: {
    title: 'Fuente Contable',
    icon: 'account_balance',
    formFields: baseFormFields,
    gridColumns: baseGridColumns
  },
  centro_costos: {
    title: 'Centro de Costos',
    icon: 'business_center',
    formFields: baseFormFields,
    gridColumns: baseGridColumns
  }
};