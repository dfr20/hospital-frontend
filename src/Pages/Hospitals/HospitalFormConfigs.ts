import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Hospital
export const hospitalFormFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nome do Hospital',
    type: 'text',
    placeholder: 'Digite o nome do hospital',
    required: true
  },
  {
    name: 'nationality',
    label: 'Nacionalidade',
    type: 'select',
    required: true,
    options: [
      { value: 'Brasil', label: 'Brasil' },
      { value: 'Estados Unidos', label: 'Estados Unidos' },
      { value: 'Portugal', label: 'Portugal' },
      { value: 'Espanha', label: 'Espanha' },
      { value: 'Outro', label: 'Outro' }
    ]
  },
  {
    name: 'document_type',
    label: 'Tipo de Documento',
    type: 'select',
    required: true,
    options: [
      { value: 'CNPJ', label: 'CNPJ' },
      { value: 'CPF', label: 'CPF' },
      { value: 'OTHER', label: 'Outro' }
    ]
  },
  {
    name: 'document',
    label: 'Documento',
    type: 'text',
    placeholder: 'Digite o documento',
    required: true
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'exemplo@hospital.com',
    required: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    type: 'tel',
    placeholder: '(00) 00000-0000',
    required: true
  },
  {
    name: 'city',
    label: 'Cidade',
    type: 'text',
    placeholder: 'Digite a cidade',
    required: true
  }
];
