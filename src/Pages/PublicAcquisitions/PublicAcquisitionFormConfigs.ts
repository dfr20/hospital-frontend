import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

export const getPublicAcquisitionFormFields = (pregoeiros: Array<{ public_id: string; name: string }>): FieldConfig[] => [
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
  },
  {
    name: 'year',
    label: 'Ano',
    type: 'text',
    placeholder: 'Ex: 2025',
    required: true
  },
  {
    name: 'user_id',
    label: 'Pregoeiro',
    type: 'select',
    placeholder: 'Selecione o pregoeiro',
    required: true,
    options: pregoeiros.map(p => ({
      value: p.public_id,
      label: p.name
    }))
  }
];
