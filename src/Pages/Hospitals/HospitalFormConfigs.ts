import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';
import { NATIONALITIES, getDocumentTypesForNationality } from '../../Utils/constants';

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
    options: NATIONALITIES,
    placeholder: 'Selecione a nacionalidade'
  },
  {
    name: 'document_type',
    label: 'Tipo de Documento',
    type: 'select',
    required: true,
    dependsOn: 'nationality',
    getDynamicOptions: (nationality: string) => getDocumentTypesForNationality(nationality),
    placeholder: 'Selecione o tipo de documento'
  },
  {
    name: 'document',
    label: 'Documento',
    type: 'text',
    placeholder: 'Digite o documento',
    required: true,
    dependsOn: 'document_type'
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
