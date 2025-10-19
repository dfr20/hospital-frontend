import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Categoria
export const categoryFormFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nome da Categoria',
    type: 'text',
    placeholder: 'Digite o nome da categoria',
    required: true
  },
  {
    name: 'description',
    label: 'Descrição',
    type: 'text',
    placeholder: 'Digite a descrição da categoria',
    required: true
  }
];
