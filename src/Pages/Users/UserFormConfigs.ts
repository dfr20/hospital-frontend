import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Usuário
export const userFormFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nome',
    type: 'text',
    placeholder: 'Digite o nome completo',
    required: true
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'exemplo@email.com',
    required: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    type: 'phone',
    placeholder: '(00) 00000-0000',
    required: true,
    withCountryCode: true
  },
  {
    name: 'password',
    label: 'Senha',
    type: 'password',
    placeholder: 'Digite a senha',
    required: true
  },
  {
    name: 'role_id',
    label: 'Função',
    type: 'select',
    required: true,
    options: [],
    fetchOptionsFrom: 'roles',
    optionValueKey: 'public_id',
    optionLabelKey: 'name'
  },
  {
    name: 'job_title_id',
    label: 'Cargo',
    type: 'select',
    required: true,
    options: [],
    fetchOptionsFrom: 'jobTitles',
    optionValueKey: 'public_id',
    optionLabelKey: 'name'
  },
  {
    name: 'hospital_id',
    label: 'Hospital',
    type: 'select',
    required: true,
    options: [],
    fetchOptionsFrom: 'hospitals',
    optionValueKey: 'public_id',
    optionLabelKey: 'name'
  }
];
