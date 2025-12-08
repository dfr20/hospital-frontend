import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAnswers } from '../../Hooks/useAnswers';
import { useAuth } from '../../Contexts/AuthContext';
import { useToast } from '../../Contexts/ToastContext';
import { getErrorMessage } from '../../Utils/errorHandler';
import { CheckCircle, Circle, Save, Check } from 'lucide-react';
import type { ApplicableQuestion } from '../../Types/Answer';

interface AnswerQuestionnaireProps {
  evaluationId: string;
  onComplete?: () => void;
  hideFloatingButton?: boolean;
}

const AnswerQuestionnaire: React.FC<AnswerQuestionnaireProps> = ({
  evaluationId,
  onComplete,
  hideFloatingButton = false
}) => {
  const toast = useToast();
  const { user } = useAuth();
  const { fetchApplicableQuestions, createBulkAnswers, fetchEvaluationStatistics } = useAnswers();

  const { data, isLoading, error, refetch } = fetchApplicableQuestions(evaluationId);
  const { data: statistics, isLoading: isLoadingStats, refetch: refetchStats } = fetchEvaluationStatistics(evaluationId);
  const { mutate: submitAnswers, isPending: isSubmitting } = createBulkAnswers();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Inicializar com respostas já existentes (agora vêm direto em answer_value)
  useEffect(() => {
    if (data) {
      const existingAnswers: Record<string, string> = {};
      data.forEach(q => {
        if (q.answer_value) {
          existingAnswers[q.public_id] = q.answer_value;
        }
      });
      setAnswers(existingAnswers);
    }
  }, [data]);

  const performSave = useCallback(() => {
    const answersPayload = Object.entries(answers)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([questionId, answer_value]) => ({
        question_id: questionId,
        answer_value: answer_value
      }));

    if (answersPayload.length === 0) return;

    submitAnswers(
      {
        evaluation_id: evaluationId,
        answers: answersPayload
      },
      {
        onSuccess: () => {
          setLastSaved(new Date());
          // Recarregar questões (podem aparecer condicionais) sem sair da página
          refetch();
          refetchStats();
        },
        onError: (error) => {
          console.error('Erro ao salvar respostas:', error);
          toast.error('Erro ao salvar', getErrorMessage(error));
        }
      }
    );
  }, [answers, evaluationId, submitAnswers, refetch, refetchStats, toast]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleManualSave = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Cancelar auto-save pendente
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    performSave();
    toast.success('Respostas salvas!', 'Suas respostas foram salvas manualmente');
  }, [performSave, toast]);

  // Auto-save com debounce de 2 segundos
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [answers, performSave]);

  // Listener para evento customizado de save manual
  useEffect(() => {
    const handleManualSaveEvent = () => {
      handleManualSave();
    };

    window.addEventListener('triggerManualSave', handleManualSaveEvent);
    return () => {
      window.removeEventListener('triggerManualSave', handleManualSaveEvent);
    };
  }, [handleManualSave]);

  const canAnswerQuestion = (question: ApplicableQuestion): boolean => {
    if (!user || !user.role?.name) return false;
    return question.roles.includes(user.role.name);
  };

  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      'Desenvolvedor': 'bg-purple-100 text-purple-800',
      'Gerente': 'bg-indigo-100 text-indigo-800',
      'Administrador': 'bg-red-100 text-red-800',
      'Pregoeiro': 'bg-blue-100 text-blue-800',
      'Avaliador Técnico': 'bg-green-100 text-green-800',
      'Avaliador Funcional': 'bg-orange-100 text-orange-800',
    };

    return roleColors[role] || 'bg-gray-100 text-gray-600';
  };

  const renderQuestionField = (question: ApplicableQuestion) => {
    const currentAnswer = answers[question.public_id] || '';
    const isDisabled = !canAnswerQuestion(question);

    switch (question.field_type) {
      case 'texto_curto':
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.public_id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              isDisabled
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-900 border-gray-300 focus:ring-teal-500'
            }`}
            placeholder={isDisabled ? 'Não disponível para seu cargo' : 'Digite sua resposta...'}
            disabled={isDisabled}
          />
        );

      case 'texto_longo':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.public_id, e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              isDisabled
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-900 border-gray-300 focus:ring-teal-500'
            }`}
            placeholder={isDisabled ? 'Não disponível para seu cargo' : 'Digite sua resposta...'}
            disabled={isDisabled}
          />
        );

      case 'select':
        return (
          <select
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.public_id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              isDisabled
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-white text-gray-900 border-gray-300 focus:ring-teal-500'
            }`}
            disabled={isDisabled}
          >
            <option value="">{isDisabled ? 'Não disponível para seu cargo' : 'Selecione uma opção...'}</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className={`flex items-center gap-4 ${isDisabled ? 'opacity-50' : ''}`}>
            <label className={`flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={`boolean-${question.public_id}`}
                checked={currentAnswer === 'Sim'}
                onChange={() => handleAnswerChange(question.public_id, 'Sim')}
                className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : 'text-teal-600 focus:ring-teal-500'}`}
                disabled={isDisabled}
              />
              <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>Sim</span>
            </label>
            <label className={`flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={`boolean-${question.public_id}`}
                checked={currentAnswer === 'Não'}
                onChange={() => handleAnswerChange(question.public_id, 'Não')}
                className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : 'text-teal-600 focus:ring-teal-500'}`}
                disabled={isDisabled}
              />
              <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>Não</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Carregando questões...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro ao carregar questões. Tente novamente mais tarde.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Nenhuma questão disponível para responder no momento.</p>
      </div>
    );
  }

  const questions = data;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Questionário de Avaliação</h3>
            <div className="flex items-center gap-2 mt-1">
              {statistics && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statistics.status === 'DESQUALIFICADO' ? 'bg-red-100 text-red-800' :
                  statistics.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {statistics.status === 'DESQUALIFICADO' ? 'Desclassificado' :
                   statistics.status === 'OK' ? 'Classificado' : 'Pendente'}
                </span>
              )}
              {lastSaved && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Check className="w-3 h-3 text-green-600" />
                  Salvo {new Date().getTime() - lastSaved.getTime() < 10000 ? 'agora' : 'há ' + Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000) + 's'}
                </span>
              )}
            </div>
          </div>
          {!isLoadingStats && statistics && (
            <div className="text-right">
              <div className="text-2xl font-bold text-teal-600">
                {statistics.answered_questions}/{statistics.total_questions}
              </div>
              <div className="text-xs text-gray-500">questões respondidas</div>
            </div>
          )}
        </div>

        {/* Barra de progresso */}
        {!isLoadingStats && statistics && (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  statistics.status === 'DESQUALIFICADO' ? 'bg-red-600' :
                  statistics.status === 'OK' ? 'bg-green-600' : 'bg-teal-600'
                }`}
                style={{ width: `${statistics.completion_percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-right">
              {statistics.completion_percentage.toFixed(1)}% completo
              {statistics.pending_questions > 0 && ` • ${statistics.pending_questions} pendente${statistics.pending_questions > 1 ? 's' : ''}`}
            </div>
          </div>
        )}

        {/* Motivos de Desclassificação */}
        {!isLoadingStats && statistics && statistics.is_disqualified && statistics.disqualification_reasons && statistics.disqualification_reasons.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-900 mb-2">Motivos de Desclassificação:</h4>
            <ul className="space-y-1">
              {statistics.disqualification_reasons.map((reason, index) => (
                <li key={index} className="text-sm text-red-800">
                  <span className="font-medium">{reason.question_number}</span> - {reason.question_description}:
                  <span className="ml-1 font-semibold">"{reason.answer_value}"</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Formulário */}
      {/* Botão flutuante de salvar */}
      {!hideFloatingButton && (
        <div className="fixed bottom-6 right-6 z-10">
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSubmitting}
            className="w-16 h-16 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center hover:scale-110"
            title={isSubmitting ? 'Salvando...' : 'Salvar Agora'}
          >
            <Save className="w-7 h-7" />
          </button>
        </div>
      )}

      <form onSubmit={handleManualSave} className="space-y-4">
        {questions.map((question, index) => {
          const isAnswered = !!question.answer_value;
          const isDisabled = !canAnswerQuestion(question);

          return (
            <div
              key={question.public_id}
              className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
                isDisabled ? 'border-gray-300 bg-gray-50' : 'border-teal-500'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-1">
                  {isAnswered ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                      {question.question_number}
                    </span>
                    {question.roles && question.roles.length > 0 && (
                      <div className="flex items-center gap-1">
                        {question.roles.map((role, idx) => (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(role)}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className={`text-sm font-medium mb-3 ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                    {question.description}
                  </p>
                  {isDisabled && (
                    <div className="mb-2 text-xs text-gray-500 italic">
                      Esta questão não pode ser respondida pelo seu cargo
                    </div>
                  )}
                  {renderQuestionField(question)}
                </div>
              </div>
            </div>
          );
        })}

      </form>
    </div>
  );
};

export default AnswerQuestionnaire;
