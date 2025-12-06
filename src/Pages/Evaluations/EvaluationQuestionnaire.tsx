import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import AnswerQuestionnaire from '../../Components/Evaluation/AnswerQuestionnaire';
import { useEvaluations } from '../../Hooks/useEvaluations';

const EvaluationQuestionnaire: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { fetchEvaluationById } = useEvaluations();
  const { data: evaluation, isLoading } = fetchEvaluationById(id || '');

  const handleBack = () => {
    if (evaluation?.public_acquisition?.public_id) {
      navigate(`/public-acquisitions/${evaluation.public_acquisition.public_id}`);
    } else {
      navigate(-1);
    }
  };

  const handleComplete = () => {
    handleBack();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Avaliação não encontrada</h2>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Questionário de Avaliação
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Licitação:</span>
                <p className="text-gray-600">{evaluation.public_acquisition?.title}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Fornecedor:</span>
                <p className="text-gray-600">{evaluation.supplier?.name}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Item:</span>
                <p className="text-gray-600">{evaluation.item?.name}</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Código do Item:</span>
                <p className="text-gray-600">{evaluation.item?.internal_code}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questionnaire */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <AnswerQuestionnaire
            evaluationId={id || ''}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default EvaluationQuestionnaire;
