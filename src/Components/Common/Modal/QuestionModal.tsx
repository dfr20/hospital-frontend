import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { X } from 'lucide-react';
import { useCategories } from '../../../Hooks/useCategories';
import type { Category } from '../../../Types/Category';

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        question_number: string;
        description: string;
        field_type: 'texto_curto' | 'texto_longo' | 'select' | 'boolean';
        response_type: 'obrigatoria' | 'condicional';
        roles: string[];
        condition: string | null;
        options: string[] | null;
        disqualification_rules: string[] | null;
        category_id: string | null;
        hospital_id?: string;
    }) => void;
    mode: 'create' | 'edit' | 'view';
    initialData?: {
        question_number?: string;
        description?: string;
        field_type?: 'texto_curto' | 'texto_longo' | 'select' | 'boolean';
        response_type?: 'obrigatoria' | 'condicional';
        roles?: string[];
        condition?: string | null;
        options?: string[] | null;
        disqualification_rules?: string[] | null;
        category_id?: string | null;
        category_name?: string;
        hospital_id?: string;
    };
    isLoading?: boolean;
}

const AVAILABLE_ROLES = [
    'Desenvolvedor',
    'Gerente',
    'Administrador',
    'Pregoeiro',
    'Avaliador Técnico',
    'Avaliador Funcional'
];

