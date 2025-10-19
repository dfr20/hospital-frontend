import type { FieldConfig } from "../../Components/Common/Modal/DynamicForm";

export const itemFormFields: FieldConfig[] = [
  {
    name: "name",
    label: "Nome",
    type: "text",
    placeholder: "Digite o nome do item",
    required: true,
  },
  {
    name: "description",
    label: "Descrição",
    type: "text",
    placeholder: "Digite a descrição curta",
    required: true,
  },
  {
    name: "full_description",
    label: "Descrição Completa",
    type: "textarea",
    placeholder: "Digite a descrição completa do item",
    required: true,
    rows: 4,
  },
  {
    name: "internal_code",
    label: "Código Interno",
    type: "text",
    placeholder: "Ex: MED-002",
    required: true,
  },
  {
    name: "presentation",
    label: "Apresentação",
    type: "text",
    placeholder: "Ex: Comprimidos 500mg",
    required: true,
  },
  {
    name: "sample",
    label: "Amostra",
    type: "text",
    placeholder: "Quantidade de amostra",
    required: true,
  },
  {
    name: "subcategory_id",
    label: "Subcategoria",
    type: "select",
    placeholder: "Selecione a subcategoria",
    required: true,
    options: [], // Será preenchido dinamicamente
  },
  {
    name: "hospital_id",
    label: "Hospital",
    type: "select",
    placeholder: "Selecione o hospital",
    required: true,
    options: [], // Será preenchido dinamicamente
  },
];
