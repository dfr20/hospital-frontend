import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

// Configuração de campos para criar Fornecedor
export const supplierFormFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Nome do Fornecedor',
    type: 'text',
    placeholder: 'Digite o nome do fornecedor',
    required: true
  },
  {
    name: 'document_type',
    label: 'Tipo de Documento',
    type: 'select',
    required: true,
    options: [
      { value: 'CNPJ', label: 'CNPJ' },
      { value: 'CPF', label: 'CPF' }
    ],
    placeholder: 'Selecione o tipo de documento'
  },
  {
    name: 'document',
    label: 'Documento',
    type: 'document',
    placeholder: 'Digite o documento',
    required: true,
    dependsOn: 'document_type',
    documentTypeField: 'document_type'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'exemplo@fornecedor.com',
    required: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    type: 'phone',
    placeholder: '(00) 00000-0000',
    required: true,
    withCountryCode: true
  }
];
