import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Subcategoria
export const subcategoryFormFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nome da Subcategoria',
    type: 'text',
    placeholder: 'Digite o nome da subcategoria',
    required: true
  },
  {
    name: 'description',
    label: 'Descrição',
    type: 'text',
    placeholder: 'Digite a descrição da subcategoria',
    required: true
  },
  {
    name: 'category_id',
    label: 'Categoria',
    type: 'select',
    required: true,
    options: [], // Será preenchido dinamicamente com categorias disponíveis
    placeholder: 'Selecione a categoria'
  }
];
