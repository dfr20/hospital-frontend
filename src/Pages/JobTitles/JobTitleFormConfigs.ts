import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Job Title
export const jobTitleFormFields: FieldConfig[] = [
  {
    name: 'title',
    label: 'Título do Cargo',
    type: 'text',
    placeholder: 'Digite o título do cargo',
    required: true
  }
];
