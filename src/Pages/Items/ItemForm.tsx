import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Item, ItemPayload } from '../../Types/Item';
import type { Subcategory } from '../../Types/Subcategory';

interface ItemFormProps {
  onSubmit: (data: ItemPayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialValues?: Item;
  readOnly?: boolean;
  subcategories: Subcategory[];
  isLoadingSubcategories: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues,
  readOnly = false,
  subcategories,
  isLoadingSubcategories
}) => {
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    description: initialValues?.description || '',
    full_description: initialValues?.full_description || '',
    internal_code: initialValues?.internal_code || '',
    presentation: initialValues?.presentation || '',
    sample: initialValues?.sample?.toString() || '0',
    has_catalog: initialValues?.has_catalog || false,
    subcategory_id: initialValues?.subcategory?.public_id || '',  // Extrair do objeto subcategory
  });

  const [similarNames, setSimilarNames] = useState<string[]>(
    initialValues?.similar_names || []
  );
  const [newSimilarName, setNewSimilarName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddSimilarName = () => {
    if (!newSimilarName.trim()) return;

    if (similarNames.includes(newSimilarName.trim())) {
      setErrors(prev => ({ ...prev, similar_names: 'Este nome similar já foi adicionado' }));
      return;
    }

    setSimilarNames(prev => [...prev, newSimilarName.trim()]);
    setNewSimilarName('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.similar_names;
      return newErrors;
    });
  };

  const handleRemoveSimilarName = (index: number) => {
    setSimilarNames(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.full_description.trim()) newErrors.full_description = 'Descrição completa é obrigatória';
    if (!formData.internal_code.trim()) newErrors.internal_code = 'Código interno é obrigatório';
    if (!formData.presentation.trim()) newErrors.presentation = 'Apresentação é obrigatória';
    if (!formData.subcategory_id) newErrors.subcategory_id = 'Subcategoria é obrigatória';

    const sampleNum = parseInt(formData.sample);
    if (isNaN(sampleNum) || sampleNum < 0) {
      newErrors.sample = 'Amostra deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload: ItemPayload = {
      name: formData.name.trim(),
      similar_names: similarNames,
      description: formData.description.trim(),
      full_description: formData.full_description.trim(),
      internal_code: formData.internal_code.trim(),
      presentation: formData.presentation.trim(),
      sample: parseInt(formData.sample),
      has_catalog: formData.has_catalog,
      subcategory_id: formData.subcategory_id,
    };

    onSubmit(payload);
  };

  const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={commonClasses}
          disabled={isLoading}
          readOnly={readOnly}
          placeholder="Digite o nome do item"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Nomes Similares */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nomes Similares
        </label>
        {!readOnly && (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSimilarName}
              onChange={(e) => setNewSimilarName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSimilarName())}
              className={commonClasses}
              disabled={isLoading}
              placeholder="Digite um nome similar e pressione Enter"
            />
            <button
              type="button"
              onClick={handleAddSimilarName}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        {errors.similar_names && <p className="text-red-500 text-xs mt-1">{errors.similar_names}</p>}

        <div className="flex flex-wrap gap-2 mt-2">
          {similarNames.map((name, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
            >
              <span>{name}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveSimilarName(index)}
                  className="ml-1 hover:text-teal-900"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={commonClasses}
          disabled={isLoading}
          readOnly={readOnly}
          placeholder="Digite a descrição curta"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      {/* Descrição Completa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição Completa <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.full_description}
          onChange={(e) => handleChange('full_description', e.target.value)}
          className={commonClasses}
          disabled={isLoading}
          readOnly={readOnly}
          placeholder="Digite a descrição completa"
          rows={4}
        />
        {errors.full_description && <p className="text-red-500 text-xs mt-1">{errors.full_description}</p>}
      </div>

      {/* Código Interno e Apresentação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código Interno <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.internal_code}
            onChange={(e) => handleChange('internal_code', e.target.value)}
            className={commonClasses}
            disabled={isLoading}
            readOnly={readOnly}
            placeholder="Ex: MED-002"
          />
          {errors.internal_code && <p className="text-red-500 text-xs mt-1">{errors.internal_code}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apresentação <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.presentation}
            onChange={(e) => handleChange('presentation', e.target.value)}
            className={commonClasses}
            disabled={isLoading}
            readOnly={readOnly}
            placeholder="Ex: Comprimidos 500mg"
          />
          {errors.presentation && <p className="text-red-500 text-xs mt-1">{errors.presentation}</p>}
        </div>
      </div>

      {/* Amostra */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amostra <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.sample}
          onChange={(e) => handleChange('sample', e.target.value)}
          className={commonClasses}
          disabled={isLoading}
          readOnly={readOnly}
          placeholder="Quantidade de amostra"
          min="0"
        />
        {errors.sample && <p className="text-red-500 text-xs mt-1">{errors.sample}</p>}
      </div>

      {/* Subcategoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subcategoria <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.subcategory_id}
          onChange={(e) => handleChange('subcategory_id', e.target.value)}
          className={commonClasses}
          disabled={isLoading || readOnly}
        >
          <option value="">
            {isLoadingSubcategories ? 'Carregando...' : 'Selecione uma subcategoria'}
          </option>
          {subcategories.map(sub => (
            <option key={sub.public_id} value={sub.public_id}>
              {sub.name}
            </option>
          ))}
        </select>
        {errors.subcategory_id && <p className="text-red-500 text-xs mt-1">{errors.subcategory_id}</p>}
      </div>

      {/* Checkbox Has Catalog */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="has_catalog"
          checked={formData.has_catalog}
          onChange={(e) => handleChange('has_catalog', e.target.checked)}
          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          disabled={isLoading || readOnly}
        />
        <label htmlFor="has_catalog" className="ml-2 text-sm text-gray-700">
          Possui catálogo
        </label>
      </div>

      {/* Botões */}
      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}
    </form>
  );
};

export default ItemForm;