const QuestionModal: React.FC<QuestionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    mode,
    initialData,
    isLoading = false
}) => {
    const { searchCategories } = useCategories();

    const [questionNumber, setQuestionNumber] = useState(initialData?.question_number || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [fieldType, setFieldType] = useState<'texto_curto' | 'texto_longo' | 'select' | 'boolean'>(
        initialData?.field_type || 'texto_curto'
    );
    const [responseType, setResponseType] = useState<'obrigatoria' | 'condicional'>(
        initialData?.response_type || 'obrigatoria'
    );
    const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.roles || []);
    const [condition, setCondition] = useState(initialData?.condition || '');
    const [options, setOptions] = useState<string[]>(initialData?.options || []);
    const [newOption, setNewOption] = useState('');
    const [disqualificationRules, setDisqualificationRules] = useState<string[]>(initialData?.disqualification_rules || []);
    const [categorySearchTerm, setCategorySearchTerm] = useState(initialData?.category_name || '');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const { data: categoriesData } = searchCategories(categorySearchTerm);

    useEffect(() => {
        if (initialData) {
            setQuestionNumber(initialData.question_number || '');
            setDescription(initialData.description || '');
            setFieldType(initialData.field_type || 'texto_curto');
            setResponseType(initialData.response_type || 'obrigatoria');
            setSelectedRoles(initialData.roles || []);
            setCondition(initialData.condition || '');
            setOptions(initialData.options || []);
            setDisqualificationRules(initialData.disqualification_rules || []);
            setCategorySearchTerm(initialData.category_name || '');
            if (initialData.category_id && initialData.category_name) {
                setSelectedCategory({
                    public_id: initialData.category_id,
                    name: initialData.category_name,
                } as Category);
            }
        }
    }, [initialData]);

    const handleRoleToggle = (role: string) => {
        if (selectedRoles.includes(role)) {
            setSelectedRoles(selectedRoles.filter(r => r !== role));
        } else {
            setSelectedRoles([...selectedRoles, role]);
        }
    };

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setCategorySearchTerm(category.name);
        setShowCategoryDropdown(false);
    };

    const handleAddOption = () => {
        if (newOption.trim() && !options.includes(newOption.trim())) {
            setOptions([...options, newOption.trim()]);
            setNewOption('');
        }
    };

    const handleRemoveOption = (optionToRemove: string) => {
        setOptions(options.filter(opt => opt !== optionToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!questionNumber.trim()) {
            alert('Por favor, preencha o número da questão');
            return;
        }

        if (!description.trim()) {
            alert('Por favor, preencha a descrição');
            return;
        }

        if (selectedRoles.length === 0) {
            alert('Por favor, selecione pelo menos uma role');
            return;
        }

        if (fieldType === 'select' && options.length === 0) {
            alert('Por favor, adicione pelo menos uma opção para o campo select');
            return;
        }

        if (responseType === 'condicional' && !condition.trim()) {
            alert('Por favor, preencha a condição');
            return;
        }

        onSubmit({
            question_number: questionNumber.trim(),
            description: description.trim(),
            field_type: fieldType,
            response_type: responseType,
            roles: selectedRoles,
            condition: responseType === 'condicional' ? condition.trim() : null,
            options: fieldType === 'select' ? options : null,
            disqualification_rules: (fieldType === 'select' || fieldType === 'boolean') && disqualificationRules.length > 0 ? disqualificationRules : null,
            category_id: selectedCategory ? selectedCategory.public_id : null,
        });

        handleClose();
    };

    const handleClose = () => {
        setQuestionNumber('');
        setDescription('');
        setFieldType('texto_curto');
        setResponseType('obrigatoria');
        setSelectedRoles([]);
        setCondition('');
        setOptions([]);
        setNewOption('');
        setDisqualificationRules([]);
        setCategorySearchTerm('');
        setSelectedCategory(null);
        setShowCategoryDropdown(false);
        onClose();
    };

    const handleDisqualificationToggle = (value: string) => {
        if (disqualificationRules.includes(value)) {
            setDisqualificationRules(disqualificationRules.filter(v => v !== value));
        } else {
            setDisqualificationRules([...disqualificationRules, value]);
        }
    };

    const isReadOnly = mode === 'view';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                mode === 'view'
                    ? 'Detalhes da Questão'
                    : mode === 'edit'
                    ? 'Editar Questão'
                    : 'Criar Nova Questão'
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Número da Questão */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número da Questão *
                    </label>
                    <input
                        type="text"
                        value={questionNumber}
                        onChange={(e) => setQuestionNumber(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Ex: 1.1"
                    />
                </div>

                {/* Descrição */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição *
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isReadOnly}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Descreva a questão..."
                    />
                </div>

                {/* Tipo de Campo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Campo *
                    </label>
                    <select
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value as any)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="texto_curto">Texto Curto</option>
                        <option value="texto_longo">Texto Longo</option>
                        <option value="select">Select</option>
                        <option value="boolean">Sim/Não</option>
                    </select>
                </div>

                {/* Opções do Select */}
                {fieldType === 'select' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opções do Select *
                        </label>
                        {!isReadOnly && (
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddOption();
                                        }
                                    }}
                                    placeholder="Digite uma opção e pressione Enter"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddOption}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    Adicionar
                                </button>
                            </div>
                        )}
                        {options.length > 0 ? (
                            <div className="border border-gray-300 rounded-md p-3">
                                <div className="space-y-2">
                                    {options.map((option, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                        >
                                            <span className="text-sm text-gray-900">{option}</span>
                                            {!isReadOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveOption(option)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Nenhuma opção adicionada</p>
                        )}
                    </div>
                )}

                {/* Regras de Desclassificação */}
                {(fieldType === 'select' || fieldType === 'boolean') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Regras de Desclassificação (opcional)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Selecione quais respostas desqualificam a avaliação
                        </p>
                        {fieldType === 'select' && options.length > 0 ? (
                            <div className="border border-gray-300 rounded-md p-3">
                                <div className="space-y-2">
                                    {options.map((option, index) => (
                                        <label
                                            key={index}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={disqualificationRules.includes(option)}
                                                onChange={() => handleDisqualificationToggle(option)}
                                                disabled={isReadOnly}
                                                className="w-4 h-4 text-red-600 focus:ring-red-500"
                                            />
                                            <span className="text-sm text-gray-900">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ) : fieldType === 'boolean' ? (
                            <div className="border border-gray-300 rounded-md p-3">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={disqualificationRules.includes('Sim')}
                                            onChange={() => handleDisqualificationToggle('Sim')}
                                            disabled={isReadOnly}
                                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-900">Sim</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={disqualificationRules.includes('Não')}
                                            onChange={() => handleDisqualificationToggle('Não')}
                                            disabled={isReadOnly}
                                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-900">Não</span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">
                                {fieldType === 'select' ? 'Adicione opções primeiro' : 'Nenhuma regra configurada'}
                            </p>
                        )}
                    </div>
                )}

                {/* Tipo de Resposta */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Resposta *
                    </label>
                    <select
                        value={responseType}
                        onChange={(e) => setResponseType(e.target.value as any)}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="obrigatoria">Obrigatória</option>
                        <option value="condicional">Condicional</option>
                    </select>
                </div>

                {/* Condição */}
                {responseType === 'condicional' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Condição *
                        </label>
                        <input
                            type="text"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            disabled={isReadOnly}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Ex: question_1_1 == 'Sim'"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use o formato: question_número == 'valor'
                        </p>
                    </div>
                )}

                {/* Categoria (opcional) */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria (opcional)
                    </label>
                    <input
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => {
                            setCategorySearchTerm(e.target.value);
                            setShowCategoryDropdown(true);
                            if (!e.target.value) {
                                setSelectedCategory(null);
                            }
                        }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        disabled={isReadOnly}
                        placeholder="Digite para buscar uma categoria..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {showCategoryDropdown && categoriesData && categoriesData.items.length > 0 && !isReadOnly && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {categoriesData.items.map((category: Category) => (
                                <div
                                    key={category.public_id}
                                    onClick={() => handleCategorySelect(category)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    <div className="font-medium">{category.name}</div>
                                    {category.description && (
                                        <div className="text-sm text-gray-600">{category.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedCategory && (
                        <p className="text-xs text-teal-600 mt-1">
                            ✓ Categoria selecionada: {selectedCategory.name}
                        </p>
                    )}
                </div>

                {/* Roles */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roles que podem responder *
                    </label>
                    <div className="border border-gray-300 rounded-md p-3">
                        <div className="space-y-2">
                            {AVAILABLE_ROLES.map((role) => (
                                <label
                                    key={role}
                                    className={`flex items-center p-2 rounded cursor-pointer ${
                                        isReadOnly ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => handleRoleToggle(role)}
                                        disabled={isReadOnly}
                                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm text-gray-900">{role}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {selectedRoles.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                            {selectedRoles.length} {selectedRoles.length === 1 ? 'role selecionada' : 'roles selecionadas'}
                        </p>
                    )}
                </div>

                {!isReadOnly && (
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : mode === 'edit' ? 'Salvar Alterações' : 'Criar Questão'}
                        </button>
                    </div>
                )}

                {isReadOnly && (
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            Fechar
                        </button>
                    </div>
                )}
            </form>
        </Modal>
    );
};

export default QuestionModal;
