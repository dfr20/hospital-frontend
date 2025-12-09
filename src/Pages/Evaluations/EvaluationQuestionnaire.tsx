import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, Save } from 'lucide-react';
import AnswerQuestionnaire from '../../Components/Evaluation/AnswerQuestionnaire';
import AssociateUserModal from '../../Components/Common/Modal/AssociateUserModal';
import { useEvaluations } from '../../Hooks/useEvaluations';
import { useAuth } from '../../Contexts/AuthContext';
import { useToast } from '../../Contexts/ToastContext';
import { getErrorMessage } from '../../Utils/errorHandler';

const EvaluationQuestionnaire: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [isAssociateUserModalOpen, setIsAssociateUserModalOpen] = useState(false);

  const { fetchEvaluationById, associateUser } = useEvaluations();
  const { data: evaluation, isLoading } = fetchEvaluationById(id || '');
  const associateUserMutation = associateUser();

  const handleBack = () => {
    if (evaluation?.public_acquisition?.public_id) {
      navigate(`/public-acquisitions/${evaluation.public_acquisition.public_id}`);
    } else {
      navigate(-1);
    }
  };

  const canAssociateUser = user?.role?.name && ['Administrador', 'Gerente', 'Pregoeiro', 'Avaliador Técnico'].includes(user.role.name);

  const handleAssociateUserSubmit = async (userId: string) => {
    if (!id) return;

    try {
      await associateUserMutation.mutateAsync({
        id: id,
        data: {
          user_id: userId
        }
      });
      toast.success('Usuário associado', 'Usuário associado à avaliação com sucesso!');
      setIsAssociateUserModalOpen(false);
    } catch (error) {
      console.error('Erro ao associar usuário:', error);
      toast.error('Erro ao associar', getErrorMessage(error));
    }
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

  // Verificar se o usuário está associado à avaliação ou é o pregoeiro
  const isUserAssociated = evaluation.users.some(
    (evalUser) => evalUser.public_id === user?.public_id
  );
  const isPregoeiro = evaluation.public_acquisition?.user_public_id === user?.public_id;
  const canAnswer = isUserAssociated || isPregoeiro;

  if (!canAnswer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FileText className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Acesso Negado</h2>
        <p className="text-gray-600 mb-4">Você não está associado a esta avaliação</p>
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
            hideFloatingButton={true}
          />
        </div>

        {/* Botões flutuantes */}
        <div className="fixed bottom-6 right-6 z-10 flex flex-col-reverse gap-3">
          <button
            type="button"
            onClick={() => {
              // Dispara evento customizado para trigger save no AnswerQuestionnaire
              window.dispatchEvent(new Event('triggerManualSave'));
            }}
            className="w-16 h-16 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-all shadow-lg flex items-center justify-center hover:scale-110"
            title="Salvar Respostas"
          >
            <Save className="w-7 h-7" />
          </button>
          {canAssociateUser && (
            <button
              type="button"
              onClick={() => setIsAssociateUserModalOpen(true)}
              className="w-16 h-16 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center hover:scale-110"
              title="Associar Usuário"
            >
              <Users className="w-7 h-7" />
            </button>
          )}
        </div>
      </div>

      {/* Modal para Associar Usuário */}
      <AssociateUserModal
        isOpen={isAssociateUserModalOpen}
        onClose={() => setIsAssociateUserModalOpen(false)}
        onSubmit={handleAssociateUserSubmit}
        pregoeiroId={evaluation?.public_acquisition?.user_public_id}
        currentUserRole={user?.role?.name}
        isLoading={associateUserMutation.isPending}
      />
    </div>
  );
};

export default EvaluationQuestionnaire;
