import React, { useState } from 'react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  fetchOptionsFrom?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  dependsOn?: string; // Nome do campo do qual depende
  getDynamicOptions?: (dependentValue: string) => { value: string; label: string }[]; // Função para obter opções dinâmicas
  rows?: number; // Número de linhas para textarea
}

interface DynamicFormProps<T> {
  fields: FieldConfig[];
  onSubmit: (data: T) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  initialValues?: Partial<T>;
  readOnly?: boolean;
}

function DynamicForm<T extends Record<string, any>>({
  fields,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Criar',
  cancelLabel = 'Cancelar',
  initialValues,
  readOnly = false
}: DynamicFormProps<T>) {
  const getInitialValues = () => {
    if (initialValues) {
      return fields.reduce((acc, field) => {
        acc[field.name] = (initialValues as any)[field.name] || '';
        return acc;
      }, {} as Record<string, string>);
    }
    return fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {} as Record<string, string>);
  };

  const [formData, setFormData] = useState<Record<string, string>>(getInitialValues());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Limpar campos dependentes quando o campo pai mudar
      fields.forEach(field => {
        if (field.dependsOn === name) {
          newData[field.name] = '';
        }
      });

      return newData;
    });

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }

      // Validação de email
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Email inválido';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData as T);
    }
  };

  const renderField = (field: FieldConfig) => {
    // Verificar se o campo está desabilitado por dependência
    const isDependentDisabled = Boolean(field.dependsOn && !formData[field.dependsOn]);

    const commonClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none ${
      errors[field.name] ? 'border-red-500' : 'border-gray-300'
    } ${readOnly || isDependentDisabled ? 'bg-gray-50 cursor-not-allowed' : ''}`;

    if (field.type === 'select') {
      // Obter opções dinâmicas se houver dependência
      let selectOptions = field.options || [];
      if (field.getDynamicOptions && field.dependsOn && formData[field.dependsOn]) {
        selectOptions = field.getDynamicOptions(formData[field.dependsOn]);
      }

      return (
        <select
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={commonClasses}
          disabled={isLoading || readOnly || isDependentDisabled}
        >
          <option value="">{field.placeholder || `Selecione ${field.label}`}</option>
          {selectOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className={commonClasses}
          disabled={isLoading || isDependentDisabled}
          readOnly={readOnly}
          rows={field.rows || 4}
        />
      );
    }

    return (
      <input
        type={field.type}
        value={formData[field.name] || ''}
        onChange={(e) => handleChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className={commonClasses}
        disabled={isLoading || isDependentDisabled}
        readOnly={readOnly}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {readOnly ? 'Fechar' : cancelLabel}
        </button>
        {!readOnly && (
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}

export default DynamicForm;
