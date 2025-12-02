import React, { useState, useEffect } from 'react';
import { useAnswers } from '../../Hooks/useAnswers';
import { useToast } from '../../Contexts/ToastContext';
import { getErrorMessage } from '../../Utils/errorHandler';
import { CheckCircle, Circle, Save } from 'lucide-react';
import type { ApplicableQuestion } from '../../Types/Answer';

interface AnswerQuestionnaireProps {
  evaluationId: string;
  onComplete?: () => void;
}

const AnswerQuestionnaire: React.FC<AnswerQuestionnaireProps> = ({
  evaluationId,
  onComplete
}) => {
  const toast = useToast();
  const { fetchApplicableQuestions, createBulkAnswers } = useAnswers();

  const { data, isLoading, error, refetch } = fetchApplicableQuestions(evaluationId);
  const { mutate: submitAnswers, isPending: isSubmitting } = createBulkAnswers();

  const [answers, setAnswers] = useState<Record<string, { text?: string; boolean?: boolean }>>({});

  // Inicializar com respostas já existentes
  useEffect(() => {
    if (data?.questions) {
      const existingAnswers: Record<string, { text?: string; boolean?: boolean }> = {};
      data.questions.forEach(q => {
        if (q.answer) {
          existingAnswers[q.public_id] = {
            text: q.answer.answer_text || undefined,
            boolean: q.answer.answer_boolean ?? undefined
          };
        }
      });
      setAnswers(existingAnswers);
    }
  }, [data]);

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { text: value }
    }));
  };

  const handleBooleanChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { boolean: value }
    }));
  };

  const handleSelectChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { text: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todas as questões obrigatórias foram respondidas
    const unansweredRequired = data?.questions.filter(q =>
      q.response_type === 'obrigatoria' && !answers[q.public_id]
    ) || [];

    if (unansweredRequired.length > 0) {
      toast.error(
        'Questões obrigatórias pendentes',
        `Por favor, responda todas as ${unansweredRequired.length} questões obrigatórias`
      );
      return;
    }

    // Preparar payload
    const answersPayload = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: questionId,
      answer_text: answer.text || null,
      answer_boolean: answer.boolean ?? null
    }));

    submitAnswers(
      {
        evaluation_id: evaluationId,
        answers: answersPayload
      },
      {
        onSuccess: () => {
          toast.success('Respostas salvas', 'Suas respostas foram salvas com sucesso!');
          refetch(); // Recarregar para pegar questões condicionais que podem ter aparecido
          if (onComplete) onComplete();
        },
        onError: (error) => {
          console.error('Erro ao salvar respostas:', error);
          toast.error('Erro ao salvar', getErrorMessage(error));
        }
      }
    );
  };

  const renderQuestionField = (question: ApplicableQuestion) => {
    const currentAnswer = answers[question.public_id];
    const isAnswered = !!currentAnswer && (currentAnswer.text !== undefined || currentAnswer.boolean !== undefined);

    switch (question.field_type) {
      case 'texto_curto':
        return (
          <input
            type="text"
            value={currentAnswer?.text || ''}
            onChange={(e) => handleTextChange(question.public_id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Digite sua resposta..."
            required={question.response_type === 'obrigatoria'}
          />
        );

      case 'texto_longo':
        return (
          <textarea
            value={currentAnswer?.text || ''}
            onChange={(e) => handleTextChange(question.public_id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Digite sua resposta..."
            required={question.response_type === 'obrigatoria'}
          />
        );

      case 'select':
        return (
          <select
            value={currentAnswer?.text || ''}
            onChange={(e) => handleSelectChange(question.public_id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            required={question.response_type === 'obrigatoria'}
          >
            <option value="">Selecione uma opção...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`boolean-${question.public_id}`}
                checked={currentAnswer?.boolean === true}
                onChange={() => handleBooleanChange(question.public_id, true)}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                required={question.response_type === 'obrigatoria'}
              />
              <span className="text-sm text-gray-700">Sim</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`boolean-${question.public_id}`}
                checked={currentAnswer?.boolean === false}
                onChange={() => handleBooleanChange(question.public_id, false)}
                className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                required={question.response_type === 'obrigatoria'}
              />
              <span className="text-sm text-gray-700">Não</span>
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

  if (!data || data.questions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">Nenhuma questão disponível para responder no momento.</p>
      </div>
    );
  }

  const { questions, total_questions, answered_questions, user_role } = data;
  const progress = total_questions > 0 ? (answered_questions / total_questions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Questionário de Avaliação</h3>
            <p className="text-sm text-gray-500">Seu papel: <span className="font-medium text-gray-700">{user_role}</span></p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal-600">{answered_questions}/{total_questions}</div>
            <div className="text-xs text-gray-500">questões respondidas</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((question, index) => {
          const isAnswered = !!question.answer;

          return (
            <div
              key={question.public_id}
              className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-teal-500"
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                      {question.question_number}
                    </span>
                    {question.response_type === 'obrigatoria' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Obrigatória
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Condicional
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-3">{question.description}</p>
                  {renderQuestionField(question)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Botão de envio */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isSubmitting ? 'Salvando...' : 'Salvar Respostas'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerQuestionnaire;
