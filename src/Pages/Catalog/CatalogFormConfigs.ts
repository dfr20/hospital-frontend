import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Catalog
export const catalogFormFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nome',
    type: 'text',
    placeholder: 'Digite o nome do equipamento',
    required: true
  },
  {
    name: 'description',
    label: 'Descrição',
    type: 'text',
    placeholder: 'Digite uma breve descrição',
    required: true
  },
  {
    name: 'full_description',
    label: 'Descrição Completa',
    type: 'textarea',
    placeholder: 'Digite a descrição completa',
    required: true
  },
  {
    name: 'presentation',
    label: 'Apresentação',
    type: 'text',
    placeholder: 'Ex: ml, mg, comprimido',
    required: true
  }
];
