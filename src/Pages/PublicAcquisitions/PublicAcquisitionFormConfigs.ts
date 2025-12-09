import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

export const getPublicAcquisitionFormFields = (
  pregoeiros: Array<{ public_id: string; name: string }>
  // items: Array<{ public_id: string; name: string }> // Commented out as multi-select not supported
): FieldConfig[] => [
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
  // TODO: multi-select not supported by DynamicForm yet
  // {
  //   name: 'item_ids',
  //   label: 'Itens da Licitação',
  //   type: 'multi-select',
  //   placeholder: 'Selecione os itens',
  //   required: true,
  //   options: items.map(item => ({
  //     value: item.public_id,
  //     label: item.name
  //   }))
  // }
];
