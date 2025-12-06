import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../../Components/Common/Layout/Layout";
import { ArrowLeft, ClipboardCheck, ChevronDown, ChevronUp, Plus, Edit, Trash2, Users, FileText } from "lucide-react";
import Pagination from "../../Components/Common/Table/Pagination";
import EvaluationModal from "../../Components/Common/Modal/EvaluationModal";
import AssociateUserModal from "../../Components/Common/Modal/AssociateUserModal";
import ConfirmationModal from "../../Components/Common/Modal/ConfirmationModal";
import { usePublicAcquisitions } from "../../Hooks/usePublicAcquisitions";
import { useEvaluations } from "../../Hooks/useEvaluations";
import { useAnswers } from "../../Hooks/useAnswers";
import { useToast } from "../../Contexts/ToastContext";
import { useAuth } from "../../Contexts/AuthContext";
import type { Evaluation } from "../../Types/Evaluation";
import { getErrorMessage } from "../../Utils/errorHandler";

// Componente auxiliar para mostrar o progresso de uma avaliação
const EvaluationProgress: React.FC<{ evaluationId: string }> = ({ evaluationId }) => {
  const { fetchEvaluationStatistics } = useAnswers();
  const { data: stats, isLoading } = fetchEvaluationStatistics(evaluationId);

  if (isLoading) {
    return <div className="text-xs text-gray-500">Carregando...</div>;
  }

  if (!stats) {
    return null;
  }

  const progressColor = stats.completion_percentage === 100 ? 'bg-green-500' :
                       stats.completion_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Progresso</span>
        <span className="font-semibold">
          {stats.answered_questions}/{stats.total_questions} ({stats.completion_percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${progressColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${stats.completion_percentage}%` }}
        />
      </div>
    </div>
  );
};

const PublicAcquisitionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEvaluations, setExpandedEvaluations] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null);
  const [isAssociateUserModalOpen, setIsAssociateUserModalOpen] = useState(false);
  const [evaluationToAssociate, setEvaluationToAssociate] = useState<Evaluation | null>(null);
  const itemsPerPage = 10;

  // Roles que podem criar avaliações
  const canCreateEvaluation = user?.role?.name && ['Desenvolvedor', 'Administrador', 'Gerente', 'Pregoeiro'].includes(user.role.name);

  // Roles que podem editar/deletar avaliações
  const canEditDeleteEvaluation = user?.role?.name && ['Administrador', 'Gerente'].includes(user.role.name);

  // Roles que podem associar usuários
  const canAssociateUser = user?.role?.name && ['Administrador', 'Gerente', 'Pregoeiro', 'Avaliador Técnico'].includes(user.role.name);

  const { fetchPublicAcquisitionById } = usePublicAcquisitions();
  const {
    fetchEvaluationsByPublicAcquisition,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    associateUser
  } = useEvaluations();

  const { data: publicAcquisitionData, isLoading: isLoadingPA, error: errorPA } = fetchPublicAcquisitionById(id || '');
  const { data, isLoading, error } = fetchEvaluationsByPublicAcquisition(id || '', currentPage, itemsPerPage);
  const createMutation = createEvaluation();
  const updateMutation = updateEvaluation();
  const associateUserMutation = associateUser();

  const toggleEvaluation = (evaluationId: string) => {
    setExpandedEvaluations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(evaluationId)) {
        newSet.delete(evaluationId);
      } else {
        newSet.add(evaluationId);
      }
      return newSet;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateEvaluation = () => {
    setModalMode('create');
    setSelectedEvaluation(null);
    setIsModalOpen(true);
  };

  const handleEditEvaluation = (evaluation: Evaluation) => {
    setModalMode('edit');
    setSelectedEvaluation(evaluation);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!evaluationToDelete) return;

    try {
      await deleteEvaluation(evaluationToDelete.public_id);
      toast.success('Avaliação removida', 'Avaliação removida com sucesso!');
      setIsDeleteModalOpen(false);
      setEvaluationToDelete(null);
    } catch (error) {
      console.error('Erro ao remover avaliação:', error);
      toast.error('Erro ao remover', getErrorMessage(error));
    }
  };

  const handleAssociateUserClick = (evaluation: Evaluation) => {
    setEvaluationToAssociate(evaluation);
    setIsAssociateUserModalOpen(true);
  };

  const handleAssociateUserSubmit = async (userId: string) => {
    if (!evaluationToAssociate) return;

    try {
      await associateUserMutation.mutateAsync({
        id: evaluationToAssociate.public_id,
        data: { user_id: userId },
      });
      toast.success('Usuário associado', 'Usuário associado à avaliação com sucesso!');
      setIsAssociateUserModalOpen(false);
      setEvaluationToAssociate(null);
    } catch (error) {
      console.error('Erro ao associar usuário:', error);
      toast.error('Erro ao associar', getErrorMessage(error));
    }
  };

  const handleModalSubmit = async (formData: {
    item_ids?: string[];
    supplier_id?: string;
    is_holder: boolean;
    user_ids: string[];
  }) => {
    try {
      if (modalMode === 'create') {
        // Criar múltiplas avaliações, uma para cada item
        if (formData.item_ids && formData.item_ids.length > 0) {
          await Promise.all(
            formData.item_ids.map(item_id =>
              createMutation.mutateAsync({
                item_id,
                supplier_id: formData.supplier_id!,
                public_acquisition_id: id!,
                is_holder: formData.is_holder,
                user_ids: formData.user_ids,
              })
            )
          );
          toast.success(
            'Avaliações criadas',
            `${formData.item_ids.length} ${formData.item_ids.length === 1 ? 'avaliação criada' : 'avaliações criadas'} com sucesso!`
          );
        }
      } else if (modalMode === 'edit' && selectedEvaluation) {
        await updateMutation.mutateAsync({
          id: selectedEvaluation.public_id,
          data: {
            user_ids: formData.user_ids,
          },
        });
        toast.success('Avaliação atualizada', 'Avaliação atualizada com sucesso!');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast.error(
        modalMode === 'create' ? 'Erro ao criar' : 'Erro ao atualizar',
        getErrorMessage(error)
      );
    }
  };

  if (error || errorPA) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-500">Tente novamente mais tarde</p>
            <button
              onClick={() => navigate('/public-acquisitions')}
              className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Voltar para Licitações
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const publicAcquisition = publicAcquisitionData;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header com informações da licitação */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => navigate('/public-acquisitions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Licitações</span>
          </button>

          {publicAcquisition && (
            <div className="border-t pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {publicAcquisition.title}
                  </h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Código:</span>
                      <p className="font-medium text-gray-900">{publicAcquisition.code}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ano:</span>
                      <p className="font-medium text-gray-900">{publicAcquisition.year}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total de Avaliações:</span>
                      <p className="font-medium text-gray-900">{data?.total || 0}</p>
                    </div>
                  </div>

                  {/* Lista de Itens da Licitação */}
                  {publicAcquisition.items && publicAcquisition.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Itens da Licitação ({publicAcquisition.items.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {publicAcquisition.items.map((item) => (
                          <div
                            key={item.public_id}
                            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                          >
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Código: {item.internal_code}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {item.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Avaliações */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Avaliações da Licitação</h2>
            {canCreateEvaluation && (
              <button
                onClick={handleCreateEvaluation}
                className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Avaliação</span>
              </button>
            )}
          </div>

          <div className="p-4">
            {isLoading || isLoadingPA ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Carregando...</div>
              </div>
            ) : data?.items && data.items.length > 0 ? (
              <div className="space-y-3">
                {data.items.map((evaluation: Evaluation) => {
                  const isExpanded = expandedEvaluations.has(evaluation.public_id);

                  return (
                    <div
                      key={evaluation.public_id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-teal-300 transition-colors"
                    >
                      {/* Header da Avaliação - Sempre visível */}
                      <div
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleEvaluation(evaluation.public_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {evaluation.item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Código: {evaluation.item.internal_code}
                              </div>
                            </div>
                            <div className="hidden md:block">
                              <div className="text-sm text-gray-700">
                                {evaluation.supplier.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {evaluation.supplier.document}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {evaluation.is_holder && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Detentor
                                </span>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {evaluation.users.length} {evaluation.users.length === 1 ? 'avaliador' : 'avaliadores'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo Expandido */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          {/* Indicador de Progresso */}
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <EvaluationProgress evaluationId={evaluation.public_id} />
                          </div>

                          <div className="flex justify-end gap-2 mb-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/evaluations/${evaluation.public_id}/questionnaire`);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Responder Questionário</span>
                            </button>
                            {canAssociateUser && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssociateUserClick(evaluation);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                              >
                                <Users className="w-4 h-4" />
                                <span>Associar Usuário</span>
                              </button>
                            )}
                            {canEditDeleteEvaluation && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEvaluation(evaluation);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(evaluation);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Remover</span>
                                </button>
                              </>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Informações do Item */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Informações do Item
                              </h4>
                              <dl className="space-y-2">
                                <div>
                                  <dt className="text-xs text-gray-500">Descrição:</dt>
                                  <dd className="text-sm text-gray-900">{evaluation.item.description || 'N/A'}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">Apresentação:</dt>
                                  <dd className="text-sm text-gray-900">{evaluation.item.presentation || 'N/A'}</dd>
                                </div>
                                {evaluation.item.similar_names && evaluation.item.similar_names.length > 0 && (
                                  <div>
                                    <dt className="text-xs text-gray-500">Nomes Similares:</dt>
                                    <dd className="text-sm text-gray-900">
                                      {evaluation.item.similar_names.join(', ')}
                                    </dd>
                                  </div>
                                )}
                              </dl>
                            </div>

                            {/* Informações do Fornecedor */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Informações do Fornecedor
                              </h4>
                              <dl className="space-y-2">
                                <div>
                                  <dt className="text-xs text-gray-500">Nome:</dt>
                                  <dd className="text-sm text-gray-900">{evaluation.supplier.name}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">{evaluation.supplier.document_type}:</dt>
                                  <dd className="text-sm text-gray-900">{evaluation.supplier.document}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">Email:</dt>
                                  <dd className="text-sm text-gray-900">{evaluation.supplier.email}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-gray-500">Telefone:</dt>
                                  <dd className="text-sm text-gray-900">{evaluation.supplier.phone}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>

                          {/* Usuários Avaliadores */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Usuários Avaliadores
                            </h4>
                            {evaluation.users.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {evaluation.users.map((user) => {
                                  const getRoleBadgeColor = (roleName: string) => {
                                    if (roleName === 'Pregoeiro') {
                                      return 'bg-blue-100 text-blue-800';
                                    }
                                    if (roleName === 'Avaliador Técnico') {
                                      return 'bg-purple-100 text-purple-800';
                                    }
                                    if (roleName === 'Avaliador Funcional') {
                                      return 'bg-amber-100 text-amber-800';
                                    }
                                    return 'bg-gray-100 text-gray-800';
                                  };

                                  return (
                                    <div
                                      key={user.public_id}
                                      className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                          <div className="text-xs text-gray-600">{user.email}</div>
                                        </div>
                                      </div>
                                      {user.role && (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(user.role.name)}`}>
                                          {user.role.name}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                Nenhum usuário avaliador atribuído.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Nenhuma avaliação encontrada nesta licitação
              </div>
            )}

            {data && data.total > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={data.total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Criar/Editar Avaliação */}
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        publicAcquisitionItems={publicAcquisition?.items || []}
        pregoeiroId={publicAcquisition?.user_public_id}
        initialData={selectedEvaluation ? {
          item_id: selectedEvaluation.item.public_id,
          item_name: selectedEvaluation.item.name,
          supplier_id: selectedEvaluation.supplier.public_id,
          supplier_name: selectedEvaluation.supplier.name,
          is_holder: selectedEvaluation.is_holder,
          users: selectedEvaluation.users,
        } : undefined}
      />

      {/* Modal para Associar Usuário */}
      <AssociateUserModal
        isOpen={isAssociateUserModalOpen}
        onClose={() => {
          setIsAssociateUserModalOpen(false);
          setEvaluationToAssociate(null);
        }}
        onSubmit={handleAssociateUserSubmit}
        pregoeiroId={publicAcquisition?.user_public_id}
        currentUserRole={user?.role?.name}
        isLoading={associateUserMutation.isPending}
      />

      {/* Modal de Confirmação para Deletar */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEvaluationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Remover Avaliação"
        message={`Tem certeza que deseja remover a avaliação do item "${evaluationToDelete?.item.name}" com o fornecedor "${evaluationToDelete?.supplier.name}"?`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </Layout>
  );
};

export default PublicAcquisitionDetails;
