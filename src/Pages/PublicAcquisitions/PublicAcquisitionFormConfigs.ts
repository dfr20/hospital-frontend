import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Licitação Pública
export const publicAcquisitionFormFields: FieldConfig[] = [
  {
    name: 'code',
    label: 'Código da Licitação',
    type: 'text',
    placeholder: 'Ex: LIC-2025-001',
    required: true
  },
  {
    name: 'title',
    label: 'Título da Licitação',
    type: 'text',
    placeholder: 'Digite o título da licitação',
    required: true
  }
];
