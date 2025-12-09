import type { FieldConfig } from '../../Components/Common/Modal/DynamicForm';

export const getQuestionFormFields = (): FieldConfig[] => {
  return [
    {
      name: 'question_number',
      label: 'Número da Questão',
      type: 'text',
      placeholder: 'Ex: P1, P5',
      required: true
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      placeholder: 'Digite a descrição da questão',
      required: true
    },
    {
      name: 'field_type',
      label: 'Tipo de Campo',
      type: 'select',
      required: true,
      options: [
        { value: 'texto_curto', label: 'Texto Curto' },
        { value: 'texto_longo', label: 'Texto Longo' },
        { value: 'select', label: 'Seleção (Select)' },
        { value: 'boolean', label: 'Sim/Não (Boolean)' }
      ]
    },
    {
      name: 'response_type',
      label: 'Tipo de Resposta',
      type: 'select',
      required: true,
      options: [
        { value: 'obrigatoria', label: 'Obrigatória' },
        { value: 'condicional', label: 'Condicional' }
      ]
    }
    // TODO: multi-select not supported by DynamicForm yet - using QuestionModal instead
    // Commented out unused fields since QuestionModal is used directly
    // {
    //   name: 'roles',
    //   label: 'Roles Permitidas',
    //   type: 'multi-select',
    //   required: true,
    //   options: [...]
    // },
    // {
    //   name: 'condition',
    //   label: 'Condição (apenas para tipo Condicional)',
    //   type: 'text',
    //   placeholder: 'Ex: P5=amostra',
    //   required: false
    // },
    // {
    //   name: 'options',
    //   label: 'Opções (apenas para tipo Select - separadas por vírgula)',
    //   type: 'text',
    //   placeholder: 'Ex: Opção 1, Opção 2, Opção 3',
    //   required: false
    // }
  ];
};
